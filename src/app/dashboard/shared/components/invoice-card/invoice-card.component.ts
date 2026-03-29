import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../invoice/shared/services/invoice.service';
import { Auth, user } from '@angular/fire/auth';
import { Observable, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoice-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-card.component.html',
  styleUrl: './invoice-card.component.scss',
})
export class InvoiceCardComponent implements OnInit {
  invoices: any[] = [];
  paginatedInvoices: any[] = [];
  currentUser: Observable<any> | undefined;

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private invoiceService: InvoiceService, private auth: Auth) { }

  ngOnInit(): void {
    this.currentUser = user(this.auth);

    if (this.currentUser) {
      this.currentUser
        .pipe(
          switchMap((user) => {
            this.invoiceService.invoiceStorage(user.email);
            return this.invoiceService.filteredInvoices;
          })
        )
        .subscribe((invoices) => {
          this.invoices = invoices;
          // Reset to page 1 on fresh data/filter
          this.currentPage = 1;
          this.calculatePagination();
        });
    }
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.invoices.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInvoices = this.invoices.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculatePagination();
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculatePagination();
      this.scrollToTop();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
      this.scrollToTop();
    }
  }

  changeItemsPerPage(event: any) {
    this.itemsPerPage = Number(event.target.value);
    this.currentPage = 1;
    this.calculatePagination();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
       pages.push(i);
    }
    return pages;
  }

  get showingStart(): number {
    if (this.invoices.length === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  get showingEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.invoices.length);
  }
}
