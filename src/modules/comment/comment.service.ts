import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IModerateCommentPayload,
  IUpdateCommentPayload,
} from "./comment.interface";

const createCommentInDB = async (
  payload: ICreateCommentPayload,
  authorId: string,
) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  const result = await prisma.comment.create({
    data: {
      ...payload,
      authorId,
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
      post: {
        select: {
          id: true,
          title: true,
        },
      },
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
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
      author: {
        omit: {
          password: true,
        },
      },
    },
  });

  return result;
};

const updateCommentInDB = async (
  commentId: string,
  userId: string,
  payload: IUpdateCommentPayload,
  isAdmin: boolean,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  if (!isAdmin && comment.authorId !== userId) {
    throw new Error("You have no access to update this comment");
  }

  const result = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: payload,
  });

  return result;
};

const deleteCommentFromDB = async (
  commentId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  if (!isAdmin && comment.authorId !== userId) {
    throw new Error("You have no access to delete this comment");
  }

  const result = await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  return result;
};


const moderateCommentInDB = async (commentId: string, payload: IModerateCommentPayload) => {
    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            ...payload
        }
    });

    return result;
}

export const commentService = {
  createCommentInDB,
  getCommentsByAuthorIdFromDB,
  getCommentsByCommentIdFromDB,
  updateCommentInDB,
  deleteCommentFromDB,
  moderateCommentInDB
};
