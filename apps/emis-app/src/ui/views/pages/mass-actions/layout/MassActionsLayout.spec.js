import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import Component from './MassActionsLayout.vue';

const localVue = createLocalVue();

describe('MassActionsLayout.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('tabs', () => {
      it('should be declared correctly', () => {
        const expected = [
          {
            name: wrapper.vm.$t('mass_action.card.group', { x: 1 }),
            items: [
              {
                text: wrapper.vm.$t('mass_action.card.financial_assistance'),
                test: 'mass_action.card.financial_assistance',
                to: routes.massActions.financialAssistance.home.name,
                exact: false,
                level: 'level6',
              },
            ],
          },
          {
            name: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            items: [
              {
                text: wrapper.vm.$t('mass_action.card.export_validation_impact'),
                test: 'mass_action.card.export_validation_impact',
                to: null,
                exact: false,
                level: 'level6',
                roles: ['contributorIM'],
                onClick: 'exportImpactValidation',
              },
              {
                text: wrapper.vm.$t('mass_action.card.import_validation_impact'),
                test: 'mass_action.card.import_validation_impact',
                to: routes.massActions.importValidationStatus.home.name,
                exact: false,
                level: 'level6',
                roles: ['contributorIM'],
              },
              {
                text: wrapper.vm.$t('mass_action.card.generate_funding'),
                test: 'mass_action.card.generate_funding',
                to: routes.massActions.fundingRequest.home.name,
                exact: false,
                level: 'level6',
                roles: ['contributorFinance'],
                onClick: 'generateFundingRequest',
              },
              {
                text: wrapper.vm.$t('mass_action.card.import_payment_statuses'),
                test: 'mass_action.card.import_payment_statuses',
                to: routes.massActions.importPaymentStatus.home.name,
                exact: false,
                level: 'level6',
                roles: ['contributorFinance'],
              },
              {
                text: wrapper.vm.$t('mass_action.card.import_users'),
                test: 'mass_action.card.import_users',
                to: routes.massActions.importUsers.home.name,
                exact: false,
                level: 'level6',
              },
            ],
          },
          {
            name: wrapper.vm.$t('mass_action.card.group', { x: 5 }),
            items: [
              {
                text: wrapper.vm.$t('mass_action.card.data_correction'),
                test: 'mass_action.card.data_correction',
                to: routes.massActions.dataCorrection.home.name,
                exact: false,
                level: 'level6',
              },
            ],
          },
        ];
        expect(wrapper.vm.tabs).toEqual(expected);
      });
    });

    describe('availableTabs', () => {
      it('should return the tab when has level is true', () => {
        const expected = [
          {
            name: wrapper.vm.$t('mass_action.card.group1'),
            items: [
              {
                text: wrapper.vm.$t('mass_action.card.financial_assistance'),
                test: 'mass_action.card.financial_assistance',
                to: routes.massActions.financialAssistance.home.name,
                exact: false,
                level: 'level6',
              },
            ],
          },
        ];

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            tabs: () => expected,
          },
          mocks: {
            $hasLevel: jest.fn(() => true),
          },
        });

        expect(wrapper.vm.availableTabs).toEqual(expected);
      });

      it('should return the tab when has role is true', () => {
        const expected = [
          {
            name: wrapper.vm.$t('mass_action.card.group4'),
            items: [
              {
                text: wrapper.vm.$t('mass_action.card.export_validation_impact'),
                test: 'mass_action.card.export_validation_impact',
                to: null,
                exact: false,
                level: 'level6',
                roles: ['contributorIM'],
                onClick: 'exportImpactValidation',
              },
            ],
          },
        ];

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            tabs: () => expected,
          },
          mocks: {
            $hasRole: jest.fn(() => true),
          },
        });

        expect(wrapper.vm.availableTabs).toEqual(expected);
      });
    });
  });
});
