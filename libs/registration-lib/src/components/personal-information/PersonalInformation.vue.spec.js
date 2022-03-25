import { i18n } from '@/ui/plugins/i18n';
import { mockStorage } from '../../store/storage/storage.mock';
import IdentityForm from '../forms/IdentityForm.vue';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import {
  mockMember,
  mockContactInformation,
  mockHouseholdCreate,
  mockPreferredLanguages,
  mockIndigenousTypesItems,
  mockIndigenousCommunitiesItems,
  mockIdentitySet,
  mockPrimarySpokenLanguages,
  mockGenders,
} from '../../entities/household-create';

import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './PersonalInformation.vue';
import helpers from '../../ui/helpers/index';
import { Status } from '../../entities/base';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PersonalInformation.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      data() {
        return {
          form: storage.registration.getters.personalInformation(),
        };
      },
      propsData: {
        i18n,
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

    describe('setIndigenousIdentity', () => {
      it('triggers mutations setPrimaryBeneficiary if storeMode but always emits', async () => {
        const newValue = {};
        await wrapper.vm.setIndigenousIdentity(newValue);
        expect(storage.registration.mutations.setIndigenousIdentity).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setIndigenousIdentity')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setIndigenousIdentity(newValue);
        expect(storage.registration.mutations.setIndigenousIdentity).not.toHaveBeenCalled();
        expect(wrapper.emitted('setIndigenousIdentity')[0][0]).toEqual(newValue);
      });
      it('should be called when indigenous identity is changed', () => {
        jest.spyOn(wrapper.vm, 'setIndigenousIdentity');
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('change', mockMember());
        expect(wrapper.vm.setIndigenousIdentity).toHaveBeenCalledWith(mockMember());
      });
    });

    describe('setIdentity', () => {
      it('triggers mutations setIdentity if storeMode but always emits', async () => {
        const newValue = {};
        await wrapper.vm.setIdentity(newValue);
        expect(storage.registration.mutations.setIdentity).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setIdentity')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setIdentity(newValue);
        expect(storage.registration.mutations.setIdentity).not.toHaveBeenCalled();
        expect(wrapper.emitted('setIdentity')[0][0]).toEqual(newValue);
      });
      it('should be called when identity is changed', () => {
        jest.spyOn(wrapper.vm, 'setIdentity');
        const component = wrapper.findComponent(IdentityForm);
        component.vm.$emit('change', mockMember());
        expect(wrapper.vm.setIdentity).toHaveBeenCalledWith(mockMember());
      });
    });

    describe('setContactInformation', () => {
      it('triggers mutations setContactInformation if storeMode but always emits', async () => {
        const newValue = {};
        await wrapper.vm.setContactInformation(newValue);
        expect(storage.registration.mutations.setContactInformation).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setContactInformation')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setContactInformation(newValue);
        expect(storage.registration.mutations.setContactInformation).not.toHaveBeenCalled();
        expect(wrapper.emitted('setContactInformation')[0][0]).toEqual(newValue);
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
    describe('identitySet', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.identitySet).toEqual(mockIdentitySet());
      });
    });

    describe('contactInformation', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('member', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.member).toEqual(mockHouseholdCreate().primaryBeneficiary);
      });
    });

    describe('preferredLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.preferredLanguagesItems).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguagesItems', () => {
      it('returns active items only if no primarySpokenLanguage selected', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
          },
        });

        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages().filter((g) => g.status === Status.Active));
      });

      it('returns active items and selected inactive primarySpokenLanguage', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            includeInactiveOptions: true,
          },
          computed: {
            contactInformation: () => ({
              primarySpokenLanguage: {
                id: '14718e75-2ae0-4a2a-8647-326edee4bb32',
              },
            }),
          },
        });

        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('genderItems', () => {
      it('returns active items only if no gender selected', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
          },
        });

        expect(wrapper.vm.genderItems).toEqual(mockGenders().filter((g) => g.status === Status.Active));
      });

      it('returns active items and selected inactive gender', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            includeInactiveOptions: true,
          },
          computed: {
            identitySet: () => ({
              gender: {
                id: '14718e75-2ae0-4a2a-8647-326edee4bb32',
              },
            }),
          },
        });

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
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(i18n));
      });
    });
  });
});
