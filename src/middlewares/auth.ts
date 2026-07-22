import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Role } from "../../generated/prisma/enums";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}


export const auth = (...permittedRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not logged in. Please login to access this resource.",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret as string,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { id, name, email, role } = verifiedToken.data as JwtPayload;

    if (permittedRoles.length && !permittedRoles.includes(role)) {
      throw new Error("You don't have permission to access this resource");
    }

    const user = await prisma.user.findFirstOrThrow({
      where: {
        id,
        name,
        email,
        role,
      },
    });

    if (!user) {
      throw new Error("User does not exist. Please register");
    }

    req.user = {
      id,
      name,
      email,
      role,
    };

    next();
  });
};