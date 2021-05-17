import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { EOptionLists } from '@/entities/optionItem';
import { mockStorage } from '@/store/storage';
import Component from '../CaseFileCloseReasons.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CaseFileCloseReasons.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    it('renders option-list component', () => {
      expect(wrapper.findComponent(OptionList).exists()).toBe(true);
    });

    it('uses correct title', () => {
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.caseFileCloseReasons');
    });
  });

  describe('Created hook', () => {
    it('reset the state of optionList', async () => {
      expect(storage.optionList.mutations.resetState).toBeCalled();
    });

    it('set the list with correct one', () => {
      expect(storage.optionList.mutations.setList).toHaveBeenCalledWith(EOptionLists.CaseFileCloseReasons);
    });
  });
});
