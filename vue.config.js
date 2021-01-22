const WorkerPlugin = require("worker-plugin");

module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    configureWebpack: {
        plugins: [new WorkerPlugin()]
    }
};
