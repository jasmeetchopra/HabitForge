import express from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every todo route is private

router.route("/").get(getTodos).post(createTodo);
router.route("/:id").put(updateTodo).delete(deleteTodo);

export default router;
