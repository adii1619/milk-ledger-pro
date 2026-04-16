import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEntries } from '@/hooks/useEntries';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Milk, LogOut } from 'lucide-react';
import { MilkEntry } from '@/lib/store';

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const { entries, isLoading: entriesLoading } = useEntries();
  const { customers, isLoading: customersLoading } = useCustomers();

  const isLoading = entriesLoading || customersLoading;

  // Group entries by date
  const entriesByDate = entries.reduce<Record<string, MilkEntry[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const totalAmount = entries.reduce((s, e) => s + e.total, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Milk className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-foreground">DudhBook</h1>
              <p className="text-[10px] text-muted-foreground">My Milk Records</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground">Total Milk</span>
            <p className="mt-1 text-2xl font-bold text-card-foreground">{totalLiters}L</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground">Total Amount</span>
            <p className="mt-1 text-2xl font-bold text-card-foreground">Rs.{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">Loading...</div>
        ) : Object.keys(entriesByDate).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(entriesByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, dayEntries]) => (
                <div key={date} className="rounded-xl border bg-card p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-semibold text-card-foreground">{date}</h3>
                  <div className="space-y-1">
                    {dayEntries.map(entry => {
                      const customer = customers.find(c => c.id === entry.customerId);
                      return (
                        <div key={entry.id} className="flex items-center justify-between rounded bg-muted px-3 py-1.5 text-sm">
                          <span>{customer?.name || 'Unknown'}</span>
                          <span>{entry.liters}L</span>
                          <span className="font-medium">Rs.{entry.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Milk className="h-12 w-12 opacity-30" />
            <p className="text-sm">No milk records yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
