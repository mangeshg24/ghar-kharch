import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Members from "@/pages/Members";
import Reports from "@/pages/Reports";

/**
 * FINAL STABLE APP ROUTER
 * - Hash routing (GitHub Pages safe)
 * - No Navigate
 * - No internal 404
 * - Sidebar/pages stay mounted correctly
 */
export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        {/* Primary routes */}
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

        {/* HARD FALLBACK — never show app 404 */}
        <Route>
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}
