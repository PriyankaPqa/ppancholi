import _cloneDeep from 'lodash/cloneDeep';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { IListOption } from '@libs/core-lib/types';
import { BaseEntity } from '../base';
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
      this.roles = _cloneDeep(data.roles) || [];
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
