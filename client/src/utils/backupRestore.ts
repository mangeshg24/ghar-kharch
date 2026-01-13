import {
  getMembers,
  getExpenses,
  addMember,
  addExpense,
} from "@/db/indexedDb";

/* --------------------------
   BACKUP
-------------------------- */
export async function backupData() {
  const members = await getMembers();
  const expenses = await getExpenses();

  const data = {
    version: 1,
    createdAt: new Date().toISOString(),
    members,
    expenses,
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ghar-kharch-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------------
   RESTORE
-------------------------- */
export async function restoreData(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.members || !data.expenses) {
    throw new Error("Invalid backup file");
  }

  // ⚠️ Clear existing DB by deleting database
  indexedDB.deleteDatabase("ghar-kharch");

  // Small delay to ensure delete completes
  await new Promise((res) => setTimeout(res, 300));

  // Re-add data
  for (const m of data.members) {
    const { id, ...member } = m;
    await addMember(member);
  }

  for (const e of data.expenses) {
    const { id, ...expense } = e;
    await addExpense(expense);
  }
}
