import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionFigure, ActionFigureReq } from '../models/product.model';
import { CategoryCrudService } from './category-crud.service';

@Injectable({ providedIn: 'root' })
export class ActionFigureService extends CategoryCrudService<ActionFigure, ActionFigureReq> {
  protected readonly resourcePath = 'actionFigure';

  constructor(http: HttpClient) {
    super(http);
  }
}
