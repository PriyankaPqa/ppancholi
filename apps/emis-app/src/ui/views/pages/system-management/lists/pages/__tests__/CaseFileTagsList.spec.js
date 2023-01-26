import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { EOptionLists } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';
import Component from '../CaseFileTagsList.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const { pinia, optionListStore } = useMockOptionListStore();

describe('CaseFileTagsList.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
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
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.caseFileTags');
    });
  });

  describe('Created hook', () => {
    it('reset the state of optionList', async () => {
      expect(optionListStore.resetState).toBeCalled();
    });

    it('set the list with correct one', () => {
      expect(optionListStore.list).toEqual(EOptionLists.CaseFileTags);
    });
  });
});
