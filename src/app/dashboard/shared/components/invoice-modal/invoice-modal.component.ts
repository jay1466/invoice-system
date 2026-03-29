import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormArray,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { InvoiceService } from '../../../../invoice/shared/services/invoice.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe],
  templateUrl: './invoice-modal.component.html',
  styleUrl: './invoice-modal.component.scss',
})
export class InvoiceModalComponent implements OnInit, OnDestroy {
  invoiceForm: FormGroup | any;
  currentUser: Observable<any> | undefined;
  
  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private dashboardService: DashboardService
  ) {}

  closeModal(event: Event) {
    this.dashboardService.closeModal();
  }

  ngOnInit(): void {
    const newInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
    
    this.invoiceForm = this.fb.group({
      name: ['System Sender', Validators.required],
      email: ['contact@system.local', [Validators.required, Validators.email]],
      invoiceNumber: [newInvoiceNumber, Validators.required],
      
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      postCode: ['', Validators.required],
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientStreetAddress: ['', Validators.required],
      clientCity: ['', Validators.required],
      clientPostCode: ['', Validators.required],
      
      date: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Pending', Validators.required],
      
      items: this.fb.array([this.createItem(1)]),
    });

    this.currentUser = this.invoiceService.getCurrentUser();
  }
  
  ngOnDestroy(): void {
  }

  nextStep() {
    this.markStepAsTouched(this.currentStep);
    if (this.currentStep < 3) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  setStep(step: number) {
    this.markStepAsTouched(this.currentStep);
    this.currentStep = step;
    this.scrollToTop();
  }

  scrollToTop() {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      setTimeout(() => container.scrollTop = 0, 10);
    }
  }
  
  markStepAsTouched(step: number) {
    if (step === 1) {
      const p = ['streetAddress', 'city', 'postCode', 'clientName', 'clientEmail', 'clientStreetAddress', 'clientCity', 'clientPostCode'];
      p.forEach(field => this.invoiceForm.get(field)?.markAsTouched());
    } else if (step === 2) {
      const p = ['date', 'description'];
      p.forEach(field => this.invoiceForm.get(field)?.markAsTouched());
    } else if (step === 3) {
      this.items.controls.forEach((control: any) => {
        control.get('itemName')?.markAsTouched();
        control.get('itemPrice')?.markAsTouched();
      });
    }
  }

  createItem(orderNumber: number): FormGroup {
    return this.fb.group({
      orderNumber: [orderNumber, Validators.required],
      itemName: ['', Validators.required],
      itemQuantity: [1, Validators.required],
      itemPrice: [null, Validators.required],
      itemTotal: [{ value: 0, disabled: true }],
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem() {
    const orderNumber = this.items.length + 1;
    this.items.push(this.createItem(orderNumber));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.items.controls.forEach((item: any, i: number) => {
      item.get('orderNumber')?.setValue(i + 1);
    });
  }

  calculateTotal(index: number) {
    const item = this.items.at(index);
    const quantity = item.get('itemQuantity')?.value;
    const price = item.get('itemPrice')?.value;
    item.get('itemTotal')?.setValue(quantity * price);
  }

  getTotalAmount(): number {
    return this.items.controls.reduce((total: number, item: any) => {
      const quantity = item.get('itemQuantity')?.value || 0;
      const price = item.get('itemPrice')?.value || 0;
      return total + (quantity * price);
    }, 0);
  }

  onSubmit() {
    this.invoiceForm.markAllAsTouched();
    
    if (this.invoiceForm.valid) {
      this.currentUser?.subscribe((user) => {
        if (user) {
          const invoiceData = {
            ...this.invoiceForm.getRawValue(),
            items: this.invoiceForm.get('items').value.map((item: any) => ({
              ...item,
              itemTotal: item.itemQuantity * item.itemPrice
            })),
            timestamp: new Date().toISOString(),
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userEmail: user.email,
            totalAmount: this.getTotalAmount(),
          };
          this.invoiceService.saveInvoice(invoiceData);
          this.closeModal(new Event('submit'));
        } else {
          console.log('User not authenticated');
        }
      });
    } else {
      console.log('Form is invalid');
      if (this.invoiceForm.get('streetAddress').invalid || this.invoiceForm.get('clientName').invalid || this.invoiceForm.get('clientEmail').invalid) {
         this.setStep(1);
      } else if (this.invoiceForm.get('date').invalid || this.invoiceForm.get('description').invalid) {
         this.setStep(2);
      }
    }
  }
}
