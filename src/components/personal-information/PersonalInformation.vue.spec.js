import { mockStorage } from '../../store/storage/storage.mock';
import { ECanadaProvinces } from '../../types';
import IdentityForm from '../forms/IdentityForm.vue';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import {
  mockPerson,
  mockContactInformation,
  mockBeneficiary,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockGenders,
  mockIndigenousTypesItems,
  mockIndigenousCommunitiesItems,
} from '../../entities/beneficiary';

import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './PersonalInformation.vue';
import helpers from '../../ui/helpers';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PersonalInformation.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      data() {
        return {
          form: storage.beneficiary.getters.personalInformation(),
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Identity Form', () => {
      it('should render it', () => {
        const component = wrapper.findComponent(IdentityForm);
        expect(component.exists()).toBeTruthy();
      });

      test('minAgeRegistration props is correctly linked', () => {
        const component = wrapper.findComponent(IdentityForm);
        expect(component.props('minAgeRestriction')).toEqual(wrapper.vm.minAgeRegistration);
      });
    });

    describe('Contact Information Form', () => {
      it('should render it', () => {
        const component = wrapper.findComponent(ContactInformationForm);
        expect(component.exists()).toBeTruthy();
      });

      test('phoneEmailRules props is correctly linked', () => {
        const component = wrapper.findComponent(ContactInformationForm);
        expect(component.props('phoneEmailRules')).toEqual(wrapper.vm.phoneEmailRules);
      });
    });

    describe('Indigenous Identity Form', () => {
      it('should render it', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        expect(component.exists()).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    describe('onIndigenousProvinceChange', () => {
      it('dispatches the action to fetch indigenous identities by province', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
      it('should be called when province is changing', () => {
        jest.spyOn(wrapper.vm, 'onIndigenousProvinceChange');
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('province-change', ECanadaProvinces.ON);
        expect(wrapper.vm.onIndigenousProvinceChange).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
    });

    describe('setIndigenousIdentity', () => {
      it('triggers mutations setPerson', async () => {
        await wrapper.vm.setIndigenousIdentity(mockPerson());
        expect(storage.beneficiary.mutations.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
      });
      it('should be called when indigenous identity is changed', () => {
        jest.spyOn(wrapper.vm, 'setIndigenousIdentity');
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.vm.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
      });
    });

    describe('setIdentity', () => {
      it('triggers mutations setIdentity', async () => {
        await wrapper.vm.setIdentity(mockPerson());
        expect(storage.beneficiary.mutations.setIdentity).toHaveBeenCalledWith(mockPerson());
      });
      it('should be called when identity is changed', () => {
        jest.spyOn(wrapper.vm, 'setIdentity');
        const component = wrapper.findComponent(IdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.vm.setIdentity).toHaveBeenCalledWith(mockPerson());
      });
    });

    describe('setContactInformation', () => {
      it('triggers mutations setContactInformation', async () => {
        await wrapper.vm.setContactInformation(mockContactInformation());
        expect(storage.beneficiary.mutations.setContactInformation).toHaveBeenCalledWith(mockContactInformation());
      });
      it('should be called when contact information is changed', () => {
        jest.spyOn(wrapper.vm, 'setContactInformation');
        const component = wrapper.findComponent(ContactInformationForm);
        component.vm.$emit('change', mockContactInformation());
        expect(wrapper.vm.setContactInformation).toHaveBeenCalledWith(mockContactInformation());
      });
    });
  });

  describe('Computed', () => {
    describe('person', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.person).toEqual(mockPerson());
      });
    });

    describe('contactInformation', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('beneficiary', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.beneficiary).toEqual(mockBeneficiary());
      });
    });

    describe('preferredLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.preferredLanguagesItems).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('genderItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.genderItems).toEqual(mockGenders());
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });
  });
});
