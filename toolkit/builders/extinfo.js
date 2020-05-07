const xmlbuilder = require("xmlbuilder2");

module.exports = {
    EXTENSION_BUILDER: (info) => {
        var ExtInfo = {
            HacknetExtension: {
                Language: info.Language,
                Name: info.extensionName,
                AllowSaves: info.allowSaves,
                StartingVisibleNodes: '',
                StartingMission: `Missions/${info.id}.xml`,
                StartingActions: '',
                Description: info.description,
                StartsWithTutorial: false,
                HasIntroStartup: false,
                StartingTheme: 'HacknetBlue',
                IntroStartupSong: info.startingMusic < 24 ? info.title : `Music/${info.startingMusic}.ogg`,
                WorkshopDescription: info.workshop_description,
                WorkshopLanguage: info.workshop_language,
                WorkshopVisibility: info.workshop_visibility,
                WorkshopTags: info.workshop_tags,
                WorkshopPreviewImagePath: info.workshop_img
            }
        };

        let xml = xmlbuilder.create(ExtInfo).end({ prettyPrint: true });

        return xml;
    }
}