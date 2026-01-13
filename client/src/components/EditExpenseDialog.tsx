import { useState } from "react";
import { updateExpense } from "@/db/indexedDb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/* -------- Cycle Helper -------- */
function getCurrentCycle(today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  let start: Date;
  let end: Date;

  if (d >= 11) {
    start = new Date(y, m, 11);
    end = new Date(y, m + 1, 10);
  } else {
    start = new Date(y, m - 1, 11);
    end = new Date(y, m, 10);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    startStr: start.toISOString().split("T")[0],
    endStr: end.toISOString().split("T")[0],
  };
}

interface Props {
  expense: any;
  onUpdated: () => void;
  disabled?: boolean;
}

export function EditExpenseDialog({
  expense,
  onUpdated,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(expense.amount));
  const [description, setDescription] = useState(
    expense.description
  );
  const [date, setDate] = useState(expense.date);

  const cycle = getCurrentCycle();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const selected = new Date(date);
    selected.setHours(12, 0, 0, 0);

    if (selected < cycle.start || selected > cycle.end) {
      toast({
        variant: "destructive",
        title: "Invalid date",
        description:
          "Expense date must be within the current cycle (11th–10th).",
      });
      return;
    }

    await updateExpense({
      ...expense,
      amount: Number(amount),
      description,
      date,
    });

    toast({
      title: "Expense Updated",
      description: "Changes saved successfully",
    });

    setOpen(false);
    onUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="h-8 w-8"
      >
        ✏️
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              min={cycle.startStr}
              max={cycle.endStr}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
