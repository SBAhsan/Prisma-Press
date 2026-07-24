import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPostInDB = async (payload: ICreatePostPayload, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })

    return result;
};

const getAllPostsFromDB = async () => {
    const posts = await prisma.post.findMany({
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    return posts;
};

const getPostStatsFromDB = async () => {
    const stats = await prisma.post.findMany({
        
    })
};

const getMyPostsFromDB = async (userId: string) => {
    const myPosts = await prisma.post.findMany({
        where: {
            authorId: userId
        },

        orderBy: {
            createdAt: "desc"
        },

        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true,

            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    return myPosts;
};

const getSinglePostFromDB = async (postId: string) => {

    await prisma.post.update({
        where: {
            id: postId
        },
        data: {
            views: {
                increment: 1
            }
        },
    })

    const result = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },

        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: {
                where: {
                    status: CommentStatus.APPROVED
                },
                
                orderBy: {
                    createdAt: 'desc'
                },
            }
        },
    })

    

    return result;
};

const updatePostInDB = async (postId : string, payload: IUpdatePostPayload, userId: string, isAdmin: boolean) => {

    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if(!isAdmin && post.authorId !== userId){
        throw new Error ("Can't update. You are not the owner of this post")
    }


    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    return result;
}

const deletePostFromDB = async (postId: string, userId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if(!isAdmin && post.authorId !== userId){
        throw new Error ("Can't delete. You are not the owner of this post");
    }


    const result = await prisma.post.delete({
        where : {
            id: postId
        }
    })


    return result;
}

export const postService = {
  createPostInDB,
  getAllPostsFromDB,
  getPostStatsFromDB,
  getMyPostsFromDB,
  getSinglePostFromDB,
  updatePostInDB,
  deletePostFromDB
};
