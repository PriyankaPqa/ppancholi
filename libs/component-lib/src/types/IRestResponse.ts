export interface IRestResponse {
    success: boolean;
    status: number;
    source?: string;
    statusText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }
