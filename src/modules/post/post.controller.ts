import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.createPostInDB(req.body, req.user?.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Post is created successfully",
        data: {
            result
        }
    })
});

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await postService.getAllPostsFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrieved all the posts successfully",
        data: posts
    })
  },
);

const getPostStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await postService.getPostStatsFromDB();
});

const getMyPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const myPosts = await postService.getMyPostsFromDB(req.user?.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrieved posts successfully",
        data: myPosts
    })
});

const getSinglePost = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    console.log(postId);

    if(!postId){
        throw new Error ("Post Id required")
    }

    const result = await postService.getSinglePostFromDB(postId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post retrieved successfully",
        data: result
    })
})

const updatePost = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId as string;
    const payload = req.body;
    const userId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN" ? true : false;

    const result = await postService.updatePostInDB(postId, payload, userId, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post updated successfully",
        data: result
    })
})


const deletePost = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId as string;
    const userId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN" ? true : false;

    const result = await postService.deletePostFromDB(postId, userId, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post deleted successfully",
        data: result
    })
})

export const postController = {
  createPost,
  getAllPosts,
  getPostStats,
  getMyPosts,
  getSinglePost,
  updatePost,
  deletePost
};
