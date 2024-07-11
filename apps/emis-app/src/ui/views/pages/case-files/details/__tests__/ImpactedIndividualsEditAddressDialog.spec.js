import { shallowMount, createLocalVue } from '@/test/testSetup';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes, mockCampGround } from '@libs/entities-lib/value-objects/current-address';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { mockHouseholdCreate } from '@libs/entities-lib/household-create';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import flushPromises from 'flush-promises';
import Component from '../case-file-impacted-individuals/components/ImpactedIndividualsEditAddressDialog.vue';

jest.mock('@libs/registration-lib/components/forms/mixins/useAddresses');
const addressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
];
useAddresses.mockImplementation(() => ({ getCurrentAddressTypeItems: jest.fn(() => addressTypes) }));

const localVue = createLocalVue();
const { pinia, registrationStore } = useMockRegistrationStore();
const setCurrentAddress = jest.fn();

const mockShelters = [{
  id: '7c076603-580a-4400-bef2-5ddececb5555',
  name: {
    translation: {
      en: 'YMCA Gym',
      fr: 'Gymnase du YMCA',
    },
  },
  status: 1,
  address: {
    country: 'CA',
    streetAddress: 'Pioneer Street',
    unitSuite: null,
    province: ECanadaProvinces.BC,
    city: 'Pemberton',
    postalCode: 'V0N 1L0',
  },
},
{
  id: '7c076603-580a-4400-bef2-5ddecec123321',
  name: {
    translation: {
      en: 'YMCA school',
      fr: 'Gymnase du CBC',
    },
  },
  status: 2,
  address: {
    country: 'CA',
    streetAddress: 'Pioneer Street',
    unitSuite: null,
    province: ECanadaProvinces.BC,
    city: 'Pemberton',
    postalCode: 'V0N 1L0',
  },
}];

