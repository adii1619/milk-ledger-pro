import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useEntries } from '@/hooks/useEntries';
import { useUserRole } from '@/hooks/useUserRole';
import Dashboard from '@/components/Dashboard';
import AddCustomerDialog from '@/components/AddCustomerDialog';
import AddEntryDialog from '@/components/AddEntryDialog';
import CustomerCard from '@/components/CustomerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Milk, LogOut, Brain, Search } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import UserDashboard from './UserDashboard';

type Tab = 'all' | 'village' | 'city';

export default function Index() {
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const { signOut } = useAuth();
  const { customers, isLoading, addCustomer, deleteCustomer, toggleAutoReceipt } = useCustomers();
  const { entries, addEntry } = useEntries();
  const { role, isLoading: roleLoading } = useUserRole();

  if (roleLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  // User role sees read-only dashboard
  if (role === 'user') {
    return <UserDashboard />;
  }

  // Milkman and dairy_shop_owner see the full dashboard
  const filtered = (tab === 'all' ? customers : customers.filter(c => c.type === tab))
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
              <p className="text-[10px] text-muted-foreground">
                {role === 'dairy_shop_owner' ? 'Dairy Shop' : 'Milk Management'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/analytics">
              <Button variant="outline" size="icon" className="text-primary">
                <Brain className="h-4 w-4" />
              </Button>
            </Link>
            <AddEntryDialog customers={customers} onAdded={addEntry} />
            <AddCustomerDialog onAdded={addCustomer} />
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <Dashboard customers={customers} entries={entries} />

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customer by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['all', 'village', 'city'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'all' ? '👥 All' : t === 'village' ? '🏡 Village' : '🏙️ City'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">Loading...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(c => (
              <CustomerCard
                key={c.id}
                customer={c}
                onDelete={() => deleteCustomer(c.id)}
                onToggleAutoReceipt={(enabled) => toggleAutoReceipt({ id: c.id, enabled })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Milk className="h-12 w-12 opacity-30" />
            <p className="text-sm">
              {search ? 'No customers match your search.' : 'No customers yet. Add your first customer!'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
