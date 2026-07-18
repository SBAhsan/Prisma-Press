import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

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

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: {
        user,
      },
    });
  },
);

export const userController = {
  registerUser,
};
