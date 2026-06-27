import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

// Tiny convenience hook so components write `const { user } = useAuth()`
// instead of importing useContext and the context object everywhere.
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
