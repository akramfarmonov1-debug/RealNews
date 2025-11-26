import type { Request, Response, NextFunction } from "express";
import type { SessionUser } from "../auth";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  req.user = req.session.user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // For now, all logged-in users are considered admins
  // In the future, you can add role-based checks here
  req.user = req.session.user;
  next();
}