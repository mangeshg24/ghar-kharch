import { useMembers } from "@/hooks/use-members";
import { useExpenses } from "@/hooks/use-expenses";
import { CycleHeader } from "@/components/CycleHeader";
import { MetricCard } from "@/components/MetricCard";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { Wallet, TrendingDown, PiggyBank, AlertTriangle, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { isWithinInterval, setDate, addMonths, subMonths, isAfter, format } from "date-fns";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Link } from "wouter";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const { data: members, isLoading: loadingMembers } = useMembers();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses();

  // Calculate financials based on current cycle
  const financials = useMemo(() => {
    if (!members || !expenses) return { fund: 0, spent: 0, balance: 0, recentExpenses: [], categoryData: [] };

    // Determine current cycle dates
    const today = new Date();
    let start, end;
    if (isAfter(today, setDate(today, 10))) {
      start = setDate(today, 11);
      end = setDate(addMonths(today, 1), 10);
    } else {
      start = setDate(subMonths(today, 1), 11);
      end = setDate(today, 10);
    }

    // 1. Total Fund
    const totalFund = members.reduce((sum, m) => sum + m.contribution, 0);

    // 2. Filter expenses for current cycle
    const cycleExpenses = expenses.filter(e => 
      isWithinInterval(new Date(e.date), { start, end })
    );

    // 3. Total Spent
    const totalSpent = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 4. Category breakdown
    const catMap = cycleExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return {
      fund: totalFund,
      spent: totalSpent,
      balance: totalFund - totalSpent,
      recentExpenses: [...cycleExpenses].sort((a, b) => b.id - a.id).slice(0, 5),
      categoryData
    };
  }, [members, expenses]);

  const isWarning = financials.spent > (financials.fund * 0.9);

  if (loadingMembers || loadingExpenses) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <CycleHeader />

      {isWarning && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-800 animate-pulse">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Warning: You have spent over 90% of the total monthly fund!</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Monthly Fund"
          value={`₹${financials.fund.toLocaleString()}`}
          icon={Wallet}
          variant="primary"
        />
        <MetricCard 
          title="Total Spent"
          value={`₹${financials.spent.toLocaleString()}`}
          icon={TrendingDown}
          variant={isWarning ? "danger" : "default"}
          trend="up"
          trendLabel="12%"
        />
        <MetricCard 
          title="Balance Remaining"
          value={`₹${financials.balance.toLocaleString()}`}
          icon={PiggyBank}
          variant={financials.balance < 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses List */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-display font-bold text-lg">Recent Expenses</h3>
            <div className="flex gap-4">
              <AddExpenseDialog />
              <Link href="/expenses">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {financials.recentExpenses.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No expenses recorded in this cycle yet.
              </div>
            ) : (
              financials.recentExpenses.map((expense) => (
                <div key={expense.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {expense.category[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.category} • {format(new Date(expense.date), 'MMM d')}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-lg">₹{expense.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <h3 className="font-display font-bold text-lg mb-6">Spending by Category</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financials.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {financials.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
