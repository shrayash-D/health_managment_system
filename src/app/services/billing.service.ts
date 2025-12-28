import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Invoice } from '../models/invoice.interface';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private mockInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: 'INV-10021',
      patientId: 1,
      patientName: 'John Doe',
      amount: 1200,
      paymentStatus: 'UNPAID',
      date: '2025-01-15',
      dueDate: '2025-01-30',
      description: 'Consultation and Lab Tests',
      items: [
        {
          description: 'General Consultation',
          quantity: 1,
          unitPrice: 500,
          total: 500,
        },
        { description: 'Blood Test', quantity: 1, unitPrice: 700, total: 700 },
      ],
    },
    {
      id: 2,
      invoiceNumber: 'INV-10018',
      patientId: 2,
      patientName: 'Jane Smith',
      amount: 2050,
      paymentStatus: 'PAID',
      date: '2025-01-10',
      dueDate: '2025-01-25',
      description: 'Follow-up Consultation',
      items: [
        {
          description: 'Follow-up Consultation',
          quantity: 1,
          unitPrice: 500,
          total: 500,
        },
        { description: 'X-Ray', quantity: 1, unitPrice: 1550, total: 1550 },
      ],
    },
    {
      id: 3,
      invoiceNumber: 'INV-10019',
      patientId: 3,
      patientName: 'Robert Williams',
      amount: 850,
      paymentStatus: 'PAID',
      date: '2025-01-12',
      dueDate: '2025-01-27',
      description: 'Routine Checkup',
      items: [
        {
          description: 'Routine Checkup',
          quantity: 1,
          unitPrice: 850,
          total: 850,
        },
      ],
    },
    {
      id: 4,
      invoiceNumber: 'INV-10020',
      patientId: 4,
      patientName: 'Emily Davis',
      amount: 3200,
      paymentStatus: 'UNPAID',
      date: '2025-01-14',
      dueDate: '2025-01-29',
      description: 'Comprehensive Health Check',
      items: [
        {
          description: 'Comprehensive Health Check',
          quantity: 1,
          unitPrice: 3200,
          total: 3200,
        },
      ],
    },
    {
      id: 5,
      invoiceNumber: 'INV-10017',
      patientId: 5,
      patientName: 'Michael Brown',
      amount: 600,
      paymentStatus: 'PAID',
      date: '2025-01-08',
      dueDate: '2025-01-23',
      description: 'Prescription Refill',
      items: [
        {
          description: 'Prescription Refill Consultation',
          quantity: 1,
          unitPrice: 600,
          total: 600,
        },
      ],
    },
  ];

  getAllInvoices(): Observable<Invoice[]> {
    return of([...this.mockInvoices]);
  }

  getInvoiceById(id: number): Observable<Invoice | undefined> {
    const invoice = this.mockInvoices.find((i) => i.id === id);
    return of(invoice);
  }

  getInvoicesByPatientId(patientId: number): Observable<Invoice[]> {
    const invoices = this.mockInvoices.filter((i) => i.patientId === patientId);
    return of(invoices);
  }

  getInvoicesByStatus(status: 'PAID' | 'UNPAID'): Observable<Invoice[]> {
    const invoices = this.mockInvoices.filter(
      (i) => i.paymentStatus === status
    );
    return of(invoices);
  }

  generateInvoice(invoice: Invoice): Observable<Invoice> {
    const newId = Math.max(...this.mockInvoices.map((i) => i.id), 0) + 1;
    const invoiceNumber = `INV-${String(10000 + newId).slice(-5)}`;
    const newInvoice: Invoice = { ...invoice, id: newId, invoiceNumber };
    this.mockInvoices.push(newInvoice);
    return of(newInvoice);
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    const index = this.mockInvoices.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.mockInvoices[index] = { ...invoice, id };
      return of(this.mockInvoices[index]);
    }
    return of(invoice);
  }

  markAsPaid(id: number): Observable<boolean> {
    const index = this.mockInvoices.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.mockInvoices[index].paymentStatus = 'PAID';
      return of(true);
    }
    return of(false);
  }
}
