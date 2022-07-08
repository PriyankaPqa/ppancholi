import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionDataCorrectionType } from '@/entities/mass-action';
import routes from '@/constants/routes';
import { mockUserStateLevel } from '@/test/helpers';
import helpers from '@/ui/helpers/helpers';
import Component from './DataCorrectionHome.vue';

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

describe('DataCorrectionHome.vue', () => {
  beforeEach(() => {
    doMount(false);
  });

  describe('Template', () => {
    it('should render MassActionBaseTable', () => {
      expect(wrapper.findComponent(MassActionBaseTable).exists()).toBe(true);
    });

    it('should pass the correct mass action type', () => {
      const props = 'massActionType';
      const expected = helpers.getEnumValues(MassActionDataCorrectionType);

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct detailsRouteName', () => {
      const props = 'detailsRouteName';
      const expected = routes.massActions.dataCorrection.details.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct tableTitle', () => {
      const props = 'tableTitle';
      const expected = 'massAction.dataCorrectionTable.title';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct searchEndpoint', () => {
      const props = 'searchEndpoint';
      const expected = 'data-correction-mass-actions';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct addRouteName', () => {
      const props = 'addRouteName';
      const expected = routes.massActions.dataCorrection.create.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    describe('showAddButton', () => {
      it('should be true if level 6', () => {
        doMount(false, mockUserStateLevel(6));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be false if not level 6', () => {
        doMount(false, mockUserStateLevel(5));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });
    });
  });
});
