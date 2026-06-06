---
Source: https://pub.dev/documentation/flutter_line_sdk/latest/flutter_line_sdk/
Generated: 2026-06-06
Updated: 2026-06-06
---

# flutter\_line\_sdk library

A Flutter plugin for using the LINE SDKs with Dart in Flutter apps.

This package is a Dart/Flutter compatible wrapper for using the [LINE SDK for iOS Swift](https://developers.line.biz/en/docs/ios-sdk/swift/overview/) and [LINE SDK for Android](https://developers.line.biz/en/docs/android-sdk/overview/) in your Flutter app. To use this plugin and LINE's APIs, you need to register and configure a channel in the [LINE Developers console](https://developers.line.biz/console/). For details, see [Getting started with LINE Login](https://developers.line.biz/en/docs/line-login/getting-started/).

After installing this flutter\_line\_sdk package, update your Xcode Runner project and Android `build.gradle` file with your channel information. For details, see the "Linking your app to your channel" section in our setup guides for [iOS](https://developers.line.biz/en/docs/ios-sdk/swift/setting-up-project/) and [Android](https://developers.line.biz/en/docs/android-sdk/integrate-line-login/).

After that, use an `import` directive to include flutter\_line\_sdk in your project and call `await LineSDK.instance.setup($channel_id);` to set up the plugin. For the most basic use case, invoke the `login` method to prompt your users to log in with their LINE accounts.

## Classes

[AccessToken](../flutter_line_sdk/AccessToken-class.html)

An access token used to access the LINE Platform.

[AccessTokenVerifyResult](../flutter_line_sdk/AccessTokenVerifyResult-class.html)

Response to [LineSDK.verifyAccessToken](../flutter_line_sdk/LineSDK/verifyAccessToken.html).

[BotFriendshipStatus](../flutter_line_sdk/BotFriendshipStatus-class.html)

Response to [LineSDK.getBotFriendshipStatus](../flutter_line_sdk/LineSDK/getBotFriendshipStatus.html).

[LineSDK](../flutter_line_sdk/LineSDK-class.html)

A general manager class for LINE SDK login features.

[LoginOption](../flutter_line_sdk/LoginOption-class.html)

Options related to LINE login process.

[LoginResult](../flutter_line_sdk/LoginResult-class.html)

The result of a successful login, containing basic user information and an access token.

[StoredAccessToken](../flutter_line_sdk/StoredAccessToken-class.html)

The access token stored on the user's device.

[UserProfile](../flutter_line_sdk/UserProfile-class.html)

The user profile used in LineSDK.
