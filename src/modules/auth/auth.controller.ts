import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authService } from "./auth.service";

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {accessToken, refreshToken} = await authService.loginUserInDB(req.body);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {accessToken, refreshToken}
    })
})


const refreshToken = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const {accessToken} = await authService.refreshTokenInDB(refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Token refreshed successfully",
        data: {
            accessToken
        }
    })
})

export const authController = {
    loginUser, refreshToken
}