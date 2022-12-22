import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';

export const useMockDashboardStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const dashboardStore = useDashboardStore();

  return {
    pinia: p,
    dashboardStore,
  };
};
