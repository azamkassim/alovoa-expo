const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;
const EXPO_OWNER = process.env.EXPO_OWNER;

const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || "OpenCircle";
const APP_SLUG = process.env.EXPO_PUBLIC_APP_SLUG || "open-circle";
const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME || "opencircle";
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || "0.1.0";
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || "com.azamkassim.opencircle";
const IOS_BUNDLE_IDENTIFIER = process.env.IOS_BUNDLE_IDENTIFIER || "com.azamkassim.opencircle";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
const VIDEO_BASE_URL = process.env.EXPO_PUBLIC_VIDEO_BASE_URL || "https://meet.jit.si";
const APP_LINK_DOMAIN = process.env.APP_LINK_DOMAIN;

const updates = EAS_PROJECT_ID
  ? {
      enabled: true,
      checkAutomatically: "ON_ERROR_RECOVERY",
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    }
  : {
      enabled: false,
      checkAutomatically: "ON_ERROR_RECOVERY",
    };

module.exports = {
  expo: {
    name: APP_NAME,
    slug: APP_SLUG,
    version: APP_VERSION,
    scheme: APP_SCHEME,
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    newArchEnabled: true,
    plugins: [
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with other users.",
        },
      ],
      "./plugins/setClearTextTrafficFalse",
      "./plugins/withGradleProperties",
      "expo-localization",
      "expo-build-properties",
    ],
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0B1020",
      dark: {
        image: "./assets/splash.png",
        backgroundColor: "#0B1020",
      },
    },
    updates,
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      usesAppleSignIn: true,
      bundleIdentifier: IOS_BUNDLE_IDENTIFIER,
      associatedDomains: APP_LINK_DOMAIN ? [`applinks:${APP_LINK_DOMAIN}`] : [],
      infoPlist: {
        LSApplicationQueriesSchemes: [APP_SCHEME],
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "This app uses your location to list people in close proximity when you choose nearby discovery.",
        NSDocumentsFolderUsageDescription:
          "This app uses the Documents folder when you request an export of your user data.",
      },
      buildNumber: "1",
    },
    android: {
      icon: "./assets/icon-round.png",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        monochromeImage: "./assets/monochrome-icon.png",
        backgroundColor: "#0B1020",
      },
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: APP_SCHEME }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      package: ANDROID_PACKAGE,
      softwareKeyboardLayoutMode: "pan",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      lintOptions: {
        checkReleaseBuilds: false,
        abortOnError: false,
      },
      versionCode: 1,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      appName: APP_NAME,
      apiUrl: API_URL,
      videoBaseUrl: VIDEO_BASE_URL,
      sourceRepo: "https://github.com/azamkassim/alovoa-expo",
    },
    owner: EXPO_OWNER,
    runtimeVersion: {
      policy: "appVersion",
    },
  },
  build: {
    android: {
      env: {
        ORG_GRADLE_JVMARGS: "-Xmx6g -XX:MaxMetaspaceSize=3g -Dfile.encoding=UTF-8",
      },
    },
  },
};
