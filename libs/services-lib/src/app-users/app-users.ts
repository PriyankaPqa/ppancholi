import {
  IAppUserData,
} from '@libs/entities-lib/app-user';
import { IHttpClient } from '../http-client';
import { IAppUsersService } from './app-users.types';

export class AppUsersService implements IAppUsersService {
  constructor(private readonly http: IHttpClient) {}

  /**
   * This method searches the Azure Active Directory (AAD) Graph API, pulling hits as IAppUserData instances.
   * AppUsers may or may not already be an EMIS user but all EMIS users have a matching AppUser.
   * The results of this search can be cross-referenced against the list of EMIS UserAccounts to determine if
   * a user can be added to EMIS.
   *
   * @param searchTerm String to match against the surname, given name or displayName of an AAD user
   * @returns Promise<IAppUserData[]>
   */
  async findAppUsers(searchTerm: string): Promise<IAppUserData[]> {
    const params = {
      select: ['id', 'displayName', 'mail'],
      filter: [`startsWith('${searchTerm}', surname) or startsWith('${searchTerm}', `
        + `givenName) or startsWith('${searchTerm}', displayName) or startsWith('${searchTerm}', Mail)`],
    };
    return this.http.get('/Graph/users', { params, isOData: true });
  }
}
