import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComicService } from '../../../core/services/comic.service';
import { ActionFigureService } from '../../../core/services/action-figure.service';
import { BoardGameService } from '../../../core/services/board-game.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/error.util';

type AdminProductType = 'comic' | 'actionFigure' | 'boardGame';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private comicService = inject(ComicService);
  private actionFigureService = inject(ActionFigureService);
  private boardGameService = inject(BoardGameService);

  readonly type = signal<AdminProductType>(this.route.snapshot.paramMap.get('type') as AdminProductType);
  readonly productId = signal<number | null>(
    this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null,
  );
  readonly isEdit = computed(() => this.productId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly typeLabel = computed(() => {
    switch (this.type()) {
      case 'comic':
        return 'Fumetto';
      case 'actionFigure':
        return 'Action Figure';
      case 'boardGame':
        return 'Board Game';
    }
  });

  // Campi comuni a tutti i prodotti
  baseForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    weight: [0, [Validators.required, Validators.min(0)]],
    releaseDate: [''],
  });

  // Campi specifici — solo quelli del tipo corrente vengono validati e inviati
  comicForm = this.fb.nonNullable.group({
    author: ['', [Validators.required]],
    publisher: ['', [Validators.required]],
    volumeNumber: [0, [Validators.min(0)]],
    pages: [0, [Validators.required, Validators.min(0)]],
  });

  actionFigureForm = this.fb.nonNullable.group({
    brand: ['', [Validators.required]],
    material: ['', [Validators.required]],
    height: [0, [Validators.required, Validators.min(0)]],
    width: [0, [Validators.required, Validators.min(0)]],
    depth: [0, [Validators.required, Validators.min(0)]],
  });

  boardGameForm = this.fb.nonNullable.group({
    brand: ['', [Validators.required]],
    minPlayers: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    maxPlayers: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
    averagePlayTime: [30, [Validators.required, Validators.min(1)]],
    recommendedAge: [8, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    const id = this.productId();
    if (id !== null) {
      this.loading.set(true);
      this.currentService()
        .getById(id)
        .subscribe({
          next: (product: any) => {
            this.baseForm.patchValue({
              name: product.name,
              description: product.description ?? '',
              price: product.price,
              stockQuantity: product.stockQuantity,
              imageUrl: product.imageUrl ?? '',
              weight: product.weight ?? 0,
              releaseDate: product.releaseDate ?? '',
            });
            this.currentSpecificForm().patchValue(product);
            this.loading.set(false);
          },
          error: (err: unknown) => {
            this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare il prodotto.'));
            this.loading.set(false);
          },
        });
    }
  }

  // Tipizzato come `any` perché i tre servizi condividono la stessa forma (CategoryCrudService)
  // ma con generici diversi: unificarli evita conflitti di overload su subscribe().
  private currentService(): any {
    switch (this.type()) {
      case 'comic':
        return this.comicService;
      case 'actionFigure':
        return this.actionFigureService;
      case 'boardGame':
        return this.boardGameService;
    }
  }

  private currentSpecificForm() {
    switch (this.type()) {
      case 'comic':
        return this.comicForm;
      case 'actionFigure':
        return this.actionFigureForm;
      case 'boardGame':
        return this.boardGameForm;
    }
  }

  // Il form ha piu' FormGroup separati (base + specifico per tipo), quindi non
  // possiamo collegare [formGroup] al tag <form> esterno. Intercettiamo l'evento
  // nativo "submit" e blocchiamo il comportamento di default del browser
  // (altrimenti il form ricarica la pagina invece di chiamare submit()).
  onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    this.baseForm.markAllAsTouched();
    this.currentSpecificForm().markAllAsTouched();
    if (this.baseForm.invalid || this.currentSpecificForm().invalid) {
      this.errorMessage.set('Compila correttamente tutti i campi obbligatori evidenziati.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const base = this.baseForm.getRawValue();
    const payload: any = {
      ...base,
      releaseDate: base.releaseDate || undefined,
      ...this.currentSpecificForm().getRawValue(),
    };

    const id = this.productId();
    const request$ = id !== null
      ? this.currentService().update({ ...payload, id })
      : this.currentService().create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id !== null ? 'Prodotto aggiornato.' : 'Prodotto creato.');
        this.router.navigate(['/admin/products']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Salvataggio non riuscito.'));
      },
    });
  }
}
