export type PaymentStatus = 'PAID' | 'UNPAID';

export interface Invoice {
  id: number;
  apiId?: string; // The actual GUID from the API
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

// Admin API Response for Invoice List
export interface InvoiceApiResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  issuedDate: string;
  status: number; // 0=UNPAID, 1=PAID
  consultationType: string;
  consulationFee: number;
  labFee: number;
  medicineFee: number;
  total: number;
  outstanding: number | null;
}

export interface AllInvoicesResponse {
  totalCount: number;
  invoices: InvoiceApiResponse[];
}
