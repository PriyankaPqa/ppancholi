import { IHttpClient } from '@/services';
import { IAuthenticationsService } from './authentications.types';

export class AuthenticationsService implements IAuthenticationsService {
  constructor(private readonly http: IHttpClient) {}

  async dummy() {
    // f
  }
}
