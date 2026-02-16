import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Invoice, DoctorInvoiceItem, DoctorInvoicesResponse } from '../../services/doctor-data.service';
import jsPDF from 'jspdf';


export enum PaymentStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Overdue = 'OVERDUE',
}



@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                console.log('Doctor ID obtained, loading patient names and invoices:', this.currentDoctorId);
                
                // First, fetch appointments to build patient name mapping
                this.doctorService.getAllAppointmentsByDoctorId(this.currentDoctorId).subscribe({
                  next: (appointmentResponse) => {
                    // Build a map of patientId to patientName from appointments
                    if (appointmentResponse.appointments && appointmentResponse.appointments.length > 0) {
                      appointmentResponse.appointments.forEach(apt => {
                        this.patientNameMap.set(apt.patientId, apt.patientName);
                      });
                    }
                    console.log('Patient name map created:', this.patientNameMap);
                    
                    // Now fetch invoices
                    this.fetchInvoices();
                  },
                  error: (error) => {
                    console.error('Error loading appointments for patient names:', error);
                    // Still proceed to fetch invoices even if appointments fail
                    this.fetchInvoices();
                  }
                });
              }
            },
            error: (error) => {
              console.error('Error fetching doctor profile:', error);
              this.isLoadingInvoices = false;
            }
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
          patientName: this.patientNameMap.get(inv.patientId) || `Patient-${inv.patientId.substring(0, 8)}`,
          invoiceHandle: this.generateInvoiceHandle(index + 1) // Generate handle like INV-001, INV-002, etc.
        })) as any[];
        
        console.log('Enriched invoices with patient names and handles:', this.invoices);
        this.isLoadingInvoices = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.invoices = [];
        this.isLoadingInvoices = false;
      }
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
        !this.dateFilter ||
        invoice.issuedDate.includes(this.dateFilter);
      
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
   
    doc.setFontSize(16);
    doc.text('Invoice Details', 10, 10);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${inv.invoiceHandle}`, 10, 20);
    doc.text(`Patient Name: ${inv.patientName || 'N/A'}`, 10, 30);
    doc.text(`Patient ID: ${inv.patientId}`, 10, 40);
    doc.text(`Amount: RS ${inv.total.toFixed(2)}`, 10, 50);
    doc.text(`Status: ${inv.status === 0 ? 'Unpaid' : 'Paid'}`, 10, 60);
    doc.text(`Issue Date: ${new Date(inv.issuedDate).toLocaleDateString()}`, 10, 70);

    doc.text('Breakdown of Charges:', 10, 85);
    doc.text(`Consultation Fee: RS ${inv.consulationFee}`, 15, 95);
    doc.text(`Lab Tests: RS ${inv.labFee}`, 15, 105);
    doc.text(`Medicines: RS ${inv.medicineFee}`, 15, 115);
    doc.text(`Consultation Type: ${inv.consultationType}`, 15, 125);

    doc.text(`Total: RS ${inv.total}`, 10, 140);

    doc.save(`${inv.invoiceHandle}.pdf`);
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }


}
