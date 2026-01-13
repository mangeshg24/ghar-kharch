import { Router, Route, Switch, Navigate } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Members from "@/pages/Members";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    // IMPORTANT: must match GitHub repo name
    <Router base="/ghar-kharch">
      <Switch>
        {/* Main pages */}
        <Route path="/" component={Dashboard} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/members" component={Members} />
        <Route path="/reports" component={Reports} />

        {/* Fallback for refresh & direct URLs */}
        <Route>
          <Navigate to="/" replace />
        </Route>
      </Switch>
    </Router>
  );
}
