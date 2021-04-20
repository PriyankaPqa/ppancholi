import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from './Individual.vue';

const localVue = createLocalVue();
const storage = mockStorage();

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
        const tab = { id: 'personalInformation' };

        storage.registration.getters.currentTab.mockReturnValueOnce(tab);

        expect(wrapper.vm.currentTab).toEqual(tab);
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
        const tabs = [{ id: 'personalInformation' }];

        storage.registration.getters.tabs.mockReturnValueOnce(tabs);

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
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        stubs: ['i18n'],
      });
    });

    describe('Event handlers', () => {
      test('Click back button triggers method', async () => {
        wrapper.vm.back = jest.fn();

        const btn = wrapper.findDataTest('backButton');
        await btn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });

      test('Click next button triggers method', async () => {
        wrapper.vm.next = jest.fn();

        const btn = wrapper.findDataTest('nextButton');
        await btn.trigger('click');

        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
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
        id: 'householdMembers',
        disabled: false,
        isValid: true,
        isTouched: false,
        componentName: 'HouseholdMembers',
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

        const toIndex = 5;
        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.$storage.registration.mutations.mutateTabAtIndex).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(3);
      });
    });

    describe('back', () => {
      test('back calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(1);
      });
    });

    describe('next', () => {
      it('calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
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
