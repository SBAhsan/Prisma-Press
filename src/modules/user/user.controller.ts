import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";

// const registerUser = async (req: Request, res: Response) => {

//   try {
//     const user = await userService.registerUserInDB(req.body)

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "User created successfully",
//     data: {
//       user
//     }
//   });
//   } catch (error: any) {

//   }
// }


const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.registerUserInDB(req.body);

    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   statusCode: httpStatus.CREATED,
    //   message: "User created successfully",
    //   data: {
    //     user,
    //   },
    // });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: {
        user,
      },
    });
  },
);

const getMyProfile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {

  const profile = await userService.getMyProfileFromDB(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: {profile}
  })
})


const updateMyProfile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {

  const userId = req.user?.id;
  const payload = req.body;

  const updatedProfile = await userService.updateMyProfileInDB(userId as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Updated profile successfully",
    data: {
      updatedProfile
    }
  })
})

export const userController = {
  registerUser, getMyProfile, updateMyProfile
};
