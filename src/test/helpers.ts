import { IUserData, mockUsersData } from '@/entities/user';
import { mockStore } from '@/store';

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

export const mockUserStateLevel = (level: number) => ({
  modules: {
    user: {
      state: {
        ...mockUsersData()[level - 1],
      },
    },
  },
});
