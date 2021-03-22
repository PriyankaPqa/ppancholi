import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { PersonalInformation } from '@/entities/beneficiary';
import { mockStorage } from '@/store/storage';
import Component from '../Individual.vue';

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
      test('returns current tab from store', async () => {
        const tab = { id: 'personalInformation' };

        storage.registration.getters.currentTab.mockReturnValueOnce(tab);

        expect(wrapper.vm.currentTab).toEqual(tab);
      });
    });
    describe('currentTabIndex', () => {
      test('returns current tab index from store', async () => {
        const index = 1;

        storage.registration.getters.currentTabIndex.mockReturnValueOnce(index);

        expect(wrapper.vm.currentTabIndex).toEqual(index);
      });
    });
    describe('allTabs', () => {
      test('returns all tabs from store', async () => {
        const tabs = [{ id: 'personalInformation' }];

        storage.registration.getters.tabs.mockReturnValueOnce(tabs);

        expect(wrapper.vm.allTabs).toEqual(tabs);
      });
    });
    describe('previousTab', () => {
      test('returns title of previous tab', async () => {
        storage.registration.getters.previousTabName.mockReturnValueOnce('test');

        expect(wrapper.vm.previousTabName).toEqual('test');
      });
    });
    describe('nextTab', () => {
      test('returns title of next tab', async () => {
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
    beforeEach(() => {
      storage.registration.getters.currentTabIndex.mockReturnValueOnce(2);
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('jump', () => {
      test('jump calls mutateStateTab', async () => {
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.mutateStateTab = jest.fn();

        const toIndex = 1;
        await wrapper.vm.jump(toIndex);

        expect(wrapper.vm.mutateStateTab).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.registration.mutations.jump).toHaveBeenCalledWith(toIndex);
      });
    });
    describe('back', () => {
      test('back calls jump', async () => {
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(1);
      });
    });
    describe('next', () => {
      test('next calls jump', async () => {
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });
    });
    describe('updateEntity', () => {
      test('updateEntity sets entity value', async () => {
        const propertyName = 'personalInformation';
        const value = new PersonalInformation();

        wrapper.vm.updateEntity(propertyName, value);

        expect(wrapper.vm.beneficiary[propertyName]).toEqual(value);
      });
    });
    describe('mutateStateTab', () => {
      test('mutateStateTab calls mutation', async () => {
        wrapper.vm.mutateStateTab(true);

        expect(wrapper.vm.$storage.registration.mutations.mutateCurrentTab).toHaveBeenCalledTimes(1);
      });
    });
  });
});
