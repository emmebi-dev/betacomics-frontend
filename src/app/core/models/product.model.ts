export type ProductType = 'COMIC' | 'ACTION_FIGURE' | 'BOARD_GAME';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  weight?: number;
  releaseDate?: string;
  productType: ProductType;
}

export interface Comic extends Product {
  productType: 'COMIC';
  author: string;
  publisher: string;
  volumeNumber?: number;
  pages: number;
}

export interface ActionFigure extends Product {
  productType: 'ACTION_FIGURE';
  brand: string;
  material: string;
  height: number;
  width: number;
  depth: number;
}

export interface BoardGame extends Product {
  productType: 'BOARD_GAME';
  brand: string;
  minPlayers: number;
  maxPlayers: number;
  averagePlayTime: number;
  recommendedAge: number;
}

export type AnyProduct = Comic | ActionFigure | BoardGame;

// Payload per creazione/aggiornamento (i campi base sono comuni a tutti i tipi)
export interface ProductReqBase {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  weight: number;
  releaseDate?: string;
}

export interface ComicReq extends ProductReqBase {
  author: string;
  publisher: string;
  volumeNumber?: number;
  pages: number;
}

export interface ActionFigureReq extends ProductReqBase {
  brand: string;
  material: string;
  height: number;
  width: number;
  depth: number;
}

export interface BoardGameReq extends ProductReqBase {
  brand: string;
  minPlayers: number;
  maxPlayers: number;
  averagePlayTime: number;
  recommendedAge: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // pagina corrente (0-based)
  size: number;
  first: boolean;
  last: boolean;
}
