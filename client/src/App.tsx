import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Members from "@/pages/Members";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      {/* App Shell */}
      <div className="flex min-h-screen bg-gray-50">
        {/* LEFT: Sidebar (always visible) */}
        <Sidebar />

        {/* RIGHT: Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/">
              <Dashboard />
            </Route>

            <Route path="/expenses">
              <Expenses />
            </Route>

            <Route path="/members">
              <Members />
            </Route>

            <Route path="/reports">
              <Reports />
            </Route>

            {/* HARD FALLBACK – never show 404 */}
            <Route>
              <Dashboard />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}
