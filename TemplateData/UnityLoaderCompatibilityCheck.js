var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

UnityLoader.compatibilityCheck = function (unityInstance, onsuccess, onerror) {
  // if (isMobile) {
  //   unityInstance.popup('This game is not optimized for mobile devices', [{text: 'OK', callback: onerror}]);
  // } else if (!UnityLoader.SystemInfo.hasWebGL) {
  //   unityInstance.popup('Your browser does not support WebGL', [{text: 'OK', callback: onerror}]);
  // } else {
    onsuccess();
  // }
}
// now you can call ... var unityInstance = UnityLoader.instantiate( ...