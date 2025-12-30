import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Invoice } from '../../services/doctor-data.service';

import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  statusFilter = '';
  dateFilter = '';
  sidebarCollapsed = false;

  // Modal state
  showInvoiceModal = false;
  selectedInvoice: Invoice | null = null;

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.doctorService.invoices$.subscribe(invoices => {
      this.invoices = invoices;
    });
  }

  get filteredInvoices() {
    return this.invoices.filter(invoice => {
      const statusMatch = !this.statusFilter || invoice.paymentStatus === this.statusFilter;
const dateMatch = !this.dateFilter || invoice.issueDate === this.dateFilter || invoice.paidDate === this.dateFilter || invoice.dueDate === this.dateFilter;      return statusMatch && dateMatch;
    });
  }

  // Open modal with invoice details
  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showInvoiceModal = true;
  }

  // Close modal
  closeInvoiceModal() {
    this.showInvoiceModal = false;
    this.selectedInvoice = null;
  }

  // Export invoice details to PDF
  downloadInvoicePDF() {
    if (!this.selectedInvoice) return;

    const inv = this.selectedInvoice;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Invoice Details', 10, 10);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${inv.id}`, 10, 20);
    doc.text(`Patient ID: ${inv.patientId}`, 10, 30);
    doc.text(`Patient Name: ${inv.patientName}`, 10, 40);
    doc.text(`Amount: $${inv.amount.toFixed(2)}`, 10, 50);
    doc.text(`Status: ${inv.paymentStatus}`, 10, 60);

    if (inv.paymentStatus === 'PAID' && inv.paidDate) {
      doc.text(`Paid Date: ${inv.paidDate}`, 10, 70);
    } else {
      if (inv.issueDate) doc.text(`Issue Date: ${inv.issueDate}`, 10, 70);
      if (inv.dueDate) doc.text(`Due Date: ${inv.dueDate}`, 10, 80);
    }

    doc.text(`Payment Method: ${inv.paymentMethod}`, 10, 90);
    doc.text(`Transaction ID: ${inv.transactionId}`, 10, 100);
    doc.text(`Consultation Type: ${inv.consultationType}`, 10, 110);

    doc.text('Breakdown of Charges:', 10, 125);
    doc.text(`Consultation Fee: $${inv.consultationFee}`, 15, 135);
    doc.text(`Lab Tests: $${inv.labFee}`, 15, 145);
    doc.text(`Prescriptions / Medicines: $${inv.medicineFee}`, 15, 155);
    doc.text(`Other Charges: $${inv.otherCharges}`, 15, 165);

    doc.text(`Subtotal: $${inv.subtotal}`, 10, 180);

    doc.save(`invoice-${inv.id}.pdf`);
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  showCreateInvoiceModal = false;
newInvoice: any = {
  patientId: '',
  patientName: '',
  consultationType: '',
  consultationFee: 0,
  labFee: 0,
  medicineFee: 0,
  otherCharges: 0,
  paymentMethod: 'Cash'
};

openCreateInvoiceModal() {
  this.showCreateInvoiceModal = true;
}

closeCreateInvoiceModal() {
  this.showCreateInvoiceModal = false;
  this.newInvoice = {
    patientId: '',
    patientName: '',
    consultationType: '',
    consultationFee: 0,
    labFee: 0,
    medicineFee: 0,
    otherCharges: 0,
    paymentMethod: 'Cash'
  };
}

createInvoice() {
  const subtotal =
    this.newInvoice.consultationFee +
    this.newInvoice.labFee +
    this.newInvoice.medicineFee +
    this.newInvoice.otherCharges;

  const invoice: Invoice = {
    id: 'INV' + (this.invoices.length + 1).toString().padStart(3, '0'),
    patientId: this.newInvoice.patientId,
    patientName: this.newInvoice.patientName,
    consultationType: this.newInvoice.consultationType,
    consultationFee: this.newInvoice.consultationFee,
    labFee: this.newInvoice.labFee,
    medicineFee: this.newInvoice.medicineFee,
    otherCharges: this.newInvoice.otherCharges,
    subtotal: subtotal,
    amount: subtotal,
    paymentStatus: 'PENDING' as 'PENDING' | 'PAID' | 'OVERDUE',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    paymentMethod: this.newInvoice.paymentMethod,
    transactionId: 'TXN' + Math.floor(Math.random() * 1000000)
  };

  this.doctorService.addInvoice(invoice);
  this.closeCreateInvoiceModal();
}

}
