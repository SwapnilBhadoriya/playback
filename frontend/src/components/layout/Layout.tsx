import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  );
}
