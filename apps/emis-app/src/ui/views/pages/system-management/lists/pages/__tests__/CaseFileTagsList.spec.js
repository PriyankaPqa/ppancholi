import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';

import Component from '../CaseFileTagsList.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();

const { pinia, optionListStore } = useMockOptionListStore();

describe('CaseFileTagsList.vue', () => {
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
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.caseFileTags');
    });

    it('has restrict financial when feature BlockFACaseFileIrregularTag is on', () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        featureList: [FeatureKeys.BlockFACaseFileIrregularTag],
      });
      expect(wrapper.findComponent(OptionList).props('hasRestrictFinancial')).toBe(true);
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
