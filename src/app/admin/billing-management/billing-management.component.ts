import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Invoice, PaymentStatus } from '../../models/invoice.interface';
import { Patient } from '../../models/patient.interface';
import { Observable, combineLatest, map, take } from 'rxjs';
import { LoadingComponent } from '../shared/loading/loading.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-billing-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './billing-management.component.html',
  styleUrl: './billing-management.component.css',
})
export class BillingManagementComponent implements OnInit {
  invoices$!: Observable<Invoice[]>;
  patients$!: Observable<Patient[]>;

  searchTerm: string = '';
  statusFilter: PaymentStatus | 'ALL' = 'ALL';
  showViewModal: boolean = false;
  selectedInvoice: Invoice | null = null;
  isLoading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.patients$ = this.adminService.getAllPatients();

    this.invoices$ = combineLatest([
      this.adminService.getAllInvoices(),
      this.patients$,
    ]).pipe(
      map(([invoices, patients]) => {
        return invoices.map((inv) => {
          // coerce inv.patientId to number when matching to handle cases
          // where the incoming invoice has patientId as a string
          const pid = Number((inv as any).patientId);
          return {
            ...inv,
            patientName:
              patients.find((p) => p.id === pid)?.name || inv.patientName,
          } as typeof inv;
        });
      }),
      finalize(() => (this.isLoading = false)),
    );
  }

  openViewModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedInvoice = null;
  }

  markAsPaid(id: number): void {
    if (confirm('Mark this invoice as paid?')) {
      // Find the invoice to get its apiId using take(1) to auto-unsubscribe
      this.invoices$.pipe(take(1)).subscribe((invoices) => {
        const invoice = invoices.find((inv) => inv.id === id);
        if (invoice?.apiId) {
          this.adminService.markInvoiceAsPaid(invoice.apiId).subscribe({
            next: () => {
              alert('Invoice marked as paid successfully!');
              this.loadData();
            },
            error: (error) => {
              console.error('Error marking invoice as paid:', error);
              alert('Failed to mark invoice as paid. Please try again.');
            },
          });
        } else {
          alert('Unable to find invoice ID. Please refresh and try again.');
        }
      });
    }
  }

  getFilteredInvoices(invoices: Invoice[]): Invoice[] {
    let filtered = invoices;

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter((i) => i.paymentStatus === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(term) ||
          i.patientName?.toLowerCase().includes(term) ||
          i.description?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }

  formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  getStatusBadgeClass(status: PaymentStatus): string {
    return status === 'PAID' ? 'badge badge-paid' : 'badge badge-unpaid';
  }
}
