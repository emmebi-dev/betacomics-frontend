import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models/cart-order.model';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly updatingId = signal<number | null>(null);

  constructor() {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare il carrello.'));
        this.loading.set(false);
      },
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updatingId.set(productId);
    this.cartService.updateItemQuantity({ productId, quantity }).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.updatingId.set(null);
      },
      error: (err) => {
        this.updatingId.set(null);
        this.toast.error(extractErrorMessage(err, 'Impossibile aggiornare la quantità.'));
      },
    });
  }

  removeItem(productId: number): void {
    this.updatingId.set(productId);
    this.cartService.removeItem(productId).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.updatingId.set(null);
        this.toast.info('Articolo rimosso dal carrello.');
      },
      error: (err) => {
        this.updatingId.set(null);
        this.toast.error(extractErrorMessage(err, 'Impossibile rimuovere l\'articolo.'));
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.fetch();
        this.toast.info('Carrello svuotato.');
      },
      error: (err) => this.toast.error(extractErrorMessage(err, 'Impossibile svuotare il carrello.')),
    });
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
