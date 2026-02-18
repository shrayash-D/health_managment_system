import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css',
})
export class PaymentModalComponent {
  @Input() invoiceId: string = '';
  @Input() invoiceNumber: string = '';
  @Input() amount: number = 0;
  @Input() show: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmPayment = new EventEmitter<string>();

  processing = false;
  paymentMethod: 'card' | 'upi' | 'netbanking' = 'card';

  // Card details
  cardNumber: string = '';
  cardName: string = '';
  expiryDate: string = '';
  cvv: string = '';

  // UPI details
  upiId: string = '';

  // Net banking
  bankName: string = '';

  close() {
    if (!this.processing) {
      this.closeModal.emit();
      this.resetForm();
    }
  }

  onPaymentMethodChange(method: 'card' | 'upi' | 'netbanking') {
    this.paymentMethod = method;
  }

  processPayment() {
    if (this.processing) return;

    // Basic validation
    if (this.paymentMethod === 'card') {
      if (!this.cardNumber || !this.cardName || !this.expiryDate || !this.cvv) {
        alert('Please fill all card details');
        return;
      }
    } else if (this.paymentMethod === 'upi') {
      if (!this.upiId) {
        alert('Please enter UPI ID');
        return;
      }
    } else if (this.paymentMethod === 'netbanking') {
      if (!this.bankName) {
        alert('Please select a bank');
        return;
      }
    }

    this.processing = true;

    // Simulate payment processing
    setTimeout(() => {
      this.confirmPayment.emit(this.invoiceId);
      this.processing = false;
    }, 1500);
  }

  resetForm() {
    this.cardNumber = '';
    this.cardName = '';
    this.expiryDate = '';
    this.cvv = '';
    this.upiId = '';
    this.bankName = '';
    this.paymentMethod = 'card';
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.expiryDate = value;
  }
}
