import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contribution: integer("contribution").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(), // Supports Marathi
  date: timestamp("date").notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
