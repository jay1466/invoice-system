import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { InvoiceService } from '../../../../invoice/shared/services/invoice.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-header.component.html',
  styleUrl: './invoice-header.component.scss',
})
export class InvoiceHeaderComponent implements OnInit, OnDestroy {
  showFilterMenu = false;
  private clickListener: () => void;
  private subscription: Subscription = new Subscription();
  invoiceCount = 0;
  totalInvoicesCount = 0;
  selectedFilters: Set<string> = new Set();
  
  statusCounts = {
    Pending: 0,
    Paid: 0,
    Draft: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private invoiceService: InvoiceService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.clickListener = this.renderer.listen(
      'document',
      'click',
      this.onDocumentClick.bind(this)
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.invoiceService.filteredInvoices.subscribe((invoices) => {
        this.invoiceCount = invoices.length;
      })
    );

    this.subscription.add(
      this.invoiceService.invoices.subscribe((invoices) => {
        this.totalInvoicesCount = invoices.length;
        this.statusCounts.Pending = invoices.filter(i => i.status === 'Pending').length;
        this.statusCounts.Paid = invoices.filter(i => i.status === 'Paid').length;
        this.statusCounts.Draft = invoices.filter(i => i.status === 'Draft' || !i.status).length;
      })
    );

    this.invoiceService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.invoiceService.invoiceStorage(user.email);
      }
    });
  }

  get selectedFiltersList(): string[] {
    return Array.from(this.selectedFilters);
  }

  get filterLabel(): string {
    const list = this.selectedFiltersList;
    if (list.length === 0) return 'Filter by status';
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]}, ${list[1]}`;
    return `${list.length} selected`;
  }

  openModal() {
    this.dashboardService.openModal();
  }

  toggleFilterMenu(event: Event) {
    event.stopPropagation();
    this.showFilterMenu = !this.showFilterMenu;
  }

  toggleFilter(filter: string) {
    if (this.selectedFilters.has(filter)) {
      this.selectedFilters.delete(filter);
    } else {
      this.selectedFilters.add(filter);
    }
    this.invoiceService.applyFilters(Array.from(this.selectedFilters));
  }
  
  clearFilters(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedFilters.clear();
    this.invoiceService.applyFilters([]);
    this.showFilterMenu = false;
  }

  onDocumentClick(event: Event) {
    if (this.showFilterMenu && !this.el.nativeElement.contains(event.target)) {
      this.showFilterMenu = false;
    }
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
    this.subscription.unsubscribe();
  }
}
