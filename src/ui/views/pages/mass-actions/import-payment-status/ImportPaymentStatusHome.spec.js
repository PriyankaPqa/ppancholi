/**
 * @group ui/components/mass-action
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import Component from './ImportPaymentStatusHome.vue';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionType } from '@/entities/mass-action';
import routes from '@/constants/routes';
import { Contributor, mockUserStateContributor, mockUserStateLevel } from '@/test/helpers';

const localVue = createLocalVue();
let wrapper;

const doMount = async (fullMount = false, store = {}, additionalOverwrites = {}) => {
  wrapper = (fullMount ? mount : shallowMount)(Component, {
    localVue,
    store: {
      ...store,
    },
    ...additionalOverwrites,
  });
};

describe('ImportPaymentStatusHome.vue', () => {
  beforeEach(() => {
    doMount(false);
  });

  describe('Template', () => {
    it('should render MassActionBaseTable', () => {
      expect(wrapper.findComponent(MassActionBaseTable).exists()).toBe(true);
    });

    it('should pass the correct mass action type', () => {
      const props = 'massActionType';
      const expected = MassActionType.ImportPaymentStatuses;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct detailsRouteName', () => {
      const props = 'detailsRouteName';
      const expected = routes.massActions.importPaymentStatus.details.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct tableTitle', () => {
      const props = 'tableTitle';
      const expected = 'massAction.importPaymentStatusTable.title';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct searchEndpoint', () => {
      const props = 'searchEndpoint';
      const expected = 'import-payment-status-mass-actions';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct addRouteName', () => {
      const props = 'addRouteName';
      const expected = routes.massActions.importPaymentStatus.create.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    describe('showAddButton', () => {
      it('should be true if level 6', () => {
        doMount(false, mockUserStateLevel(6));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be true if contributorFinance ', () => {
        doMount(false, mockUserStateContributor(Contributor.Finance));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be false if not level 6', () => {
        doMount(false, mockUserStateLevel(5));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });

      it('should be false if not contributorFinance', () => {
        doMount(false, mockUserStateContributor(Contributor.IM));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });
    });
  });
});
