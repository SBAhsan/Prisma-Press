import { Router } from "express";
import { postController } from "./post.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(Role.ADMIN, Role.USER), postController.createPost);

router.get("/", postController.getAllPosts);

router.get("/stats", auth(Role.ADMIN), postController.getPostStats);

router.get(
  "/my-posts",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.getMyPosts,
);

router.get("/:postId", postController.getSinglePost);

router.patch("/:postId", auth(Role.ADMIN, Role.USER), postController.updatePost);

router.delete("/:postId", auth(Role.ADMIN, Role.USER), postController.deletePost);

export const postRoute = router;
