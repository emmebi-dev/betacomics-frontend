import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/cart-order.model';
import { extractErrorMessage } from '../../../core/utils/error.util';

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

  readonly statuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly updating = signal(false);
  readonly errorMessage = signal<string | null>(null);

  lookupForm = this.fb.nonNullable.group({
    orderId: [null as number | null, [Validators.required]],
  });

  statusForm = this.fb.nonNullable.group({
    status: ['PENDING' as OrderStatus, [Validators.required]],
  });

  lookup(): void {
    const id = this.lookupForm.getRawValue().orderId;
    if (!id) return;
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
        // getOrderDetails filtra per l'utente corrente: se l'admin non è il proprietario
        // dell'ordine, il backend può restituire 404. In tal caso è comunque possibile
        // aggiornare lo stato "alla cieca" inserendo direttamente l'ID qui sotto.
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'Impossibile recuperare i dettagli di questo ordine (potrebbe appartenere a un altro utente). Puoi comunque aggiornarne lo stato inserendo l\'ID.',
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

    this.orderService.updateStatus(id, this.statusForm.getRawValue()).subscribe({
      next: (order) => {
        this.order.set(order);
        this.updating.set(false);
        this.toast.success(`Stato dell'ordine #${id} aggiornato a ${order.status}.`);
      },
      error: (err) => {
        this.updating.set(false);
        this.toast.error(extractErrorMessage(err, 'Impossibile aggiornare lo stato.'));
      },
    });
  }
}
