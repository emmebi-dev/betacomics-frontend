import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Page, Product, ProductType } from '../../../core/models/product.model';
import { extractErrorMessage } from '../../../core/utils/error.util';

const PAGE_SIZE = 15;

// Mappa il productType del backend (es. "ACTION_FIGURE") allo slug di route
// usato dai servizi CRUD di categoria (es. "actionFigure").
const TYPE_TO_ROUTE: Record<ProductType, 'comic' | 'actionFigure' | 'boardGame'> = {
  COMIC: 'comic',
  ACTION_FIGURE: 'actionFigure',
  BOARD_GAME: 'boardGame',
};

@Component({
  selector: 'app-product-admin-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-admin-list.component.html',
  styleUrl: './product-admin-list.component.scss',
})
export class ProductAdminListComponent {
  private catalogService = inject(CatalogService);
  private toast = inject(ToastService);

  readonly page = signal<Page<Product> | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly deletingId = signal<number | null>(null);

  constructor() {
    this.fetch();
  }

  fetch(pageIndex = 0): void {
    this.loading.set(true);
    this.catalogService.list({ page: pageIndex, size: PAGE_SIZE, sort: 'id,desc' }).subscribe({
      next: (page) => {
        this.page.set(page);
        this.currentPage.set(pageIndex);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare i prodotti.'));
        this.loading.set(false);
      },
    });
  }

  goToPage(index: number): void {
    if (index < 0 || (this.page() && index >= this.page()!.totalPages)) return;
    this.fetch(index);
  }

  routeType(type: ProductType): string {
    return TYPE_TO_ROUTE[type];
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Eliminare definitivamente "${product.name}"?`)) return;
    this.deletingId.set(product.id);
    this.catalogService.delete(product.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.toast.success(`"${product.name}" eliminato.`);
        this.fetch(this.currentPage());
      },
      error: (err) => {
        this.deletingId.set(null);
        this.toast.error(extractErrorMessage(err, 'Impossibile eliminare il prodotto.'));
      },
    });
  }
}
