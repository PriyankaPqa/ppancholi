import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockBrandingEntity, mockEditColoursRequest } from '@libs/entities-lib/tenantSettings';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../Colours.vue';

const localVue = createLocalVue();

let wrapper;

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      disableEditBtn: false,
    },
    mocks: {

    },
  });
});

describe('Colours.vue', () => {
  describe('>> Template', () => {
    it('save colours button is only visible in edit mode', async () => {
      await wrapper.setData({
        isEditing: false,
      });

      expect(wrapper.findDataTest('cancel').exists()).toBeFalsy();
      expect(wrapper.findDataTest('save').exists()).toBeFalsy();

      await wrapper.setData({
        isEditing: true,
      });

      expect(wrapper.findDataTest('cancel').exists()).toBeTruthy();
      expect(wrapper.findDataTest('save').exists()).toBeTruthy();
    });
  });

  describe('>> Computed', () => {
    describe('isDirty', () => {
      it('compares the colours with store', async () => {
        const { colours } = mockEditColoursRequest();

        await wrapper.setData({
          colours: [
            { value: colours.primary },
            { value: colours.primaryLight },
            { value: colours.primaryDark },
            { value: colours.secondary },
          ],
        });

        expect(wrapper.vm.isDirty).toBeFalsy();

        await wrapper.setData({
          colours: [
            { value: colours.primary },
            { value: colours.primaryLight },
            { value: colours.primaryDark },
            { value: '000000' },
          ],
        });

        expect(wrapper.vm.isDirty).toBeTruthy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls the resetColours', () => {
        wrapper.vm.resetColours = jest.fn();

        expect(wrapper.vm.resetColours).toHaveBeenCalledTimes(0);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.resetColours).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('>> Methods', () => {
    describe('toggleEditMode', () => {
      it('sets data', async () => {
        wrapper.vm.toggleEditMode(true);

        expect(wrapper.vm.isEditing).toBe(true);
      });

      it('emits event', async () => {
        wrapper.vm.toggleEditMode(true);

        expect(wrapper.emitted('update:is-editing-colours')[0][0]).toEqual(true);
      });

      it('calls resetColours if is not editing', async () => {
        wrapper.vm.resetColours = jest.fn();
        expect(wrapper.vm.resetColours).toHaveBeenCalledTimes(0);

        wrapper.vm.toggleEditMode(false);

        expect(wrapper.vm.resetColours).toHaveBeenCalledTimes(1);
      });
    });

    describe('resetColours', () => {
      it('sets values properly', async () => {
        const { colours } = mockBrandingEntity();

        wrapper.vm.resetColours();

        expect(wrapper.vm.colours[0].value).toBe(colours.primary);
        expect(wrapper.vm.colours[1].value).toBe(colours.primaryLight);
        expect(wrapper.vm.colours[2].value).toBe(colours.primaryDark);
        expect(wrapper.vm.colours[3].value).toBe(colours.secondary);
      });
    });

    describe('saveEdit', () => {
      it('calls the store to save colours', async () => {
        await wrapper.setData({
          colours: [
            {
              value: 'primary',
            },
            {
              value: 'primaryLight',
            },
            {
              value: 'primaryDark',
            },
            {
              value: 'secondary',
            },
          ],
        });

        await wrapper.vm.saveEdit();

        expect(tenantSettingsStore.updateColours).toHaveBeenCalledWith({
          colours: {
            primary: 'primary',
            primaryLight: 'primaryLight',
            primaryDark: 'primaryDark',
            secondary: 'secondary',
          },
        });
      });
    });
  });
});
