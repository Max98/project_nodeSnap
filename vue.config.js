const WorkerPlugin = require("worker-plugin");

module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                win: {
                    target: "zip"
                },
                icon: "nodeSnap.ico"
            }
        }
    },
    configureWebpack: {
        plugins: [new WorkerPlugin()]
    }
};
