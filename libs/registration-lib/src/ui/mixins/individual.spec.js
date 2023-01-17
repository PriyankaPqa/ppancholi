import helpers from '@libs/entities-lib/helpers';
import { mockEvent } from '@libs/entities-lib/src/registration-event/registrationEvent.mock';
import { mockStorage } from '../../store/storage';
import { createLocalVue, shallowMount } from '../../test/testSetup';

import individual from './individual';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEventData = mockEvent();

window.scrollTo = jest.fn();

const tabs = [
  {
    id: 'privacy',
    disabled: false,
    isValid: true,
    isTouched: false,
    componentName: 'PrivacyStatement',
  },
  {
    id: 'personalInfo',
    disabled: false,
    isValid: true,
    isTouched: false,
    componentName: 'PersonalInformation',
  },
  {
    id: 'addresses',
    disabled: false,
    isValid: true,
    isTouched: false,
    componentName: 'Addresses',
  },
  {
    id: 'additionalMembers',
    disabled: false,
    isValid: true,
    isTouched: false,
    componentName: 'AdditionalMembers',
  },
  {
    id: 'review',
    disabled: false,
    isValid: true,
    isTouched: false,
    componentName: 'ReviewRegistration',
  },
  {
    id: 'confirmation',
    disabled: true,
    isValid: true,
    isTouched: false,
    componentName: 'ConfirmRegistration',
  }];

storage.registration.getters.currentTab.mockImplementation(() => tabs[0]);
storage.registration.getters.tabs.mockImplementation(() => tabs);

