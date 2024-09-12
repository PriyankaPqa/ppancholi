import { createLocalVue, shallowMount } from '@/test/testSetup';
import { isTemporaryBranch } from '@libs/shared-lib/helpers/temporary-branch';
import Component from './App.vue';
import ActivityWatcher from './ActivityWatcher.vue';

const localVue = createLocalVue();

jest.mock('@/auth/AuthenticationProvider', () => ({
  startAccessTokenAutoRenewal: jest.fn(),
}));

jest.mock('@libs/shared-lib/helpers/temporary-branch', () => ({
  isTemporaryBranch: jest.fn(),
}));

let wrapper;

const doMount = (forceOptions = {}) => {
  const options = {
    localVue,
    ...forceOptions,
  };

  wrapper = shallowMount(Component, options);
};

describe('ActivityWatcher', () => {
  const originalWindow = window.location;

  beforeEach(() => {
    delete window.location;
  });

  afterEach(() => {
    window.location = originalWindow;
  });

  describe('Template', () => {
    describe('ActivityWatcher', () => {
      it('should not be mounted if activateActivityWatcher is false', () => {
        doMount({
          computed: {
            isLoading: () => false,
            activateActivityWatcher: () => false,
          },
        });

        const component = wrapper.findComponent(ActivityWatcher);

        expect(component.exists()).toBe(false);
      });

      it('should not be mounted if activateActivityWatcher is true', () => {
        doMount({
          computed: {
            isLoading: () => false,
            activateActivityWatcher: () => true,
          },
        });

        const component = wrapper.findComponent(ActivityWatcher);

        expect(component.exists()).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    describe('activateActivityWatcher', () => {
      it('should be false for a feature branch', () => {
        isTemporaryBranch.mockReturnValue(true);
        window.location = { host: 'example.com' };
        doMount();
        expect(wrapper.vm.activateActivityWatcher).toBe(false);
      });

      it('should be false for localhost', () => {
        isTemporaryBranch.mockReturnValue(false);
        window.location = { host: 'localhost.com' };
        doMount();
        expect(wrapper.vm.activateActivityWatcher).toBe(false);
      });

      it('should be true for non-temporary branch and non-localhost', () => {
        isTemporaryBranch.mockReturnValue(false);
        window.location = { host: 'crc-tech.com' };
        doMount();
        expect(wrapper.vm.activateActivityWatcher).toBe(true);
      });
    });
  });
});
