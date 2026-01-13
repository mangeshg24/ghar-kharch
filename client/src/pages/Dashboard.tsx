import { useEffect, useMemo, useState } from "react";
import { getMembers, getExpenses } from "@/db/indexedDb";
import { CycleHeader } from "@/components/CycleHeader";
import { MetricCard } from "@/components/MetricCard";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { CycleSelector } from "@/components/CycleSelector";
import { exportCycleToCSV } from "@/utils/exportCsv";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

export default function Dashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cycle, setCycle] = useState<{
    start: Date;
    end: Date;
    isCurrent: boolean;
  } | null>(null);

  // 🧮 Manual Previous Balance
  const [previousBalance, setPreviousBalance] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setMembers(await getMembers());
    setExpenses(await getExpenses());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const financials = useMemo(() => {
    if (!cycle) {
      return {
        fund: 0,
        spent: 0,
        balance: 0,
        recentExpenses: [],
        chartData: [],
      };
    }

    const baseFund = members.reduce(
      (sum, m) => sum + Number(m.contribution || 0),
      0
    );

    const totalFund = baseFund + Number(previousBalance || 0);

    const cycleExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      d.setHours(12, 0, 0, 0);
      return d >= cycle.start && d <= cycle.end;
    });

    const totalSpent = cycleExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    const descMap: Record<string, number> = {};
    cycleExpenses.forEach((e) => {
      const key = e.description?.trim();
      if (!key) return;
      descMap[key] = (descMap[key] || 0) + Number(e.amount);
    });

    const chartData = Object.entries(descMap)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);

    return {
      fund: totalFund,
      spent: totalSpent,
      balance: totalFund - totalSpent,
      recentExpenses: [...cycleExpenses]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
        .slice(0, 5),
      chartData,
    };
  }, [members, expenses, cycle, previousBalance]);

  const isWarning =
    financials.spent > financials.fund * 0.9;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <CycleHeader />

      <div className="flex justify-between items-center">
        <CycleSelector onChange={setCycle} />

        {/* Manual Previous Balance */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Previous Balance
          </span>
          <Input
            type="number"
            className="w-32"
            value={previousBalance}
            onChange={(e) =>
              setPreviousBalance(Number(e.target.value))
            }
          />
        </div>
      </div>

      {isWarning && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-800 animate-pulse">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">
            Warning: You have spent over 90% of the monthly fund!
          </span>
        </div>
      )}

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
        />
        <MetricCard
          title="Balance Remaining"
          value={`₹${financials.balance.toLocaleString()}`}
          icon={PiggyBank}
          variant={
            financials.balance < 0 ? "danger" : "success"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">
              Recent Expenses
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  cycle &&
                  exportCycleToCSV(cycle, members, expenses)
                }
                className="px-4 py-2 rounded-lg border text-sm hover:bg-muted"
              >
                Export Excel
              </button>

              {cycle?.isCurrent && (
                <AddExpenseDialog onAdded={loadData} />
              )}

              <Link href="/expenses">
                <span className="text-sm hover:text-primary cursor-pointer">
                  View All →
                </span>
              </Link>
            </div>
          </div>

          <div className="divide-y">
            {financials.recentExpenses.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No expenses recorded in this cycle.
              </div>
            ) : (
              financials.recentExpenses.map((e) => (
                <div
                  key={e.id}
                  className="p-4 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(e.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    ₹{e.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">
            Spending Breakdown
          </h3>

          <div style={{ height: 320 }}>
            {financials.chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No expense data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financials.chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {financials.chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
