import { IUserData, mockUsersData } from '@libs/entities-lib/user';
import { mockStore } from '@/store';
import { IAzureSearchParams } from '@libs/shared-lib/types';

export const mockStoreWithUserState = (state: IUserData) => mockStore({
  modules: {
    user: {
      state: {
        ...state,
      },
    },
  },
});

export const mockStoreUserLevel = (level: number) => mockStoreWithUserState(mockUsersData()[level - 1]);

export const mockStoreUserContributorIM = () => mockStoreWithUserState(mockUsersData()[6]);

export const mockStoreUserContributorFinance = () => mockStoreWithUserState(mockUsersData()[7]);

export const mockStoreUserContributor3 = () => mockStoreWithUserState(mockUsersData()[8]);

export const mockStoreUserReadOnly = () => mockStoreWithUserState(mockUsersData()[9]);

export const mockStoreUserNoRole = () => mockStoreWithUserState(mockUsersData()[10]);

export const mockUserStateLevel = (level: number) => ({
  modules: {
    user: {
      state: {
        ...mockUsersData()[level - 1],
      },
    },
  },
});

export enum Contributor {
  'IM' =1,
  'Finance' = 2,
  'Three' = 3,

}

export const mockUserStateContributor = (number: number) => {
  let mockUser;
  switch (number) {
    case Contributor.IM:
      mockUser = mockUsersData()[6]; // contributorIM
      break;
    case Contributor.Finance:
      mockUser = mockUsersData()[7]; // contributorFinance
      break;
    case Contributor.Three:
      mockUser = mockUsersData()[8]; // contributor3
      break;
    default:
      break;
  }

  return {
    modules: {
      user: {
        state: {
          ...mockUser,
        },
      },
    },
  };
};

export const mockSearchParams: IAzureSearchParams = {
  filter: { Foo: 'foo' },
};

export const mockAppUsers = [{
  id: 'ced05d73-ca2b-4177-87a9-71164192d054',
  displayName: 'Mark De Verno',
  roles: [
    '00000000-0000-0000-0000-000000000000',
    '58ff083e-b3d2-55af-705a-5db5619806c3',
  ],
},
{
  id: '8ab3cf69-70dc-48fd-aed8-bce6e2ba9d12',
  displayName: 'Andrei Hatieganu',
  roles: [
    '58ff083e-b3d2-55af-705a-5db5619806c3',
  ],
},
];
