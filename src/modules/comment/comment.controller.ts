import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id;

    const result = await commentService.createCommentInDB(
      payload,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment created successfully",
      data: result,
    });
  },
);

const getCommentsByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.params.authorId as string;

    const result = await commentService.getCommentsByAuthorIdFromDB(authorId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comments retrieved successfully",
      data: result,
    });
  },
);

const getCommentsByComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;

    const result = await commentService.getCommentsByCommentIdFromDB(
      commentId as string,
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment retrieved successfully",
        data: result
    })
  },
);


const updateComment = catchAsync(async(req: Request, res: Response, next: NextFunction) => {

    const commentId = req.params.commentId;
    const userId = req.user?.id;
    const payload = req.body;
    const isAdmin = req.user?.role === 'ADMIN' ? true : false;

    const result = await commentService.updateCommentInDB(commentId as string, userId as string, payload, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment updated successfully",
        data: result
    })
});


const deleteComment = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    
    const commentId = req.params.commentId;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN' ? true : false;

    const result = await commentService.deleteCommentFromDB(commentId as string, userId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment deleted successfully",
        data: result
    });
})

export const commentController = {
  createComment,
  getCommentsByAuthorId,
  getCommentsByComment,
  updateComment,
  deleteComment
};
