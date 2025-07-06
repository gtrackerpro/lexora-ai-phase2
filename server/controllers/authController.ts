import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { HydratedDocument } from 'mongoose';
import ServerUser, { IUser as IServerUser } from '../models/User';
import passport from '../config/passport';

// Validate and declare JWT constants
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!JWT_EXPIRE) {
  throw new Error('JWT_EXPIRE environment variable is required');
}

// Properly typed JWT secret constant
const JWT_SECRET_TYPED: Secret = JWT_SECRET;

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET_TYPED, {
    expiresIn: JWT_EXPIRE! as any
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user exists
    const existingUser = await ServerUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await ServerUser.create({
      email,
      password,
      displayName,
      authProvider: 'local'
    }) as IServerUser;

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await ServerUser.findOne({ email }).select('+password') as HydratedDocument<IServerUser>;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (err: any, user: HydratedDocument<IServerUser>) => {
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      preferences: user.preferences
    }))}`);
  })(req, res);
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await ServerUser.findById(req.user?._id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/me/preferences
// @access  Private
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;

    const user = await ServerUser.findByIdAndUpdate(
      req.user?._id,
      { preferences },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};