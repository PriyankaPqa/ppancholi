/**
 * @group ui/components/household
 */

import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import {
  mockIndigenousCommunitiesGetData, mockSplitHousehold, mockHouseholdCreate,
} from '@crctech/registration-lib/src/entities/household-create';
import { mockStorage } from '@/store/storage';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';

import Component from '../HouseholdMemberCard.vue';
import householdHelpers from '@/ui/helpers/household';

const localVue = createLocalVue();
const member = mockMember({ id: 'id-1' });
const storage = mockStorage();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };
describe('HouseholdMemberCard.vue', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);

  const doMount = (isPrimaryMember = false, isShallow = true, customOptions = null, index = 0) => {
    const options = {
      localVue,
      propsData: {
        member,
        isPrimaryMember,
        shelterLocations: [],
        index,
      },
      mocks: {
        $storage: storage,
      },
      store: {
        modules: {
          registration: {
            state: {
              indigenousCommunities: mockIndigenousCommunitiesGetData(),
            },
          },
        },
      },
      ...customOptions,
    };
    if (isShallow) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Template', () => {
    describe('display name', () => {
      let element;
      beforeEach(() => {
        doMount(true);
        element = wrapper.findDataTest('household_profile_member_display_name');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the name of the member', () => {
        expect(element.text()).toContain(member.identitySet.firstName);
        expect(element.text()).toContain(member.identitySet.lastName);
      });
    });

    describe('primary member label ', () => {
      it('renders if member is primary', () => {
        doMount(true);
        const element = wrapper.findDataTest('household_profile_member_primary_member_label');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if member is not primary', () => {
        doMount(false);
        const element = wrapper.findDataTest('household_profile_member_primary_member_label');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('make member button ', () => {
      it('renders if member is not primary and canChangePrimary', () => {
        doMount(false, true, {
          computed: {
            canChangePrimary() {
              return true;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_make_primary_btn');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if member is not primary and  !canChangePrimary', () => {
        doMount(false, true, {
          computed: {
            canChangePrimary() {
              return false;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_make_primary_btn');
        expect(element.exists()).toBeFalsy();
      });

      it('does not render if member is  primary', () => {
        doMount(true);
        const element = wrapper.findDataTest('household_profile_member_make_primary_btn');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('action buttons', () => {
      let element;
      let buttons;
      beforeEach(() => {
        buttons = [{
          test: 'mock-button',
          label: 'mock-button',
          additionalMemberOnly: true,
          icon: 'mock-icon',
          event: jest.fn(),
        }];
        doMount(false, false, {
          computed: {
            buttons() {
              return buttons;
            },
          },
        });
        element = wrapper.findDataTest('household_profile_member_action_btn_mock-button');
      });
      it('renders with the right label', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right icon', () => {
        expect(element.find('i').classes('mock-icon')).toBeTruthy();
      });

      it('calls the right method', async () => {
        doMount(false, false, {
          computed: {
            buttons() {
              return buttons;
            },
          },
        });
        element = wrapper.findDataTest('household_profile_member_action_btn_mock-button');
        await element.trigger('click');
        expect(buttons[0].event).toHaveBeenCalledTimes(1);
      });

      it('does not render if hide option is false', () => {
        buttons = [{
          test: 'mock-button',
          label: 'mock-button',
          additionalMemberOnly: true,
          icon: 'mock-icon',
          event: jest.fn(),
          hide: true,
        }];
        doMount(false, true, {
          computed: {
            buttons() {
              return buttons;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_action_btn_mock-button');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('member info', () => {
      it('renders the right label', () => {
        const memberInfo = [
          {
            label: 'mock-label-1',
            data: 'mock-data-1',
            test: 'mock-test-name-1',
            primaryMemberOnly: false,
          },
        ];
        doMount(false, false, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_info_label_mock-test-name-1');
        expect(element.exists()).toBeTruthy();
      });

      it('renders the right data', () => {
        const memberInfo = [
          {
            label: 'mock-label-1',
            data: 'mock-data-1',
            test: 'mock-test-name-1',
            primaryMemberOnly: false,
          },
        ];
        doMount(false, false, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element.text()).toContain(memberInfo[0].data);
      });

      it('renders the right data when member is primary', () => {
        const memberInfo = [
          {
            label: 'mock-label-1',
            data: 'mock-data-1',
            test: 'mock-test-name-1',
            primaryMemberOnly: false,
          },
          {
            label: 'mock-label-2',
            data: 'mock-data-2',
            test: 'mock-test-name-2',
            primaryMemberOnly: true,
          },
        ];

        // is primary
        doMount(true, true, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element1 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element1.text()).toContain(memberInfo[0].data);
        const element2 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-2');
        expect(element2.text()).toContain(memberInfo[1].data);

        // is not primary
        doMount(false, true, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element3 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element3.text()).toContain(memberInfo[0].data);
        const element4 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-2');
        expect(element4.exists()).toBeFalsy();
      });

      it('displays the right data for full name', () => {
        const memberInfo = [
          {
            label: 'mock-label-1',
            data: 'mock-data-1',
            test: 'mock-test-name-1',
            customContent: 'name',
          },
        ];
        doMount(false, true, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(member.identitySet.firstName);
        expect(element.text()).toContain(member.identitySet.lastName);
        expect(element.text()).toContain(member.identitySet.middleName);
        expect(element.text()).toContain(member.identitySet.preferredName);
      });

      it('displays the right data for phone numbers', () => {
        const memberInfo = [
          {
            label: 'mock-label-1',
            data: 'mock-data-1',
            test: 'mock-test-name-1',
            customContent: 'phoneNumbers',
          },
        ];

        householdHelpers.homePhoneNumber = jest.fn(() => 'mock-homePhoneNumber');
        householdHelpers.mobilePhoneNumber = jest.fn(() => 'mock-mobilePhoneNumber');
        householdHelpers.alternatePhoneNumber = jest.fn(() => 'mock-alternatePhoneNumber');
        householdHelpers.alternatePhoneExtension = jest.fn(() => 'mock-alternatePhoneExtension');

        doMount(false, true, {
          computed: {
            memberInfo() {
              return memberInfo;
            },
          },
        });
        const element = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('mock-homePhoneNumber');
        expect(element.text()).toContain('mock-mobilePhoneNumber');
        expect(element.text()).toContain('mock-alternatePhoneNumber');
        expect(element.text()).toContain('mock-alternatePhoneExtension');
      });
    });
  });

  describe('Computed', () => {
    describe('canSplit', () => {
      it('returns true if the user has level 2 or more', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            ...mockUserStateLevel(2),
          },

        });
        expect(wrapper.vm.canSplit).toBeTruthy();
      });
      it('returns false if the user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            modules: {
              ...mockUserStateLevel(1),
            },
          },

        });
        expect(wrapper.vm.canSplit).toBeFalsy();
      });
    });

    describe('canChangePrimary', () => {
      it('returns true if the user has level 2 or more', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            ...mockUserStateLevel(2),
          },

        });
        expect(wrapper.vm.canChangePrimary).toBeTruthy();
      });
      it('returns false if the user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            modules: {
              ...mockUserStateLevel(1),
            },
          },

        });
        expect(wrapper.vm.canChangePrimary).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true if the user has level 1 or more', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            ...mockUserStateLevel(1),
          },

        });
        expect(wrapper.vm.canEdit).toBeTruthy();
      });
      it('returns false if the user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            isPrimaryMember: false,
            shelterLocations: [],
          },
          store: {
            modules: {
              user: {
                state:
                  {
                    oid: '7',
                    email: 'test@test.ca',
                    family_name: 'Joe',
                    given_name: 'Pink',
                    roles: ['contributorIM'],
                  },
              },
            },
          },

        });
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('displayName', () => {
      it('returns the right data', () => {
        doMount();
        expect(wrapper.vm.displayName).toEqual(`${wrapper.vm.member.identitySet.firstName} ${wrapper.vm.member.identitySet.lastName}`);
      });
    });

    describe('splitHouseholdMembers', () => {
      it('returns the right data', () => {
        doMount(false, true, {
          store: {
            modules: {
              registration: {
                state: { splitHousehold: mockSplitHousehold() },
              },
            },
          },
        });

        expect(wrapper.vm.splitHouseholdMembers).toEqual(mockSplitHousehold().splitMembers);
      });
    });

    describe('splitAdditionalMembers', () => {
      // eslint-disable-next-line max-len
      it('returns the split additional members if there are split household members and the card corresponds to the new primary member of the split household ', () => {
        doMount(false, true, {
          propsData: {
            shelterLocations: [],
            index: 1,
            member: mockMember({ id: mockSplitHousehold().splitMembers.primaryMember.id }),
          },
          computed: {
            splitHouseholdMembers() {
              return mockSplitHousehold().splitMembers;
            },
          },
        });

        expect(wrapper.vm.splitAdditionalMembers).toEqual(mockSplitHousehold().splitMembers.additionalMembers);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('create', () => {
      it('calls initSplitView if is in split mode (e.g we land back on the page from the split flow)', () => {
        storage.registration.getters.isSplitMode = jest.fn(() => true);
        doMount(false, true, {
          mocks: { $storage: storage },
        });
        jest.spyOn(wrapper.vm, 'initSplitView').mockImplementation(() => {});

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initSplitView).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('openEditDialog', () => {
      it('sets showPrimaryMemberDialog if isPrimaryMember', async () => {
        doMount(true);
        expect(wrapper.vm.showPrimaryMemberDialog).toBeFalsy();
        await wrapper.vm.openEditDialog();
        expect(wrapper.vm.showPrimaryMemberDialog).toBeTruthy();
      });

      it('sets showAdditionalMemberDialog if isPrimaryMember is false', async () => {
        doMount(false);
        expect(wrapper.vm.showAdditionalMemberDialog).toBeFalsy();
        await wrapper.vm.openEditDialog();
        expect(wrapper.vm.showAdditionalMemberDialog).toBeTruthy();
      });
    });

    describe('openSplitDialog', () => {
      it('sets showSplitDialog to true', async () => {
        doMount(true);
        expect(wrapper.vm.showSplitDialog).toBeFalsy();
        await wrapper.vm.openSplitDialog();
        expect(wrapper.vm.showSplitDialog).toBeTruthy();
      });
      it('calls the mutation resetSplitHousehold if is not in split mode', async () => {
        storage.registration.getters.isSplitMode = jest.fn(() => false);
        doMount(true);
        await wrapper.vm.openSplitDialog();
        expect(storage.registration.mutations.resetSplitHousehold).toHaveBeenCalled();
      });
    });

    describe('initSplitView', () => {
      // eslint-disable-next-line max-len
      it('sets showSplitDialog to true if there are split household members and the card corresponds to the new primary member of the split household',
        async () => {
          doMount(false, true, {
            propsData: {
              shelterLocations: [],
              index: 1,
              member: mockMember({ id: mockSplitHousehold().splitMembers.primaryMember.id }),
            },
            computed: {
              splitHouseholdMembers() {
                return mockSplitHousehold().splitMembers;
              },
            },
          });
          await wrapper.vm.initSplitView();
          expect(wrapper.vm.showSplitDialog).toBeTruthy();
        });
    });

    describe('deleteAdditionalMember', () => {
      it('should call confirm with the right parameters', () => {
        doMount(false);
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ title: 'common.delete', messages: 'household.profile.member.delete.message' });
      });

      it('should call deleteAdditionalMember storage action', async () => {
        doMount(false);
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.setData({ index: 0 });

        await wrapper.vm.deleteAdditionalMember();

        expect(wrapper.vm.$storage.registration.actions.deleteAdditionalMember)
          .toHaveBeenCalled(householdCreate.id, wrapper.vm.member.id, 0);
      });

      it('should call deleteAdditionalMember', async () => {
        doMount(false);
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.setData({ index: 0 });

        await wrapper.vm.deleteAdditionalMember();

        expect(wrapper.vm.$storage.registration.actions.deleteAdditionalMember)
          .toHaveBeenCalled(householdCreate.id, wrapper.vm.member.id, 0);
      });
    });

    describe('closeAndReload', () => {
      it('emits and closes popups', async () => {
        doMount(false);
        await wrapper.setData({ showAdditionalMemberDialog: true });
        await wrapper.setData({ showPrimaryMemberDialog: true });
        expect(wrapper.emitted('reload-household-create')).toBeFalsy();

        wrapper.vm.closeAndReload();

        expect(wrapper.vm.showAdditionalMemberDialog).toBeFalsy();
        expect(wrapper.vm.showPrimaryMemberDialog).toBeFalsy();
        expect(wrapper.emitted('reload-household-create')).toBeTruthy();
      });
    });
  });
});
