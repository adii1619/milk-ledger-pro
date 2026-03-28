import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addEntry, Customer } from '@/lib/store';
import { Plus } from 'lucide-react';

interface Props {
  customers: Customer[];
  onAdded: () => void;
}

export default function AddEntryDialog({ customers, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState('');

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !date || !liters || !selectedCustomer) return;
    addEntry({
      customerId,
      date,
      liters: parseFloat(liters),
      ratePerLiter: selectedCustomer.ratePerLiter,
    });
    setLiters('');
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Daily Milk Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.type === 'village' ? '🏡' : '🏙️'} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="liters">Liters</Label>
            <Input id="liters" type="number" step="0.5" min="0.5" value={liters} onChange={e => setLiters(e.target.value)} placeholder="e.g. 5" required />
          </div>
          {selectedCustomer && liters && (
            <div className="rounded-lg bg-accent p-3 text-sm">
              <span className="text-muted-foreground">Total: </span>
               <span className="font-bold text-accent-foreground">Rs.{(parseFloat(liters) * selectedCustomer.ratePerLiter).toFixed(2)}</span>
               <span className="text-muted-foreground"> ({liters}L × Rs.{selectedCustomer.ratePerLiter})</span>
            </div>
          )}
          <Button type="submit" className="w-full">Save Entry</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
