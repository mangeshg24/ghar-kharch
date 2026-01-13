import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Cycle {
  key: string;
  label: string;
  cycle: {
    start: Date;
    end: Date;
    isCurrent: boolean;
  };
}

interface Props {
  onChange: (cycle: {
    start: Date;
    end: Date;
    isCurrent: boolean;
  }) => void;
}

function generateCycles(count = 12): Cycle[] {
  const cycles: Cycle[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const base = new Date(today.getFullYear(), today.getMonth() - i, 11);
    const start = new Date(base);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 10);

    const key = `${start.toISOString()}_${end.toISOString()}`;
    const isCurrent =
      today >= start && today <= end;

    cycles.push({
      key,
      label: `${format(start, "MMM dd")} – ${format(end, "MMM dd, yyyy")}${isCurrent ? " (Current)" : ""}`,
      cycle: { start, end, isCurrent },
    });
  }

  return cycles;
}

export function CycleSelector({ onChange }: Props) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const list = generateCycles();
    setCycles(list);

    if (list.length > 0) {
      setValue(list[0].key);
      onChange(list[0].cycle);
    }
  }, []);

  const handleChange = (key: string) => {
    setValue(key);
    const found = cycles.find((c) => c.key === key);
    if (found) onChange(found.cycle);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Select cycle" />
      </SelectTrigger>
      <SelectContent>
        {cycles.map((c) => (
          <SelectItem key={c.key} value={c.key}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
