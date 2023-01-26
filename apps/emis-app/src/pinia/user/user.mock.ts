import { createTestingPinia, TestingPinia } from '@pinia/testing';

import { useUserStore } from '@/pinia/user/user';
import { IUserData, mockUsersData } from '@libs/entities-lib/user';

export type Role = 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'level6' | 'contributorIM' | 'contributorFinance' | 'contributor3' | 'readOnly' | 'noRole';

export const useMockUserStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const userStore = useUserStore(p);
  userStore.getUserId = jest.fn(() => 'its me');
  userStore.getLandingPage = jest.fn().mockImplementation(() => 'HomeLevel4');
  userStore.signOut = jest.fn();

  return {
    pinia: p,
    userStore,
  };
};

export const getPiniaForUser = (level: Role, stubActions = false) => {
  const mockData = {
    level0: mockUsersData()[11],
    level1: mockUsersData()[0],
    level2: mockUsersData()[1],
    level3: mockUsersData()[2],
    level4: mockUsersData()[3],
    level5: mockUsersData()[4],
    level6: mockUsersData()[5],
    contributorIM: mockUsersData()[6],
    contributorFinance: mockUsersData()[7],
    contributor3: mockUsersData()[8],
    readOnly: mockUsersData()[9],
    noRole: mockUsersData()[10],
  } as Record<Role, IUserData>;

  const pinia = createTestingPinia({
    initialState: {
      user: { ...mockData[level] },
    },
    stubActions,
  });

  return pinia;
};