describe('ImpactedIndividualsEditAddressDialog.vue', () => {
  let wrapper;

  const mockAddressTypes = [
    { value: ECurrentAddressTypes.Campground, text: 'Campground' },
    { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
    { value: ECurrentAddressTypes.RemainingInHome, text: 'RemainingInHome' },
  ];
  helpers.enumToTranslatedCollection = jest.fn(() => mockAddressTypes);

  const doMount = async (isPrimaryMember = true, other = {}) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        show: true,
        member: mockMember({ id: 'mock-member-id' }),
        isPrimaryMember,
        shelterLocationsList: mockShelters,
      },
      data() {
        return {
          apiKey: 'google-api-key',
          sameAddress: false,
          memberClone: mockMember({ id: 'mock-member-id' }),
          primaryBeneficiary: mockMember({ id: 'mock-member-id' }),
        };
      },
      ...other,
    };
    wrapper = shallowMount(Component, options);
    await wrapper.vm.$nextTick();

    await flushPromises();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    describe('current-address-form', () => {
      it('should be rendered when isPrimaryMember is true', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        expect(component.exists()).toBeTruthy();
      });

      it('should be rendered when isPrimaryMember is false, sameAddress is false', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        await wrapper.setData({
          sameAddress: false,
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        expect(component.exists()).toBeTruthy();
      });

      it('should not be rendered when isPrimaryMember is false, sameAddress is true', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        await wrapper.setData({
          sameAddress: true,
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        expect(component.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.title).toEqual({ key: 'impactedIndividuals.temporary_address.edit.title', params: [{ x: 'Bob Smith' }] });
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(wrapper.vm.$i18n));
      });
    });

    describe('currentAddressTypeItems', () => {
      it('calls the useAddresses method with the right params when primary member', async () => {
        doMount();

        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, !!wrapper.vm.shelterLocations.length);
      });

      it('calls the useAddresses method with the right params when no fixed home', async () => {
        doMount();
        await wrapper.setData({ noFixedHome: true });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, true, !!wrapper.vm.shelterLocations.length);
      });

      it('calls the useAddresses method with the right params when no shelter locations', async () => {
        doMount();
        await wrapper.setProps({ shelterLocationsList: [] });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, false);
      });

      it('has the right value', () => {
        doMount();
        expect(wrapper.vm.currentAddressTypeItems).toEqual(addressTypes);
      });
    });

    describe('shelterLocations', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.shelterLocations).toEqual([mockShelters[0]]);
      });
    });

    describe('currentAddressWithFormattedDate', () => {
      it('should return proper data', () => {
        const expectResult = {
          address: {
            city: 'Ottawa',
            country: 'CA',
            latitude: 0,
            longitude: 0,
            postalCode: 'K1W 1G7',
            province: 9,
            specifiedOtherProvince: undefined,
            streetAddress: '247 Some Street',
            unitSuite: '123',
          },
          addressType: 2,
          checkIn: '2023-05-01',
          checkOut: '2023-05-31',
          crcProvided: false,
          placeName: 'test',
          placeNumber: '',
          shelterLocation: null,
        };
        wrapper.vm.memberClone.currentAddress = mockCampGround();
        expect(wrapper.vm.currentAddressWithFormattedDate).toEqual(expectResult);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should call getHouseholdCreate', async () => {
        registrationStore.getHouseholdCreate = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(registrationStore.getHouseholdCreate).toHaveBeenCalled();
      });

      it('should save the currentAddress into backupAddress', async () => {
        registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.backupAddress).toEqual(wrapper.vm.member.currentAddress);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await doMount();
    });

    describe('close', () => {
      it('should emit update:show with argument false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('submitUpdatedAddress', () => {
      it('should call updatePersonAddress with proper params when is primary member', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submitUpdatedAddress();
        expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({ member: wrapper.vm.memberClone, isPrimaryMember: true });
      });

      it('should call updateAdditionalMembersWithSameAddress with proper params when is primary member and has additionalMembers', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        await wrapper.setData({
          additionalMembers: [mockMember()],
        });
        registrationStore.updatePersonAddress = jest.fn(() => mockMember({ id: '1' }));
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.updateAdditionalMembersWithSameAddress = jest.fn();
        await wrapper.vm.submitUpdatedAddress();
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).toHaveBeenCalled();
      });

      it('should call updatePersonAddress with proper params when is not primary member', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({
          isPrimaryMember: false,
          index: 0,
        });
        await wrapper.setData({
          sameAddress: false,
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submitUpdatedAddress();
        expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({ member: wrapper.vm.memberClone, isPrimaryMember: false, index: 0, sameAddress: false });
      });
    });

    describe('updateAdditionalMembersWithSameAddress', () => {
      it(
        'calls the service updatePersonAddress for each additional member that has the same address as the primary member and sets address',
        async () => {
          jest.clearAllMocks();
          registrationStore.updatePersonAddress = jest.fn();

          await doMount();
          await wrapper.setProps({
            isPrimaryMember: true,
          });
          await wrapper.setData({
            additionalMembers: [
              { ...mockMember({ id: '1' }), setCurrentAddress },
              { ...mockMember({ id: '2' }), setCurrentAddress },
            ],
            backupAddress: mockMember({ id: 'mock-member-id' }).currentAddress,
          });

          await wrapper.vm.updateAdditionalMembersWithSameAddress();
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledTimes(2);
          expect(setCurrentAddress).toHaveBeenCalledTimes(2);
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({
            member: wrapper.vm.additionalMembers[0],
            isPrimaryMember: false,
            index: 0,
          });
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({
            member: wrapper.vm.additionalMembers[1],
            isPrimaryMember: false,
            index: 1,
          });
        },
      );
    });

    describe('changeSameAddress', () => {
      it('should call setCurrentAddress with proper argument', async () => {
        wrapper.vm.setCurrentAddress = jest.fn();
        wrapper.vm.changeSameAddress(true);
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.primaryBeneficiary.currentAddress);

        wrapper.vm.changeSameAddress(false);
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.backupAddress);
      });
    });

    describe('setCurrentAddress', () => {
      it('calls the member setCurrentAddress ', async () => {
        const param = {};
        wrapper.vm.memberClone.setCurrentAddress = jest.fn();
        await wrapper.vm.setCurrentAddress(param);
        expect(wrapper.vm.memberClone.setCurrentAddress).toHaveBeenCalledWith(param);
      });
    });
  });
});
