import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Members
  app.get(api.members.list.path, async (req, res) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  app.post(api.members.create.path, async (req, res) => {
    try {
      const input = api.members.create.input.parse(req.body);
      const member = await storage.createMember(input);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.members.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const updated = await storage.updateMember(id, req.body);
    if (!updated) return res.status(404).json({ message: "Member not found" });
    res.json(updated);
  });

  app.delete(api.members.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteMember(id);
    res.status(204).send();
  });

  // Expenses
  app.get(api.expenses.list.path, async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.post(api.expenses.create.path, async (req, res) => {
    try {
      const input = api.expenses.create.input.parse(req.body);
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.expenses.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const updated = await storage.updateExpense(id, req.body);
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.json(updated);
  });

  app.delete(api.expenses.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteExpense(id);
    res.status(204).send();
  });

  return httpServer;
}

// Seed function
async function seedDatabase() {
  const members = await storage.getMembers();
  if (members.length === 0) {
    await storage.createMember({ name: "Rahul", contribution: 50000 });
    await storage.createMember({ name: "Priya", contribution: 30000 });
    
    // Add some sample expenses
    await storage.createExpense({ 
      amount: 2000, 
      category: "Groceries", 
      description: "Weekly vegetables", 
      date: new Date()
    });
    await storage.createExpense({ 
      amount: 500, 
      category: "Utility", 
      description: "Electricity Bill part payment", 
      date: new Date()
    });
  }
}

// Call seed (in a real app, maybe trigger via a route or script, but here simple invocation is fine for dev)
// Note: We're not calling it here directly to avoid race conditions with server start, 
// but in this environment it's often handled by checking DB on start.
// For now, let's just leave it available.
seedDatabase().catch(console.error);
