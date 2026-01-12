import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertExpense } from "@shared/schema";

export function useExpenses() {
  return useQuery({
    queryKey: [api.expenses.list.path],
    queryFn: async () => {
      const res = await fetch(api.expenses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      // Note: Dates will be strings from JSON, need to be coerced if schema used z.coerce.date()
      // But our schema uses timestamp() which drizle-zod handles as Date in runtime but JSON sends string
      const rawData = await res.json();
      return rawData.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      }));
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExpense) => {
      // Handle type coercion for form inputs
      const payload = {
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date), // Ensure date object
      };
      
      const validated = api.expenses.create.input.parse(payload);
      
      const res = await fetch(api.expenses.create.path, {
        method: api.expenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create expense");
      }
      return api.expenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertExpense>) => {
      const payload = { ...updates };
      if (payload.amount) payload.amount = Number(payload.amount);
      if (payload.date) payload.date = new Date(payload.date);

      const validated = api.expenses.update.input.parse(payload);
      const url = buildUrl(api.expenses.update.path, { id });
      
      const res = await fetch(url, {
        method: api.expenses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update expense");
      return api.expenses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, { 
        method: api.expenses.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] }),
  });
}
