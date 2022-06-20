import { mockStorage } from '../../store/storage';
import { createLocalVue, shallowMount } from '../../test/testSetup';

import individual from './individual';

const localVue = createLocalVue();
const storage = mockStorage();

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
        storage.registration.getters.registrationErrors.mockReturnValueOnce([]);
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
  });

  describe('Methods', () => {
    beforeEach(() => {
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

        expect(wrapper.vm.disableOtherTabs).toHaveBeenCalledWith(toIndex);
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(toIndex);
      });
    });

    describe('next', () => {
      it('calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });

      it('calls closeRegistration if it is confirmation', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
          id: 'confirmation',
        }));
        wrapper.vm.closeRegistration = jest.fn();
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.closeRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.jump).toHaveBeenCalledTimes(0);
      });

      it('should call submit registration with recaptchaToken if current tab is review', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
          id: 'review',
        }));
        await wrapper.setData({ recaptchaToken: 'recaptchaToken' });
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledWith('recaptchaToken');
      });
    });

    describe('closeRegistration', () => {
      it('redirects to case file if it is CRC regitration', async () => {
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
