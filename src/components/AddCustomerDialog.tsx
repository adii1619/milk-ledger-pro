import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerType } from '@/lib/store';
import { UserPlus } from 'lucide-react';

interface Props {
  onAdded: (customer: { name: string; phone: string; type: CustomerType; ratePerLiter: number }) => Promise<unknown>;
}

export default function AddCustomerDialog({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('city');
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !rate) return;
    setLoading(true);
    try {
      await onAdded({ name, phone, type, ratePerLiter: parseFloat(rate) });
      setName(''); setPhone(''); setRate(''); setType('city');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Customer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setType('village')}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${type === 'village' ? 'border-village bg-village/10 text-village' : 'border-border text-muted-foreground'}`}>
              🏡 Village (Supplier)
            </button>
            <button type="button" onClick={() => setType('city')}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${type === 'city' ? 'border-city bg-city/10 text-city' : 'border-border text-muted-foreground'}`}>
              🏙️ City (Buyer)
            </button>
          </div>
          <div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" required /></div>
          <div><Label htmlFor="phone">WhatsApp Number</Label><Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92XXXXXXXXXX" required /></div>
          <div><Label htmlFor="rate">Rate per Liter (Rs.)</Label><Input id="rate" type="number" step="0.5" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 60" required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Adding...' : 'Add Customer'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
