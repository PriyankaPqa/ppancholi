import { i18n } from '@/ui/plugins/i18n';
import { Status } from '@libs/entities-lib/base';
import helpers from '@libs/entities-lib/helpers';
import {
  mockMember,
  mockContactInformation,
  mockHouseholdCreate,
  mockPreferredLanguages,
  mockIndigenousTypesItems,
  mockIndigenousCommunitiesItems,
  mockIdentitySet,
  mockPrimarySpokenLanguages,
  mockGenders, mockSplitHousehold,
} from '@libs/entities-lib/src/household-create';
import IdentityForm from '../forms/IdentityForm.vue';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';

import { createLocalVue, shallowMount, mount } from '../../test/testSetup';
import Component from './PersonalInformationLib.vue';

const localVue = createLocalVue();

describe('PersonalInformationLib.vue', () => {
  let wrapper;

  const doMount = (shallow, {
    otherProps, otherComputed,
  }) => {
    const options = {
      localVue,
      propsData: {
        i18n,
        ...otherProps,
      },
      computed: {
        ...otherComputed,
      },
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };
  beforeEach(() => {
    doMount(true, {
      otherProps: null,
      otherComputed: null,
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
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setIndigenousIdentity')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setIndigenousIdentity(newValue);
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity).not.toHaveBeenCalled();
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
        const newValue = mockIdentitySet();
        wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIdentity = jest.fn();
        await wrapper.vm.setIdentity(newValue);
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIdentity).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setIdentity')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setIdentity(newValue);
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIdentity).not.toHaveBeenCalled();
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
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setContactInformation')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        await wrapper.vm.setContactInformation(newValue);
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation).not.toHaveBeenCalled();
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
        doMount(true, {
          otherProps: null,
          otherComputed: null,
        });

        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages().filter((g) => g.status === Status.Active));
      });

      it('returns active items and selected inactive primarySpokenLanguage', async () => {
        doMount(
          true,
          {
            otherProps: {
              includeInactiveOptions: true,
            },
            otherComputed: {
              contactInformation: () => ({
                primarySpokenLanguage: {
                  id: '14718e75-2ae0-4a2a-8647-326edee4bb32',
                },
              }),
            },
          },
        );

        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('genderItems', () => {
      it('returns active items only if no gender selected', async () => {
        doMount(true, {
          otherProps: null,
          otherComputed: null,
        });
        expect(wrapper.vm.genderItems).toEqual(mockGenders().filter((g) => g.status === Status.Active));
      });

      it('returns active items and selected inactive gender', async () => {
        doMount(true, {
          otherProps: { includeInactiveOptions: true },
          otherComputed: {
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

    describe('splitHousehold', () => {
      it('returns the proper data', async () => {
        doMount(true, {
          otherProps: null,
          otherComputed: null,
        });
        wrapper.vm.$registrationStore.splitHouseholdState = mockSplitHousehold();
        expect(wrapper.vm.splitHousehold).toEqual(mockSplitHousehold());
      });
    });

    describe('isTouched', () => {
      it('should return isTouched of personalInformaiton tab', () => {
        doMount(true, {
          otherProps: null,
          otherComputed: null,
        });
        expect(wrapper.vm.isTouched).toEqual(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Created', () => {
      it('should call action function fetchIndigenousCommunities', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$registrationStore.fetchIndigenousCommunities).toHaveBeenCalled();
      });

      it('should call function loadInitialDataFromBeneficiarySearch when props prefillPersonalInformation is true', async () => {
        doMount(true, {
          otherProps: { prefillPersonalInformation: true },
          otherComputed: { isTouched: () => false, isSplitMode: () => false },
        });
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.setProps({
          prefillPersonalInformation: true,
          isEditMode: false,
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataFromBeneficiarySearch).toHaveBeenCalled();
      });

      it('should not call function loadInitialDataFromBeneficiarySearch when props prefillPersonalInformation is false', async () => {
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.setProps({
          prefillPersonalInformation: false,
          isEditMode: false,
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataFromBeneficiarySearch).not.toHaveBeenCalled();
      });

      it('should not call function loadInitialDataFromBeneficiarySearch when props isEditMode is true', async () => {
        doMount(
          true,
          {
            otherProps: {
              prefillPersonalInformation: true,
              isEditMode: true,
            },
            otherComputed: { isSplitMode: () => true },
          },
        );
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataFromBeneficiarySearch).not.toHaveBeenCalled();
      });

      it('should call function loadInitialDataUnderSplitMode when props isSplitMode is true and prefillPersonalInformation is true', async () => {
        doMount(
          true,
          {
            otherProps: {
              prefillPersonalInformation: true,
              isEditMode: false,
            },
            otherComputed: {
              isSplitMode: () => true,
              isTouched: () => false,
            },
          },
        );
        wrapper.vm.loadInitialDataUnderSplitMode = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataUnderSplitMode).toHaveBeenCalled();
      });

      it('should not call function loadInitialDataUnderSplitMode when is touched', async () => {
        doMount(
          true,
          {
            otherProps: {
              prefillPersonalInformation: true,
            },
            otherComputed: {
              isTouched: () => true,
            },
          },
        );
        wrapper.vm.loadInitialDataUnderSplitMode = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataUnderSplitMode).not.toHaveBeenCalled();
      });

      it('should not call function loadInitialDataFromBeneficiarySearch when is touched', async () => {
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataFromBeneficiarySearch).not.toHaveBeenCalled();
      });
    });
  });
});
