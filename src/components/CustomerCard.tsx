import { useState } from 'react';
import { Customer, getEntriesForCustomer, generateBill, sendWhatsAppReceipt, MilkEntry } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Send, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  customer: Customer;
  onDelete: () => void;
  onToggleAutoReceipt: (enabled: boolean) => void;
}

export default function CustomerCard({ customer, onDelete, onToggleAutoReceipt }: Props) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<MilkEntry[]>([]);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const loadEntries = async () => {
    if (!user) return;
    const data = await getEntriesForCustomer(user.id, customer.id, fromDate, toDate);
    setEntries(data);
  };

  const handleExpand = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next) await loadEntries();
  };

  const handleDateChange = async (setter: (v: string) => void, value: string) => {
    setter(value);
    if (expanded && user) {
      // Will reload on next render via effect
      setTimeout(async () => {
        const from = setter === setFromDate ? value : fromDate;
        const to = setter === setToDate ? value : toDate;
        const data = await getEntriesForCustomer(user.id, customer.id, from, to);
        setEntries(data);
      }, 0);
    }
  };

  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const totalAmount = entries.reduce((s, e) => s + e.total, 0);

  const handleSendReceipt = async () => {
    if (!user) return;
    const bill = await generateBill(user.id, customer.id, fromDate, toDate);
    if (bill && bill.entries.length > 0) sendWhatsAppReceipt(bill);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${customer.name} and all their entries?`)) onDelete();
  };

  const handleAutoReceiptToggle = (checked: boolean) => {
    onToggleAutoReceipt(checked);
    toast({
      title: checked ? 'Auto Receipt Enabled' : 'Auto Receipt Disabled',
      description: checked
        ? `Monthly receipt will be sent to ${customer.name} at end of each month.`
        : `Auto receipt turned off for ${customer.name}.`,
    });
  };

  const isVillage = customer.type === 'village';

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader
        className={`cursor-pointer pb-3 ${isVillage ? 'border-l-4 border-l-village' : 'border-l-4 border-l-city'}`}
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {isVillage ? '🏡' : '🏙️'} {customer.name}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {customer.phone} · Rs.{customer.ratePerLiter}/L · {isVillage ? 'Supplier' : 'Buyer'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {customer.autoMonthlyReceipt && <Clock className="h-4 w-4 text-primary" />}
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label htmlFor={`auto-${customer.id}`} className="text-xs font-medium cursor-pointer">
                Auto-send monthly receipt
              </Label>
            </div>
            <Switch
              id={`auto-${customer.id}`}
              checked={customer.autoMonthlyReceipt}
              onCheckedChange={handleAutoReceiptToggle}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex gap-2">
            <Input type="date" value={fromDate} onChange={e => handleDateChange(setFromDate, e.target.value)} className="text-xs" />
            <Input type="date" value={toDate} onChange={e => handleDateChange(setToDate, e.target.value)} className="text-xs" />
          </div>
          {entries.length > 0 ? (
            <>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {entries.map((entry: MilkEntry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded bg-muted px-3 py-1.5 text-sm">
                    <span>{entry.date}</span>
                    <span>{entry.liters}L</span>
                    <span className="font-medium">Rs.{entry.total}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-accent px-3 py-2 text-sm font-semibold">
                <span>Total: {totalLiters}L</span>
                <span>Rs.{totalAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No entries for this period</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleSendReceipt} disabled={entries.length === 0}>
              <Send className="h-3 w-3" /> WhatsApp Receipt
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
