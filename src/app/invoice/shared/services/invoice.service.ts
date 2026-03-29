import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, doc, docData, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private invoicesSubject = new BehaviorSubject<any[]>([]);
  invoices = this.invoicesSubject.asObservable();
  private filteredInvoicesSubject = new BehaviorSubject<any[]>([]);
  filteredInvoices = this.filteredInvoicesSubject.asObservable();
  private filters: string[] = [];

  private MOCK_INVOICES = [
    {
      id: 'inv-2026-001',
      invoiceNumber: 'INV-2026-001',
      description: 'Website Development',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Rahul Sharma',
      clientEmail: 'rahul.sharma@gmail.com',
      clientStreetAddress: '45 C.G. Road',
      clientCity: 'Ahmedabad',
      clientPostCode: '380009',
      date: '2026-03-25',
      status: 'Pending',
      totalAmount: 30000,
      items: [
        { itemName: 'Website Development', itemQuantity: 1, itemPrice: 25000, itemTotal: 25000 },
        { itemName: 'Hosting', itemQuantity: 1, itemPrice: 5000, itemTotal: 5000 }
      ],
      timestamp: 1711324800000
    },
    {
      id: 'inv-2026-002',
      invoiceNumber: 'INV-2026-002',
      description: 'Mobile App UI/UX',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Priya Patel',
      clientEmail: 'priya.designs@yahoo.in',
      clientStreetAddress: '12B Marine Drive',
      clientCity: 'Mumbai',
      clientPostCode: '400002',
      date: '2026-03-10',
      status: 'Paid',
      totalAmount: 75000,
      items: [
        { itemName: 'UI/UX Design', itemQuantity: 1, itemPrice: 60000, itemTotal: 60000 },
        { itemName: 'Wireframing', itemQuantity: 1, itemPrice: 15000, itemTotal: 15000 }
      ],
      timestamp: 1710028800000
    },
    {
      id: 'inv-2026-003',
      description: 'Brand Identity',
      invoiceNumber: 'INV-2026-003',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Amit Verma',
      clientEmail: 'amit.v@hotmail.com',
      clientStreetAddress: 'Sector 62, Noida',
      clientCity: 'Delhi',
      clientPostCode: '110092',
      date: '2026-03-29',
      status: 'Draft',
      totalAmount: 45000,
      items: [
        { itemName: 'Logo Design', itemQuantity: 1, itemPrice: 20000, itemTotal: 20000 },
        { itemName: 'Brand Guidelines', itemQuantity: 1, itemPrice: 25000, itemTotal: 25000 }
      ],
      timestamp: 1711670400000
    },
    {
      id: 'inv-2026-004',
      invoiceNumber: 'INV-2026-004',
      description: 'SEO Monthly Retainer',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Neha Gupta',
      clientEmail: 'neha.digital@gmail.com',
      clientStreetAddress: 'Indiranagar',
      clientCity: 'Bangalore',
      clientPostCode: '560038',
      date: '2026-02-15',
      status: 'Paid',
      totalAmount: 15000,
      items: [
        { itemName: 'SEO Optimization', itemQuantity: 1, itemPrice: 15000, itemTotal: 15000 }
      ],
      timestamp: 1707955200000
    },
    {
      id: 'inv-2026-005',
      invoiceNumber: 'INV-2026-005',
      description: 'Custom CRM Development',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Karan Mehta',
      clientEmail: 'karan.m@business.in',
      clientStreetAddress: 'Vesu Main Road',
      clientCity: 'Surat',
      clientPostCode: '395007',
      date: '2026-03-28',
      status: 'Pending',
      totalAmount: 150000,
      items: [
        { itemName: 'CRM Backend', itemQuantity: 1, itemPrice: 100000, itemTotal: 100000 },
        { itemName: 'Frontend Dashboard', itemQuantity: 1, itemPrice: 50000, itemTotal: 50000 }
      ],
      timestamp: 1711584000000
    },
    {
      id: 'inv-2026-006',
      invoiceNumber: 'INV-2026-006',
      description: 'E-commerce Maintenance',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Swati Joshi',
      clientEmail: 'swati.j@outlook.com',
      clientStreetAddress: 'Kothrud',
      clientCity: 'Pune',
      clientPostCode: '411038',
      date: '2026-03-22',
      status: 'Draft',
      totalAmount: 22000,
      items: [
        { itemName: 'Server Maintenance', itemQuantity: 1, itemPrice: 10000, itemTotal: 10000 },
        { itemName: 'Bug Fixes', itemQuantity: 4, itemPrice: 3000, itemTotal: 12000 }
      ],
      timestamp: 1711065600000
    },
    {
      id: 'inv-2026-007',
      invoiceNumber: 'INV-2026-007',
      description: 'Cloud Migration',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Rohan Desai',
      clientEmail: 'r.desai@startup.in',
      clientStreetAddress: 'Hitech City',
      clientCity: 'Hyderabad',
      clientPostCode: '500081',
      date: '2026-03-15',
      status: 'Paid',
      totalAmount: 85000,
      items: [
        { itemName: 'AWS Infrastructure Setup', itemQuantity: 1, itemPrice: 60000, itemTotal: 60000 },
        { itemName: 'Data Migration', itemQuantity: 1, itemPrice: 25000, itemTotal: 25000 }
      ],
      timestamp: 1710460800000
    },
    {
      id: 'inv-2026-008',
      invoiceNumber: 'INV-2026-008',
      description: 'Copywriting Services',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Anita Agarwal',
      clientEmail: 'anita.writes@yahoo.com',
      clientStreetAddress: 'Salt Lake',
      clientCity: 'Kolkata',
      clientPostCode: '700091',
      date: '2026-03-20',
      status: 'Pending',
      totalAmount: 18000,
      items: [
        { itemName: 'Landing Page Copy', itemQuantity: 2, itemPrice: 5000, itemTotal: 10000 },
        { itemName: 'Blog Articles', itemQuantity: 4, itemPrice: 2000, itemTotal: 8000 }
      ],
      timestamp: 1710892800000
    },
    {
      id: 'inv-2026-009',
      invoiceNumber: 'INV-2026-009',
      description: 'Social Media Marketing',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Vikram Singh',
      clientEmail: 'vikram.s@gmail.com',
      clientStreetAddress: 'C-Scheme',
      clientCity: 'Jaipur',
      clientPostCode: '302001',
      date: '2026-03-26',
      status: 'Pending',
      totalAmount: 35000,
      items: [
        { itemName: 'SMM Campaign Setup', itemQuantity: 1, itemPrice: 15000, itemTotal: 15000 },
        { itemName: 'Ad Spend (Mar)', itemQuantity: 1, itemPrice: 20000, itemTotal: 20000 }
      ],
      timestamp: 1711411200000
    },
    {
      id: 'inv-2026-010',
      invoiceNumber: 'INV-2026-010',
      description: 'Video Animation',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Suresh Nair',
      clientEmail: 'snair.media@hotmail.com',
      clientStreetAddress: 'Kakkanad',
      clientCity: 'Kochi',
      clientPostCode: '682030',
      date: '2026-03-05',
      status: 'Paid',
      totalAmount: 55000,
      items: [
        { itemName: 'Explainer Video (60s)', itemQuantity: 1, itemPrice: 45000, itemTotal: 45000 },
        { itemName: 'Voiceover Recording', itemQuantity: 1, itemPrice: 10000, itemTotal: 10000 }
      ],
      timestamp: 1709596800000
    },
    {
      id: 'inv-2026-011',
      invoiceNumber: 'INV-2026-011',
      description: 'API Integration Setup',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Arjun Reddy',
      clientEmail: 'arjun.tech@gmail.com',
      clientStreetAddress: 'OMR',
      clientCity: 'Chennai',
      clientPostCode: '600119',
      date: '2026-03-27',
      status: 'Pending',
      totalAmount: 48000,
      items: [
        { itemName: 'Payment Gateway Integration', itemQuantity: 1, itemPrice: 30000, itemTotal: 30000 },
        { itemName: 'SMS API Setup', itemQuantity: 1, itemPrice: 18000, itemTotal: 18000 }
      ],
      timestamp: 1711497600000
    },
    {
      id: 'inv-2026-012',
      invoiceNumber: 'INV-2026-012',
      description: 'Graphic Design Batch',
      streetAddress: '123 Tech Park',
      city: 'Ahmedabad',
      postCode: '380015',
      email: 'hello@agency.in',
      clientName: 'Pooja Trivedi',
      clientEmail: 'pooja.t@yahoo.co.in',
      clientStreetAddress: 'Navrangpura',
      clientCity: 'Ahmedabad',
      clientPostCode: '380009',
      date: '2026-03-29',
      status: 'Draft',
      totalAmount: 12000,
      items: [
        { itemName: 'Social Media Templates', itemQuantity: 10, itemPrice: 1200, itemTotal: 12000 }
      ],
      timestamp: 1711670400000
    }
  ];

  constructor(private firestore: Firestore, private auth: Auth) {}

  getCurrentUser(): Observable<any> {
    return user(this.auth);
  }

  saveInvoice(invoiceData: any): Observable<void> {
    const description = invoiceData.description
      .replace(/\s+/g, '-')
      .toLowerCase();
    const invoicesCollection = collection(
      this.firestore,
      `users/${invoiceData.userEmail}/invoices`
    );
    const invoiceDoc = doc(invoicesCollection, description);

    return from(setDoc(invoiceDoc, invoiceData)).pipe(
      map(() => {
        console.log('Invoice saved successfully');
      }),
      catchError((error) => {
        console.error('Failed to save invoice:', error);
        throw error;
      })
    );
  }

  deleteInvoice(userEmail: string, description: string): Observable<void> {
    const invoiceId = description.replace(/\s+/g, '-').toLowerCase();
    const invoiceDoc = doc(
      this.firestore,
      `users/${userEmail}/invoices/${invoiceId}`
    );

    return from(deleteDoc(invoiceDoc)).pipe(
      map(() => {
        console.log('Invoice deleted successfully!');
        const currentInvoices = this.invoicesSubject.value;
        const updatedInvoices = currentInvoices.filter(
          (invoice) => invoice.description !== description
        );
        this.invoicesSubject.next(updatedInvoices);
      }),
      catchError((error) => {
        console.error('Error deleting invoice: ', error);
        throw error;
      })
    );
  }

  invoiceStorage(userEmail: string): void {
    const invoicesCollection = collection(
      this.firestore,
      `users/${userEmail}/invoices`
    );
    const invoicesQuery = query(
      invoicesCollection,
      orderBy('timestamp', 'desc')
    );
    collectionData(invoicesQuery, { idField: 'id' }).subscribe(
      (invoices: any[]) => {
        // Combine real data with mock data purely for UI demo purposes
        const displayInvoices = [...(invoices || []), ...this.MOCK_INVOICES];
        this.invoicesSubject.next(displayInvoices);
        this.applyFilters(this.filters);
      }
    );
  }

  applyFilters(filters: string[]): void {
    this.filters = filters;
    if (filters.length === 0) {
      this.filteredInvoicesSubject.next(this.invoicesSubject.value);
    } else {
      const filteredInvoices = this.invoicesSubject.value.filter((invoice) =>
        filters.includes(invoice.status)
      );
      this.filteredInvoicesSubject.next(filteredInvoices);
    }
  }

  getInvoiceById(userEmail: string, invoiceId: string): Observable<any> {
    const invoiceDoc = doc(
      this.firestore,
      `users/${userEmail}/invoices/${invoiceId}`
    );
    return docData(invoiceDoc).pipe(
      map(invoice => {
        if (!invoice) {
           // Fallback to mock data for demo view interactions
           const mockRecord = this.MOCK_INVOICES.find(i => 
             // Try to match directly by id, or by description slug which may have been routed
             i.id === invoiceId || i.description.replace(/\s+/g, '-').toLowerCase() === invoiceId
           );
           return mockRecord || null;
        }
        return invoice;
      })
    );
  }
}
