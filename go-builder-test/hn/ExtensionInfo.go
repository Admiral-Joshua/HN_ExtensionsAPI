package hn

import (
	"database/sql"
	"fmt"
	"log"
)

// HacknetExtension - Information about the extension
type HacknetExtension struct {
	Language             string   `xml:"Language"`
	Name                 string   `xml:"Name"`
	AllowSaves           bool     `xml:"AllowSaves"`
	StartingVisibleNodes string   `xml:"StartingVisibleNodes"`
	StartingMission      string   `xml:"StartingMission"`
	StartingActions      string   `xml:"StartingActions"`
	Description          string   `xml:"Description"`
	Faction              []string `xml:"Faction"`
	StartsWithTutorial   bool     `xml:"StartsWithTutorial"`
	StartingTheme        string   `xml:"StartingTheme"`
	HasIntroStartup      bool     `xml:"HasIntroStartup"`
	IntroStartupSong     string   `xml:"IntroStartupSong"`

	// TODO: Sequencer data

	WorkshopDescription      string `xml:"WorkshopDescription"`
	WorkshopLanguage         string `xml:"WorkshopLanguage"`
	WorkshopVisibility       int    `xml:"WorkshopVisibility"`
	WorkshopTags             string `xml:"WorkshopTags"`
	WorkshopPreviewImagePath string `xml:"WorkshopPreviewImagePath"`
}

// ToCSV - Takes list of strings, converts to csv.
func ToCSV(params []string) string {
	retVal := ""

	for i, str := range params {
		retVal += str
		if i < len(params)-1 {
			retVal += str
		}
	}

	return retVal
}

func getStartingComps(conn *sql.DB, extensionID int) []string {
	nodes, err := conn.Query(`SELECT "hn_CompNode"."id" FROM "ln_Starting_Comp"
	INNER JOIN "hn_CompNode" ON "ln_Starting_Comp"."nodeId" = "hn_CompNode"."nodeId"
	INNER JOIN "hn_CompType" ON "hn_CompNode"."typeId" = "hn_CompType"."typeId"
	WHERE "ln_Starting_Comp"."extensionId" = $1`, extensionID)

	if err != nil {
		log.Fatal(err)
	}

	defer nodes.Close()

	nodeIds := make([]string, 0)

	for nodes.Next() {
		var id string
		nodes.Scan(&id)

		if len(id) > 0 {
			nodeIds = append(nodeIds, id)
		}
	}

	return nodeIds
}

// BuildExtensionInfo - Uses the ExtensionID and DBConn given, to query for and return a complete ExtensionInfo from the Database.
func BuildExtensionInfo(conn *sql.DB, extensionID int) HacknetExtension {
	var retVal HacknetExtension

	infoRes := conn.QueryRow(`SELECT "extensionName", "allowSaves", "description", "extension_Language"."lang", "hn_Mission"."id",
	"workshop_tags", "startingMusic", "workshop_description" , "workshop_language", "workshop_visibility"
	FROM "extension_Info"
	INNER JOIN "extension_Language" ON "extension_Language"."langId" = "extension_Info"."languageId"
	INNER JOIN "hn_Mission" ON "extension_Info"."startingMissionId" = "hn_Mission"."missionId"
	WHERE "extension_Info"."extensionId" = $1`, extensionID)

	var musicID int
	var startMission string

	_ = infoRes.Scan(&retVal.Name, &retVal.AllowSaves, &retVal.Description, &retVal.Language, &startMission, &retVal.WorkshopTags, &musicID, &retVal.WorkshopDescription, &retVal.WorkshopLanguage, &retVal.WorkshopVisibility)

	retVal.StartingMission = fmt.Sprintf("Missions/%s.xml", startMission)

	if musicID > 0 {
		musicRes := conn.QueryRow(`SELECT * FROM "hn_Music" WHERE "musicId" = $1`, musicID)

		var musicID int
		var ownerID int
		var title string

		_ = musicRes.Scan(&musicID, &ownerID, &title)

		if ownerID == 0 {
			retVal.IntroStartupSong = title
		} else {
			retVal.IntroStartupSong = fmt.Sprintf(`Music/%d.ogg`, musicID)
		}
	}

	nodeIds := getStartingComps(conn, extensionID)

	retVal.StartingVisibleNodes = ToCSV(nodeIds)

	return retVal
}
