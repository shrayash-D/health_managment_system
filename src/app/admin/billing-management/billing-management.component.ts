import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { Invoice, PaymentStatus } from '../../models/invoice.interface';
import { Patient } from '../../models/patient.interface';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-billing-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing-management.component.html',
  styleUrl: './billing-management.component.css',
})
export class BillingManagementComponent implements OnInit {
  invoices$!: Observable<Invoice[]>;
  patients$!: Observable<Patient[]>;

  searchTerm: string = '';
  statusFilter: PaymentStatus | 'ALL' = 'ALL';
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  selectedInvoice: Invoice | null = null;

  newInvoice: Partial<Invoice> = {
    patientId: 0,
    amount: 0,
    paymentStatus: 'UNPAID',
    date: new Date().toISOString().split('T')[0],
    description: '',
    items: [],
  };

  constructor(
    private billingService: BillingService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.invoices$ = combineLatest([
      this.billingService.getAllInvoices(),
      this.patientService.getAllPatients(),
    ]).pipe(
      map(([invoices, patients]) => {
        return invoices.map((inv) => ({
          ...inv,
          patientName:
            patients.find((p) => p.id === inv.patientId)?.name ||
            inv.patientName,
        }));
      })
    );
    this.patients$ = this.patientService.getAllPatients();
  }

  openAddModal(): void {
    this.newInvoice = {
      patientId: 0,
      amount: 0,
      paymentStatus: 'UNPAID',
      date: new Date().toISOString().split('T')[0],
      description: '',
      items: [],
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openViewModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedInvoice = null;
  }

  generateInvoice(): void {
    if (this.newInvoice.patientId && this.newInvoice.amount) {
      this.billingService
        .generateInvoice(this.newInvoice as Invoice)
        .subscribe(() => {
          this.loadData();
          this.closeAddModal();
        });
    }
  }

  markAsPaid(id: number): void {
    if (confirm('Mark this invoice as paid?')) {
      this.billingService.markAsPaid(id).subscribe(() => {
        this.loadData();
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
          i.description?.toLowerCase().includes(term)
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
