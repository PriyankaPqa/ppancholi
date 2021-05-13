import { i18n } from '@/ui/plugins/i18n';
import { ECanadaProvinces } from '@/types';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import TempAddressForm from '../forms/TempAddressForm.vue';
import helpers from '../../ui/helpers';
import { ETemporaryAddressTypes, mockCampGround } from '../../entities/value-objects/temporary-address/index';
import {
  mockShelterLocations,
} from '../../entities/event';
import { mockStorage } from '../../store/storage/storage.mock';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import {
  mockGenders,
  mockHouseholdMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockPerson,
} from '../../entities/beneficiary';
import Component from './HouseholdMemberForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdMemberForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        person: mockHouseholdMember(),
        sameAddress: true,
        genderItems: mockGenders(),
        canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
        indigenousTypesItems: mockIndigenousTypesItems(),
        indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
        temporaryAddressTypeItems: helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes'),
        loading: false,
        apiKey: 'google-api-key',
        shelterLocations: mockShelterLocations(),
        i18n,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Indigenous identity form', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(IndigenousIdentityForm).exists()).toBeTruthy();
      });

      it('should relay province-change event', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('province-change', ECanadaProvinces.ON);
        expect(wrapper.emitted('province-change')[0]).toEqual([ECanadaProvinces.ON]);
      });

      it('should relay change event', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.emitted('indigenous-identity-change')[0]).toEqual([mockPerson()]);
      });
    });

    describe('Identity form', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(IdentityForm).exists()).toBeTruthy();
      });

      it('should relay change event', () => {
        const component = wrapper.findComponent(IdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.emitted('identity-change')[0]).toEqual([mockPerson()]);
      });
    });

    describe('Temporary Address', () => {
      it('should be displayed only is different address', async () => {
        expect(wrapper.findComponent(TempAddressForm).exists()).toBeFalsy();

        await wrapper.setProps({
          sameAddress: false,
        });

        expect(wrapper.findComponent(TempAddressForm).exists()).toBeTruthy();
      });

      it('should relay change event', async () => {
        await wrapper.setProps({
          sameAddress: false,
        });
        const component = wrapper.findComponent(TempAddressForm);
        component.vm.$emit('change', mockCampGround());
        expect(wrapper.emitted('temporary-address-change')[0]).toEqual([mockCampGround()]);
      });
    });
  });
});
