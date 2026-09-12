import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type CustomerType = 'village' | 'city';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone: string;
  ratePerLiter: number;
  autoMonthlyReceipt: boolean;
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

// ── Customers ──

export async function getCustomers(userId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCustomer);
}

export async function addCustomer(userId: string, customer: Omit<Customer, 'id' | 'createdAt' | 'autoMonthlyReceipt'>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: userId,
      name: customer.name,
      type: customer.type,
      phone: customer.phone,
      rate_per_liter: customer.ratePerLiter,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCustomer(data);
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

export async function updateCustomerAutoReceipt(id: string, enabled: boolean) {
  const { error } = await supabase
    .from('customers')
    .update({ auto_monthly_receipt: enabled })
    .eq('id', id);
  if (error) throw error;
}

// ── Entries ──

export async function getEntries(userId: string): Promise<MilkEntry[]> {
  const { data, error } = await supabase
    .from('milk_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapEntry);
}

export async function addEntry(userId: string, entry: Omit<MilkEntry, 'id' | 'total'>): Promise<MilkEntry> {
  const total = entry.liters * entry.ratePerLiter;
  const { data, error } = await supabase
    .from('milk_entries')
    .insert({
      user_id: userId,
      customer_id: entry.customerId,
      date: entry.date,
      liters: entry.liters,
      rate_per_liter: entry.ratePerLiter,
      total,
    })
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from('milk_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function getEntriesForCustomer(userId: string, customerId: string, fromDate?: string, toDate?: string): Promise<MilkEntry[]> {
  let query = supabase
    .from('milk_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('customer_id', customerId)
    .order('date', { ascending: true });
  if (fromDate) query = query.gte('date', fromDate);
  if (toDate) query = query.lte('date', toDate);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapEntry);
}

// ── Bill ──

export async function generateBill(userId: string, customerId: string, fromDate: string, toDate: string): Promise<Bill | null> {
  const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single();
  if (!customer) return null;
  const entries = await getEntriesForCustomer(userId, customerId, fromDate, toDate);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const totalAmount = entries.reduce((s, e) => s + e.total, 0);
  return {
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerType: customer.type as CustomerType,
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
    msg += `• ${e.date}: ${e.liters}L × Rs.${e.ratePerLiter} = Rs.${e.total}\n`;
  });
  msg += `\n📊 *Total: ${bill.totalLiters}L = Rs.${bill.totalAmount}*`;
  const phone = bill.customerPhone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── Mappers ──

function mapCustomer(row: Tables<'customers'>): Customer {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    phone: row.phone,
    ratePerLiter: Number(row.rate_per_liter),
    autoMonthlyReceipt: row.auto_monthly_receipt,
    createdAt: row.created_at,
  };
}

function mapEntry(row: Tables<'milk_entries'>): MilkEntry {
  return {
    id: row.id,
    customerId: row.customer_id,
    date: row.date,
    liters: Number(row.liters),
    ratePerLiter: Number(row.rate_per_liter),
    total: Number(row.total),
  };
}
