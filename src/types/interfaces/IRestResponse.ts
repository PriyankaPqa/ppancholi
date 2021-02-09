export interface IRestResponse<T> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}
