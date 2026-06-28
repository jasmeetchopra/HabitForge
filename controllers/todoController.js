import Todo from "../models/Todo.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateTodo } from "../middleware/validators.js";

// Find a todo and confirm it belongs to the logged-in user (authorization).
const findOwnedTodo = async (id, userId, res) => {
  const todo = await Todo.findById(id);
  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }
  if (todo.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("You do not have access to this todo");
  }
  return todo;
};

// @desc   List my todos (newest first; filtering/sorting done on the client)
// @route  GET /api/todos
// @access Private
export const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(todos);
});

// @desc   Create a todo
// @route  POST /api/todos
// @access Private
export const createTodo = asyncHandler(async (req, res) => {
  validateTodo(req, res);
  const { title, description, priority, dueDate } = req.body;

  const todo = await Todo.create({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  res.status(201).json(todo);
});

// @desc   Update a todo (also used to toggle `completed`)
// @route  PUT /api/todos/:id
// @access Private
export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await findOwnedTodo(req.params.id, req.user._id, res);
  const { title, description, priority, dueDate, completed } = req.body;

  // Only validate the full payload when fields that need it are present.
  if (title !== undefined || priority !== undefined || dueDate !== undefined) {
    validateTodo(req, res);
  }

  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description.trim();
  if (priority !== undefined) todo.priority = priority;
  if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;
  if (completed !== undefined) todo.completed = completed;

  const updated = await todo.save();
  res.json(updated);
});

// @desc   Delete a todo
// @route  DELETE /api/todos/:id
// @access Private
export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await findOwnedTodo(req.params.id, req.user._id, res);
  await todo.deleteOne();
  res.json({ message: "Todo deleted", id: todo._id });
});
