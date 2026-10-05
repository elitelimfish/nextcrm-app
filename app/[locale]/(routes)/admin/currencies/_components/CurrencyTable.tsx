"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toggleCurrency, setDefaultCurrency, createCurrency } from "../_actions/currencies";
import type { CurrencyValue } from "../_actions/currencies";

export function CurrencyTable({ currencies }: { currencies: CurrencyValue[] }) {
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");

  const handleToggle = async (code: string, enabled: boolean) => {
    try {
      await toggleCurrency(code, enabled);
      toast.success(`Currency ${code} ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update currency");
    }
  };

  const handleSetDefault = async (code: string) => {
    try {
      await setDefaultCurrency(code);
      toast.success(`${code} set as default currency`);
    } catch {
      toast.error("Failed to set default currency");
    }
  };

  const handleCreate = async () => {
    try {
      await createCurrency({ code: newCode, name: newName, symbol: newSymbol });
      toast.success(`Currency ${newCode} added`);
      setAdding(false);
      setNewCode("");
      setNewName("");
      setNewSymbol("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add currency");
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((c) => (
            <TableRow key={c.code} className={!c.isEnabled ? "opacity-50" : ""}>
              <TableCell className="font-semibold">{c.code}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.symbol}</TableCell>
              <TableCell>
                <Switch
                  checked={c.isEnabled}
                  onCheckedChange={(checked) => handleToggle(c.code, checked)}
                  disabled={c.isDefault}
                />
              </TableCell>
              <TableCell>
                <input
                  type="radio"
                  name="defaultCurrency"
                  checked={c.isDefault}
                  onChange={() => handleSetDefault(c.code)}
                  className="h-4 w-4"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={adding} onOpenChange={setAdding}>
        <SallyTarget id="add-currency" label="+ Add Currency">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">+ Add Currency</Button>
          </DialogTrigger>
        </SallyTarget>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <SallyTarget id="code-e-g-gbp" label="Code (e.g. GBP)" completeWhen="codeEGGbpFilled">
              <Input placeholder="Code (e.g. GBP)" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} maxLength={3} />
            </SallyTarget>
            <SallyTarget id="name-e-g-british-pound" label="Name (e.g. British Pound)" completeWhen="nameEGBritishPoundFilled">
              <Input placeholder="Name (e.g. British Pound)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </SallyTarget>
            <SallyTarget id="symbol-e-g" label="Symbol (e.g. £)" completeWhen="symbolEGFilled">
              <Input placeholder="Symbol (e.g. £)" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} maxLength={5} />
            </SallyTarget>
            <SallyTarget id="add" label="Add">
              <Button onClick={handleCreate} disabled={!newCode || !newName || !newSymbol}>Add</Button>
            </SallyTarget>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
