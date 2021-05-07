import { IAzureSearchResult } from '@/types';
import { mockUserFilters } from '@/entities/user';
import {
  EUserAccountStatus, IUserAccountData, IUserAccountSearchData,
} from './user-account.types';

export const mockUserAccount = () : IUserAccountData => ({
  id: '125',
  tenantId: '1254',
  created: '21',
  timestamp: 'string',
  status: 1,
  eTag: 'string',
  filters: mockUserFilters(),
});

export const mockUserAccountSearchData = () : IUserAccountSearchData[] => ([{
  userAccountId: 'mock-id',
  givenName: 'Jane',
  surname: 'Smith',
  displayName: 'Jane Smith',
  emailAddress: 'Jane.Smith@example.com',
  phoneNumber: '+5145555555',
  roleId: 'mock-role-id',
  roleName: {
    translation: {
      en: 'System Admin', fr: 'Sys Admin fr',
    },
  },
  userAccountStatus: EUserAccountStatus.Active,
  filters: [],
  tenantId: 'mock-tenant-id',
  teamCount: 1,
  caseFilesCount: 10,
  openCaseFilesCount: 10,
  inactiveCaseFilesCount: 0,
}]);

export const mockSearchUserAccounts = (index = -1): IAzureSearchResult<IUserAccountSearchData> => {
  let value = mockUserAccountSearchData();
  if (index !== -1) {
    value = [mockUserAccountSearchData()[index]];
  }
  return {
    odataCount: 2,
    odataContext: 'context',
    value,
  };
};
