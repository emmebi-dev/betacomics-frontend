import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActionFigure, BoardGame, Comic, Product } from '../../../core/models/product.model';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.fetch(id);
  }

  get comic(): Comic | null {
    return this.product()?.productType === 'COMIC' ? (this.product() as Comic) : null;
  }

  get actionFigure(): ActionFigure | null {
    return this.product()?.productType === 'ACTION_FIGURE' ? (this.product() as ActionFigure) : null;
  }

  get boardGame(): BoardGame | null {
    return this.product()?.productType === 'BOARD_GAME' ? (this.product() as BoardGame) : null;
  }

  fetch(id: number): void {
    this.loading.set(true);
    this.catalogService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Prodotto non trovato.'));
        this.loading.set(false);
      },
    });
  }

  changeQuantity(delta: number): void {
    const stock = this.product()?.stockQuantity ?? 1;
    const next = Math.min(Math.max(1, this.quantity() + delta), Math.max(1, stock));
    this.quantity.set(next);
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Accedi per aggiungere articoli al carrello.');
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
      return;
    }
    this.addingToCart.set(true);
    this.cartService.addItem({ productId: product.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toast.success(`"${product.name}" aggiunto al carrello.`);
      },
      error: (err) => {
        this.addingToCart.set(false);
        this.toast.error(extractErrorMessage(err, 'Impossibile aggiungere al carrello.'));
      },
    });
  }
}
