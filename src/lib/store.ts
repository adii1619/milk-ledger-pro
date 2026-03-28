export type CustomerType = 'village' | 'city';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone: string;
  ratePerLiter: number;
  createdAt: string;
}

export interface MilkEntry {
  id: string;
  customerId: string;
  date: string;
  liters: number;
  ratePerLiter: number;
  total: number;
}

export interface Bill {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  fromDate: string;
  toDate: string;
  entries: MilkEntry[];
  totalLiters: number;
  totalAmount: number;
}

const CUSTOMERS_KEY = 'milkman_customers';
const ENTRIES_KEY = 'milkman_entries';

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function deleteCustomer(id: string) {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
  const entries = getEntries().filter(e => e.customerId !== id);
  saveEntries(entries);
}

export function getEntries(): MilkEntry[] {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEntries(entries: MilkEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: Omit<MilkEntry, 'id' | 'total'>): MilkEntry {
  const entries = getEntries();
  const newEntry: MilkEntry = {
    ...entry,
    id: crypto.randomUUID(),
    total: entry.liters * entry.ratePerLiter,
  };
  entries.push(newEntry);
  saveEntries(entries);
  return newEntry;
}

export function deleteEntry(id: string) {
  const entries = getEntries().filter(e => e.id !== id);
  saveEntries(entries);
}

export function getEntriesForCustomer(customerId: string, fromDate?: string, toDate?: string): MilkEntry[] {
  let entries = getEntries().filter(e => e.customerId === customerId);
  if (fromDate) entries = entries.filter(e => e.date >= fromDate);
  if (toDate) entries = entries.filter(e => e.date <= toDate);
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function generateBill(customerId: string, fromDate: string, toDate: string): Bill | null {
  const customer = getCustomers().find(c => c.id === customerId);
  if (!customer) return null;
  const entries = getEntriesForCustomer(customerId, fromDate, toDate);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const totalAmount = entries.reduce((s, e) => s + e.total, 0);
  return {
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerType: customer.type,
    fromDate,
    toDate,
    entries,
    totalLiters,
    totalAmount,
  };
}

export function sendWhatsAppReceipt(bill: Bill) {
  const typeLabel = bill.customerType === 'village' ? 'Purchased from' : 'Sold to';
  let msg = `🥛 *Milk ${bill.customerType === 'village' ? 'Purchase' : 'Sale'} Receipt*\n`;
  msg += `${typeLabel}: *${bill.customerName}*\n`;
  msg += `Period: ${bill.fromDate} to ${bill.toDate}\n\n`;
  msg += `📋 *Details:*\n`;
  bill.entries.forEach(e => {
    msg += `• ${e.date}: ${e.liters}L × ₹${e.ratePerLiter} = ₹${e.total}\n`;
  });
  msg += `\n📊 *Total: ${bill.totalLiters}L = ₹${bill.totalAmount}*`;
  const phone = bill.customerPhone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
