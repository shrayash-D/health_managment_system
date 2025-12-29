export type PaymentStatus = 'PAID' | 'UNPAID';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  date: string; // ISO date string
  dueDate?: string;
  description?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
