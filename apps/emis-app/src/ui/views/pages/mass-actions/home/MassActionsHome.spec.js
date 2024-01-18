import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import routes from '@/constants/routes';
import { MassActionDataCorrectionType, MassActionGroup } from '@libs/entities-lib/mass-action';
import { UserRoles } from '@libs/entities-lib/user';
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
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group1,
          },
          {
            title: 'mass_action.card.assessments',
            description: wrapper.vm.$t('mass_action.card.group', { x: 1 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.assessments.home.name,
            dataTest: 'massAction_assessments',
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group1,
          },
          {
            title: 'mass_action.card.communications',
            description: wrapper.vm.$t('mass_action.card.group', { x: 1 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.communications.home.name,
            dataTest: 'massAction_communications',
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group1,
          },
          {
            title: 'mass_action.card.caseFileStatus',
            description: wrapper.vm.$t('mass_action.card.group', { x: 1 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.caseFileStatus.home.name,
            dataTest: 'massAction_case_file_status',
            level: UserRoles.level5,
            roles: null,
            group: MassActionGroup.Group1,
          },
          {
            title: 'mass_action.card.finance_customoptions',
            description: wrapper.vm.$t('mass_action.card.group', { x: 3 }),
            button: 'mass_action.card.action.view',
            secondaryButton: 'mass_action.card.action.download_template',
            showSecondaryButton: true,
            route: routes.massActions.financialAssistanceCustom.home.name,
            dataTest: 'massAction_finance_customoptions',
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group3,
            onSecondaryClick: 'downloadFACustomTemplate',
          },
          {
            title: 'mass_action.card.export_validation_impact',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.export',
            route: null,
            dataTest: 'massAction_export_validation_impact',
            level: UserRoles.level6,
            roles: [UserRoles.contributorIM],
            group: MassActionGroup.Group4,
            onClick: 'exportImpactValidation',
          },
          {
            title: 'mass_action.card.import_validation_impact',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.importValidationStatus.home.name,
            dataTest: 'massAction_import_validation_impact',
            level: UserRoles.level6,
            roles: [UserRoles.contributorIM],
            group: MassActionGroup.Group4,
          },
          {
            title: 'mass_action.card.generate_funding',
            description: wrapper.vm.$t('mass_action.card.group', { x: 4 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.fundingRequest.home.name,
            dataTest: 'massAction_generate_funding',
            level: UserRoles.level6,
            roles: [UserRoles.contributorFinance],
            group: MassActionGroup.Group4,
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
            level: UserRoles.level6,
            roles: [UserRoles.contributorFinance],
            group: MassActionGroup.Group4,
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
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group4,
            onSecondaryClick: 'downloadImportUsersTemplate',
          },
          {
            title: 'mass_action.card.data_correction',
            description: wrapper.vm.$t('mass_action.card.group', { x: 5 }),
            button: 'mass_action.card.action.view',
            route: routes.massActions.dataCorrection.home.name,
            dataTest: 'massAction_data_correction',
            level: UserRoles.level6,
            roles: null,
            group: MassActionGroup.Group5,
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
      it('should return a list of mass action type translation objects', () => {
        expect(wrapper.vm.massActionTypes.length).toBeGreaterThan(1);
        const maType = wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.FinancialAssistance);
        expect(!!maType.text && !!maType.value).toBeTruthy();
      });

      it('should not return AuthenticationSpecifiedOther', () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        const maType = wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.AuthenticationSpecifiedOther);
        expect(maType).toBeFalsy();
      });
    });
  });
});
