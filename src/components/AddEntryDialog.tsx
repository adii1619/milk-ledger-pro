import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer, MilkEntry } from '@/lib/store';
import { Plus, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  customers: Customer[];
  onAdded: (entry: Omit<MilkEntry, 'id' | 'total'>) => Promise<unknown>;
}

export default function AddEntryDialog({ customers, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const filteredCustomers = useMemo(
    () => customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())),
    [customers, customerSearch]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !date || !liters || !selectedCustomer) return;
    setLoading(true);
    try {
      await onAdded({
        customerId,
        date,
        liters: parseFloat(liters),
        ratePerLiter: selectedCustomer.ratePerLiter,
      });
      setLiters('');
      setCustomerSearch('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCustomerSearch(''); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Daily Milk Entry</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="mt-2 max-h-36 overflow-y-auto rounded-md border">
              {filteredCustomers.length === 0 ? (
                <p className="p-3 text-center text-sm text-muted-foreground">No customers found</p>
              ) : (
                filteredCustomers.map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCustomerId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent",
                      customerId === c.id && "bg-accent font-medium"
                    )}
                  >
                    <span>{c.type === 'village' ? '🏡' : '🏙️'} {c.name}</span>
                    {customerId === c.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
          <div><Label htmlFor="date">Date</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div><Label htmlFor="liters">Liters</Label><Input id="liters" type="number" step="0.5" min="0.5" value={liters} onChange={e => setLiters(e.target.value)} placeholder="e.g. 5" required /></div>
          {selectedCustomer && liters && (
            <div className="rounded-lg bg-accent p-3 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-accent-foreground">Rs.{(parseFloat(liters) * selectedCustomer.ratePerLiter).toFixed(2)}</span>
              <span className="text-muted-foreground"> ({liters}L × Rs.{selectedCustomer.ratePerLiter})</span>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !customerId}>{loading ? 'Saving...' : 'Save Entry'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
