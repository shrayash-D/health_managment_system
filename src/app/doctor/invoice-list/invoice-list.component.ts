import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DoctorDataService,
  Invoice,
  DoctorInvoiceItem,
  DoctorInvoicesResponse,
} from '../../services/doctor-data.service';
import jsPDF from 'jspdf';
import { LoadingComponent } from '../../shared/loading/loading.component';

export enum PaymentStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Overdue = 'OVERDUE',
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
})
export class InvoiceListComponent implements OnInit {
  PaymentStatus = PaymentStatus;

  invoices: DoctorInvoiceItem[] = []; // Changed to use API invoice type
  apiInvoices: DoctorInvoiceItem[] = []; // Store original API invoices for mapping
  statusFilter = '';
  dateFilter = '';
  sidebarCollapsed = false;

  showInvoiceModal = false;
  selectedInvoice: DoctorInvoiceItem | null = null;

  showCreateInvoiceModal = false;

  isLoadingInvoices: boolean = false;
  currentDoctorId: string = '';
  patientNameMap: Map<string, string> = new Map(); // Map patientId to patientName

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  /**
   * Load invoices for the current doctor from API
   */
  private loadInvoices(): void {
    // Get userId from localStorage
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        if (currentUser && currentUser.id) {
          // First fetch doctor profile to get doctorId
          this.doctorService.getDoctorById(currentUser.id).subscribe({
            next: (doctorResponse) => {
              if (doctorResponse && doctorResponse.id) {
                this.currentDoctorId = doctorResponse.id;
                console.log(
                  'Doctor ID obtained, loading patient names and invoices:',
                  this.currentDoctorId,
                );

                // First, fetch appointments to build patient name mapping
                this.doctorService
                  .getAllAppointmentsByDoctorId(this.currentDoctorId)
                  .subscribe({
                    next: (appointmentResponse) => {
                      // Build a map of patientId to patientName from appointments
                      if (
                        appointmentResponse.appointments &&
                        appointmentResponse.appointments.length > 0
                      ) {
                        appointmentResponse.appointments.forEach((apt) => {
                          this.patientNameMap.set(
                            apt.patientId,
                            apt.patientName,
                          );
                        });
                      }
                      console.log(
                        'Patient name map created:',
                        this.patientNameMap,
                      );

                      // Now fetch invoices
                      this.fetchInvoices();
                    },
                    error: (error) => {
                      console.error(
                        'Error loading appointments for patient names:',
                        error,
                      );
                      // Still proceed to fetch invoices even if appointments fail
                      this.fetchInvoices();
                    },
                  });
              }
            },
            error: (error) => {
              console.error('Error fetching doctor profile:', error);
              this.isLoadingInvoices = false;
            },
          });
        }
      } catch (error) {
        console.error('Error parsing currentUser:', error);
        this.isLoadingInvoices = false;
      }
    }
  }

  /**
   * Fetch invoices and enrich with patient names
   */
  private fetchInvoices(): void {
    this.isLoadingInvoices = true;
    this.doctorService.getInvoicesByDoctorId(this.currentDoctorId).subscribe({
      next: (response: DoctorInvoicesResponse) => {
        console.log('Invoices response:', response);
        this.apiInvoices = response.invoices || [];

        // Enrich invoices with patient names and generate invoice handles
        this.invoices = this.apiInvoices.map((inv, index) => ({
          ...inv,
          patientName:
            this.patientNameMap.get(inv.patientId) ||
            `Patient-${inv.patientId.substring(0, 8)}`,
          invoiceHandle: this.generateInvoiceHandle(index + 1), // Generate handle like INV-001, INV-002, etc.
        })) as any[];

        console.log(
          'Enriched invoices with patient names and handles:',
          this.invoices,
        );
        this.isLoadingInvoices = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.invoices = [];
        this.isLoadingInvoices = false;
      },
    });
  }

  /**
   * Generate a frontend-friendly invoice handle
   * @param invoiceNumber - Sequential invoice number
   * @returns formatted invoice handle like INV-001, INV-002, etc.
   */
  private generateInvoiceHandle(invoiceNumber: number): string {
    return `INV-${invoiceNumber.toString().padStart(3, '0')}`;
  }

  get filteredInvoices() {
    return this.invoices.filter((invoice) => {
      const statusMatch =
        !this.statusFilter ||
        (this.statusFilter === 'PAID' && invoice.status === 1) ||
        (this.statusFilter === 'PENDING' && invoice.status === 0);

      const dateMatch =
        !this.dateFilter || invoice.issuedDate.includes(this.dateFilter);

      return statusMatch && dateMatch;
    });
  }

  viewDetails(invoice: DoctorInvoiceItem) {
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Document Title
    doc.setTextColor(8, 71, 113);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Medical Invoice', pageWidth / 2, yPos, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 4, pageWidth - 20, yPos + 4);

    yPos = 32;
    doc.setTextColor(0, 0, 0);

    // Helper functions
    const drawSectionHeader = (title: string, y: number) => {
      doc.setFillColor(240, 248, 255);
      doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(8, 71, 113);
      doc.text(title, 25, y);
      doc.setTextColor(0, 0, 0);
      return y + 10;
    };

    const drawField = (label: string, value: string, x: number, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(label + ':', x, y);
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(label + ': ') + 2; // Add 2pt spacing
      doc.text(value, x + labelWidth, y);
    };

    // Invoice Information Section
    yPos = drawSectionHeader('Invoice Information', yPos);

    drawField('Invoice Number', inv.invoiceHandle || 'N/A', 25, yPos);
    yPos += 7;
    drawField(
      'Issue Date',
      new Date(inv.issuedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      25,
      yPos,
    );
    yPos += 7;

    // Status with color coding
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', 25, yPos);
    const statusText = inv.status === 0 ? 'UNPAID' : 'PAID';
    const statusColor = inv.status === 0 ? [220, 38, 38] : [22, 163, 74];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    const statusX = 25 + doc.getTextWidth('Payment Status: ') + 2;
    doc.text(statusText, statusX, yPos);
    doc.setTextColor(0, 0, 0);

    yPos += 12;

    // Patient Information Section
    yPos = drawSectionHeader('Patient Information', yPos);

    drawField('Patient Name', inv.patientName || 'N/A', 25, yPos);
    yPos += 7;

    yPos += 12;

    // Service Details Section
    yPos = drawSectionHeader('Service Details', yPos);

    drawField('Consultation Type', inv.consultationType || 'General', 25, yPos);

    yPos += 16;

    // Charges Breakdown Section
    yPos = drawSectionHeader('Charges Breakdown', yPos);

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.text('Service Description', 25, yPos);
    doc.text('Amount (RS)', 150, yPos);

    doc.setLineWidth(0.3);
    doc.line(25, yPos + 2, pageWidth - 25, yPos + 2);

    // Line items
    doc.setFont('helvetica', 'normal');
    doc.text('Consultation Fee', 25, yPos + 10);
    doc.text(`${inv.consulationFee.toFixed(2)}`, 150, yPos + 10);

    doc.text('Laboratory Tests', 25, yPos + 18);
    doc.text(`${inv.labFee.toFixed(2)}`, 150, yPos + 18);

    doc.text('Medicines & Prescriptions', 25, yPos + 26);
    doc.text(`${inv.medicineFee.toFixed(2)}`, 150, yPos + 26);

    // Subtotal line
    doc.setLineWidth(0.3);
    doc.line(25, yPos + 30, pageWidth - 25, yPos + 30);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL AMOUNT DUE', 25, yPos + 40);
    doc.text(`RS ${inv.total.toFixed(2)}`, 150, yPos + 40);

    // Total box
    doc.setLineWidth(0.5);
    doc.setDrawColor(8, 71, 113);
    doc.rect(140, yPos + 32, 50, 12);

    yPos += 58;

    // Payment Instructions
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Please make payment within 30 days of invoice date.', 25, yPos);
    doc.text(
      'For payment inquiries, please contact our billing department.',
      25,
      yPos + 5,
    );

    // Footer
    doc.setFontSize(8);
    doc.text(
      'This is a computer-generated invoice and does not require a signature.',
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' },
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString('en-US')}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' },
    );
    doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    const fileName = `Invoice_${inv.invoiceHandle}_${inv.patientName?.replace(/\s+/g, '_') || 'Patient'}.pdf`;
    doc.save(fileName);
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}
