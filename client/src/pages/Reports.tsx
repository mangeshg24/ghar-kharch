import { useExpenses } from "@/hooks/use-expenses";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Reports() {
  const { data: expenses } = useExpenses();

  const downloadCSV = () => {
    if (!expenses) return;

    const headers = ["Date", "Description", "Category", "Amount"];
    const rows = expenses.map(e => [
      format(new Date(e.date), "yyyy-MM-dd"),
      `"${e.description.replace(/"/g, '""')}"`, // Handle commas in description
      e.category,
      e.amount
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pt-10">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
          <FileDown className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-display font-bold">Reports & Exports</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Download your expense data for further analysis in Excel or Google Sheets.
        </p>
      </div>

      <Card className="border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download a CSV file containing all {expenses?.length || 0} expense records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={downloadCSV} 
            size="lg" 
            className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            disabled={!expenses || expenses.length === 0}
          >
            <Download className="w-5 h-5" /> Download CSV Report
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Includes date, description, category, and amount for every transaction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
