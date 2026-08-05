import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/cart-order.model';
import { extractErrorMessage } from '../../../core/utils/error.util';
import { Page } from '../../../core/models/product.model';

@Component({
  selector: 'app-order-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-manage.component.html',
  styleUrl: './order-manage.component.scss',
})
export class OrderManageComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  readonly statuses: OrderStatus[] = [
    'PENDING',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly updating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly orders = signal<Page<Order> | null>(null);
  readonly mode = signal<'all' | 'id' | 'user'>('all');

  // Tengono traccia dei criteri con cui è stata effettivamente lanciata
  // l'ultima ricerca, per poterli mostrare nei titoli dei risultati.
  readonly searchedUserQuery = signal<string>('');
  readonly searchedStatus = signal<OrderStatus | ''>('');

  private page = 0;
  private size = 10;

  statusForms = new Map<number, FormGroup>();

  constructor() {
    this.loadOrders();
  }

  lookupForm = this.fb.nonNullable.group({
    orderId: [null as number | null, [Validators.required]],
  });

  statusForm = this.fb.nonNullable.group({
    status: ['PENDING' as OrderStatus, [Validators.required]],
  });

  lookup(): void {
    const id = this.lookupForm.getRawValue().orderId;
    if (!id) return;
    this.mode.set('id');
    this.userForm.reset({ query: '' });
    this.loading.set(true);
    this.errorMessage.set(null);
    this.order.set(null);

    this.orderService.getDetails(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.statusForm.patchValue({ status: order.status });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          extractErrorMessage(
            err,
            "Impossibile recuperare i dettagli di questo ordine (potrebbe appartenere a un altro utente). Puoi comunque aggiornarne lo stato inserendo l'ID.",
          ),
        );
        this.loading.set(false);
      },
    });
  }

  updateStatus(): void {
    const id = this.lookupForm.getRawValue().orderId;
    if (!id || this.statusForm.invalid) return;
    this.updating.set(true);

    this.orderService
      .updateStatus(id, this.statusForm.getRawValue())
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.updating.set(false);
          this.toast.success(
            `Stato dell'ordine #${id} aggiornato a ${order.status}.`,
          );
        },
        error: (err) => {
          this.updating.set(false);
          this.toast.error(
            extractErrorMessage(err, 'Impossibile aggiornare lo stato.'),
          );
        },
      });
  }

  createStatusForm(currentStatus: OrderStatus): FormGroup {
    return this.fb.nonNullable.group({
      status: [currentStatus, [Validators.required]],
    });
  }

  // Ricostruisce la mappa dei form di stato per gli ordini appena caricati.
  private rebuildStatusForms(items: Order[]): void {
    this.statusForms.clear();
    items.forEach((o) => {
      this.statusForms.set(o.id, this.createStatusForm(o.status));
    });
  }

  loadOrders(): void {
    this.orderService
      .list({ page: this.page, size: this.size, sort: 'id,desc' })
      .subscribe({
        next: (page) => {
          this.rebuildStatusForms(page.content);
          this.orders.set(page);
        },
        error: () => this.toast.error('Impossibile caricare gli ordini.'),
      });
  }

  private reloadCurrentPage(): void {
    if (this.mode() === 'user') {
      this.searchByUser();
    } else if (this.mode() === 'all') {
      this.loadOrdersPreservingFilter();
    }
  }

  private loadOrdersPreservingFilter(): void {
    const status = this.filterForm.getRawValue().status;

    this.orderService
      .list({
        page: this.page,
        size: this.size,
        sort: 'id,desc',
        status: status || undefined,
      })
      .subscribe({
        next: (page) => {
          this.orders.set(page);
          this.rebuildStatusForms(page.content);
        },
        error: () => this.toast.error('Impossibile caricare gli ordini.'),
      });
  }

  nextPage(): void {
    this.page++;
    this.reloadCurrentPage();
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  prevPage(): void {
    if (this.page === 0) return;

    this.page--;
    this.reloadCurrentPage();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
  }

  updateStatusForOrder(orderId: number, form: FormGroup): void {
    if (!orderId || form.invalid) return;

    this.updating.set(true);

    this.orderService.updateStatus(orderId, form.getRawValue()).subscribe({
      next: (order) => {
        this.toast.success(
          `Stato dell'ordine #${orderId} aggiornato a ${order.status}.`,
        );
        this.updating.set(false);
        this.reloadCurrentPage();
      },
      error: (err) => {
        this.updating.set(false);
        this.toast.error(
          extractErrorMessage(err, 'Impossibile aggiornare lo stato.'),
        );
      },
    });
  }

  userForm = this.fb.nonNullable.group({
    query: ['', [Validators.required]],
  });

  filterForm = this.fb.nonNullable.group({
    status: ['' as OrderStatus | '', []],
  });

  searchByUser(): void {
    const query = this.userForm.getRawValue().query;
    if (!query) return;

    if (this.mode() !== 'user') {
      this.page = 0; // reset solo quando cambi modalità
    }

    this.mode.set('user');
    this.lookupForm.reset({ orderId: null });

    const status = this.filterForm.getRawValue().status;
    this.searchedUserQuery.set(query);
    this.searchedStatus.set(status);

    this.orderService
      .listByUser({
        query,
        page: this.page,
        size: this.size,
        status: status || undefined,
      })
      .subscribe({
        next: (page) => {
          this.orders.set(page);
          this.rebuildStatusForms(page.content);
        },
        error: () => this.toast.error('Errore nella ricerca per utente.'),
      });
  }

  applyFilter(): void {
    this.page = 0;

    if (this.mode() === 'user') {
      this.searchByUser();
      return;
    }

    this.showAll();
  }

  // Mostra tutti gli ordini, applicando sempre l'eventuale filtro per stato selezionato.
  showAll(): void {
    this.mode.set('all');
    this.page = 0;
    this.lookupForm.reset({ orderId: null });
    this.userForm.reset({ query: '' });
    this.searchedStatus.set(this.filterForm.getRawValue().status);

    this.loadOrdersPreservingFilter();
  }
}
