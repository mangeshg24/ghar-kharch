import { Router, Route, Switch } from "wouter";
import { Navigate } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Members from "@/pages/Members";
import Reports from "@/pages/Reports";
import Layout from "@/components/Layout";

export default function App() {
  return (
    // IMPORTANT: base must match GitHub repo name
    <Router base="/ghar-kharch">
      <Layout>
        <Switch>
          {/* Main pages */}
          <Route path="/" component={Dashboard} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/members" component={Members} />
          <Route path="/reports" component={Reports} />

          {/* Fallback for GitHub Pages refresh / direct links */}
          <Route>
            <Navigate to="/" replace />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}
