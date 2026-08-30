const { createRunOncePlugin, withAndroidManifest } = require('@expo/config-plugins');

const setClearTextTrafficPolicy = config => {
    return withAndroidManifest(config, config => {
        const androidManifest = config.modResults.manifest;
        const mainApplication = androidManifest.application[0];
        const allowCleartext = process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true';
        mainApplication.$['android:usesCleartextTraffic'] = allowCleartext ? 'true' : 'false';
        return config;
    });
};

module.exports = createRunOncePlugin(
    setClearTextTrafficPolicy,
    'setClearTextTrafficFalse',
    '1.1.0'
);
