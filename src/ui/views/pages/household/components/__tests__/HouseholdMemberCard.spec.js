import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockMemberData } from '@crctech/registration-lib/src/entities/value-objects/member';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { mockIndigenousCommunitiesGetData, EIndigenousTypes } from '@crctech/registration-lib/src/entities/household-create';

import Component from '../HouseholdMemberCard.vue';

const localVue = createLocalVue();
const member = mockMemberData();

describe('HouseholdMemberCard.vue', () => {
  let wrapper;

  const doMount = (isPrimaryMember = false, isShallow = true, customOptions = null) => {
    const options = {
      localVue,
      propsData: {
        member,
        isPrimaryMember,
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
      it('renders if member is not primary', () => {
        doMount(false);
        const element = wrapper.findDataTest('household_profile_member_make_primary_btn');
        expect(element.exists()).toBeTruthy();
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
        doMount(false, true, { computed: { buttons() { return buttons; } } });
        element = wrapper.findDataTest('household_profile_member_action_btn_mock-button');
      });
      it('renders with the right label', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right icon', () => {
        expect(element.text()).toContain('mock-icon');
      });

      it('calls the right method', async () => {
        doMount(false, false, { computed: { buttons() { return buttons; } } });
        element = wrapper.findDataTest('household_profile_member_action_btn_mock-button');
        await element.trigger('click');
        expect(buttons[0].event).toHaveBeenCalledTimes(1);
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
        doMount(false, false, { computed: { memberInfo() { return memberInfo; } } });
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
        doMount(false, false, { computed: { memberInfo() { return memberInfo; } } });
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
        doMount(true, true, { computed: { memberInfo() { return memberInfo; } } });
        const element1 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-1');
        expect(element1.text()).toContain(memberInfo[0].data);
        const element2 = wrapper.findDataTest('household_profile_member_info_data_mock-test-name-2');
        expect(element2.text()).toContain(memberInfo[1].data);

        // is not primary
        doMount(false, true, { computed: { memberInfo() { return memberInfo; } } });
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
        doMount(false, true, { computed: { memberInfo() { return memberInfo; } } });
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
        doMount(false, true, {
          computed: {
            memberInfo() { return memberInfo; },
            homePhoneNumber() { return 'mock-homePhoneNumber'; },
            mobilePhoneNumber() { return 'mock-mobilePhoneNumber'; },
            alternatePhoneNumber() { return 'mock-alternatePhoneNumber'; },
            alternatePhoneExtension() { return 'mock-alternatePhoneExtension'; },
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
    describe('birthDate', () => {
      beforeEach(() => {
        jest.spyOn(libHelpers, 'displayBirthDate').mockImplementation(() => 'Jan 1, 1945');
        jest.spyOn(libHelpers, 'getAge').mockImplementation(() => '75');
      });

      it('calls the lib helper functions', () => {
        doMount();
        expect(libHelpers.displayBirthDate).toHaveBeenCalled();
        expect(libHelpers.getAge).toHaveBeenCalled();
      });

      it('returns the right data', () => {
        doMount();
        expect(wrapper.vm.birthDate).toEqual('Jan 1, 1945 (75 common.years)');
      });
    });

    describe('displayName', () => {
      it('returns the right data', () => {
        doMount();
        expect(wrapper.vm.displayName).toEqual(`${wrapper.vm.member.identitySet.firstName} ${wrapper.vm.member.identitySet.lastName}`);
      });
    });

    describe('indigenousIdentity', () => {
      it('returns the right data ', () => {
        const altMember = {
          ...member,
          identitySet: {
            ...member.identitySet,
            indigenousType: EIndigenousTypes.InuitCommunity,
            indigenousCommunityId: mockIndigenousCommunitiesGetData()[0].id,
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.indigenousIdentity)
          .toEqual(`${mockIndigenousCommunitiesGetData()[0].communityName}, common.indigenous.types.InuitCommunity`);
      });

      it('returns the right data if member has indigenousType other', () => {
        const altMember = {
          ...member,
          identitySet: {
            ...member.identitySet,
            indigenousType: EIndigenousTypes.Other,
            indigenousCommunityOther: 'mock-community',
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.indigenousIdentity).toEqual('mock-community, common.indigenous.types.Other');
      });
    });

    describe('gender', () => {
      it('returns the right data when gender is other', () => {
        const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: 'mock-gender' } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.gender).toEqual('mock-gender');
      });
      it('returns the right data when gender is not other', () => {
        const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: null } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.gender).toEqual(member.identitySet.gender.name.translation.en);
      });
    });

    describe('preferredLanguage', () => {
      it('returns the right data when preferredLanguage is other', () => {
        const altMember = {
          ...member,
          contactInformation: {
            ...member.contactInformation,
            preferredLanguage: { isOther: true },
            preferredLanguageOther: 'mock-language',
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.preferredLanguage).toEqual('mock-language');
      });
      it('returns the right data when preferredLanguage is not other', () => {
        const altMember = {
          ...member,
          contactInformation: {
            ...member.contactInformation,
            preferredLanguage: { isOther: false, name: { translation: { en: 'bar' } } },
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.preferredLanguage).toEqual('bar');
      });
    });

    describe('primarySpokenLanguage', () => {
      it('returns the right data when primarySpokenLanguage is other', () => {
        const altMember = {
          ...member,
          contactInformation: {
            ...member.contactInformation,
            primarySpokenLanguage: { isOther: true },
            primarySpokenLanguageOther: 'mock-language',
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.primarySpokenLanguage).toEqual('mock-language');
      });
      it('returns the right data when primarySpokenLanguage is not other', () => {
        const altMember = {
          ...member,
          contactInformation: {
            ...member.contactInformation,
            primarySpokenLanguage: { isOther: false, name: { translation: { en: 'foo' } } },
          },
        };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.primarySpokenLanguage).toEqual('foo');
      });
    });

    describe('mobilePhoneNumber', () => {
      it('returns the right data when there is a mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, mobilePhoneNumber: { number: 'mock-number' } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.mobilePhoneNumber).toEqual('mock-number');
      });
      it('returns the right data when there is no mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, mobilePhoneNumber: { number: null } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.mobilePhoneNumber).toEqual('-');
      });
    });

    describe('homePhoneNumber', () => {
      it('returns the right data when there is a mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, homePhoneNumber: { number: 'mock-number' } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.homePhoneNumber).toEqual('mock-number');
      });
      it('returns the right data when there is no mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, homePhoneNumber: { number: null } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.homePhoneNumber).toEqual('-');
      });
    });
    describe('alternatePhoneNumber', () => {
      it('returns the right data when there is a mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { number: 'mock-number' } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.alternatePhoneNumber).toEqual('mock-number');
      });
      it('returns the right data when there is no mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { number: null } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.alternatePhoneNumber).toEqual('-');
      });
    });

    describe('alternatePhoneExtension', () => {
      it('returns the right data when there is a mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { extension: 'mock-number' } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.alternatePhoneExtension).toEqual('mock-number');
      });
      it('returns the right data when there is no mobile number', () => {
        const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { extension: null } } };
        doMount(false, false, { propsData: { member: altMember, isPrimaryMember: false } });
        expect(wrapper.vm.alternatePhoneExtension).toEqual('-');
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
  });
});
