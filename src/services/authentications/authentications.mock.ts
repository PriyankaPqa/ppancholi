import { IAuthenticationsServiceMock } from '@/services/authentications/authentications.types';

export const mockAuthenticationsService = (): IAuthenticationsServiceMock => ({
  dummy: jest.fn(),
});
