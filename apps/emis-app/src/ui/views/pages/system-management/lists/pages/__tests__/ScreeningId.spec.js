import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';

import Component from '../ScreeningId.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();

const { pinia, optionListStore } = useMockOptionListStore();

describe('ScreeningId.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Template', () => {
    it('renders option-list component', () => {
      expect(wrapper.findComponent(OptionList).exists()).toBe(true);
    });

    it('uses correct title', () => {
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.screeningId');
    });
  });

  describe('Created hook', () => {
    it('reset the state of optionList', async () => {
      expect(optionListStore.resetState).toBeCalled();
    });

    it('set the list with correct one', () => {
      expect(optionListStore.list).toEqual(EOptionLists.ScreeningId);
    });
  });
});
