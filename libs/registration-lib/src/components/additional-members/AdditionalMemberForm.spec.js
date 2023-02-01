import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/helpers';
import { ECurrentAddressTypes, mockCampGround } from '@libs/entities-lib/src/value-objects/current-address';
import {
  mockShelterLocations,
} from '@libs/entities-lib/src/registration-event';
import {
  mockGenders,
  mockAdditionalMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockMember,
} from '@libs/entities-lib/src/household-create';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AdditionalMemberForm.vue';

const localVue = createLocalVue();

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
        disableAutocomplete: false,
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
  });
});
