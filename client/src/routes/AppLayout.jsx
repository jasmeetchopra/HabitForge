import { Outlet } from "react-router-dom";
import { TopNav } from "../components/Navigation.jsx";

// Shared shell for logged-in pages: top navigation, then the page below it.
// The sidebar has been removed — navigation is fully top-based now.
export const AppLayout = () => (
  <div className="app-main">
    <TopNav />
    <Outlet />
  </div>
);
