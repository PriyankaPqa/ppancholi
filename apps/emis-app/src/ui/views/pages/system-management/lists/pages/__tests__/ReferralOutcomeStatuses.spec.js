import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { EOptionLists } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/store/storage';
import Component from '../ReferralOutcomeStatuses.vue';
import OptionList from '../../components/OptionList.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('ReferralOutcomeStatuses.vue', () => {
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
      expect(wrapper.findComponent(OptionList).props('title')).toBe('system_management.lists.referralOutcomeStatuses');
    });
  });

  describe('Created hook', () => {
    it('reset the state of optionList', async () => {
      expect(storage.optionList.mutations.resetState).toBeCalled();
    });

    it('set the list with correct one', () => {
      expect(storage.optionList.mutations.setList).toHaveBeenCalledWith(EOptionLists.ReferralOutcomeStatus);
    });
  });
});
