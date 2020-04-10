package hn

import (
	"database/sql"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/danilobuerger/null"
)

// Mission - a single Hacknet Mission
type Mission struct {
	ID                             string `xml:"id,attr"`
	ActiveCheck                    bool   `xml:"activeCheck,attr"`
	ShouldIgnoreSenderVerification bool   `xml:"shouldIgnoreSenderVerification,attr"`

	Goals GoalCollection `xml:"goals"`

	MissionStart missionFunction `xml:"missionStart"`
	MissionEnd   missionFunction `xml:"missionEnd"`
	NextMission  nextMission     `xml:"nextMission"`

	Email   hnEmail     `xml:"email,omitempty"`
	Posting hnBoardPost `xml:"posting,omitempty"`
}

type nextMission struct {
	Path     string `xml:",chardata"`
	IsSilent bool   `xml:"IsSilent,attr"`
}

type missionFunction struct {
	Value    int    `xml:"val,attr"`
	Suppress bool   `xml:"suppress,attr,omitempty"`
	Function string `xml:",chardata" default:"NONE"`
}

// GoalCollection - A collection of goals for a mission.
type GoalCollection struct {
	Goal []MissionGoal `xml:"goal"`
}

type hnEmail struct {
	Sender  string    `xml:"sender"`
	Subject string    `xml:"subject"`
	Body    plaintext `xml:"body"`
}

type plaintext struct {
	Value string `xml:",innerxml"`
}

type hnBoardPost struct {
	Title        string `xml:"title,attr"`
	Reqs         string `xml:"reqs,attr"`
	RequiredRank int    `xml:"requiredRank,attr"`
	Content      string `xml:",chardata"`
}

// MissionGoal - a single goal for a mission.
type MissionGoal struct {
	Type null.String `xml:"type,attr"`

	// Goal Specifics
	Target null.String `xml:"target,attr,omitempty"`

	File null.String `xml:"file,attr,omitempty"`

	Path null.String `xml:"path,attr,omitempty"`

	Keyword null.String `xml:"keyword,attr,omitempty"`

	Removal null.String `xml:"removal,attr,omitempty"`

	CaseSensitive null.String `xml:"caseSensitive,attr,omitempty"`

	Time null.Float64 `xml:"time,attr,omitempty"`

	DestTarget null.String `xml:"destTarget,attr,omitempty"`

	DestPath null.String `xml:"destPath,attr,omitempty"`

	Decrypt null.String `xml:"decrypt,attr,omitempty"`

	DecryptPass null.String `xml:"decryptPass,attr,omitempty"`

	Owner null.String `xml:"owner,attr,omitempty"`

	Degree null.String `xml:"degree,attr,omitempty"`

	Uni null.String `xml:"uni,attr,omitempty"`

	Gpa null.Float64 `xml:"gpa,attr,omitempty"`

	MailServer null.String `xml:"mailServer,attr,omitempty"`

	Recipient null.String `xml:"recipient,attr,omitempty"`

	Subject null.String `xml:"subject,attr,omitempty"`
}

