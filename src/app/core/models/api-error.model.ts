export interface ValidationError {
  field: string;
  rejectedValue: unknown;
  message: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: ValidationError[];
}
