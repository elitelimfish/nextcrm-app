"use client";
import { SallyTarget } from "@supportsally/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TargetList = {
  id: string;
  name: string;
  _count: { targets: number };
};

type Props = {
  initialData: { target_list_ids?: string[] };
  targetLists: TargetList[];
  onNext: (data: { target_list_ids: string[] }) => void;
  onBack: () => void;
};

export function Step3Audience({
  initialData,
  targetLists,
  onNext,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialData.target_list_ids ?? [])
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filtered = targetLists.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalRecipients = targetLists
    .filter((l) => selected.has(l.id))
    .reduce((sum, l) => sum + l._count.targets, 0);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError("");
  };

  const handleNext = () => {
    if (selected.size === 0) {
      setError("Select at least one target list");
      return;
    }
    onNext({ target_list_ids: Array.from(selected) });
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <SallyTarget id="search-target-lists" label="Search target lists..." completeWhen="searchTargetListsFilled">
  <Input
        placeholder="Search target lists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
</SallyTarget>
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto border rounded-md p-2">
        {filtered.map((l) => (
          <label
            key={l.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(l.id)}
              onChange={() => toggle(l.id)}
            />
            <span className="text-sm">{l.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {l._count.targets} targets
            </span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground p-2">
            No target lists found.
          </p>
        )}
      </div>
      {selected.size > 0 && (
        <p className="text-sm text-muted-foreground">
          ~{totalRecipients} recipients selected across {selected.size} list(s)
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-between">
        <SallyTarget id="back-3" label="← Back">
  <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
</SallyTarget>
        <SallyTarget id="next-4" label="Next →">
  <Button onClick={handleNext}>Next →</Button>
</SallyTarget>
      </div>
    </div>
  );
}
