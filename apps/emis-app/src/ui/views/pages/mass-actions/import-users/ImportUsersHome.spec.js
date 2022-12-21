import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionType } from '@libs/entities-lib/mass-action';
import routes from '@/constants/routes';
import { getPiniaForUser } from '@/pinia/user/user.spec';
import Component from './ImportUsersHome.vue';

const localVue = createLocalVue();
let wrapper;

const doMount = async (fullMount = false, pinia = {}, additionalOverwrites = {}) => {
  wrapper = (fullMount ? mount : shallowMount)(Component, {
    localVue,
    pinia,
    ...additionalOverwrites,
  });
};

describe('ImportUsersHome.vue', () => {
  beforeEach(() => {
    doMount(false, getPiniaForUser('level6'));
  });

  describe('Template', () => {
    it('should render MassActionBaseTable', () => {
      expect(wrapper.findComponent(MassActionBaseTable).exists()).toBe(true);
    });

    it('should pass the correct mass action type', () => {
      const props = 'massActionType';
      const expected = MassActionType.ImportUsers;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct detailsRouteName', () => {
      const props = 'detailsRouteName';
      const expected = routes.massActions.importUsers.details.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct tableTitle', () => {
      const props = 'tableTitle';
      const expected = 'massAction.importUsersTable.title';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct searchEndpoint', () => {
      const props = 'searchEndpoint';
      const expected = 'import-users-mass-actions';

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    it('should pass the correct addRouteName', () => {
      const props = 'addRouteName';
      const expected = routes.massActions.importUsers.create.name;

      expect(wrapper.findComponent(MassActionBaseTable).props(props)).toEqual(expected);
    });

    describe('showAddButton', () => {
      it('should be true if level 6', () => {
        doMount(false, getPiniaForUser('level6'));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(true);
      });

      it('should be false if not level 6', () => {
        doMount(false, getPiniaForUser('level5'));
        expect(wrapper.findComponent(MassActionBaseTable).props('showAddButton')).toEqual(false);
      });
    });
  });
});
