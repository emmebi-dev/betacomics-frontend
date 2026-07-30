import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardGame, BoardGameReq } from '../models/product.model';
import { CategoryCrudService } from './category-crud.service';

@Injectable({ providedIn: 'root' })
export class BoardGameService extends CategoryCrudService<BoardGame, BoardGameReq> {
  protected readonly resourcePath = 'boardGame';

  constructor(http: HttpClient) {
    super(http);
  }
}
