import { Router } from "express";
import { commentController } from "./comment.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post('/', auth(Role.ADMIN, Role.USER), commentController.createComment);

router.get('/author/:authorId', commentController.getCommentsByAuthorId);

router.get('/:commentId', commentController.getCommentsByComment);

router.patch('/:commentId', auth(Role.ADMIN, Role.USER), commentController.updateComment);

router.delete('/:commentId', auth(Role.ADMIN, Role.USER), commentController.deleteComment)

export const commentRoute = router;