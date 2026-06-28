import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHabits } from "../hooks/useHabits.js";
import { habitService } from "../services/habitService.js";
import { HabitForm } from "../components/HabitForm.jsx";
import { Loader } from "../components/UI.jsx";

export default function EditHabit() {
  const { id } = useParams(); // the :id from the URL /habits/:id/edit
  const { editHabit } = useHabits();
  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [error, setError] = useState("");

  // Load the habit we're editing so the form can be pre-filled.
  useEffect(() => {
    habitService
      .getOne(id)
      .then((res) => setHabit(res.habit))
      .catch(() => setError("Could not load that habit"));
  }, [id]);

  const handleUpdate = async (data) => {
    await editHabit(id, data);
    navigate("/habits");
  };

  if (error) return <main className="page"><div className="form-error">{error}</div></main>;
  if (!habit) return <Loader />;

  return (
    <main className="page" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1>Edit Habit</h1>
          <p className="page-subtitle">Update the details below.</p>
        </div>
      </div>
      <HabitForm initial={habit} onSubmit={handleUpdate} submitLabel="Save changes" />
    </main>
  );
}
