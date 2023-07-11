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
import { useMockRegistrationStore } from '@libs/stores-lib/src/registration/registration.mock';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import IdentityForm from '../forms/IdentityForm.vue';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';

import { createLocalVue, shallowMount, mount } from '../../test/testSetup';
import Component from './PersonalInformationLib.vue';

const localVue = createLocalVue();
const { pinia } = useMockRegistrationStore();

describe('PersonalInformationLib.vue', () => {
  let wrapper;

  const doMount = (shallow = true, {
    otherProps = {}, otherComputed = null,
  } = {}) => {
    const options = {
      localVue,
      pinia,
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
    jest.clearAllMocks();
    doMount();
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
        const newValue = {
          alternatePhoneNumber: {
            countryCode: 'CA',
            e164Number: '',
            extension: '',
            number: '',
          },
          emailValidatedByBackend: true,
          homePhoneNumber: {
            countryCode: 'CA',
            e164Number: '',
            extension: '',
            number: '',
          },
          preferredLanguage: null,
          preferredLanguageOther: null,
          primarySpokenLanguage: null,
          primarySpokenLanguageOther: null,
        };
        wrapper.vm.setContactInformation(newValue);
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation).toHaveBeenCalledWith(newValue);
        expect(wrapper.emitted('setContactInformation')[0][0]).toEqual(newValue);
        jest.clearAllMocks();
        await wrapper.setProps({ memberProps: mockMember() });
        wrapper.vm.setContactInformation(newValue);
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
          otherProps: {
            memberProps: mockMember(),
          },
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
              memberProps: mockMember(),
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
          otherProps: {
            memberProps: mockMember(),
          },
          otherComputed: null,
        });
        expect(wrapper.vm.genderItems).toEqual(mockGenders().filter((g) => g.status === Status.Active));
      });

      it('returns active items and selected inactive gender', async () => {
        doMount(true, {
          otherProps: {
            includeInactiveOptions: true,
            memberProps: mockMember(),
          },
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
          otherProps: {
            memberProps: mockMember(),
          },
          otherComputed: null,
        });
        wrapper.vm.$registrationStore.splitHouseholdState = mockSplitHousehold();
        expect(wrapper.vm.splitHousehold).toEqual(mockSplitHousehold());
      });
    });

    describe('isTouched', () => {
      it('should return isTouched of personalInformaiton tab', () => {
        doMount(true, {
          otherProps: {
            memberProps: mockMember(),
          },
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

      it('should call function loadInitialDataFromBeneficiarySearch', async () => {
        doMount(true, {
          otherProps: {
            memberProps: mockMember(),
          },
          otherComputed: { isTouched: () => false, isSplitMode: () => false, shouldLoadDataFromBeneficiarySearch: () => true },
        });
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.setProps({
          isEditMode: false,
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadInitialDataFromBeneficiarySearch).toHaveBeenCalled();
      });

      it('should not call function loadInitialDataFromBeneficiarySearch in PrimaryMemberDialog', async () => {
        doMount(true, {
          otherProps: {
            isInPrimaryMemberDialog: true,
          },
          otherComputed: { isTouched: () => false, isSplitMode: () => false },
        });
        wrapper.vm.loadInitialDataFromBeneficiarySearch = jest.fn();
        await wrapper.setProps({
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
              isEditMode: true,
              memberProps: mockMember(),
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

      it('should call function loadInitialDataUnderSplitMode when props isSplitMode is true', async () => {
        doMount(
          true,
          {
            otherProps: {
              isEditMode: false,
              memberProps: mockMember(),
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
            otherProps: null,
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

  describe('Methods', () => {
    describe('setIdentity', () => {
      it('calls emit with setIdentity ', async () => {
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('setIdentity', mockIdentitySet());
      });

      it('calls setIdentitySet on the primary member ', async () => {
        jest.spyOn(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet, 'setIdentity');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('calls checkDuplicates if the feature flag is on and it is not split mode', async () => {
        doMount(
          true,
          {
            otherProps: null,
            otherComputed: {
              isSplitMode: () => false,
            },
          },
        );
        wrapper.vm.checkDuplicates = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.checkDuplicates).toHaveBeenCalledWith(mockIdentitySet());
      });
    });

    describe('checkDuplicates', () => {
      it('calls store method checkDuplicates with the right params and sets the form in identitySet of the member', async () => {
        wrapper.setData({ member: { ...mockMember(), identitySet: { ...mockIdentitySet(), setIdentity: jest.fn() } } });
        wrapper.setProps({ preventDbDuplicateCheck: true });
        wrapper.vm.$registrationStore.checkDuplicates = jest.fn();
        await wrapper.vm.checkDuplicates(mockIdentitySet());
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));
        expect(wrapper.vm.$registrationStore.checkDuplicates).toHaveBeenCalledWith({ form: mockIdentitySet(), isPrimaryMember: true, preventDbCheck: true, memberId: undefined });
        expect(wrapper.vm.member.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });
    });
  });
});