// BuildMissions - Exports all missions under the given extension into their respective XML files.
func BuildMissions(conn *sql.DB, extensionID int) {

	// Set-up directory for writing missions to
	BuildPath := fmt.Sprintf("%s/Missions", os.Getenv("bpath"))
	os.Mkdir(BuildPath, 777)

	// Get a list of missions to build...
	missions, err := conn.Query(`SELECT
	"hn_Mission"."missionId", "hn_Mission"."id", "hn_Mission"."activeCheck", "hn_Mission"."shouldIgnoreSenderVerification", "hn_Mission"."emailId", "hn_Mission"."postingId", "hn_Mission"."nextMission", "hn_Mission"."IsSilent", "hn_Mission"."missionStart", "hn_Mission"."missionEnd"
	FROM "hn_Mission" WHERE "extensionId" = $1`, extensionID)

	if err != nil {
		log.Fatal(err)
	}

	// for each mission
	for missions.Next() {
		// MissionID
		var missionID int

		// Prep an object for marshalling
		var mission Mission

		var missionStart missionFunction
		var missionEnd missionFunction

		var nextMission nextMission
		var nextMissionID int

		var emailID null.Int64
		var postingID null.Int64

		// Build mission
		missions.Scan(&missionID, &mission.ID, &mission.ActiveCheck, &mission.ShouldIgnoreSenderVerification, &emailID, &postingID, &nextMissionID, &nextMission.IsSilent, &missionStart.Function, &missionEnd.Function)

		// Prep list of goals
		var goalCol GoalCollection

		// Get a list of goals for this misison
		goals, err := conn.Query(`SELECT
		"hn_MGoalType"."typeText", "hn_CompNode"."id", "hn_MissionGoal"."file", "hn_MissionGoal"."path", "hn_MissionGoal"."keyword", "hn_MissionGoal"."removal", "hn_MissionGoal"."caseSensitive",
		"hn_MissionGoal"."owner", "hn_MissionGoal"."degree", "hn_MissionGoal"."uni", "hn_MissionGoal"."gpa", "hn_MissionGoal"."mailServer", "hn_MissionGoal"."recipient", "hn_MissionGoal"."subject", "hn_MissionGoal"."target", "hn_MissionGoal"."delay"
		FROM "ln_Goal_Mission"
		INNER JOIN "hn_MissionGoal" ON "ln_Goal_Mission"."goalId" = "hn_MissionGoal"."goalId"
		INNER JOIN "hn_MGoalType" ON "hn_MGoalType"."typeId" = "hn_MissionGoal"."typeId"
		LEFT JOIN "hn_CompNode" ON "hn_MissionGoal"."targetNodeId" = "hn_CompNode"."nodeId"
		WHERE "ln_Goal_Mission"."missionId" = $1`, missionID)

		if err != nil {
			log.Fatal(err)
		}

		// For each goal
		for goals.Next() {
			// Create goal
			var goal MissionGoal

			// Build goal
			goals.Scan(&goal.Type, &goal.Target, &goal.File, &goal.Path, &goal.Keyword, &goal.Removal, &goal.CaseSensitive, &goal.Owner, &goal.Degree, &goal.Uni, &goal.Gpa, &goal.MailServer, &goal.Recipient, &goal.Subject, &goal.Target, &goal.Time)

			// Push goal onto slice
			goalCol.Goal = append(goalCol.Goal, goal)
		}

		mission.Goals = goalCol

		// Is there an email for this mission?
		if emailID.Valid {
			// YES - Build Email

			emailRes := conn.QueryRow(`SELECT "hn_Email"."sender", "hn_Email"."subject", "hn_Email"."body" FROM "hn_Email" WHERE "emailId" = $1`, emailID)

			var email hnEmail
			var eBody plaintext
			emailRes.Scan(&email.Sender, &email.Subject, &eBody.Value)
			email.Body = eBody

			mission.Email = email
		}

		// Is there a board posting for this mission?
		if postingID.Valid {
			// YES - Build post

			postRes := conn.QueryRow(`SELECT "hn_BoardPost"."title", "hn_BoardPost"."reqs", "hn_BoardPost"."requiredRank", "hn_BoardPost"."content" FROM "hn_BoardPost" WHERE "postingId" = $1`, postingID)

			var posting hnBoardPost
			postRes.Scan(&posting.Title, &posting.Reqs, &posting.RequiredRank, &posting.Content)

			mission.Posting = posting
		}

		// build xml
		xml, err := xml.Marshal(mission)

		if err != nil {
			log.Fatal(err)
		}

		err = ioutil.WriteFile(fmt.Sprintf(`%s/%s.xml`, BuildPath, mission.ID), xml, 0644)

		if err != nil {
			log.Fatal(err)
		}
	}

}
