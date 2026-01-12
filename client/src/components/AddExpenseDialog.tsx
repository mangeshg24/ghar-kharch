import { useState } from "react";
import { useCreateExpense } from "@/hooks/use-expenses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Groceries", "Vegetables", "Milk/Dairy", "Utilities", 
  "Medical", "Entertainment", "Dining Out", "Transportation", "Other"
];

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createExpense, isPending } = useCreateExpense();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0] // Default to today YYYY-MM-DD
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpense(
      {
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({
            amount: "",
            category: "",
            description: "",
            date: new Date().toISOString().split("T")[0]
          });
          toast({
            title: "Expense Added",
            description: `₹${formData.amount} added to ${formData.category}`,
          });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense. Description supports Marathi input.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              required
              placeholder="0.00"
              className="text-lg font-mono"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({...formData, category: val})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              required
              placeholder="e.g. Weekly veggies / आठवड्याची भाजी"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Expense"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
