(function (pluginManager, id) {
  const callback = () => {
    console.log("callback");
  };

  const init = () => {
    pluginManager.registerPlugin(id, "test");
    pluginManager.registerAction(id, "test", callback);
  };

  return { init };
});
