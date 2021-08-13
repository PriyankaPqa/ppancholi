import { i18n } from '@/ui/plugins/i18n';
import { VDateFieldWithValidation } from '@crctech/component-library';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import helpers from '../../ui/helpers';
import { ECurrentAddressTypes, mockCampGround } from '../../entities/value-objects/current-address/index';
import {
  mockShelterLocations,
} from '../../entities/event';
import { mockStorage } from '../../store/storage/storage.mock';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import {
  mockGenders,
  mockAdditionalMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockMember,
} from '../../entities/household-create';
import Component from './AdditionalMemberForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AdditionalMemberForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        member: mockAdditionalMember(),
        sameAddress: true,
        genderItems: mockGenders(),
        canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
        indigenousTypesItems: mockIndigenousTypesItems(),
        indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
        currentAddressTypeItems: helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes'),
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

      it('should relay change event', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('change', mockMember());
        expect(wrapper.emitted('indigenous-identity-change')[0]).toEqual([mockMember()]);
      });
    });

    describe('Identity form', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(IdentityForm).exists()).toBeTruthy();
      });

      it('should relay change event', () => {
        const component = wrapper.findComponent(IdentityForm);
        component.vm.$emit('change', mockMember());
        expect(wrapper.emitted('identity-change')[0]).toEqual([mockMember()]);
      });
    });

    describe('Temporary Address', () => {
      it('should be displayed only is different address', async () => {
        expect(wrapper.findComponent(CurrentAddressForm).exists()).toBeFalsy();

        await wrapper.setProps({
          sameAddress: false,
        });

        expect(wrapper.findComponent(CurrentAddressForm).exists()).toBeTruthy();
      });

      it('should relay change event', async () => {
        await wrapper.setProps({
          sameAddress: false,
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        component.vm.$emit('change', mockCampGround());
        expect(wrapper.emitted('temporary-address-change')[0]).toEqual([mockCampGround()]);
      });
    });

    describe('Moved at', () => {
      it('should be rendered if inHouseholdProfile is true', async () => {
        await wrapper.setProps({
          inHouseholdProfile: true,
        });
        const component = wrapper.findComponent(VDateFieldWithValidation);
        expect(component.exists()).toBeTruthy();
      });

      it('should call changeMovedDate', async () => {
        await wrapper.setProps({
          inHouseholdProfile: true,
        });
        jest.spyOn(wrapper.vm, 'changeMovedDate').mockImplementation(() => {});
        const component = wrapper.findComponent(VDateFieldWithValidation);
        component.vm.$emit('change');
        expect(wrapper.vm.changeMovedDate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('movedDate', () => {
      it('returns the right value', () => {
        const member = { ...mockAdditionalMember(), currentAddress: { from: new Date('2021', '0', '1') } };
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member,
            sameAddress: true,
            genderItems: mockGenders(),
            canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
            indigenousTypesItems: mockIndigenousTypesItems(),
            indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
            currentAddressTypeItems: helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes'),
            loading: false,
            apiKey: 'google-api-key',
            shelterLocations: mockShelterLocations(),
            i18n,
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.movedDate).toEqual('2021-01-01');
      });
    });
  });

  describe('Methods', () => {
    describe('changeMovedDate', () => {
      it('emits temporary-address-change with the right payload', async () => {
        wrapper.vm.member.currentAddress = mockCampGround();
        await wrapper.vm.changeMovedDate('2021-04-23');
        expect(wrapper.emitted('temporary-address-change')[0][0]).toEqual({ ...mockCampGround(), from: new Date('2021-04-23') });
      });
    });
  });
});
