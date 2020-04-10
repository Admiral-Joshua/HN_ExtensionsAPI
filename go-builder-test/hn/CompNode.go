package hn

import (
	"database/sql"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

// Computer - A computer within an extensions' in-game network.
type Computer struct {
	ID                      string        `xml:"id,attr"`
	Name                    string        `xml:"name,attr"`
	IP                      string        `xml:"ip,attr"`
	SecurityLevel           int           `xml:"security,attr"`
	AllowsDefaultBootModule bool          `xml:"allowsDefaultBootModule,attr"`
	Icon                    string        `xml:"icon,attr"`
	TypeID                  int           `xml:"type,attr"`
	AdminPass               adminPass     `xml:"adminPass"`
	PortsForCrack           portsForCrack `xml:"portsForCrack"`
	TraceTime               tracer        `xml:"trace"`
	Admin                   adminType     `xml:"admin"`

	// TODO: adminInfo

	Tracker string `xml:"tracker,omitempty"`

	Files  []compFile  `xml:"file"`
	DLinks []compDlink `xml:"dlink"`
}

type compDlink struct {
	Target string `xml:"target,attr"`
}

type portsForCrack struct {
	Value int `xml:"val,attr"`
}

type adminPass struct {
	Pass string `xml:"pass,attr"`
}

type tracer struct {
	Time float32 `xml:"time,attr"`
}

type adminType struct {
	Type          string `xml:"type,attr"`
	ResetPassword bool   `xml:"resetPassword,attr"`
	IsSuper       bool   `xml:"isSuper,attr"`
}

type compFile struct {
	Path    string `xml:"path,attr"`
	Name    string `xml:"name,attr"`
	Content string `xml:",chardata"`
}

// BuildNodes - Builds computer nodes for given extension.
func BuildNodes(conn *sql.DB, extensionID int) {

	BuildPath := fmt.Sprintf("%s/Nodes", os.Getenv("bpath"))
	os.Mkdir(BuildPath, 777)

	comps, err := conn.Query(`SELECT "nodeId", "id", "name", "ip", "securityLevel", "allowsDefaultBootModule", "icon", "hn_CompNode"."typeId", "adminPass", "portsForCrack", "traceTime", "tracker", "hn_AdminType"."adminType", "hn_Admin"."resetPassword", "hn_Admin"."isSuper" FROM "hn_CompNode"
	INNER JOIN "hn_Admin" ON "hn_Admin"."adminId" = "hn_CompNode"."adminInfoId"
	INNER JOIN "hn_AdminType" ON "hn_Admin"."adminTypeId" = "hn_AdminType"."adminTypeId"
	WHERE "hn_CompNode"."extensionId" = $1`, extensionID)

	if err != nil {
		log.Fatal(err)
	} else {
		for comps.Next() {
			var comp Computer

			var nodeID int
			var portsForCrack portsForCrack
			var tracer tracer
			var adminPass adminPass
			var adminData adminType

			var hasTracker bool

			comps.Scan(&nodeID, &comp.ID, &comp.Name, &comp.IP, &comp.SecurityLevel, &comp.AllowsDefaultBootModule, &comp.Icon, &comp.TypeID, &adminPass.Pass, &portsForCrack.Value, &tracer.Time, &hasTracker, &adminData.Type, &adminData.ResetPassword, &adminData.IsSuper)
			comp.PortsForCrack = portsForCrack
			comp.TraceTime = tracer
			comp.AdminPass = adminPass
			comp.Admin = adminData

			// DLinks
			dlinks, err := conn.Query(`SELECT "hn_CompNode"."id" FROM "ln_Comp_Dlink" INNER JOIN "hn_CompNode" ON "ln_Comp_Dlink"."destNodeId" = "hn_CompNode"."nodeId" WHERE "srcNodeId" = $1`, nodeID)

			if err != nil {
				log.Fatal(err)
			}

			for dlinks.Next() {
				var dlink compDlink

				dlinks.Scan(&dlink.Target)

				comp.DLinks = append(comp.DLinks, dlink)
			}

			// Files
			files, err := conn.Query(`SELECT "hn_CompFile"."path", "hn_CompFile"."name", "hn_CompFile"."contents" FROM "ln_Comp_File" INNER JOIN "hn_CompFile" ON "ln_Comp_File"."fileId" = "hn_CompFile"."fileId" WHERE "ln_Comp_File"."nodeId" = $1`, nodeID)
			if err != nil {
				log.Fatal(err)
			}

			for files.Next() {
				var file compFile

				err := files.Scan(&file.Path, &file.Name, &file.Content)

				if err != nil {
					log.Fatal(err)
				}
				comp.Files = append(comp.Files, file)
			}

			if hasTracker {
				comp.Tracker = ""
			}

			// Write XML
			xml, err := xml.Marshal(comp)
			if err != nil {
				log.Fatal(err)
			}

			err = ioutil.WriteFile(fmt.Sprintf(`%s/%s.xml`, BuildPath, comp.ID), xml, 0644)

			if err != nil {
				log.Fatal(err)
			}
		}

	}

}
