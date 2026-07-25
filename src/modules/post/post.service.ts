import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPostInDB = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostsFromDB = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};

const getPostStatsFromDB = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // const totalPosts = await tx.post.count();

    // const totalPublishedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });

    // const totalArchivedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.ARCHIVED,
    //   },
    // });

    // const totalDraftedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });

    // const totalComments = await tx.comment.count();

    // const totalApprovedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.APPROVED,
    //   },
    // });

    // const totalRejectedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.REJECTED,
    //   },
    // });

    // const totalPostsViewsAggregate = await tx.post.aggregate({
    //     _sum: {
    //         views: true
    //     }
    // });

    // const totalPostViews = totalPostsViewsAggregate._sum.views

    // return {
    //   totalPosts,
    //   totalPublishedPosts,
    //   totalDraftedPosts,
    //   totalArchivedPosts,
    //   totalComments,
    //   totalApprovedComments,
    //   totalRejectedComments,
    //   totalPostViews
    // };

    const [
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostsViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECTED,
        },
      }),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftedPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostsViewsAggregate._sum
    };
  });
  return transactionResult;
};

const getMyPostsFromDB = async (userId: string) => {
  const myPosts = await prisma.post.findMany({
    where: {
      authorId: userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,

      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return myPosts;
};

const getSinglePostFromDB = async (postId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // throw new Error ("Fake error!")

    const result = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },

      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return result;
  });

  // await prisma.post.update({
  //     where: {
  //         id: postId
  //     },
  //     data: {
  //         views: {
  //             increment: 1
  //         }
  //     },
  // })

  // const result = await prisma.post.findUniqueOrThrow({
  //     where: {
  //         id: postId
  //     },

  //     include: {
  //         author: {
  //             omit: {
  //                 password: true
  //             }
  //         },
  //         comments: {
  //             where: {
  //                 status: CommentStatus.APPROVED
  //             },

  //             orderBy: {
  //                 createdAt: 'desc'
  //             },
  //         }
  //     },
  // })

  return transactionResult;
};

const updatePostInDB = async (
  postId: string,
  payload: IUpdatePostPayload,
  userId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== userId) {
    throw new Error("Can't update. You are not the owner of this post");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return result;
};

const deletePostFromDB = async (
  postId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== userId) {
    throw new Error("Can't delete. You are not the owner of this post");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

export const postService = {
  createPostInDB,
  getAllPostsFromDB,
  getPostStatsFromDB,
  getMyPostsFromDB,
  getSinglePostFromDB,
  updatePostInDB,
  deletePostFromDB,
};
