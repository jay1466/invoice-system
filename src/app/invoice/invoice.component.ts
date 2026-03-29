import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../dashboard/shared/components/sidebar/sidebar.component";
import { InvoiceViewComponent } from "./shared/components/invoice-view/invoice-view.component";

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    InvoiceViewComponent
],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
