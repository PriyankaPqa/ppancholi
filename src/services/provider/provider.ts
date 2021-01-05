import { http } from '@/services/http';
import { IProvider } from './provider.types';
import { AuthenticationsService } from '../authentications';

export const provider = (): IProvider => ({
  authentications: new AuthenticationsService(http),
});
