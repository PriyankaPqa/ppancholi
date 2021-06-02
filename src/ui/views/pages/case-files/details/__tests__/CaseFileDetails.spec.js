import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData } from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';

import Component from '../CaseFileDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);

describe('CaseFileDetails.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.id,
        },
        computed: {
          caseFile() {
            return mockCaseFile;
          },
          beneficiaryFullName() {
            return 'mock-full-name';
          },
          hasPhoneNumbers() {
            return true;
          },
          addressFirstLine() {
            return '100 Right ave';
          },
          addressSecondLine() {
            return 'Montreal, QC H2H 2H2';
          },
          contactInfo() {
            return {
              email: 'Jane.doe@email.com',
              mobilePhoneNumber: {
                number: '(514) 123 4444',
                extension: '',
              },
              homePhoneNumber: {
                number: '(514) 123 2222',
                extension: '123',
              },
              alternatePhoneNumber: {
                number: '(514) 123 1111',
                extension: '',
              },
            };
          },
        },
      });
    });

    describe('page template left menu title', () => {
      it('displays the beneficiary name', () => {
        const pageTemplate = wrapper.findComponent(PageTemplate);
        expect(pageTemplate.props('leftMenuTitle')).toEqual('mock-full-name');
      });
    });

    describe('caseFileNumber', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-caseFileNumber');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(mockCaseFile.caseFileNumber);
      });
    });

    describe('event', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-event');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(mockCaseFile.event.name.translation.en);
      });
    });

    describe('verify-identity', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-verify-identity-icon');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('verify-impact', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-verify-impact-icon');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('email', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-email');
      });
      it('is rendered if the beneficiary has an email', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(wrapper.vm.contactInfo.email);
      });

      it('is NOT rendered if the beneficiary does not have an email', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            contactInfo() {
              return { email: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-email');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('home phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-home-phone-number');
      });
      it('is rendered if the beneficiary has a home phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.contactInfo.homePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a home phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            contactInfo() {
              return { homePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-home-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('mobile phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-mobile-phone-number');
      });
      it('is rendered if the beneficiary has a mobile phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.contactInfo.mobilePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a mobile number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            contactInfo() {
              return { mobilePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-mobile-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('alternate phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-alternate-phone-number');
      });
      it('is rendered if the beneficiary has an alternate phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.contactInfo.alternatePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a alternate number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            contactInfo() {
              return { alternatePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-alternate-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('home address', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-home-address');
      });
      it('is rendered if the beneficiary has an address', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toContain(wrapper.vm.addressFirstLine);
        expect(element.text()).toContain(wrapper.vm.addressSecondLine);
      });
    });

    describe('household member count', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-household-member-count');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('beneficiary profile button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('household-profile-btn');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls goToHouseholdProfile when clicked', async () => {
        jest.spyOn(wrapper.vm, 'goToHouseholdProfile').mockImplementation(() => {});

        await element.vm.$emit('click');
        expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.caseFile.getters.caseFileById.mockReturnValueOnce(mockCaseFile);
    });

    describe('addressFirstLine', () => {
      it('return the right address information when there is a suite number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.address.address.unitSuite = '100';
              altCaseFile.household.address.address.streetAddress = '200 Left ave';
              return altCaseFile;
            },
          },
        });
        expect(wrapper.vm.addressFirstLine).toEqual('100-200 Left ave');
      });

      it('return the right address information when there is no suite number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.address.address.unitSuite = '';
              altCaseFile.household.address.address.streetAddress = '200 Main ave';
              return altCaseFile;
            },
          },
        });
        expect(wrapper.vm.addressFirstLine).toEqual('200 Main ave');
      });
    });

    describe('addressSecondLine', () => {
      it('return the right address information', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.address.address.postalCode = 'H2H 2H2';
              altCaseFile.household.address.address.city = 'Montreal';
              altCaseFile.household.address.address.provinceCode.translation.en = 'QC';
              return altCaseFile;
            },
          },
        });
        expect(wrapper.vm.addressSecondLine).toEqual('Montreal, QC H2H 2H2');
      });
    });

    describe('caseFile', () => {
      it('return the case file by id from the storage', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.caseFile).toEqual(mockCaseFile);
      });
    });

    describe('beneficiaryFullName', () => {
      it('return the beneficiary first and last name', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
          },
        });
        expect(wrapper.vm.beneficiaryFullName).toEqual(
          `${wrapper.vm.caseFile.household.primaryBeneficiary.identitySet.firstName}`
          + ` ${wrapper.vm.caseFile.household.primaryBeneficiary.identitySet.middleName}`
          + ` ${wrapper.vm.caseFile.household.primaryBeneficiary.identitySet.lastName}`,
        );
      });
    });

    describe('contactInfo', () => {
      it('returns the contact information of the beneficiary', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
          },
        });
        expect(wrapper.vm.contactInfo).toEqual(wrapper.vm.caseFile.household.primaryBeneficiary.contactInformation);
      });
    });

    describe('hasPhoneNumbers', () => {
      it('return true if the beneficiary has a home phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.primaryBeneficiary.contactInformation.homePhoneNumber = {
                number: '514-555-5555',
                extension: '',
              };
              altCaseFile.household.primaryBeneficiary.contactInformation.mobilePhoneNumber = null;
              altCaseFile.household.primaryBeneficiary.contactInformation.alternatePhoneNumber = null;
              return altCaseFile;
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return true if the beneficiary has a mobile phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.primaryBeneficiary.contactInformation.mobilePhoneNumber = {
                number: '514-555-5555',
                extension: '',
              };
              altCaseFile.household.primaryBeneficiary.contactInformation.homePhoneNumber = null;
              altCaseFile.household.primaryBeneficiary.contactInformation.alternatePhoneNumber = null;
              return altCaseFile;
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return true if the beneficiary has an alternate phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.primaryBeneficiary.contactInformation.alternatePhoneNumber = {
                number: '514-555-5555',
                extension: '',
              };
              altCaseFile.household.primaryBeneficiary.contactInformation.homePhoneNumber = null;
              altCaseFile.household.primaryBeneficiary.contactInformation.mobilePhoneNumber = null;
              return altCaseFile;
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return false if the beneficiary has no phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          computed: {
            caseFile() {
              const altCaseFile = _cloneDeep(mockCaseFile);
              altCaseFile.household.primaryBeneficiary.contactInformation.alternatePhoneNumber = null;
              altCaseFile.household.primaryBeneficiary.contactInformation.homePhoneNumber = null;
              altCaseFile.household.primaryBeneficiary.contactInformation.mobilePhoneNumber = null;
              return altCaseFile;
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeFalsy();
      });
    });

    describe('tabs', () => {
      it('returns the right array', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.tabs).toEqual(
          [{
            text: 'caseFileDetail.menu_activity',
            test: 'case-file-activity',
            icon: '',
            to: routes.caseFile.activity.name,
          }, {
            text: 'caseFileDetail.menu_case_note',
            test: 'case-note',
            to: 'casefile.note',
          }, {
            text: 'caseFileDetail.menu_documents',
            test: 'attached-documents',
            disabled: true,
          }, {
            text: 'caseFileDetail.menu_financial_assistance',
            test: 'financial-assistance',
            disabled: true,
          }, {
            text: 'caseFileDetail.menu_assessments',
            test: 'assessments',
            disabled: true,
          }, {
            text: 'caseFileDetail.menu_referrals',
            test: 'referrals',
            disabled: true,
          }, {
            text: 'caseFileDetail.menu_recoveryPlan',
            test: 'recovery-plan',
            disabled: true,
          }],
        );
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetchCaseFile = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.id,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    it('should call fetchCaseFile', () => {
      expect(wrapper.vm.$storage.caseFile.actions.fetchCaseFile).toHaveBeenCalledWith(wrapper.vm.id);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetchCaseFile = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.id,
        },
        computed: {
          caseFile() {
            return mockCaseFile;
          },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to the household profile page', async () => {
        wrapper.vm.goToHouseholdProfile();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.householdProfile.name,
          params: {
            householdId: wrapper.vm.caseFile.household.id,
          },
        });
      });
    });
  });
});
