import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Invoice } from '../../services/doctor-data.service';
import jsPDF from 'jspdf';

export enum PaymentStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Overdue = 'OVERDUE'
}

interface NewInvoice {
  patientId: string;
  patientName: string;
  consultationType: string;
  consultationFee: string;
  labFee: string;
  medicineFee: string;
  otherCharges: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
})
export class InvoiceListComponent implements OnInit {
  PaymentStatus = PaymentStatus; // ✅ expose enum to template

  invoices: Invoice[] = [];
  statusFilter = '';
  dateFilter = '';
  sidebarCollapsed = false;

  showInvoiceModal = false;
  selectedInvoice: Invoice | null = null;

  showCreateInvoiceModal = false;
  newInvoice: NewInvoice = this.getEmptyInvoice();

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.doctorService.invoices$.subscribe(invoices => {
      this.invoices = invoices;
    });
  }

  get filteredInvoices() {
    return this.invoices.filter(invoice => {
      const statusMatch = !this.statusFilter || invoice.paymentStatus === this.statusFilter;
      const dateMatch =
        !this.dateFilter ||
        invoice.issueDate === this.dateFilter ||
        invoice.paidDate === this.dateFilter ||
        invoice.dueDate === this.dateFilter;
      return statusMatch && dateMatch;
    });
  }

  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal() {
    this.showInvoiceModal = false;
    this.selectedInvoice = null;
  }

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

    if (inv.paymentStatus === PaymentStatus.Paid && inv.paidDate) {
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

  openCreateInvoiceModal() {
    this.showCreateInvoiceModal = true;
  }

  closeCreateInvoiceModal() {
    this.showCreateInvoiceModal = false;
    this.newInvoice = this.getEmptyInvoice();
  }

  private getEmptyInvoice(): NewInvoice {
    return {
      patientId: '',
      patientName: '',
      consultationType: '',
      consultationFee: '',
      labFee: '',
      medicineFee: '',
      otherCharges: '',
      paymentMethod: 'Cash'
    };
  }

  createInvoice() {
    const subtotal =
      Number(this.newInvoice.consultationFee || 0) +
      Number(this.newInvoice.labFee || 0) +
      Number(this.newInvoice.medicineFee || 0) +
      Number(this.newInvoice.otherCharges || 0);

    const invoice: Invoice = {
      id: 'INV' + (this.invoices.length + 1).toString().padStart(3, '0'),
      patientId: Number(this.newInvoice.patientId || 0),
      patientName: this.newInvoice.patientName,
      consultationType: this.newInvoice.consultationType,
      consultationFee: Number(this.newInvoice.consultationFee || 0),
      labFee: Number(this.newInvoice.labFee || 0),
      medicineFee: Number(this.newInvoice.medicineFee || 0),
      otherCharges: Number(this.newInvoice.otherCharges || 0),
      subtotal: subtotal,
      amount: subtotal,
      paymentStatus: PaymentStatus.Pending,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      paymentMethod: this.newInvoice.paymentMethod,
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000)
    };

    this.doctorService.addInvoice(invoice);
    this.closeCreateInvoiceModal();
  }
}
