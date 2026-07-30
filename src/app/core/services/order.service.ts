import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, Order, UpdateOrderStatusRequest } from '../models/cart-order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/orders`;

  constructor(private http: HttpClient) {}

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/checkout`, request);
  }

  getHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/history`);
  }

  getDetails(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  // Solo ADMIN (protetto anche lato backend)
  updateStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, request);
  }
}
