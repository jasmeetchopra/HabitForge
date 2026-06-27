import { useContext } from "react";
import { TodoContext } from "../context/TodoContext.jsx";

export const useTodos = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used inside <TodoProvider>");
  return ctx;
};
