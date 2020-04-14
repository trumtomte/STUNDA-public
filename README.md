# STUNDA (public repo)

> Built with React Native

This repository contains the source (JS) for the mobile application STUNDA. You will need to compile your own React Native app along with these sources files in order to build your own version of the app. You'll find a couple of notes/gotchas down below. This project also makes use of [react-native-ln](https://github.com/trumtomte/react-native-ln).

## Getting up and running

### Base

* Run `$ yarn` to install dependencies
* run `$ react-native link` to link dependencies

### iOS

* Drag `RCTPushNotification.xcodeproj` from `node_modules/react-native/Libraries/PushNotificationIOS` to `Libraries` in XCode
* Drag `libRTCPushNotification.a` from `Libraries/RTCPushNotification.xcodeproj/Products` (in XCode) to `Link Binary With Libaries` under Build Phases inside the main Project Target

Add the following code to `AppDelegate.m`:

* `#import <React/RCTPushNotificationManager.h>`

```
// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
    [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
    [RCTPushNotificationManager didReceiveLocalNotification:notification];
}
```

* Change the bundle identifier and the signing for all main Project Targets
* Remove device orientation for left and right under *General*
* Remove `Launch Screen File` under *General* for the main Project Target
* Remove current icons in `Images.xcassets` and add both an *App Icon* and *Launch Image*, fill these with the corresponding images
* Under *General* choose *Migrate* for the `Launch Image Source`
* Bundle the app `react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios`

### Android

* Add `local.properties` to `/android` containing `sdk.dir = /Users/$USERNAME/Library/Android/sdk`
* Replace android App icons inside `/android/app/src/main/res`
* Inside `/android/app/build.gradle` add `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"`

**Preparing for release:**

* `keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`

In `~/.gradle/gradle.properties`:

```
PROJECT_NAME_RELEASE_STORE_FILE=my-release-key.keystore
PROJECT_NAME_RELEASE_KEY_ALIAS=my-key-alias
PROJECT_NAME_RELEASE_STORE_PASSWORD=keystore-password
PROJECT_NAME_RELEASE_KEY_PASSWORD=keyalias-password
```

In `android/app/build.gradle.`:

```
signingConfigs {
    release {
        storeFile file(PROJECT_NAME_RELEASE_STORE_FILE)
            storePassword PROJECT_NAME_RELEASE_STORE_PASSWORD
            keyAlias PROJECT_NAME_RELEASE_KEY_ALIAS
            keyPassword PROJECT_NAME_RELEASE_KEY_PASSWORD
    }
}
buildTypes {
    release {
        minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release // add this line as well
    }
}
```

* `cd android && ./gradlew assembleRelease`
* `cd android && ./gradlew installRelease`

APK is stored in `/android/app/build/outputs/apk/`
