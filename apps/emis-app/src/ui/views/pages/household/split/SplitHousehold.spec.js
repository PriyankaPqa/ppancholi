import { mockSplitHousehold, ContactInformation } from '@libs/entities-lib/household-create';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockDetailedRegistrationResponse, mockHouseholdEntity } from '@libs/entities-lib/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';

import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import helpers from '@/ui/helpers/helpers';

import routes from '@/constants/routes';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { tabs } from '@/ui/views/pages/household/split/tabs';

import Component from './SplitHousehold.vue';

const localVue = createLocalVue();

const { pinia, registrationStore } = useMockRegistrationStore();

window.scrollTo = jest.fn();
describe('SplitHousehold.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          currentTab: () => ({ id: '', titleKey: '', nextButtonTextKey: '' }),
          splitHousehold() {
            return mockSplitHousehold();
          },
        },

      });
    });

    describe('back', () => {
      it('should return to search household page if user is seeing results', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTabIndex: () => 0,
            splitHousehold() {
              return mockSplitHousehold();
            },
          },

        });
        await wrapper.vm.back();
        expect(registrationStore.householdResultsShown).toEqual(false);
      });

      it('should go to the origin household if user is at the first page of registration', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
          pinia,
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
          pinia,
          computed: {
            currentTab: () => ({ id: TabId.IsRegistered }),
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
          pinia,
          computed: {
            currentTab: () => ({ id: TabId.PersonalInfo }),
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
            currentTab: () => ({ id: TabId.ReviewSplitInfo }),
          },
        });
        wrapper.vm.nextDefault = jest.fn();

        await wrapper.vm.next();
        expect(wrapper.vm.nextDefault).toBeCalledWith(true);
      });

      it('calls nextDefault without argument by default', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
          pinia,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            currentTabIndex: () => 1,
            allTabs() {
              return [{ id: '1' }, { id: 2 }, { id: 3 }];
            },
          },
        });
        registrationStore.currentTabIndex = 1;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextDefault();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(2);
      });

      it('does not calls jump if current tab index same or larger as number of tabs -1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            currentTabIndex: () => 1,
            allTabs() {
              return [{ id: '1' }, { id: 2 }];
            },
          },
        });
        registrationStore.currentTabIndex = 1;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextDefault();
        expect(wrapper.vm.jump).not.toHaveBeenCalled();
      });

      it('calls the store action splitHousehold if performSplit is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            splitHousehold() {
              return mockSplitHousehold();
            },
            allTabs() {
              return [{ id: '1' }, { id: 2 }];
            },
          },

        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.nextDefault(true);
        expect(registrationStore.splitHousehold).toHaveBeenCalledTimes(1);
      });
    });

    describe('closeSplit', () => {
      it('calls router replace with the new household id if there is one ', () => {
        registrationStore.registrationResponse = mockDetailedRegistrationResponse();
        wrapper.vm.closeSplit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name, params: { id: mockHouseholdEntity().id },
        });
      });

      it('calls router replace with the origin household id if there is no new household id ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTab: () => ({
              id: TabId.ReviewSplitInfo, titleKey: '', nextButtonTextKey: '', isValid: '',
            }),
            splitHousehold() {
              return mockSplitHousehold();
            },
          },

        });
        registrationStore.registrationResponse = null;
        wrapper.vm.closeSplit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name, params: { id: mockSplitHousehold().originHouseholdId },
        });
      });
    });

    describe('createNewHousehold', () => {
      it('calls the registration mutation resetHouseholdCreate', async () => {
        await wrapper.vm.createNewHousehold();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });

      it('calls setPrimaryBeneficiary with the right payload', async () => {
        const { primaryMember } = mockSplitHousehold().splitMembers;
        registrationStore.householdCreate.setPrimaryBeneficiary = jest.fn();
        registrationStore.resetHouseholdCreate = jest.fn();
        primaryMember.setCurrentAddress(null);
        primaryMember.contactInformation = new ContactInformation();
        await wrapper.vm.createNewHousehold();
        expect(registrationStore.householdCreate.setPrimaryBeneficiary).toHaveBeenCalledWith(primaryMember);
      });

      it('calls addAdditionalMember if the split household has additional members', async () => {
        const additionalMember = mockSplitHousehold().splitMembers.additionalMembers[0];
        registrationStore.householdCreate.addAdditionalMember = jest.fn();
        registrationStore.resetHouseholdCreate = jest.fn();
        additionalMember.setCurrentAddress(null);

        await wrapper.vm.createNewHousehold();
        expect(registrationStore.householdCreate.addAdditionalMember).toHaveBeenCalledWith(additionalMember, true);
      });
    });
  });

  describe('Computed', () => {
    describe('registrationAssessment', () => {
      it('should return the registrationAssessment', () => {
        jest.clearAllMocks();
        const registrationAssessment = wrapper.vm.registrationAssessment;
        expect(registrationStore.getAssessmentToComplete).toHaveBeenCalled();
        expect(registrationAssessment).toEqual(registrationStore.getAssessmentToComplete().registrationAssessment);
      });
    });

    describe('splitMemberName', () => {
      it('returns the right value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            splitHousehold() {
              return mockSplitHousehold();
            },
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
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },

        });

        registrationStore.splitHouseholdState = mockSplitHousehold();

        expect(wrapper.vm.splitHousehold).toEqual(mockSplitHousehold());
      });
    });

    describe('titleLeave', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },

        });
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
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
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
        });
        expect(wrapper.vm.title).toEqual(wrapper.vm.allTabs[wrapper.vm.currentTabIndex].titleKey);
      });
    });

    describe('nextButtonLabel', () => {
      it('should return proper text ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
        });
        expect(wrapper.vm.nextButtonLabel).toEqual(wrapper.vm.currentTab.nextButtonTextKey);
      });
    });
  });

  describe('lifecycle', () => {
    it('sets the right tabs if there are additional members', () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          splitHousehold() {
            return mockSplitHousehold();
          },
        },
      });

      expect(registrationStore.setTabs).toBeCalledWith(tabs());
    });

    it('returns the right tabs if there are no additional members', () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
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
      });

      expect(registrationStore.setTabs).toHaveBeenCalledWith(tabs().filter((t) => t.id !== TabId.AdditionalSplitMembers));
    });

    it('calls back if there is no split household data', () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          splitHousehold() {
            return null;
          },
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
