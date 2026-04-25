export type SuccessResult<T> = {
  success: true;
  data: T;
};

export type ErrorResult = {
  success: false;
  error: string;
  code?: 'NOT_FOUND' | 'INTERNAL_ERROR' | 'BAD_REQUEST';
};

export type Result<T> = SuccessResult<T> | ErrorResult;
