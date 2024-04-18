import { createLocalVue, mount } from '@/test/testSetup';
import Component from '../components/HouseholdDetailsList.vue';

const localVue = createLocalVue();

const propsData = {
  hasPhoneNumbers: true,
  addressFirstLine: '100 Right ave',
  addressSecondLine: 'Montreal, QC H2H 2H2',
  primaryBeneficiary: {
    identitySet: {
      email: 'Jane.doe@email.com',
    },
    contactInformation: {
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
    },
  },
  onDuplicatePage: false,
};

describe('HouseholdDetailsList.spec.vue', () => {
  let wrapper;
  const doMount = async (options = {}) => {
    const params = {
      localVue,
      propsData,
      ...options,
    };
    wrapper = mount(Component, params);
  };

  describe('Template', () => {
    beforeEach(async () => {
      await doMount();
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
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.contactInformation.homePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a home phone number', () => {
        doMount({ propsData: { ...propsData, primaryBeneficiary: { contactInformation: { homePhoneNumber: null } } } });

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
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.contactInformation.mobilePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a mobile number', () => {
        doMount({ propsData: { ...propsData, primaryBeneficiary: { contactInformation: { mobilePhoneNumber: null } } } });

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
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.contactInformation.alternatePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a alternate number', () => {
        doMount({ propsData: { ...propsData, primaryBeneficiary: { contactInformation: { alternatePhoneNumber: null } } } });

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
  });
});
