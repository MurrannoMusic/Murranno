const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAdiRegistration = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const file = path.join(config.modRequest.projectRoot, 'adi-registration.properties');
      const dest = path.join(config.modRequest.platformProjectRoot, 'app/src/main/assets/adi-registration.properties');
      
      const assetDir = path.dirname(dest);
      if (!fs.existsSync(assetDir)) {
        fs.mkdirSync(assetDir, { recursive: true });
      }
      
      fs.copyFileSync(file, dest);
      return config;
    },
  ]);
};

module.exports = withAdiRegistration;
