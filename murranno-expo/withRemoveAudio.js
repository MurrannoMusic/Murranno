const { withAndroidManifest } = require('@expo/config-plugins');

const withRemoveAudioPermission = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    if (androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = androidManifest['uses-permission'].filter(
        (permission) => permission.$['android:name'] !== 'android.permission.RECORD_AUDIO'
      );
    }
    return config;
  });
};

module.exports = withRemoveAudioPermission;