const Component = {
  render() {},
  mixins: [individual],
};

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  const doMount = ({ errorCode } = { errorCode: null }) => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      computed: {
        submitErrors: () => ({ response: { data: { errors: [{ code: errorCode }] } } }),
      },
    });
  };

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('currentTab', () => {
      it('returns current tab from store', async () => {
        expect(wrapper.vm.currentTab).toEqual(tabs[0]);
      });
    });

    describe('currentTabIndex', () => {
      it('returns current tab index from store', async () => {
        const index = 1;

        storage.registration.getters.currentTabIndex.mockReturnValueOnce(index);

        expect(wrapper.vm.currentTabIndex).toEqual(index);
      });
    });

    describe('allTabs', () => {
      it('returns all tabs from store', async () => {
        expect(wrapper.vm.allTabs).toEqual(tabs);
      });
    });

    describe('previousTab', () => {
      it('returns title of previous tab', async () => {
        storage.registration.getters.previousTabName.mockReturnValueOnce('test');

        expect(wrapper.vm.previousTabName).toEqual('test');
      });
    });

    describe('nextTab', () => {
      it('returns title of next tab', async () => {
        storage.registration.getters.nextTabName.mockReturnValueOnce('test');

        expect(wrapper.vm.nextTabName).toEqual('test');
      });
    });

    describe('submitLoading', () => {
      it('returns proper data', () => {
        expect(wrapper.vm.submitLoading).toBe(wrapper.vm.$store.state.registration.submitLoading);
      });
    });

    describe('inlineEdit', () => {
      it('returns proper data', () => {
        expect(wrapper.vm.inlineEdit).toBe(false);
      });
    });

    describe('registrationSuccess', () => {
      it('returns true if no error', () => {
        storage.registration.getters.registrationErrors.mockReturnValueOnce(null);
        expect(wrapper.vm.registrationSuccess).toBe(true);
      });

      it('returns false if has error', () => {
        storage.registration.getters.registrationErrors.mockReturnValueOnce([{ detail: 'error' }]);
        expect(wrapper.vm.registrationSuccess).toBe(false);
      });

      it('returns false if response is undefined', () => {
        storage.registration.getters.registrationErrors.mockReturnValueOnce([]);
        storage.registration.getters.registrationResponse.mockReturnValueOnce(undefined);
        expect(wrapper.vm.registrationSuccess).toBe(false);
      });
    });

    describe('submitErrors', () => {
      it('returns errors from the store', async () => {
        expect(wrapper.vm.submitErrors).toEqual(wrapper.vm.$storage.registration.getters.registrationErrors());
      });
    });

    describe('event', () => {
      it('return the event by id from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEventData);
      });
    });

    describe('phoneAssistance', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.phoneAssistance).toEqual(mockEventData.responseDetails.assistanceNumber);
      });
    });

    describe('isDuplicateError', () => {
      it('returns false if the error is not a duplicate of a kind', async () => {
        expect(wrapper.vm.isDuplicateError).toEqual(false);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        doMount({ errorCode: 'errors.the-beneficiary-have-duplicate-first-name-last-name-birthdate' });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        doMount({ errorCode: 'errors.the-beneficiary-have-duplicate-first-name-last-name-phone-number' });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        doMount({ errorCode: 'errors.the-household-have-duplicate-first-name-last-name-birthdate' });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        doMount({ errorCode: 'errors.the-email-provided-already-exists-in-the-system' });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        doMount({ errorCode: 'errors.person-identified-as-duplicate' });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });
    });

    describe('containsErrorCode', () => {
      it('should be true if an error is coming from the BE with a code', () => {
        doMount({ errorCode: 'errors.example' });
        expect(wrapper.vm.containsErrorCode).toEqual(true);
      });
      it('should be false if an error does not have an error code', () => {
        doMount({ errorCode: '' });
        expect(wrapper.vm.containsErrorCode).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      window.scrollTo = jest.fn();
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('jump', () => {
      it('makes correct uninterrupted jump', async () => {
        storage.registration.getters.tabs.mockReturnValueOnce(tabs);
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.$storage.mutateStateTab = jest.fn();
        wrapper.vm.$storage.registration.mutations.mutateTabAtIndex = jest.fn();
        wrapper.vm.$storage.registration.getters.findEffectiveJumpIndex = jest.fn(() => 4);
        storage.registration.getters.currentTabIndex.mockReturnValueOnce(2);

        const toIndex = 4;
        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.$storage.registration.mutations.mutateTabAtIndex).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(toIndex);
      });

      it('make correct interrupted jump', async () => {
        storage.registration.getters.tabs.mockReturnValueOnce(tabs);
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.$storage.mutateStateTab = jest.fn();
        wrapper.vm.$storage.registration.getters.findEffectiveJumpIndex = jest.fn(() => 3);
        storage.registration.getters.currentTabIndex.mockReturnValueOnce(2).mockReturnValueOnce(3);

        const toIndex = 4;
        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.$storage.registration.mutations.mutateTabAtIndex).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(3);
      });

      it('call handleConfirmationScreen if it is confirmation', async () => {
        storage.registration.getters.tabs.mockReturnValueOnce(tabs);

        const toIndex = 5;
        wrapper.vm.handleConfirmationScreen = jest.fn();

        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.handleConfirmationScreen).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleConfirmationScreen', () => {
      it('call disableOtherTabs and jump', () => {
        const toIndex = 5;
        wrapper.vm.disableOtherTabs = jest.fn();

        wrapper.vm.handleConfirmationScreen(toIndex);

        expect(wrapper.vm.disableOtherTabs).toHaveBeenCalledWith(toIndex, false);
        expect(wrapper.vm.$storage.registration.getters.isCRCRegistration).toHaveBeenCalled();
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(toIndex);
      });
    });

    describe('next', () => {
      describe('Confirmation page', () => {
        it('calls closeRegistration', async () => {
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
            id: 'confirmation',
          }));
          wrapper.vm.closeRegistration = jest.fn();
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$storage.registration.getters.isCRCRegistration).toHaveBeenCalled();
          expect(wrapper.vm.closeRegistration).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.jump).toHaveBeenCalledTimes(0);
        });
      });

      describe('Review page', () => {
        it('should call submit registration with recaptchaToken', async () => {
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
            id: 'review',
          }));
          await wrapper.setData({ recaptchaToken: 'recaptchaToken' });
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledWith('recaptchaToken');
        });
        it('calls handleErrors if there are submit errors with no errors code', async () => {
          doMount({ errorCode: '' });
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
            id: 'review',
          }));

          wrapper.vm.handleErrors = jest.fn();

          await wrapper.vm.next();
          expect(wrapper.vm.handleErrors).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.handleErrors).toHaveBeenCalledWith(wrapper.vm.submitRegistration);
        });
        it('calls jump if there are submit errors with error code', async () => {
          doMount({ errorCode: 'errors.example' });
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
            id: 'review',
          }));

          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();
          expect(wrapper.vm.jump).toHaveBeenCalledTimes(1);
        });
      });

      it('calls jump otherwise', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });
    });

    describe('handleErrors', () => {
      it('calls a timer and the passed function for the amount of times equal to retryMax if there are still submit errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
          },
          mocks: {
            $storage: storage,
          },
        });
        helpers.timeout = jest.fn();
        wrapper.vm.submitRegistration = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 0, retryInterval: 2000 });
        await wrapper.vm.handleErrors(wrapper.vm.submitRegistration);

        expect(wrapper.vm.submitRegistration).toBeCalledTimes(5);
        expect(helpers.timeout).toBeCalledTimes(5);
        expect(helpers.timeout).toBeCalledWith(2000);
      });

      it('opens the errorDialog if it called submit for the maximum number of times and there are still errors - not duplication errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
            isDuplicateError: () => false,
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.showErrorDialog).toEqual(true);
      });

      it('calls jump if it called submit for the maximum number of times and there are no errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => null,
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });

      it('calls jump if it called submit for the maximum number of times and there are duplication errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
            isDuplicateError: () => true,

          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });
    });

    describe('closeRegistration', () => {
      it('redirects to case file if it is CRC registration', async () => {
        wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => true);
        wrapper.vm.$router = {
          replace: jest.fn(),
        };

        await wrapper.vm.closeRegistration();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: 'casefile.home' });
      });

      it('redirects to red cross if it is not CRC regitration', async () => {
        wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => false);
        wrapper.vm.$router = {
          replace: jest.fn(),
        };

        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
          value: {
            assign: jest.fn(),
          },
        });

        await wrapper.vm.closeRegistration();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledTimes(0);
        expect(window.location.assign).toHaveBeenCalledWith('registration.redirection_link');
      });
    });

    describe('mutateStateTab', () => {
      it('calls mutation', async () => {
        storage.registration.getters.tabs.mockReturnValueOnce(tabs);

        wrapper.vm.mutateStateTab(true);

        expect(wrapper.vm.$storage.registration.mutations.mutateCurrentTab).toHaveBeenCalledTimes(1);
      });
    });
  });
});
