import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionType, mockCombinedMassAction } from '@libs/entities-lib/mass-action';
import routes from '@/constants/routes';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import Component from './FinancialAssistanceCustomHome.vue';

const localVue = createLocalVue();
let wrapper;

const doMount = async (fullMount = false, pinia = getPiniaForUser(UserRoles.level6), additionalOverwrites = {}) => {
  wrapper = (fullMount ? mount : shallowMount)(Component, {
    localVue,
    pinia,
    ...additionalOverwrites,
  });
};

describe('FinancialAssistanceCustomHome.vue', () => {
  beforeEach(() => {
    doMount(false, getPiniaForUser(UserRoles.level6));
  });

  describe('Template', () => {
    it('should render MassActionBaseTable', () => {
      expect(wrapper.findComponent(MassActionBaseTable).exists()).toBe(true);
    });

    it('should pass the correct mass action type', () => {
      const props = 'massActionType';
      const expected = MassActionType.FinancialAssistanceCustomOptions;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct detailsRouteName', () => {
      const props = 'detailsRouteName';
      const expected = routes.massActions.financialAssistanceCustom.details.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct tableTitle', () => {
      const props = 'tableTitle';
      const expected = 'massAction.financialAssistanceCustomTable.title';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct searchEndpoint', () => {
      const props = 'searchEndpoint';
      const expected = 'financial-assistance-custom';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct addRouteName', () => {
      const props = 'addRouteName';
      const expected = routes.massActions.financialAssistanceCustom.create.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    describe('showAddButton', () => {
      it('should be true if level 6', () => {
        doMount(false, getPiniaForUser(UserRoles.level6));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be false if not level 6', () => {
        doMount(false, getPiniaForUser(UserRoles.level5));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });
    });
  });

  describe('computed', () => {
    describe('additionalColumns', () => {
      it('includes column for totalAmount', () => {
        doMount();
        const totalAmount = wrapper.vm.additionalColumns.find((x) => x.name === 'totalAmount');
        const item = mockCombinedMassAction();
        item.metadata.lastRun.totalAmount = null;
        expect(totalAmount.templateFct(item)).toBe('common.toBeDetermined');
        item.metadata.lastRun.totalAmount = 5;
        expect(totalAmount.templateFct(item)).toBe('$5.00');
      });
    });
  });
});
