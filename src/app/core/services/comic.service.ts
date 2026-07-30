import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comic, ComicReq } from '../models/product.model';
import { CategoryCrudService } from './category-crud.service';

@Injectable({ providedIn: 'root' })
export class ComicService extends CategoryCrudService<Comic, ComicReq> {
  protected readonly resourcePath = 'comic';

  constructor(http: HttpClient) {
    super(http);
  }
}
