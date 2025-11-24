const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport){
  // serialize
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try{
      const user = await User.findById(id).lean();
      done(null, user);
    }catch(err){
      done(err);
    }
  });

  const clientID = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  if (!clientID || clientID.includes('SEU_CLIENT_ID')) {
    console.log('⚠️ GOOGLE_CLIENT_ID not set — Google OAuth disabled. Mock login available at /auth/mock');
    // No Google strategy registered; routes will offer mock login fallback.
    return;
  }

  passport.use(new GoogleStrategy({
    clientID, clientSecret, callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try{
      // find or create user
      let user = await User.findOne({ googleId: profile.id });
      if(!user){
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName || (profile.emails && profile.emails[0] && profile.emails[0].value),
          email: profile.emails && profile.emails[0] && profile.emails[0].value
        });
      }
      return done(null, user);
    }catch(err){
      return done(err);
    }
  }));
};
