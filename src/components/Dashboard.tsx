import { Customer, MilkEntry } from '@/lib/store';
import { Milk, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  customers: Customer[];
  entries: MilkEntry[];
}

export default function Dashboard({ customers, entries }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);

  const villageCustomers = customers.filter(c => c.type === 'village');
  const cityCustomers = customers.filter(c => c.type === 'city');

  const todayBought = todayEntries
    .filter(e => villageCustomers.some(c => c.id === e.customerId))
    .reduce((s, e) => s + e.liters, 0);

  const todaySold = todayEntries
    .filter(e => cityCustomers.some(c => c.id === e.customerId))
    .reduce((s, e) => s + e.liters, 0);

  const stats = [
    { label: 'Village Suppliers', value: villageCustomers.length, icon: TrendingDown, color: 'text-village' },
    { label: 'City Buyers', value: cityCustomers.length, icon: TrendingUp, color: 'text-city' },
    { label: "Today's Purchase", value: `${todayBought}L`, icon: Milk, color: 'text-village' },
    { label: "Today's Sale", value: `${todaySold}L`, icon: Milk, color: 'text-city' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
