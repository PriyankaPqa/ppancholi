import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import Component from './ReportingHome.vue';

const localVue = createLocalVue();

describe('ReportingHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        pinia: getPiniaForUser(UserRoles.level6),
        localVue,
      });
    });

    describe('Standard L6 card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('standardQueriesL6');
        expect(card.exists()).toBeTruthy();
      });
    });

    describe('Custom Queries card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('customQueries');
        expect(card.exists()).toBeTruthy();
      });
    });

    describe('SentEmailIssues Queries card', () => {
      it('is displayed when feature flag is on', async () => {
        wrapper = mount(Component, {
          pinia: getPiniaForUser(UserRoles.level6),
          featureList: [FeatureKeys.GeographicMapping],
          localVue,
        });
        const card = wrapper.findDataTest('sentEmailIssuesQueries');
        expect(card.exists()).toBeTruthy();
      });

      it('is not displayed when feature flag is off', async () => {
        const card = wrapper.findDataTest('sentEmailIssuesQueries');
        expect(card.exists()).toBeFalsy();
      });
    });
  });
});
