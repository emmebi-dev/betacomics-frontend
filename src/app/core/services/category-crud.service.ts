import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/product.model';
import { ListParams } from './catalog.service';

/**
 * Classe base riutilizzabile per i tre endpoint di categoria del backend
 * (/comic, /actionFigure, /boardGame), che espongono tutti la stessa
 * shape: list, getById, create, update (PATCH), delete.
 */
export abstract class CategoryCrudService<TDto, TReq> {
  protected abstract readonly resourcePath: string;

  constructor(protected http: HttpClient) {}

  private get baseUrl(): string {
    return `${environment.apiUrl}/${this.resourcePath}`;
  }

  list(params: ListParams = {}): Observable<Page<TDto>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<Page<TDto>>(`${this.baseUrl}/list`, { params: httpParams });
  }

  getById(id: number): Observable<TDto> {
    return this.http.get<TDto>(`${this.baseUrl}/getById/${id}`);
  }

  create(req: TReq): Observable<TDto> {
    return this.http.post<TDto>(`${this.baseUrl}/create`, req);
  }

  update(req: TReq & { id: number }): Observable<TDto> {
    return this.http.patch<TDto>(`${this.baseUrl}/update`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
