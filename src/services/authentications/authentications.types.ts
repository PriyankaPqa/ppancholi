export interface IAuthenticationsService {
  dummy(): Promise<void>;
}

export interface IAuthenticationsServiceMock {
  dummy: jest.Mock <Promise<void>>;
}
