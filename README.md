# Betacomics Frontend

Frontend Angular 18 (standalone components, signals) per il backend Spring Boot "betacomics".

## Avvio rapido

```bash
npm install
npm start
```

L'app parte su `http://localhost:4200` e si aspetta il backend su `http://localhost:8080`
(vedi `src/environments/environment.ts` per cambiare l'URL dell'API).

Il backend deve avere CORS configurato per `http://localhost:4200` (già presente in `CorsConfig.java`).

## Struttura

```
src/app/
  core/
    models/        interfacce TS che rispecchiano i DTO del backend
    services/       AuthService, CatalogService, ComicService, ActionFigureService,
                     BoardGameService, CartService, OrderService, UserService
    interceptors/    authInterceptor: aggiunge il JWT alle richieste, gestisce 401
    guards/          authGuard, adminGuard
    utils/           extractErrorMessage: traduce ApiErrorResponse in messaggi leggibili
  features/
    auth/           login, register
    catalog/        lista prodotti (con filtri per tipo) e dettaglio prodotto
    cart/           carrello
    checkout/       checkout con indirizzo e metodo di pagamento
    orders/         storico ordini e dettaglio ordine
    profile/        modifica profilo utente
    admin/
      product-form/   lista prodotti admin + form CRUD unificato (comic/actionFigure/boardGame)
      order-manage/   ricerca ordine per ID e aggiornamento stato
  shared/components/  navbar, sistema di toast
```

## Autenticazione

Il backend usa JWT stateless (header `Authorization: Bearer <token>`), non sessioni/cookie.
Il token viene salvato in `localStorage` da `AuthService` e allegato automaticamente dall'interceptor.

## Nota sulla gestione ordini admin

Il backend **non espone un endpoint per elencare tutti gli ordini** — solo lo storico
dell'utente corrente (`GET /api/v1/orders/history`) e i dettagli per ID
(`GET /api/v1/orders/{id}`, filtrato per utente proprietario). La pagina
`/admin/orders` permette quindi di cercare un ordine per ID e aggiornarne lo stato
(`PUT /api/v1/orders/{id}/status`, non filtrato per proprietario), ma non di sfogliare
l'elenco completo. Per abilitare una vera dashboard ordini servirebbe un endpoint
backend dedicato (es. `GET /api/v1/orders` con ruolo ADMIN).

## Ruoli e permessi

- Endpoint pubblici in lettura: catalogo prodotti (`GET`)
- Richiedono login: carrello, checkout, ordini, profilo
- Richiedono ruolo ADMIN: creazione/modifica/eliminazione prodotti, aggiornamento stato ordini
