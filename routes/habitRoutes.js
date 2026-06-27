import express from "express";
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
} from "../controllers/habitController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every habit route is private, so we apply protect to all of them at once.
router.use(protect);

router.route("/").get(getHabits).post(createHabit);

router
  .route("/:id")
  .get(getHabit)
  .put(updateHabit)
  .delete(deleteHabit);

router
  .route("/:id/complete")
  .post(completeHabit)
  .delete(uncompleteHabit);

export default router;
