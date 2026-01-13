import { useEffect, useState } from "react";
import {
  getExpenses,
  deleteExpense as dbDeleteExpense,
} from "@/db/indexedDb";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

/* --------------------------
   LOCAL HOOK (IndexedDB)
-------------------------- */
function useExpenses() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const expenses = await getExpenses();
    setData(expenses || []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, isLoading, refetch: load };
}

function useDeleteExpense(refetch: () => void) {
  return {
    mutate: async (id: number) => {
      await dbDeleteExpense(id);
      refetch();
    },
  };
}

/* --------------------------
   MAIN COMPONENT
-------------------------- */
export default function Expenses() {
  const { data: expenses, isLoading, refetch } = useExpenses();
  const { mutate: deleteExpense } = useDeleteExpense(refetch);

  const [search, setSearch] = useState("");

  const filteredExpenses = expenses
    .filter((expense) =>
      expense.description
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Expenses
          </h1>
          <p className="text-muted-foreground mt-1">
            View, edit, and manage all expense records.
          </p>
        </div>

        <AddExpenseDialog onAdded={refetch} />
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              className="pl-10 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">
                  Date
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">
                  Amount
                </TableHead>
                <TableHead className="w-[90px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10"
                  >
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No expenses found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="group">
                    <TableCell className="text-muted-foreground font-medium">
                      {format(
                        new Date(expense.date),
                        "dd MMM yyyy"
                      )}
                    </TableCell>

                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold">
                      ₹{expense.amount}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <EditExpenseDialog
                          expense={expense}
                          onUpdated={refetch}
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this expense?"
                              )
                            ) {
                              deleteExpense(expense.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
