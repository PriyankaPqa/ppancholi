import { IUserData, mockUsersData } from '@/entities/user';
import { mockStore } from '@/store';
import { ISearchData } from '@/types';

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

export const mockUserStateContributor = (number: number) => {
  let mockUser;
  switch (number) {
    case 1:
      // eslint-disable-next-line prefer-destructuring
      mockUser = mockUsersData()[6];
      break;
    case 2:
      // eslint-disable-next-line prefer-destructuring
      mockUser = mockUsersData()[7];
      break;
    case 3:
      // eslint-disable-next-line prefer-destructuring
      mockUser = mockUsersData()[8];
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

export const mockSearchParams: ISearchData = {
  filter: 'foo',
};
