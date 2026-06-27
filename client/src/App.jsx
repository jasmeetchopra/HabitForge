import { AuthProvider } from "./context/AuthContext.jsx";
import { HabitProvider } from "./context/HabitContext.jsx";
import { TodoProvider } from "./context/TodoContext.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";

// Providers wrap the whole app so any component can read auth/habit state.
// Order matters only if one depended on the other; here they're independent.
export default function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <TodoProvider>
          <AppRoutes />
        </TodoProvider>
      </HabitProvider>
    </AuthProvider>
  );
}
