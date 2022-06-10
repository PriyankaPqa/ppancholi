import { mockSplitHousehold, ContactInformation } from '@libs/registration-lib/entities/household-create';
import { mockMember } from '@libs/registration-lib/entities/value-objects/member';
import { mockHouseholdEntity } from '@libs/registration-lib/entities/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { tabs } from '@/store/modules/household/tabs';
import { EventHub } from '@libs/core-lib/plugins/event-hub';

import helpers from '@/ui/helpers/helpers';

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
          splitHousehold() {
            return mockSplitHousehold();
          },
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
            splitHousehold() {
              return mockSplitHousehold();
            },
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
            splitHousehold() {
              return mockSplitHousehold();
            },
          },
          mocks: {
            $route: {
              name: routes.household.householdSplit.name,
              params: {
                id: 'id-1',
              },
            },
            $storage: storage,
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id: 'id-1',
          },
        });
      });

      test('back calls jump', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            currentTabIndex: () => 1,
          },
        });
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(0);
      });
    });

    describe('next', () => {
      it('calls createNewHousehold and nextDefault if current tab is isRegistered', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'isRegistered' }),
          },
        });
        wrapper.vm.createNewHousehold = jest.fn();
        wrapper.vm.nextDefault = jest.fn();

        await wrapper.vm.next();
        expect(wrapper.vm.createNewHousehold).toBeCalledTimes(1);
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });

      it('calls eventhub emit if current tab is personalInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'personalInfo' }),
          },
        });
        EventHub.$emit = jest.fn();

        await wrapper.vm.next();
        expect(EventHub.$emit).toBeCalledWith('checkEmailValidation', wrapper.vm.nextDefault);
      });

      it('calls nextDefault with true if current tab is reviewSplitInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'reviewSplitInfo' }),
          },
        });
        wrapper.vm.nextDefault = jest.fn();

        await wrapper.vm.next();
        expect(wrapper.vm.nextDefault).toBeCalledWith(true);
      });

      it('calls nextDefault without argument by default', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: '' }),
          },
        });
        wrapper.vm.nextDefault = jest.fn();

        await wrapper.vm.next();
        expect(wrapper.vm.nextDefault).toBeCalledWith();
      });
    });

    describe('nextDefault', () => {
      it('calls scrollToFirstError if isValid is false', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        helpers.scrollToFirstError = jest.fn();

        await wrapper.vm.nextDefault();
        expect(helpers.scrollToFirstError).toHaveBeenCalledTimes(1);
      });

      it('calls jump if current tab index smaller than number of tabs -1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            currentTabIndex: () => 1,
            flowTabs() {
              return [{ id: '1' }, { id: 2 }, { id: 3 }];
            },
          },
        });
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 1);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextDefault();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(2);
      });

      it('does not calls jump if current tab index same or larger as number of tabs -1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            currentTabIndex: () => 1,
            flowTabs() {
              return [{ id: '1' }, { id: 2 }];
            },
          },
        });
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 1);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextDefault();
        expect(wrapper.vm.jump).not.toHaveBeenCalled();
      });

      it('calls storage action splitHousehold if performSplit is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
          },
          mocks: { $storage: storage },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.nextDefault(true);
        expect(storage.registration.actions.splitHousehold).toHaveBeenCalledTimes(1);
      });
    });

    describe('closeSplit', () => {
      it('calls router replace with the new household id if there is one ', () => {
        wrapper.vm.closeSplit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name, params: { id: mockHouseholdEntity().id },
        });
      });

      it('calls router replace with the origin household id if there is no new household id ', () => {
        storage.registration.getters.registrationResponse = jest.fn(() => null);
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'reviewSplitInfo', titleKey: '', nextButtonTextKey: '' }),
            splitHousehold() {
              return mockSplitHousehold();
            },
          },
          mocks: { $storage: storage },
        });
        wrapper.vm.closeSplit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name, params: { id: mockSplitHousehold().originHouseholdId },
        });
      });
    });

    describe('createNewHousehold', () => {
      it('calls the registration mutation resetHouseholdCreate', async () => {
        await wrapper.vm.createNewHousehold();
        expect(storage.registration.mutations.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });
      it('calls the registration mutation setPrimaryBeneficiary with the right payload', async () => {
        const { primaryMember } = mockSplitHousehold().splitMembers;
        primaryMember.setCurrentAddress(null);
        primaryMember.contactInformation = new ContactInformation();
        await wrapper.vm.createNewHousehold();
        expect(storage.registration.mutations.setPrimaryBeneficiary).toHaveBeenCalledWith(primaryMember);
      });

      it('calls the registration mutation addAdditionalMember if the split household has additional members', async () => {
        const additionalMember = mockSplitHousehold().splitMembers.additionalMembers[0];
        additionalMember.setCurrentAddress(null);

        await wrapper.vm.createNewHousehold();
        expect(storage.registration.mutations.addAdditionalMember).toHaveBeenCalledWith(additionalMember, true);
      });
    });
  });

  describe('Computed', () => {
    describe('flowTabs', () => {
      it('returns the right tabs if there are additional members', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.flowTabs).toEqual(tabs());
      });

      it('returns the right tabs if there are no additional members', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            splitHousehold() {
              return {
                originHouseholdId: 'f4ec77c9-8b02-4ba6-9ba3-9c24e943afe8',
                splitMembers: {
                  primaryMember: mockMember({ id: 'id-1' }),
                  additionalMembers: [],
                },
              };
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.flowTabs).toEqual(tabs().filter((t) => t.id !== 'additionalSplitMembers'));
      });
    });

    describe('splitMemberName', () => {
      it('returns the right value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            splitHousehold() {
              return mockSplitHousehold();
            },
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

  describe('lifecycle', () => {
    it('calls the storage mutation setTabs with the tabs', () => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          flowTabs() {
            return [{ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }];
          },
        },
        mocks: { $storage: storage },
      });

      wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(storage.registration.mutations.setTabs)
        .toHaveBeenCalledWith([{ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }]);
    });

    it('calls back if there is no split household data', () => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          splitHousehold() {
            return null;
          },
        },
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.back = jest.fn();
      wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.back).toHaveBeenCalled();
    });
  });
});
