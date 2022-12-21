import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import routes from '@/constants/routes';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import Component from './MassActionsHome.vue';

const localVue = createLocalVue();

describe('MassActionsHome.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('cards', () => {
      it('should be declared correctly', () => {
        const expected = [
          {
            title: 'mass_action.card.financial_assistance',
            description: wrapper.vm.$t('mass_action.card.group', { x: 1 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.financialAssistance.home.name,
            dataTest: 'massAction_financial',
            level: 'level6',
            roles: null,
            group: 1,
          },
          {
            title: 'mass_action.card.export_validation_impact',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.export',
            route: null,
            dataTest: 'massAction_export_validation_impact',
            level: 'level6',
            roles: ['contributorIM'],
            group: 4,
            onClick: 'exportImpactValidation',
          },
          {
            title: 'mass_action.card.import_validation_impact',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.importValidationStatus.home.name,
            dataTest: 'massAction_import_validation_impact',
            level: 'level6',
            roles: ['contributorIM'],
            group: 4,
          },
          {
            title: 'mass_action.card.generate_funding',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.fundingRequest.home.name,
            dataTest: 'massAction_generate_funding',
            level: 'level6',
            roles: ['contributorFinance'],
            group: 4,
            onClick: 'generateFundingRequest',
          },
          {
            title: 'mass_action.card.import_payment_statuses',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            secondaryButton: 'mass_action.card.action.download_template',
            showSecondaryButton: true,
            route: routes.massActions.importPaymentStatus.home.name,
            dataTest: 'massAction_import_payment_statuses',
            level: 'level6',
            roles: ['contributorFinance'],
            group: 4,
            onSecondaryClick: 'downloadImportPaymentStatusesTemplate',
          },
          {
            title: 'mass_action.card.import_users',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            secondaryButton: 'mass_action.card.action.download_template',
            showSecondaryButton: true,
            route: routes.massActions.importUsers.home.name,
            dataTest: 'massAction_import_users',
            level: 'level6',
            roles: null,
            group: 4,
            onSecondaryClick: 'downloadImportUsersTemplate',
          },
          {
            title: 'mass_action.card.data_correction',
            description: wrapper.vm.$t('mass_action.card.group', { x: 5 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.dataCorrection.home.name,
            dataTest: 'massAction_data_correction',
            level: 'level6',
            roles: null,
            group: 5,
            secondaryButton: 'mass_action.card.action.download_template',
            showSecondaryButton: true,
            secondaryButtonIsMenu: true,
            secondaryMenuItems: wrapper.vm.massActionTypes,
            onClickMenu: 'downloadDataCorrectionTemplate',
          },
        ];
        expect(wrapper.vm.cards).toEqual(expected);
      });
    });

    describe('availableCards', () => {
      it('should return result of filterItems ', () => {
        expect(wrapper.vm.availableCards).toEqual(wrapper.vm.filterItems(wrapper.vm.cards));
      });
    });

    describe('massActionTypes', () => {
      it('should contain Financial Assistance data correction type when feature is enabled', () => {
        wrapper.vm.isFinancialAssistanceDataCorrectionEnabled = true;
        expect(wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.FinancialAssistance)).toBeTruthy();
      });

      it('should not contain Financial Assistance data correction type when feature is disabled', () => {
        wrapper.vm.isFinancialAssistanceDataCorrectionEnabled = false;
        expect(wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.FinancialAssistance)).toBeFalsy();
      });
    });
  });
});
