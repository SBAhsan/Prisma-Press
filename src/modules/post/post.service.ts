import { title } from "node:process";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPostInDB = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostsFromDB = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: IPostQuery[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: JSON.parse(query.tags as string),
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  const posts = await prisma.post.findMany({
    // finding with multiple properties with AND operator (Exact match : Filtering)
    // that means if each of these properties' value is found in a post, then the post will be shown
    // where: {
    //     AND: [
    //         {
    //             title: ""
    //         },
    //         {
    //             content: ""
    //         }
    //     ]
    // },

    // finding with multiple properties with OR operator (Partial match : Searching)
    // that means if one of these is found in a post, then the post will be shown
    // where: {
    //     OR: [
    //         {
    //             title: {
    //                 contains: "first",
    //                 mode: "insensitive"
    //             }
    //         },
    //         {
    //             content: {
    //                 contains: "first",
    //                 mode: "insensitive"
    //             }
    //         }
    //     ]
    // },

    // take: 1,
    // skip: 0,

    // searching and filtering
    // where: {
    //     AND: [
    //         query.searchTerm ? {
    //     OR: [
    //         {
    //             title: {
    //                 contains: query.searchTerm,
    //                 mode: 'insensitive'
    //             }
    //         },
    //         {
    //             content: {
    //                 contains: query.searchTerm,
    //                 mode: 'insensitive'
    //             }
    //         }
    //     ]
    // } : {},

    //         // title filtering
    //         query.title ? { title : query.title } : {},

    //         // content filtering
    //         query.content ? { content: query.content } : {},
    //     ]
    // },

    where: {
      AND: andConditions,
    },

    // pagination
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

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
      totalPostViews: totalPostsViewsAggregate._sum,
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
