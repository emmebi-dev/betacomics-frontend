import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, Order, UpdateOrderStatusRequest } from '../models/cart-order.model';
import { Page } from '../models/product.model';

export interface OrderListParams {
  page?: number;
  size?: number;
  sort?: string;
  status?: string; // enum OrderStatus convertito a string
}

export interface UserOrderListParams extends OrderListParams {
  query: string; // obbligatorio
}


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

  list(params: OrderListParams = {}): Observable<Page<Order>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<Page<Order>>(`${this.baseUrl}/list`, { params: httpParams });
  }

  listByUser(params: UserOrderListParams): Observable<Page<Order>> {
    let httpParams = new HttpParams().set('query', params.query);

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<Page<Order>>(`${this.baseUrl}/listByUser`, { params: httpParams });
  }
}
