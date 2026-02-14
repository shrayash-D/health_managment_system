import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Invoice, AllInvoicesResponse } from '../models/invoice.interface';
import { HttpClient } from '@angular/common/http';
import { ADMIN_API_ENDPOINTS } from '../constants/api/api-endpoints';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  constructor(private http: HttpClient) {}

  // ==========================================
  // ADMIN API METHODS
  // ==========================================

  getAllInvoices(): Observable<Invoice[]> {
    return this.http
      .get<AllInvoicesResponse>(ADMIN_API_ENDPOINTS.getAllInvoices)
      .pipe(
        map((response) =>
          response.invoices.map((apiInvoice) => {
            // Map status number to string: 0=UNPAID, 1=PAID
            const statusMap: { [key: number]: 'PAID' | 'UNPAID' } = {
              0: 'UNPAID',
              1: 'PAID',
            };

            return {
              id: parseInt(apiInvoice.id) || 0,
              apiId: apiInvoice.id, // Store the actual GUID for API calls
              invoiceNumber: `INV-${apiInvoice.id.substring(0, 8).toUpperCase()}`,
              patientId: parseInt(apiInvoice.patientId) || 0,
              amount: apiInvoice.total,
              paymentStatus: statusMap[apiInvoice.status] || 'UNPAID',
              date: apiInvoice.issuedDate
                ? new Date(apiInvoice.issuedDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              description: apiInvoice.consultationType || 'Consultation',
              // patientName will be populated by the component
            };
          }),
        ),
      );
  }

  markAsPaid(invoiceId: string): Observable<any> {
    return this.http.put(ADMIN_API_ENDPOINTS.markInvoiceAsPaid(invoiceId), {});
  }
}
