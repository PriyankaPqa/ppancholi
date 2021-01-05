declare module 'axios' {
  export interface AxiosRequestConfig {
    globalHandler: boolean;
    sendTokenAndRole: boolean;
  }
}
