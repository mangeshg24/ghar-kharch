import { backupData, restoreData } from "@/utils/backupRestore";
import { useEffect, useMemo, useState } from "react";
import { getMembers, getExpenses } from "@/db/indexedDb";
import { CycleSelector } from "@/components/CycleSelector";
import { exportCycleToCSV } from "@/utils/exportCsv";
import { exportCycleToPDF } from "@/utils/exportPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Reports() {
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cycle, setCycle] = useState<any>(null);

  // Manual previous balance (transparent)
  const [previousBalance, setPreviousBalance] = useState(0);

  useEffect(() => {
    (async () => {
      setMembers(await getMembers());
      setExpenses(await getExpenses());
    })();
  }, []);

  const report = useMemo(() => {
    if (!cycle) return null;

    const memberFund = members.reduce(
      (sum, m) => sum + Number(m.contribution || 0),
      0
    );

    const totalFund = memberFund + Number(previousBalance || 0);

    const cycleExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      d.setHours(12, 0, 0, 0);
      return d >= cycle.start && d <= cycle.end;
    });

    const totalSpent = cycleExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // Description-wise totals
    const descMap: Record<string, number> = {};
    cycleExpenses.forEach((e) => {
      const key = e.description.trim();
      descMap[key] = (descMap[key] || 0) + Number(e.amount);
    });

    const descSummary = Object.entries(descMap).map(
      ([desc, amount]) => ({ desc, amount })
    );

    return {
      memberFund,
      totalFund,
      totalSpent,
      balance: totalFund - totalSpent,
      descSummary,
      cycleExpenses,
    };
  }, [members, expenses, cycle, previousBalance]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-display font-bold">
        Monthly Report
      </h1>

      {/* Cycle Selector */}
      <div className="flex justify-between items-center">
        <CycleSelector onChange={setCycle} />

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

      {report && (
        <>
          {/* FUND SUMMARY */}
          <div className="bg-card border rounded-xl p-6 space-y-2">
            <h3 className="font-semibold text-lg">
              Fund Summary
            </h3>
            <p>Member Contributions: ₹{report.memberFund}</p>
            <p>Previous Balance: ₹{previousBalance}</p>
            <p className="font-semibold">
              Total Available Fund: ₹{report.totalFund}
            </p>
          </div>

          {/* EXPENSE SUMMARY */}
          <div className="bg-card border rounded-xl p-6 space-y-2">
            <h3 className="font-semibold text-lg">
              Expense Summary
            </h3>
            <p>Total Expenses: ₹{report.totalSpent}</p>
            <p className="font-semibold">
              Balance Remaining: ₹{report.balance}
            </p>
          </div>

          {/* DESCRIPTION-WISE SUMMARY */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">
              Description-wise Summary
            </h3>

            {report.descSummary.length === 0 ? (
              <p className="text-muted-foreground">
                No expenses for this cycle.
              </p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">
                      Description
                    </th>
                    <th className="text-right py-2">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.descSummary.map((d, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{d.desc}</td>
                      <td className="py-2 text-right">
                        ₹{d.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* FULL EXPENSE LIST */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">
              Detailed Expense List
            </h3>

            {report.cycleExpenses.length === 0 ? (
              <p className="text-muted-foreground">
                No expenses recorded.
              </p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">
                      Date
                    </th>
                    <th className="text-left py-2">
                      Description
                    </th>
                    <th className="text-right py-2">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.cycleExpenses.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2">
                        {format(
                          new Date(e.date),
                          "dd MMM yyyy"
                        )}
                      </td>
                      <td className="py-2">
                        {e.description}
                      </td>
                      <td className="py-2 text-right">
                        ₹{e.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* EXPORT BUTTONS */}
          <div className="flex gap-4">
            <Button
              onClick={() =>
                exportCycleToCSV(
                  cycle,
                  members,
                  expenses
                )
              }
            >
              Export Excel
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                exportCycleToPDF(
                  cycle,
                  members,
                  expenses,
                  previousBalance
                )
              }
            >
              Export PDF
            </Button>

            {/* BACKUP & RESTORE */}
<div className="bg-card border rounded-xl p-6 space-y-4">
  <h3 className="font-semibold text-lg">
    Backup & Restore
  </h3>

  <p className="text-sm text-muted-foreground">
    Backup your data safely or restore from a previous backup.
  </p>

  <div className="flex gap-4 items-center">
    <Button onClick={backupData}>
      Backup Data
    </Button>

    <label className="cursor-pointer">
      <input
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (
            confirm(
              "Restoring will overwrite existing data. Continue?"
            )
          ) {
            restoreData(file).then(() => {
              alert("Data restored successfully. Reloading...");
              window.location.reload();
            });
          }
        }}
      />
      <Button variant="outline">
        Restore Backup
      </Button>
    </label>
  </div>
</div>

          </div>
        </>
      )}
    </div>
  );
}
