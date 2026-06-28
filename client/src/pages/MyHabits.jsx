import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHabits } from "../hooks/useHabits.js";
import { dashboardService, habitService } from "../services/habitService.js";
import { HabitCard } from "../components/HabitCard.jsx";
import { Loader, EmptyState } from "../components/UI.jsx";
import { Modal } from "../components/Modal.jsx";

export default function MyHabits() {
  // The list of habits is GLOBAL state from HabitContext - shared with the
  // dashboard. Deleting here updates it everywhere at once.
  const { habits, loading, loadHabits, removeHabit } = useHabits();

  // "Which habits are done today" and "what's each streak" is view-specific,
  // so it's LOCAL state (useState) rather than something we keep globally.
  const [status, setStatus] = useState({}); // { habitId: { done, streak } }
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    loadHabits();
    // One call gives us today's completion + streak for every habit.
    dashboardService.get().then((d) => {
      const map = {};
      d.habits.forEach((h) => {
        map[h._id] = { done: h.completedToday, streak: h.currentStreak };
      });
      setStatus(map);
    });
  }, [loadHabits]);

  const toggle = async (habit, isDone) => {
    if (isDone) await habitService.uncomplete(habit._id);
    else await habitService.complete(habit._id);
    // Optimistically flip the local state for instant feedback.
    setStatus((prev) => ({
      ...prev,
      [habit._id]: {
        done: !isDone,
        streak: (prev[habit._id]?.streak || 0) + (isDone ? -1 : 1),
      },
    }));
  };

  const confirmDelete = async () => {
    await removeHabit(toDelete._id);
    setToDelete(null);
  };

  if (loading) return <Loader />;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>My Habits</h1>
          <p className="page-subtitle">Create, edit, and manage every habit.</p>
        </div>
        <Link className="btn btn-primary" to="/habits/new">+ New habit</Link>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No habits yet"
          message="Habits you create will show up here."
          action={<Link className="btn btn-primary" to="/habits/new">Create your first habit</Link>}
        />
      ) : (
        <div className="habit-grid">
          {habits.map((h) => (
            <HabitCard
              key={h._id}
              habit={h}
              completedToday={status[h._id]?.done || false}
              streak={status[h._id]?.streak || 0}
              onToggleComplete={toggle}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!toDelete}
        title="Delete habit?"
        confirmLabel="Delete"
        confirmDanger
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        <p>
          This will permanently delete "{toDelete?.title}" and all of its
          completion history. This can't be undone.
        </p>
      </Modal>
    </main>
  );
}
