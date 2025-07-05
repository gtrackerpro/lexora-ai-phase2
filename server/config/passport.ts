import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          authProvider: 'google',
          lastLogin: new Date(),
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error as Error, false);
  }
});

export default passport;