class HacknetExtension {
    constructor(language, name, saves, startNodes, startMission, startActions, description, factions, hasTutorial, startTheme, startupSong, wDescription, wLang, wVis, wTags, wIcon) {
        this.Language = language;
        this.Name = name;
        this.AllowSaves = saves;
        this.StartingVisibleNodes = startNodes;
        this.StartingMission = startMission;
        this.StartingActions = startActions;
        this.Description = description;
        this.Faction = factions;
        this.StartsWithTutorial = hasTutorial;
        this.HasIntroStartup = false;
        this.StartingTheme = startTheme;
        this.IntroStartupSong = startupSong;

        this.WorkshopDescription = wDescription;
        this.WorkshopLanguage = wLang;
        this.WorkshopVisibility = wVis;
        this.WorkshopTags = wTags;
        this.WorkshopPreviewImagePath = wIcon;
    }
}

/*const ExtensionInfo = {
    HacknetExtension: HacknetExtension
}*/

const TYPES = {
    ALL: 0,
    EXT_INFO: 1,
    NODE: 2,
    ALL_NODES: 3,
    MISSION_FILE: 4,
    ALL_MISSIONS: 5,
    ACTIONSET: 6,
    ALL: 7
}

module.exports = {
    HacknetExtension: HacknetExtension,
    //ExtensionInfo: ExtensionInfo,
    TYPES: TYPES
}