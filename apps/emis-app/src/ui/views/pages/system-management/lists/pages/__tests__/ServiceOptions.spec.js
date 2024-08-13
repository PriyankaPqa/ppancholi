import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';

import Component from '../ServiceOptions.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();

const { pinia, optionListStore } = useMockOptionListStore();

describe('ServiceOptions.vue', () => {
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
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.serviceOptions');
    });
  });

  describe('Created hook', () => {
    it('reset the state of optionList', async () => {
      optionListStore.resetState = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(optionListStore.resetState).toBeCalled();
    });

    it('set the list with correct one', async () => {
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(optionListStore.list).toEqual(EOptionLists.ServiceOptions);
    });
  });
});
