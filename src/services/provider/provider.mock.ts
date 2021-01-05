import { IProviderMock } from './provider.types';
import { mockAuthenticationsService } from '../authentications';

export const mockProvider = (): IProviderMock => ({
  authentications: mockAuthenticationsService(),
});
