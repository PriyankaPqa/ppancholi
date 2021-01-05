import { IAuthenticationsService, IAuthenticationsServiceMock } from '../authentications';

export interface IProvider {
  authentications: IAuthenticationsService
}

export interface IProviderMock {
  authentications: IAuthenticationsServiceMock
}
