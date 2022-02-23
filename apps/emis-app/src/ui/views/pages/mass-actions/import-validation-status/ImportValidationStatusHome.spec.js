/**
 * @group ui/components/mass-action
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionType } from '@/entities/mass-action';
import routes from '@/constants/routes';
import {
  Contributor, mockUserStateContributor, mockUserStateLevel,
} from '@/test/helpers';
import Component from './ImportValidationStatusHome.vue';

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

describe('ImportValidationStatusHome.vue', () => {
  describe('Template', () => {
    it('should render MassActionBaseTable', () => {
      doMount(false);
      expect(wrapper.findComponent(MassActionBaseTable).exists()).toBe(true);
    });

    it('should pass the correct mass action type', () => {
      doMount(false);
      const props = 'massActionType';
      const expected = MassActionType.ImportValidationOfImpactStatus;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct detailsRouteName', () => {
      doMount(false);
      const props = 'detailsRouteName';
      const expected = routes.massActions.importValidationStatus.details.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct tableTitle', () => {
      doMount(false);
      const props = 'tableTitle';
      const expected = 'massAction.impactValidationStatusTable.title';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct searchEndpoint', () => {
      doMount(false);
      const props = 'searchEndpoint';
      const expected = 'validate-impact-status-mass-actions';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct addRouteName', () => {
      doMount(false);
      const props = 'addRouteName';
      const expected = routes.massActions.importValidationStatus.create.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    describe('showAddButton', () => {
      it('should be true if level 6', () => {
        doMount(false, mockUserStateLevel(6));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be true if contributorIM ', () => {
        doMount(false, mockUserStateContributor(Contributor.IM));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be false if not level 6', () => {
        doMount(false, mockUserStateLevel(5));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });

      it('should be false if not contributorIM', () => {
        doMount(false, mockUserStateContributor(Contributor.Finance));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });
    });
  });
});
