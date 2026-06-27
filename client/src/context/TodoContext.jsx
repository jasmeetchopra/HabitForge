import { createContext, useState, useCallback } from "react";
import { todoService } from "../services/todoService.js";

// Global todo state, mirroring HabitContext. Shared between the Todos page and
// (in Phase 4) the dashboard, so both stay in sync without refetching.
export const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTodos(await todoService.getAll());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (data) => {
    const created = await todoService.create(data);
    setTodos((prev) => [created, ...prev]);
    return created;
  }, []);

  const editTodo = useCallback(async (id, data) => {
    const updated = await todoService.update(id, data);
    setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  }, []);

  const toggleTodo = useCallback(async (todo) => {
    const updated = await todoService.update(todo._id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? updated : t)));
    return updated;
  }, []);

  const removeTodo = useCallback(async (id) => {
    await todoService.remove(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const value = { todos, loading, error, loadTodos, addTodo, editTodo, toggleTodo, removeTodo };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
