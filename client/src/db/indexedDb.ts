import { openDB } from "idb";

/* ==============================
   DATABASE CONFIG
============================== */
const DB_NAME = "ghar-kharch";
const DB_VERSION = 2;

/* ==============================
   OPEN DATABASE
============================== */
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Expenses
    if (!db.objectStoreNames.contains("expenses")) {
      db.createObjectStore("expenses", {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    // Members
    if (!db.objectStoreNames.contains("members")) {
      db.createObjectStore("members", {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    // Cycle Summary (for carry-forward balance)
    if (!db.objectStoreNames.contains("cycleSummary")) {
      db.createObjectStore("cycleSummary", {
        keyPath: "cycleKey",
      });
    }
  },
});

/* ==============================
   EXPENSES
============================== */
export async function getExpenses() {
  return (await dbPromise).getAll("expenses");
}

export async function addExpense(expense: any) {
  return (await dbPromise).add("expenses", expense);
}

export async function updateExpense(expense: any) {
  return (await dbPromise).put("expenses", expense);
}

export async function deleteExpense(id: number) {
  return (await dbPromise).delete("expenses", id);
}

/* ==============================
   MEMBERS
============================== */
export async function getMembers() {
  return (await dbPromise).getAll("members");
}

export async function addMember(member: any) {
  return (await dbPromise).add("members", member);
}

export async function updateMember(member: any) {
  return (await dbPromise).put("members", member);
}

export async function deleteMember(id: number) {
  return (await dbPromise).delete("members", id);
}

/* ==============================
   CYCLE SUMMARY (Carry Forward)
============================== */
export async function saveCycleSummary(summary: {
  cycleKey: string;
  fund: number;
  spent: number;
  balance: number;
}) {
  return (await dbPromise).put("cycleSummary", summary);
}

export async function getCycleSummary(cycleKey: string) {
  return (await dbPromise).get("cycleSummary", cycleKey);
}
