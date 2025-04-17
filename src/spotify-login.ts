// import { Assignment, ButtonType } from "midi-mixer-plugin";
import express from 'express';
import session from 'express-session';
import passport, { AuthenticateOptions } from 'passport';
import { Strategy } from 'passport-spotify';

let clientId = "";
let clientSecret = "";
const SESSION_SECRET = 'Not important here';
const CALLBACK_URL = 'http://127.0.0.1:22025/auth/spotify/callback';

let settings: Record<string, any>;

export async function initLoginServer() {
  settings = await $MM.getSettings();
  clientId = settings["SpotifyClientID"];
  clientSecret = settings["SpotifyClientSecret"];
  initExpress();
}

function initExpress() {
  const app = express()
  const port = 22025
  app.set("view engine", "pug");
  app.set("views", __dirname + '/views');

  app.use(
    session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true, cookie: { maxAge: 1000 * 5 } })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', (req, res) => {
    res.render('index', { user: req.user });
  });

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    done(null, user);
  });

  passport.use(
    new Strategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: CALLBACK_URL
      },
      function (accessToken, refreshToken, expires_in, profile, done) {
        return done(null, { ...profile, accessToken, refreshToken });
      }
    )
  );

  app.get('/auth/spotify', passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-library-modify', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'],
    // This setting requires the type assertion below
    showDialog: true
  } as AuthenticateOptions));

  app.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    }
  );

  app.listen(port, () => {
    console.log(`Spotify login server listening on port ${port}`);
    $MM.setSettingsStatus("SpotifyExpressStatus", "Running");
  });
}
