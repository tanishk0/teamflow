import Sidebar from "../components/Sidebar.jsx";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, Building2, Users } from "lucide-react";

export function Settings() {
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];

  return (
    <section className="min-h-screen w-full flex bg-background">
      <Sidebar items={items} />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
              <p className="text-sm text-text-secondary">
                Select a workspace or team to view and manage its settings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Link
              to="/workspaces"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Building2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                Workspaces
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                View workspaces and manage their settings, rename, or delete.
              </p>
            </Link>

            <Link
              to="/teams"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                Teams
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                View teams and manage their settings, rename, or delete.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </section>
  );
}

export default Settings;