import { format } from "date-fns";

export function exportCycleToCSV(
  cycle: { start: Date; end: Date },
  members: any[],
  expenses: any[]
) {
  // Calculate totals
  const totalFund = members.reduce(
    (sum, m) => sum + m.contribution,
    0
  );

  const cycleExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    d.setHours(12, 0, 0, 0);
    return d >= cycle.start && d <= cycle.end;
  });

  const totalSpent = cycleExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const balance = totalFund - totalSpent;

  // CSV content
  let csv = "";
  csv += `Home Expense Report\n`;
  csv += `Cycle,${format(cycle.start, "dd MMM yyyy")} - ${format(
    cycle.end,
    "dd MMM yyyy"
  )}\n\n`;

  csv += `Total Fund,${totalFund}\n`;
  csv += `Total Spent,${totalSpent}\n`;
  csv += `Balance,${balance}\n\n`;

  csv += `Date,Description,Amount\n`;

  cycleExpenses.forEach((e) => {
    csv += `${format(new Date(e.date), "dd-MM-yyyy")},`;
    csv += `"${e.description}",`;
    csv += `${e.amount}\n`;
  });

  // File download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Home-Expense-${format(
    cycle.start,
    "MMMdd"
  )}-${format(cycle.end, "MMMdd-yyyy")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
