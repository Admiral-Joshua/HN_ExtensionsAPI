const xmlbuilder = require("xmlbuilder2");

module.exports = {
    NODE_BUILDER: function(info) {
        // CREATE XML
        var NodeInfo = {
            Computer: {
                '@id': info.id,
                '@name': info.name,
                '@ip': info.ip,
                '@security': info.securityLevel,
                '@allowsDefaultBootModule': info.allowsDefaultBootModule,
                '@icon': info.icon,
                '@type': info.typeId,

                ports: info.ports.map(port => port.port).join(","),

                adminPass: {
                    '@pass': info.adminPass
                },

                portsForCrack: {
                    '@val': info.portsForCrack
                },

                trace: {
                    '@time': info.traceTime ? info.traceTime : -1
                },

                admin: '',

                portRemap: info.remaps.map(remap => {
                    return `${remap.oldPort}=${remap.newPort}`
                }).join(','),

                file: info.files.map(file => {
                    return {
                        '@path': file.path,
                        '@name': file.name,
                        '#text': file.contents
                    }
                })
            }
        }

        if (info.tracker) {
            NodeInfo.Computer.tracker = '';
        }

        let xml = xmlbuilder.create(NodeInfo).end({ prettyPrint: true });

        return xml;
    }
}