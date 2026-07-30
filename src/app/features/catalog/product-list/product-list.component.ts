import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Page, Product, ProductType } from '../../../core/models/product.model';
import { extractErrorMessage } from '../../../core/utils/error.util';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  readonly page = signal<Page<Product> | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly typeFilter = signal<ProductType | 'ALL'>('ALL');
  readonly addingId = signal<number | null>(null);

  readonly filters: { label: string; value: ProductType | 'ALL' }[] = [
    { label: 'Tutti', value: 'ALL' },
    { label: 'Fumetti', value: 'COMIC' },
    { label: 'Action Figure', value: 'ACTION_FIGURE' },
    { label: 'Board Game', value: 'BOARD_GAME' },
  ];

  constructor() {
    this.fetch();
  }

  get filteredContent(): Product[] {
    const content = this.page()?.content ?? [];
    const filter = this.typeFilter();
    return filter === 'ALL' ? content : content.filter((p) => p.productType === filter);
  }

  setFilter(type: ProductType | 'ALL'): void {
    this.typeFilter.set(type);
  }

  fetch(pageIndex = 0): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.catalogService.list({ page: pageIndex, size: PAGE_SIZE, sort: 'name,asc' }).subscribe({
      next: (page) => {
        this.page.set(page);
        this.currentPage.set(pageIndex);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare il catalogo.'));
        this.loading.set(false);
      },
    });
  }

  goToPage(index: number): void {
    if (index < 0 || (this.page() && index >= this.page()!.totalPages)) return;
    this.fetch(index);
  }

  quickAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Accedi per aggiungere articoli al carrello.');
      return;
    }
    this.addingId.set(product.id);
    this.cartService.addItem({ productId: product.id, quantity: 1 }).subscribe({
      next: () => {
        this.addingId.set(null);
        this.toast.success(`"${product.name}" aggiunto al carrello.`);
      },
      error: (err) => {
        this.addingId.set(null);
        this.toast.error(extractErrorMessage(err, 'Impossibile aggiungere al carrello.'));
      },
    });
  }

  typeLabel(type: ProductType): string {
    switch (type) {
      case 'COMIC':
        return 'Fumetto';
      case 'ACTION_FIGURE':
        return 'Action Figure';
      case 'BOARD_GAME':
        return 'Board Game';
    }
  }
}
