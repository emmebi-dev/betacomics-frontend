import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/cart-order.model';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent {
  private orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.orderService.getHistory().subscribe({
      next: (orders) => {
        this.orders.set(orders.sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1)));
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare lo storico ordini.'));
        this.loading.set(false);
      },
    });
  }
}
