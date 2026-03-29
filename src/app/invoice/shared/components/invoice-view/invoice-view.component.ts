import { Component, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.scss'
})
export class InvoiceViewComponent implements OnInit {
  invoice: any = {};
  userEmail: string = '';
  invoiceId: string = '';
  isDeleted: boolean = false;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isDeleted = false;
      this.invoiceData();
    });
  }

  ngOnInit(): void {
    this.invoiceData();
  }

  invoiceData(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') || '';
    this.invoiceService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        this.invoiceService.getInvoiceById(this.userEmail, this.invoiceId).subscribe(
          invoice => {
            if (invoice) {
              this.invoice = invoice;
              this.calculateTotalAmount();
            } else if (!this.isDeleted) {
              this.router.navigate(['/dashboard']);
            }
          },
          error => {
            console.error('Error fetching invoice:', error);
            if (!this.isDeleted) {
              this.router.navigate(['/dashboard']);
            }
          }
        );
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  deleteInvoice(): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      console.log(`Deleting invoice with description: ${this.invoice.description}`);
      this.invoiceService.deleteInvoice(this.userEmail, this.invoice.description).subscribe(
        () => {
          console.log('Invoice deleted successfully');
          this.isDeleted = true;
          window.location.reload();
        },
        error => {
          console.error('Failed to delete invoice:', error);
          alert('Failed to delete invoice');
        }
      );
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
  }

  saveInvoice(): void {
    this.invoiceService.saveInvoice(this.invoice).subscribe(
      () => {
        console.log('Invoice saved successfully');
        this.isEditing = false;
      },
      error => {
        console.error('Failed to save invoice:', error);
        alert('Failed to save invoice');
      }
    );
  }

  addItem(): void {
    const newItem = {
      itemQuantity: 1,
      itemName: '',
      itemPrice: 0,
      itemTotal: 0
    };
    this.invoice.items.push(newItem);
    this.calculateTotalAmount();
  }

  removeItem(index: number): void {
    this.invoice.items.splice(index, 1);
    this.calculateTotalAmount();
  }

  calculateTotalAmount(): void {
    this.invoice.items.forEach((item: any) => {
      item.itemTotal = item.itemQuantity * item.itemPrice;
    });
    this.invoice.totalAmount = this.invoice.items.reduce((total: number, item: any) => {
      return total + item.itemTotal;
    }, 0);
  }

  generatePDF(): void {
    const data = document.getElementById('invoice-content');
    if (data) {
      html2canvas(data).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save('invoice.pdf');
      });
    }
  }
}
