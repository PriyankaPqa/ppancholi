import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import routes from '@/constants/routes';
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
            description: 'mass_action.card.group1',
            button: 'mass_action.card.action.view',
            route: routes.massActions.financialAssistance.name,
            dataTest: 'massAction_financial',
            level: 'level6',
            roles: null,
            group: 1,
          },
          {
            title: 'mass_action.card.export_validation_impact',
            description: 'mass_action.card.group4',
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
            description: 'mass_action.card.group4',
            button: 'mass_action.card.action.import',
            route: null,
            dataTest: 'massAction_import_validation_impact',
            level: 'level6',
            roles: ['contributorIM'],
            group: 4,
            onClick: 'importValidationImpact',
          },
          {
            title: 'mass_action.card.generate_funding',
            description: 'mass_action.card.group4',
            button: 'mass_action.card.action.generate',
            route: null,
            dataTest: 'massAction_generate_funding',
            level: 'level6',
            roles: ['contributorFinance'],
            group: 4,
            onClick: 'generateFundingRequest',
          },
          {
            title: 'mass_action.card.import_payment_statuses',
            description: 'mass_action.card.group4',
            button: 'mass_action.card.action.import',
            secondaryButton: 'mass_action.card.action.download_template',
            showSecondaryButton: true,
            route: null,
            dataTest: 'massAction_import_payment_statuses',
            level: 'level6',
            roles: ['contributorFinance'],
            group: 4,
            onClick: 'importPaymentStatuses',
            onSecondaryClick: 'downloadTemplate',
          },
        ];
        expect(wrapper.vm.cards).toEqual(expected);
      });
    });

    describe('availableCards', () => {
      it('should return result of filterItemsOnLevelOrRole ', () => {
        wrapper.vm.filterItemsOnLevelOrRole = jest.fn(() => []);
        expect(wrapper.vm.availableCards).toEqual([]);
      });
    });
  });
});
