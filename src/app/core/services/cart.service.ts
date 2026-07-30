import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddToCartRequest, Cart, UpdateQuantityRequest } from '../models/cart-order.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/cart`;

  // Numero di articoli nel carrello, usato per il badge nella navbar
  readonly itemCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.baseUrl).pipe(tap((cart) => this.syncCount(cart)));
  }

  addItem(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/items`, request).pipe(tap((cart) => this.syncCount(cart)));
  }

  updateItemQuantity(request: UpdateQuantityRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.baseUrl}/items`, request).pipe(tap((cart) => this.syncCount(cart)));
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.baseUrl}/items/${productId}`).pipe(tap((cart) => this.syncCount(cart)));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl).pipe(tap(() => this.itemCount.set(0)));
  }

  private syncCount(cart: Cart): void {
    const total = cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    this.itemCount.set(total);
  }
}
