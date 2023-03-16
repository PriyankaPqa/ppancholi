import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileActivityType } from '@libs/entities-lib/case-file';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { HouseholdStatus } from '@libs/entities-lib/household';
import Component from '../PinnedStatus.vue';

const localVue = createLocalVue();
const { pinia } = useMockCaseFileStore();

const householdStatusChangedActivity = {
  id: 'mock-activity-id-41',
  caseFileId: 'mock-id-1',
  user: { id: '1', name: 'Jane Doe' },
  role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
  created: '2021-05-04',
  activityType: CaseFileActivityType.HouseholdStatusChanged,
  details: {
    newHouseholdStatus: HouseholdStatus.Open,
    oldHouseholdStatus: HouseholdStatus.Closed,
    rationale: {
      translation: {
        en: 'rationale in EN',
        fr: 'rationale in FR',
      },
    },
  },
};

describe('PinnedStatus.vue', () => {
  let wrapper;
  const doMount = () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'mock-id',
      },
      computed: {
        pinnedHouseholdStatusActivity: () => householdStatusChangedActivity,
      },
    });
  };
  beforeEach(() => {
    doMount();
  });

  describe('Template', () => {
    describe('rationale', () => {
      it('should display correct data', () => {
        const element = wrapper.findDataTest('rationale');
        expect(element.text()).toEqual('rationale in EN');
      });
    });
  });

  describe('Computed', () => {
    describe('householdStatusActionAndUserInfo', () => {
      it('should return correct string', async () => {
        expect(wrapper.vm.householdStatusActionAndUserInfo).toEqual('household.status.pinned_information.Open Jane Doe (sys admin) - May 4, 2021');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchCaseFileActivities', async () => {
        wrapper.vm.fetchCaseFileActivities = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalled();
      });

      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(true);
      });
    });

    describe('destroyed', () => {
      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        wrapper.destroy();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(false);
      });
    });
  });
});
