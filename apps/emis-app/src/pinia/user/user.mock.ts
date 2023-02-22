import { createTestingPinia, TestingPinia } from '@pinia/testing';

import { useUserStore } from '@/pinia/user/user';
import { IUserData, mockUsersData, UserRoles } from '@libs/entities-lib/user';

export type Role = UserRoles.level0 | UserRoles.level1 |
UserRoles.level2 | UserRoles.level3 | UserRoles.level4 | UserRoles.level5 |
UserRoles.level6 | UserRoles.contributorIM | UserRoles.contributorFinance | UserRoles.contributor3 | 'readOnly' | 'noRole';

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
