import { createTestingPinia, TestingPinia } from '@pinia/testing';

import { useUserStore } from '@/pinia/user/user';

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
