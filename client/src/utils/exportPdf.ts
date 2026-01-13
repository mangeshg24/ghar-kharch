import { format } from "date-fns";

export function exportCycleToPDF(
  cycle: { start: Date; end: Date },
  members: any[],
  expenses: any[],
  previousBalance = 0
) {
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

  const balance = totalFund - totalSpent;

  let html = `
    <html>
    <head>
      <title>Home Expense Report</title>
      <style>
        body { font-family: Arial; padding: 24px; }
        h1 { margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ccc; padding: 8px; font-size: 14px; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>
      <h1>Home Expense Report</h1>
      <p>
        Cycle: ${format(cycle.start, "dd MMM yyyy")} – ${format(
    cycle.end,
    "dd MMM yyyy"
  )}
      </p>

      <h3>Summary</h3>
      <p>Total Fund: ₹${totalFund}</p>
      <p>Total Spent: ₹${totalSpent}</p>
      <p>Balance: ₹${balance}</p>

      <h3>Expenses</h3>
      <table>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
  `;

  cycleExpenses.forEach((e) => {
    html += `
      <tr>
        <td>${format(new Date(e.date), "dd MMM yyyy")}</td>
        <td>${e.description}</td>
        <td>₹${e.amount}</td>
      </tr>
    `;
  });

  html += `
      </table>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.print();
}
