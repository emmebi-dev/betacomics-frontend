import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalCartPrice: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  productId: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product: Product;
  priceAtPurchase: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: number;
  userId: number;
  username: string;
  email: string;
  orderDate: string;
  totalPrice: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface CheckoutRequest {
  shippingAddress: string;
  paymentMethod: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
