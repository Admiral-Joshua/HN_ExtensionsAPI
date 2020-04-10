package main

import (
	"database/sql"
	"encoding/xml"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"./hn"

	_ "github.com/lib/pq"
)

var conn *sql.DB
var err error

func main() {

	// Set Build path for other modules
	BuildPath := "./temp"
	os.Setenv("bpath", BuildPath)

	os.Mkdir(BuildPath, 777)

	extensionID := flag.Int("extension", 0, "Extension ID to be exported.")
	userID := flag.Int("user", 0, "User ID this export is for.")

	flag.Parse()

	// Check everything is valid and ready to go.
	if *extensionID < 1 {
		log.Fatal("No Extension ID specified -- Cannot continue")
		os.Exit(1)
	} else if *userID < 1 {
		log.Fatal("No User ID specified -- Cannot continue")
		os.Exit(1)
	}

	// Getting started...
	fmt.Printf("Preparing to export Extension with ID %d for User %d\n", *extensionID, *userID)

	// Connect to Database
	connStr := "host=localhost password=postgres user=postgres dbname=EXTENSIONS_DB sslmode=disable"
	conn, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	// Fetch/compile Extension Info
	extInfo := hn.BuildExtensionInfo(conn, *extensionID)
	xml, err := xml.Marshal(extInfo)
	if err != nil {
		log.Fatal(err)
	}
	ioutil.WriteFile(fmt.Sprintf(`%s/ExtensionInfo.xml`, BuildPath), xml, 0644)

	// Build and write computer nodes
	hn.BuildNodes(conn, *extensionID)
	hn.BuildMissions(conn, *extensionID)
}
