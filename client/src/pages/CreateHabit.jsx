import { useNavigate } from "react-router-dom";
import { useHabits } from "../hooks/useHabits.js";
import { HabitForm } from "../components/HabitForm.jsx";

export default function CreateHabit() {
  const { addHabit } = useHabits();
  const navigate = useNavigate();

  // The form does the input handling; we just say what "submit" means here:
  // add the habit to global state, then go to the habits list.
  const handleCreate = async (data) => {
    await addHabit(data);
    navigate("/habits");
  };

  return (
    <main className="page" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1>New Habit</h1>
          <p className="page-subtitle">What do you want to build?</p>
        </div>
      </div>
      <HabitForm onSubmit={handleCreate} submitLabel="Create habit" />
    </main>
  );
}
