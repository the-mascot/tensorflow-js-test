let jsonObject = {
  pluginId: 'wallet',
  command: 'requestPermission',
  args: {
    permission: ['android.permission.CAMERA'],
    title: '카메라 권한 요청',
    content: '비대면인증 권한요청'
  },
  callbackScriptName: callbackNative
};

function callbackNative(result) {
  console.log('callbackNative reuslt: ', result);
};

let query = btoa(encodeURIComponent(JSON.stringify(jsonObject)));

window.AndroidBridge.callNativeMethod(`native://callNative?${query}`);
