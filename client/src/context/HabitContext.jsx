import { createContext, useState, useCallback } from "react";
import { habitService } from "../services/habitService.js";

// HabitContext owns the user's list of habits. It's global because both the
// Dashboard and the My Habits page read/modify the same list, and we don't
// want them to fall out of sync or refetch independently.
export const HabitContext = createContext(null);

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitService.getAll();
      setHabits(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(async (data) => {
    const created = await habitService.create(data);
    setHabits((prev) => [created, ...prev]);
    return created;
  }, []);

  const editHabit = useCallback(async (id, data) => {
    const updated = await habitService.update(id, data);
    setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    return updated;
  }, []);

  const removeHabit = useCallback(async (id) => {
    await habitService.remove(id);
    setHabits((prev) => prev.filter((h) => h._id !== id));
  }, []);

  const value = {
    habits,
    loading,
    error,
    loadHabits,
    addHabit,
    editHabit,
    removeHabit,
  };
  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};
