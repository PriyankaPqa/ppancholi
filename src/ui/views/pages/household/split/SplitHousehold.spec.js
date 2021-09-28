import { mockSplitHousehold } from '@crctech/registration-lib/src/entities/household-create';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import Component from './SplitHousehold.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('SplitHousehold.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: '', titleKey: '', nextButtonTextKey: '' }),
          splitHousehold() { return mockSplitHousehold(); },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should return to search household page if user is seeing results', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 0,
            splitHousehold() { return mockSplitHousehold(); },
          },
          mocks: {
            $storage: storage,
          },
          store: {
            modules: {
              registration: {
                state: {
                  householdResultsShown: true,
                },
              },
            },
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(false);
      });

      it('should go to the origin household if user is at the first page of registration', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 0,
            splitHousehold() { return mockSplitHousehold(); },
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id: wrapper.vm.splitHousehold.originHouseholdId,
          },
        });
      });

      test('back calls jump', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() { return mockSplitHousehold(); },
            currentTabIndex: () => 1,
          },
        });
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(0);
      });
    });

    describe('next', () => {
      it('calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'personalInfo' }));
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();
        expect(wrapper.vm.jump)
          .toHaveBeenCalledWith(3);
      });
    });
  });

  describe('Computed', () => {
    describe('splitMemberName', () => {
      it('returns the right value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            splitHousehold() { return mockSplitHousehold(); },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.splitMemberName)
          .toEqual(`${mockSplitHousehold().splitMembers.primaryMember.identitySet.firstName
          } ${mockSplitHousehold().splitMembers.primaryMember.identitySet.lastName}`);
      });
    });

    describe('splitHousehold', () => {
      it('returns the right value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
          store: {
            modules: {
              registration: {
                state: {
                  householdResultsShown: true,
                  splitHousehold: mockSplitHousehold(),
                },
              },
            },
          },
        });

        expect(wrapper.vm.splitHousehold).toEqual(mockSplitHousehold());
      });
    });

    describe('titleLeave', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.messagesLeave).toEqual([
          'confirmLeaveDialog.message_1',
          'confirmLeaveDialog.message_2',
        ]);
      });
    });

    describe('title', () => {
      it('should return proper text', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
        });
        expect(wrapper.vm.title).toEqual(wrapper.vm.currentTab.titleKey);
      });
    });

    describe('nextButtonLabel', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
        });
        expect(wrapper.vm.nextButtonLabel).toEqual(wrapper.vm.currentTab.nextButtonTextKey);
      });
    });
  });
});
