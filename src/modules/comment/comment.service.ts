import { prisma } from "../../lib/prisma";
import { ICreateCommentPayload, IUpdateCommentPayload } from "./comment.interface";

const createCommentInDB = async (
  payload: ICreateCommentPayload,
  authorId: string,
) => {
  const { content, postId } = payload;

  const result = await prisma.comment.create({
    data: {
      content,
      authorId,
      postId,
      status: "APPROVED",
    },
  });

  return result;
};

const getCommentsByAuthorIdFromDB = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
    },
  });

  return result;
};

const getCommentsByCommentIdFromDB = async (commentId: string) => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
    include: {
      post: true,
      author: {
        omit: {
          password: true,
        },
      },
    },
  });

  return result;
};


const updateCommentInDB = async(commentId: string, userId: string, payload: IUpdateCommentPayload, isAdmin : boolean) => {

    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        }
    })

    if(!isAdmin && comment.authorId !== userId){
        throw new Error ("You have no access to update this comment");
    }

    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: payload
    })

    return result;
};


const deleteCommentFromDB = async(commentId: string, userId: string, isAdmin : boolean) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        }
    })

    if(!isAdmin && comment.authorId !== userId){
        throw new Error ("You have no access to delete this comment")
    }


    const result = await prisma.comment.delete({
        where: {
            id: commentId
        }
    });

    return result;
}

export const commentService = {
  createCommentInDB,
  getCommentsByAuthorIdFromDB,
  getCommentsByCommentIdFromDB,
  updateCommentInDB,
  deleteCommentFromDB
};
