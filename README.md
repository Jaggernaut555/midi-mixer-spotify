# Spotify

Control spotify volume, skip tracks, play/pause, and add the current playing track to favourites. All with your midi device through Midi Mixer.

# This will only work with a spotify premium account

This will also not play spotify music directly. It is made to control the spotify app. The app is still needed to be running/playing music.

## Installing
To install without compiling from source, download the [.midiMixerPlugin from the latest release](https://github.com/Jaggernaut555/midi-mixer-spotify/releases/latest) and double click the file.

# Setting up this plugin
1. Log in to [Spotify developers](https://developer.spotify.com/) page and go to the [dashboard](https://developer.spotify.com/dashboard/)
2. Create an app. Set the name to something like `Midi Mixer Spotify Plugin`. The description can be anything
3. Add a redirect URI with the address `http://127.0.0.1:22025/auth/spotify/callback` and click `Add`
4. Enable the `Web API` and `Web Playback SDK` 
5. Click `Settings` on the newly created app
6. Copy the `Client ID` to the plugin's `Settings` page
7. Click `View client secret` and copy the `Client Secret` into the plugin's `Settings` page
8. Activate this plugin
9. On this plugin's `Settings` page click the `Run Login Server` button
10. Open the webpage [http://127.0.0.1:22025](http://127.0.0.1:22025)
11. Click the `Login with spotify` button. This should prompt you to log in to your spotify account. After logging in you will be prompted to approve of the app you created on step 2
12. Copy the `Access Token` and `Refresh Token` and enter them into this plugin's `Settings` page
13. Deactivate and reactivate this plugin



This package uses:
- [midi-mixer-plugin](https://github.com/midi-mixer/midi-mixer-plugin)
- [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node)
- [express](https://github.com/expressjs/express)
- [express-session](https://github.com/expressjs/session)
- [passport](https://github.com/jaredhanson/passport)
- [passport-spotify](https://github.com/JMPerez/passport-spotify)
- [pug](https://github.com/pugjs/pug)
