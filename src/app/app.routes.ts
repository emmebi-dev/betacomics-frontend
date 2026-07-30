import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Betacomics — Catalogo',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
    title: 'Betacomics — Dettaglio prodotto',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Betacomics — Accedi',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Betacomics — Registrati',
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
    title: 'Betacomics — Carrello',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Betacomics — Checkout',
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/order-history/order-history.component').then((m) => m.OrderHistoryComponent),
    canActivate: [authGuard],
    title: 'Betacomics — I miei ordini',
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [authGuard],
    title: 'Betacomics — Dettaglio ordine',
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Betacomics — Profilo',
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./features/admin/product-form/product-admin-list.component').then((m) => m.ProductAdminListComponent),
    canActivate: [adminGuard],
    title: 'Betacomics — Gestione prodotti',
  },
  {
    path: 'admin/products/new/:type',
    loadComponent: () =>
      import('./features/admin/product-form/product-form.component').then((m) => m.ProductFormComponent),
    canActivate: [adminGuard],
    title: 'Betacomics — Nuovo prodotto',
  },
  {
    path: 'admin/products/edit/:type/:id',
    loadComponent: () =>
      import('./features/admin/product-form/product-form.component').then((m) => m.ProductFormComponent),
    canActivate: [adminGuard],
    title: 'Betacomics — Modifica prodotto',
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./features/admin/order-manage/order-manage.component').then((m) => m.OrderManageComponent),
    canActivate: [adminGuard],
    title: 'Betacomics — Gestione ordini',
  },
  { path: '**', redirectTo: '' },
];
