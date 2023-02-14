UnityLoader.compatibilityCheck = function (unityInstance, onsuccess, onerror) {
  if (!UnityLoader.SystemInfo.hasWebGL) {
    unityInstance.popup('Your browser does not support WebGL',
      [{text: 'OK', callback: onerror}]);
  } else {
    onsuccess();
  }
}
// now you can call ... var unityInstance = UnityLoader.instantiate( ...