import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Members from "@/pages/Members";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        {/* Explicit routes */}
        <Route path="/" component={Dashboard} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/members" component={Members} />
        <Route path="/reports" component={Reports} />

        {/* ABSOLUTE fallback – ALWAYS dashboard */}
        <Route path="*">
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}
