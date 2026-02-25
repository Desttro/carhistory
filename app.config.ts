import type { ExpoConfig } from 'expo/config'

const appName = 'CarHistory'
const appId = appName.toLowerCase()

const { APP_VARIANT = 'development' } = process.env

if (
  APP_VARIANT !== 'production' &&
  APP_VARIANT !== 'preview' &&
  APP_VARIANT !== 'development'
) {
  throw new Error(`Invalid APP_VARIANT: ${APP_VARIANT}`)
}

const IS_DEV = APP_VARIANT === 'development'

const getBundleId = () => {
  // use tamagui bundle ids for production/preview, carhistory for dev
  if (APP_VARIANT === 'development') {
    return 'io.carhistory.app.dev'
  } else if (APP_VARIANT === 'preview') {
    return 'io.carhistory.app.preview'
  }
  return 'io.carhistory.app'
}

const getAppIcon = () => {
  return './assets/icon.png'
}

const appVersion = '3.0.0'
const buildVersion = '53'

export default {
  expo: {
    name: `${appName}${(() => {
      switch (APP_VARIANT) {
        case 'development':
          return ' (Dev)'
        case 'preview':
          return ' (Preview)'
        default:
          return ''
      }
    })()}`,
    slug: 'carhistory',
    owner: 'carverify',
    scheme: appId,
    version: appVersion,
    // runtimeVersion: version, // must be set to use hot-updater "appVersion" update strategy
    // Strongly recommended for EAS Update / OTA
    // runtimeVersion: {
    //   policy: 'appVersion', // auto-uses expo.version → safest & simplest
    //   // OR: runtimeVersion: appVersion        // explicit string also fine
    // },
    newArchEnabled: true,
    platforms: ['ios', 'android', 'web'],
    userInterfaceStyle: 'automatic',
    icon: getAppIcon(),
    ios: {
      buildNumber: buildVersion,
      supportsTablet: true,
      bundleIdentifier: getBundleId(),
      icon: getAppIcon(),
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSCameraUsageDescription:
          '$(PRODUCT_NAME) uses the camera to take profile photos and capture images for AI-powered image creation features.',
        NSMicrophoneUsageDescription: 'Allow $(PRODUCT_NAME) to access your microphone',
        NSPhotoLibraryUsageDescription:
          '$(PRODUCT_NAME) accesses your photo library to let you select images for profile pictures and choose photos as input for AI image generation.',
        NSPhotoLibraryAddUsageDescription:
          '$(PRODUCT_NAME) saves generated AI artwork and edited profile photos to your photo library so you can keep and share your creations.',
        NSAppleMusicUsageDescription:
          'Allow $(PRODUCT_NAME) to access your music library',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        CFBundleAllowMixedLocalizations: true, // allows mixed language resources
        // CFBundleDevelopmentRegion: "en",     // optional – plugin usually sets it
      },
      associatedDomains: ['applinks:carhistory.io', 'applinks:*.carhistory.io'],
    },
    android: {
      versionCode: Number(buildVersion),
      package: getBundleId().replaceAll('-', '_'),
      icon: getAppIcon(),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['android.permission.RECORD_AUDIO'],
      intentFilters: [
        {
          autoVerify: true,
          action: 'VIEW',
          data: [
            {
              scheme: 'https',
              host: 'carhistory.io',
            },
            {
              scheme: 'https',
              host: '*.carhistory.io',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    primaryColor: '#ffffff',
    plugins: [
      'vxrn/expo-plugin',
      'expo-web-browser',
      'expo-font',
      'react-native-bottom-tabs',
      [
        'expo-plugin-ios-static-libraries',
        {
          libraries: ['RNPermissions', 'op-sqlite'],
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '17.0',
          },
        },
      ],
      [
        'expo-dev-client',
        {
          addGeneratedScheme: !!IS_DEV,
        },
      ],
      [
        'react-native-permissions',
        {
          // Add setup_permissions to your Podfile (see iOS setup - steps 1, 2 and 3)
          iosPermissions: [
            // 'AppTrackingTransparency',
            // 'Bluetooth',
            // 'Calendars',
            // 'CalendarsWriteOnly',
            'Camera',
            // 'Contacts',
            'FaceID',
            // 'LocationAccuracy',
            // 'LocationAlways',
            // 'LocationWhenInUse',
            'MediaLibrary',
            'Microphone',
            // 'Motion',
            'Notifications',
            'PhotoLibrary',
            // 'PhotoLibraryAddOnly',
            // 'Reminders',
            // 'Siri',
            // 'SpeechRecognition',
            // 'StoreKit',
          ],
        },
      ],
      // Custom fonts
      // [
      //   'expo-font',
      //   {
      //     fonts: [
      //       './assets/fonts/Inter-Black.ttf',
      //       './assets/fonts/Inter-Bold.ttf',
      //       './assets/fonts/Inter-Light.ttf',
      //       './assets/fonts/Inter-Medium.ttf',
      //       './assets/fonts/Inter-Regular.ttf',
      //       './assets/fonts/Inter-SemiBold.ttf',
      //     ],
      //   },
      // ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/logo.png',
          imageWidth: 80,
          imageHeight: 80,
        },
      ],
      [
        'expo-localization',
        {
          // Array works for both platforms (or use { ios: [...], android: [...] } if you ever need different lists)
          supportedLocales: [
            'en', // your main / fallback language – put first
            'pl',
            'fr',
            'zh', // Chinese (use 'zh-Hans' or 'zh-Hant' if you need to distinguish)
            'ru',
            'cs',
            'it',
            'ar',
            'es',
          ],
        },
      ],
      // EAS enables the App Groups capability but does NOT assign the group identifier.
      // go to apple developer portal → Certificates, Identifiers & Profiles →
      // edit App ID Configuration for both the main app and Live Activity extension →
      // App Groups → select group.<bundleId>, then rebuild
      [
        'voltra',
        {
          groupIdentifier: `group.${getBundleId()}`,
          widgets: [
            {
              id: 'create_report',
              displayName: 'Create Report',
              description: 'Quickly create a new report',
              supportedFamilies: ['systemSmall'],
            },
          ],
        },
      ],
      // enable hot-updater here
      // [
      //   '@hot-updater/react-native',
      //   {
      //     channel: APP_VARIANT,
      //   },
      // ],
    ],
    // 4. (OPTIONAL but recommended) Localized app name + permission strings
    // Create a `locales/` folder and add one JSON file per language
    // locales: {
    //   en: './locales/en.json',
    //   pl: './locales/pl.json',
    //   fr: './locales/fr.json',
    //   zh: './locales/zh.json',
    //   ru: './locales/ru.json',
    //   cs: './locales/cs.json',
    //   it: './locales/it.json',
    //   ar: './locales/ar.json',
    //   es: './locales/es.json',
    // },
    extra: {
      supportsRTL: true,
      // forcesRTL: false, // only if you want to force RTL for testing
      eas: {
        projectId: 'c41791cd-523b-440c-b05d-2a06ca9ce8ee',
      },
    },
  } satisfies ExpoConfig,
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
}
