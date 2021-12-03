import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import { BaseEntity } from '@/entities/base/base';
import { IListOption } from '@/types';
import {
  AccessLevels, AccountStatus, IFilter, IUserAccountEntity,
} from './userAccount.types';

export class UserAccountEntity extends BaseEntity {
  filters?: Array<IFilter>;

  roles?: Array<IListOption>;

  accessLevels?: AccessLevels;

  accountStatus?: AccountStatus;

  constructor(data?: IUserAccountEntity) {
    if (data) {
      super(data);
      this.accountStatus = data.accountStatus;
      this.filters = data.filters ? this.parseFilters(data.filters) : [];
      this.roles = data.roles;
      this.accessLevels = data.accessLevels;
    } else {
      super();
      this.accountStatus = AccountStatus.None;
      this.filters = [];
      this.roles = [];
      this.accessLevels = null;
    }
  }

  // If one filter is corrupted we return empty array
  private parseFilters(filters: IFilter[]) {
    try {
      return filters.map((f: IFilter) => ({
        ...f,
        criteria: f.criteria.map((c: string) => JSON.parse(c)),
      }));
    } catch (e) {
      applicationInsights.trackException(new Error('Could not parse filters'),
        { originalError: e, filters }, 'userAccount', 'parseFilters');
      return [];
    }
  }
}
