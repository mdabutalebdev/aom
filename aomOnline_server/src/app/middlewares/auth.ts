/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Role hierarchy — higher value = higher authority
// parent < student < teacher < admin < superAdmin
const ROLE_HIERARCHY: Record<string, number> = {
  parent: 1,
  student: 2,
  teacher: 3,
  admin: 4,
  superAdmin: 5,
};

// JWT Authentication middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.access_secret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role-based Authorization middleware
// Usage: authorize('admin', 'teacher') → only these roles + superAdmin can access
// Hierarchy-aware: a role with authority >= the highest allowed role also passes.
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(403).json({ success: false, message: 'Access denied: No role found' });
    }

    const userRole = user.role as string;

    // superAdmin always has access
    if (userRole === 'superAdmin') {
      return next();
    }

    // Direct match against the allowed list
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // Hierarchy check — allow roles ranked at or above the highest allowed role
    const userRank = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredRank = Math.min(
      ...allowedRoles.map((r) => ROLE_HIERARCHY[r] ?? Number.MAX_SAFE_INTEGER),
    );
    if (userRank >= requiredRank) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: '${userRole}' role is not authorized for this action`,
    });
  };
};
