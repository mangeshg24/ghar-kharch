import { useMemo } from "react";
import { format, addMonths, setDate, isAfter, isBefore, subMonths } from "date-fns";
import { CalendarDays } from "lucide-react";

export function CycleHeader() {
  const cycle = useMemo(() => {
    const today = new Date();
    const currentMonth10th = setDate(today, 10);
    
    let startDate, endDate;

    if (isAfter(today, currentMonth10th)) {
      // If today is after 10th, cycle is 11th of this month to 10th of next month
      startDate = setDate(today, 11);
      endDate = setDate(addMonths(today, 1), 10);
    } else {
      // If today is before or on 10th, cycle is 11th of prev month to 10th of this month
      startDate = setDate(subMonths(today, 1), 11);
      endDate = setDate(today, 10);
    }

    return {
      start: startDate,
      end: endDate,
      label: `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d")}`
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 lg:p-6 rounded-2xl shadow-xl shadow-slate-900/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-display font-bold text-slate-100">Current Expense Cycle</h2>
        <p className="text-slate-400 text-sm">Tracking expenses for this month's period</p>
      </div>
      
      <div className="flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/5">
        <CalendarDays className="w-5 h-5 text-sky-400" />
        <span className="font-mono font-semibold text-lg tracking-wide">{cycle.label}</span>
      </div>
    </div>
  );
}
