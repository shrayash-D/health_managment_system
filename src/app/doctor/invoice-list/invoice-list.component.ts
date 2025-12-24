import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Invoice } from '../../services/doctor-data.service';

@Component({
  selector: 'app-invoice-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  statusFilter = '';
  dateFilter = '';

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.invoices = this.doctorService.getInvoices();
  }

  get filteredInvoices() {
    return this.invoices.filter(invoice => {
      const statusMatch = !this.statusFilter || this.mapStatus(invoice.paymentStatus) === this.statusFilter;
      const dateMatch = !this.dateFilter || invoice.date === this.dateFilter;
      return statusMatch && dateMatch;
    });
  }

  mapStatus(status: string): string {
    return status === 'PAID' ? 'PAID' : 'UNPAID';
  }

  viewDetails(invoice: Invoice) {
    alert(`Viewing details for invoice ${invoice.id} for ${invoice.patientName}`);
  }

  exportToCSV() {
    // Placeholder for CSV export
    alert('CSV export functionality would be implemented here');
  }

  exportToPDF() {
    // Placeholder for PDF export
    alert('PDF export functionality would be implemented here');
  }
}
