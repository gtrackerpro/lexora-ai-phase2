import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ServerUser, { IUser as IServerUser } from '../models/User';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IServerUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await ServerUser.findById(decoded.id);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
    return;
  }
};