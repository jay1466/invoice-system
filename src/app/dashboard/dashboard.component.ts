import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { InvoiceComponent } from '../invoice/invoice.component';
import { InvoiceModalComponent } from './shared/components/invoice-modal/invoice-modal.component';
import { DashboardService } from './shared/services/dashboard.service';
import { InvoiceService } from '../invoice/shared/services/invoice.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InvoiceHeaderComponent } from "./shared/components/invoice-header/invoice-header.component";
import { InvoiceCardComponent } from "./shared/components/invoice-card/invoice-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    InvoiceModalComponent,
    InvoiceHeaderComponent,
    InvoiceCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  showModal = false;
  private subscriptions: Subscription = new Subscription();

  totalOutstanding = 0;
  pendingCount = 0;
  receivedThisMonth = 0;
  draftCount = 0;

  constructor(
    private dashboardService: DashboardService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.dashboardService.modalState$.subscribe(
        (state) => {
          this.showModal = state;
          if (state) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = 'auto';
          }
        }
      )
    );

    this.subscriptions.add(
      this.invoiceService.invoices.subscribe((invoices) => {
        this.calculateMetrics(invoices || []);
      })
    );
  }

  private calculateMetrics(invoices: any[]) {
    let outstanding = 0;
    let pendingCnt = 0;
    let received = 0;
    let draftCnt = 0;

    const currentData = new Date();
    const currentMonth = currentData.getMonth();
    const currentYear = currentData.getFullYear();

    invoices.forEach((invoice) => {
      const status = (invoice.status || '').toLowerCase();
      // Extract numeric total amount, falling back to 0
      const amount = Number(invoice.totalAmount) || 0;

      if (status === 'pending') {
        outstanding += amount;
        pendingCnt++;
      } else if (status === 'draft' || !invoice.status) {
        draftCnt++;
      } else if (status === 'paid') {
        // Check if invoice date is within current month/year
        if (invoice.date) {
          const invDate = new Date(invoice.date);
          if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
            received += amount;
          }
        } else if (invoice.timestamp) {
           const invDate = new Date(invoice.timestamp);
           if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
             received += amount;
           }
        }
      }
    });

    this.totalOutstanding = outstanding;
    this.pendingCount = pendingCnt;
    this.receivedThisMonth = received;
    this.draftCount = draftCnt;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  closeModal(event: Event) {
    this.dashboardService.closeModal();
  }
}
