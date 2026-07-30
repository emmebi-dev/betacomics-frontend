import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models/cart-order.model';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly paymentMethods = ['STRIPE', 'PAYPAL'];

  form = this.fb.nonNullable.group({
    shippingAddress: ['', [Validators.required]],
    paymentMethod: ['STRIPE', [Validators.required]],
  });

  constructor() {
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.orderService.checkout(this.form.getRawValue()).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.toast.success('Ordine effettuato con successo!');
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Checkout non riuscito.'));
      },
    });
  }
}
