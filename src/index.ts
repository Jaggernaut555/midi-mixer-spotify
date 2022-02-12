import { Assignment, ButtonType } from "midi-mixer-plugin";
import SpotifyWebApi from "spotify-web-api-node";
import { initLoginServer } from "./spotify-login";

let clientId = "";
let clientSecret = "";
let accessToken = "";
let refreshToken = "";
var spotifyApi = new SpotifyWebApi();

let settings: Record<string, any>;

// Remember the last device spotify was using. Without this after like 15 seconds of spotify being paused you can no longer control it.
let recentDevice: string;
// Don't overwrite local changes during the time it takes to sync changes between local and remote settings
let updated = false;

// Spotify api rate limit is 2000 requests/hour per application
// This may require changing the volume refreshing

// This interface is used all over "spotify-web-api-node" but not exported for some reason.
interface Response<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

async function initVolume() {
  const volumeAssignment = new Assignment("VolumeAssignment", {
    name: "Spotify Volume",
    volume: 0,
  });

  volumeAssignment.on("volumeChanged", async (level: number) => {
    updated = true;
    volumeAssignment.volume = level;
    if (!volumeAssignment.muted) {
      await spotifyReq(async () => {
        volumeAssignment.volume = level;
        await spotifyApi.setVolume(Math.floor(level * 100), { device_id: recentDevice });
      }, false, false);
    }
  });

  volumeAssignment.on("mutePressed", async () => {
    updated = true;
    if (volumeAssignment.muted) {
      volumeAssignment.muted = false;
      await spotifyReq(async () => {
        let level = Math.floor(volumeAssignment.volume * 100)
        await spotifyApi.setVolume(level, { device_id: recentDevice });
        updated = true;
      }, false, false);
    }
    else {
      volumeAssignment.muted = true;
      await spotifyReq(async () => {
        await spotifyApi.setVolume(0, { device_id: recentDevice });
        updated = true;
      }, false, false);
    }
  });

  const receiveVolume = (res: Response<SpotifyApi.CurrentPlaybackResponse>) => {
    if (res && res.body && res.body.device && res.body.device.volume_percent !== null) {
      let level = res.body.device.volume_percent / 100
      if (level != 0) {
        volumeAssignment.muted = false;
        volumeAssignment.volume = level;
      }
      else if (!volumeAssignment.muted) {
        volumeAssignment.emit("mutePressed");
      }
    }
  }

  await spotifyReq(async (res) => {
    receiveVolume(res);
  }, true);

  // If there's no device id then the api doesn't know where to play
  // Volume refreshing
  setInterval(async () => {
    spotifyReq(async (res) => {
      if (res && res.body && res.body.is_playing && res.body.device) {
        recentDevice = res.body.device.id ?? recentDevice;
        if (updated) {
          updated = false;
          return;
        }
        receiveVolume(res);
      }
      else {
        // There is no current or recently playing device
      }
    }, true);
  }, 1000);
}

function initButtons() {

  const playPauseButton = new ButtonType("PlayPauseButton", {
    name: "Play/Pause Button",
    active: true,
  });

  playPauseButton.on("pressed", async () => {
    spotifyReq(async (res) => {
      if (res.body.is_playing) {
        await spotifyApi.pause({ device_id: recentDevice });
      }
      else {
        await spotifyApi.play({ device_id: recentDevice });
      }
    });
  });

  const nextButton = new ButtonType("NextButton", {
    name: "Next Button",
    active: true,
  });
  nextButton.on("pressed", async () => {
    spotifyReq(async (res) => {
      await spotifyApi.skipToNext({ device_id: recentDevice });
    });
  });

  const previousButton = new ButtonType("PreviousButton", {
    name: "Previous Button",
    active: true,
  });
  previousButton.on("pressed", async () => {
    spotifyReq(async (res) => {
      await spotifyApi.skipToPrevious({ device_id: recentDevice });
    });
  });

  const saveTrackButton = new ButtonType("SaveTrackButton", {
    name: "Save Track",
    active: true,
  });
  saveTrackButton.on("pressed", () => {
    spotifyReq(async (res) => {
      if (!res.body.item) {
        console.log("No valid item to add to saved tracks");
        return;
      }
      await spotifyApi.addToMySavedTracks([res.body.item?.id]);
    });
  });
}

// Wrapper function to handle access token expiry
async function spotifyReq(f: (res: Response<SpotifyApi.CurrentPlaybackResponse>) => Promise<void>, skipCheck: boolean = false, getState: boolean = true) {
  if (!recentDevice && !skipCheck) {
    console.log(`No recent device to control`);
    return;
  }

  let res: Response<SpotifyApi.CurrentPlaybackResponse>;

  try {
    if (getState) {
      res = await spotifyApi.getMyCurrentPlaybackState();
      recentDevice = res.body?.device?.id ?? recentDevice;
    }
    await f(res!);
    return;
  }
  catch (error: any) {
    // Can't import error type WebapiRegularError but that's what this would be
    if (error && error.body && error.body.error && error.body.error.status == 401) {
      await spotifyApi.refreshAccessToken().then(
        function (data) {
          console.log('The access token has been refreshed!');

          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body.access_token);
        },
        function (err) {
          console.log('Could not refresh access token', err);
        }
      );
    }
    else {
      log.error(error);
      return;
    }
  }

  // If it was just a lack of fresh token try again.
  try {
    if (getState) {
      res = await spotifyApi.getMyCurrentPlaybackState();
      recentDevice = res.body?.device?.id ?? recentDevice;
    }
    await f(res!);
  }
  catch (error) {
    log.debug("Retrying failed");
    log.error(error);
  }
}

async function init() {
  settings = await $MM.getSettings();
  clientId = settings["ClientID"];
  clientSecret = settings["ClientSecret"];
  accessToken = settings["AccessToken"];
  refreshToken = settings["RefreshToken"];

  if (!clientId || !clientSecret) {
    log.error("Cannot function without client ID or Secret");
    $MM.showNotification("Cannot run spotify plugin without a ClientID or ClientSecret");
    process.exit(1);
  }

  if (!accessToken || !refreshToken) {
    log.error("Need an access and refresh token. Follow the instuctions on the Info page to log in.");
    $MM.showNotification("Need an access and refresh token. Follow the instuctions on the Info page to log in.");
    return;
  }

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);
  spotifyApi.setClientId(clientId);
  spotifyApi.setClientSecret(clientSecret);

  initVolume();
  initButtons();
}

$MM.onSettingsButtonPress("runLogin", () => {
  initLoginServer();
})

init();
