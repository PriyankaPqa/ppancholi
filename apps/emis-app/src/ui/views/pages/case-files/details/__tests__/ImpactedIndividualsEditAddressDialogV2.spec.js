import { shallowMount, createLocalVue } from '@/test/testSetup';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes, mockCampGround, CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { mockCaseFileIndividualEntity, mockCaseFileIndividualEntities, mockTemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import flushPromises from 'flush-promises';
import _cloneDeep from 'lodash/cloneDeep';
import Component from '../case-file-impacted-individualsV2/components/ImpactedIndividualsEditAddressDialogV2.vue';

jest.mock('@libs/registration-lib/components/forms/mixins/useAddresses');
const addressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining in home' },
];
useAddresses.mockImplementation(() => ({ getCurrentAddressTypeItems: jest.fn(() => addressTypes) }));

const localVue = createLocalVue();
const { pinia, caseFileIndividualStore } = useMockCaseFileIndividualStore();
useMockCaseFileStore(pinia);
const { householdStore } = useMockHouseholdStore(pinia);
useMockPersonStore(pinia);

const household = householdStore.getById();
const primaryIndividual = caseFileIndividualStore.getByCaseFile()[0];
household.primaryBeneficiary = primaryIndividual.personId;
householdStore.getById = jest.fn(() => household);
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
        id: 'casefileid',
        show: true,
        individual: mockCaseFileIndividualEntity({ id: 'mock-individual-id' }),
        member: mockMember({ id: 'mock-member-id' }),
        isPrimaryMember,
        shelterLocationsList: mockShelters,
      },
      data() {
        return {
          apiKey: 'google-api-key',
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
    describe('individuals', () => {
      it('returns the right data', () => {
        expect(wrapper.vm.individuals).toEqual(mockCaseFileIndividualEntities());
      });
    });

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
        doMount(true, { mocks: { $hasFeature: (f) => f !== FeatureKeys.RemainingInHomeForAdditionalMembers } });

        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, !!wrapper.vm.shelterLocations.length, false);
      });

      it('calls the useAddresses method with the right params when feature flag is off', async () => {
        doMount(true, { mocks: { $hasFeature: (f) => f !== FeatureKeys.RemainingInHomeForAdditionalMembers } });
        await wrapper.setData({ sameAddress: false });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, !!wrapper.vm.shelterLocations.length, false);
      });

      it('calls the useAddresses method with the right params when feature flag is off and not primary member', async () => {
        doMount(false, { mocks: { $hasFeature: (f) => f !== FeatureKeys.RemainingInHomeForAdditionalMembers } });
        await wrapper.setData({ sameAddress: false });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, !!wrapper.vm.shelterLocations.length, true);
      });

      it('calls the useAddresses method with the right params when no fixed home', async () => {
        doMount();
        await wrapper.setData({ noFixedHome: true });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, true, !!wrapper.vm.shelterLocations.length, false);
      });

      it('calls the useAddresses method with the right params when no shelter locations', async () => {
        doMount();
        await wrapper.setProps({ shelterLocationsList: [] });
        expect(wrapper.vm.getCurrentAddressTypeItems)
          .toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, false, false);
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
      it('should return proper data', async () => {
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
        await wrapper.setData({ editedAddress: mockCampGround() });
        expect(wrapper.vm.currentAddressWithFormattedDate).toEqual(expectResult);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should save the currentAddress into backupAddress and edited address', () => {
        expect(wrapper.vm.backupAddress).toEqual(wrapper.vm.temporaryAddressAsCurrentAddress(wrapper.vm.individual.currentAddress));
        expect(wrapper.vm.editedAddress).toEqual(wrapper.vm.temporaryAddressAsCurrentAddress(wrapper.vm.individual.currentAddress));
        expect(wrapper.vm.sameAddress).toBeTruthy();
        expect(wrapper.vm.noFixedHome).toBeFalsy();
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

    describe('temporaryAddressAsCurrentAddress', () => {
      it('sets the shelter id', () => {
        let result = wrapper.vm.temporaryAddressAsCurrentAddress(mockTemporaryAddress());
        expect(result).toEqual(new CurrentAddress(mockTemporaryAddress()));
        result = wrapper.vm.temporaryAddressAsCurrentAddress({ ...mockTemporaryAddress(), shelterLocationId: mockShelters[0].id });
        expect(result).toEqual({ ...new CurrentAddress(mockTemporaryAddress()), shelterLocation: mockShelters[0] });
      });
    });

    describe('submitUpdatedAddress', () => {
      it('should call addTemporaryAddress with proper params for current individual', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.editedAddress.shelterLocation = { id: 'abc' };
        await wrapper.vm.submitUpdatedAddress();
        const expected = _cloneDeep(wrapper.vm.editedAddress);
        expected.shelterLocationId = 'abc';
        expect(caseFileIndividualStore.addTemporaryAddress).toHaveBeenCalledWith(wrapper.vm.caseFileId, wrapper.vm.individual.id, expected);
      });

      it('should call updateAdditionalMembersWithSameAddress with proper params when is primary member and has additionalMembers', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.updateAdditionalMembersWithSameAddress = jest.fn();
        await wrapper.vm.submitUpdatedAddress();
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setProps({
          isPrimaryMember: false,
        });
        await wrapper.vm.submitUpdatedAddress();
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).not.toHaveBeenCalled();
      });
    });

    describe('updateAdditionalMembersWithSameAddress', () => {
      it(
        'calls the service updatePersonAddress for each additional member that has the same address as the primary member and sets address',
        async () => {
          await wrapper.vm.updateAdditionalMembersWithSameAddress(wrapper.vm.editedAddress);
          expect(caseFileIndividualStore.addTemporaryAddress).toHaveBeenCalledTimes(2);
          expect(caseFileIndividualStore.addTemporaryAddress).toHaveBeenCalledWith(wrapper.vm.caseFileId, '1', wrapper.vm.editedAddress);
          expect(caseFileIndividualStore.addTemporaryAddress).toHaveBeenCalledWith(wrapper.vm.caseFileId, '3', wrapper.vm.editedAddress);
        },
      );
    });

    describe('changeSameAddress', () => {
      it('should call setCurrentAddress with proper argument', async () => {
        wrapper.vm.setCurrentAddress = jest.fn();
        wrapper.vm.changeSameAddress(true);
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.primaryAddress);

        wrapper.vm.changeSameAddress(false);
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.backupAddress);
      });
    });

    describe('setCurrentAddress', () => {
      it('sets editedAddress ', async () => {
        const param = {};
        await wrapper.vm.setCurrentAddress(param);
        expect(wrapper.vm.editedAddress).toBe(param);
      });
    });
  });
});
