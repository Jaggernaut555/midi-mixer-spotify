# Spotify

Control spotify volume, skip tracks, play/pause, and add the current playing track to favourites.

# This will only work with a spotify premium account

This will also not play spotify music directly. It it made to control the spotify app. The app is still needed to be running/playing music.

# Setting up this plugin

You can open up these steps in a web browser [on the github repo](https://github.com/Jaggernaut555/midi-mixer-spotify/blob/main/README.md#setting-up-this-plugin)

1. Log in to [Spotify developers dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app. Set the name to something like `Midi Mixer Spotify Plugin`. The description can be anything
3. Copy the `Client ID` and `Client Secret` and enter them into this plugin's `Settings` page
4. Click `Edit Settings` on the newly created app
5. Add a redirect URI with the address `http://localhost:22025/auth/spotify/callback`
6. Click `Add` and then `Save`
7. Activate this plugin
8. On this plugin's `Settings` page click the `Run Login Server` button
9. Open the webpage [http://localhost:22025](http://localhost:22025)
10. Click the `Login with spotify` button. This should prompt you to log in to your spotify account. After logging in you will be prompted to approve of the app you created on step 2
11. Copy the `Access Token` and `Refresh Token` and enter them into this plugin's `Settings` page
12. Deactivate and reactivate this plugin

Latest releases of this plugin available [on the project's github page](https://github.com/Jaggernaut555/midi-mixer-spotify/releases/latest)
