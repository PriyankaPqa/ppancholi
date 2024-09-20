import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '../appointmentProgramsHelpers';

import Component from './ServiceOptionDetails.vue';

jest.mock('../appointmentProgramsHelper');
const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('ServiceOptionDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, otherOptions = {}) => {
    jest.clearAllMocks();
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        appointmentProgramId: 'appt-program-id',
        serviceOptionId: 'so-id',
      },
      ...otherOptions,
    });
  };

  describe('Computed', () => {
    describe('serviceOptionTypeName', () => {
      it('returns the right type name', () => {
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [mockOptionItem({ id: 'oi-1', name: { translation: { en: 'name-oi-1' } } })]);
        mountWrapper(true, { computed: { serviceOption() {
          return mockServiceOption({ serviceOptionType: { optionItemId: 'oi-1' } });
        } } });
        expect(wrapper.vm.serviceOptionTypeName).toEqual({ translation: { en: 'name-oi-1' } });
      });
    });

    describe('appointmentModalities', () => {
      it('returns the  modalities of the service option as option items', () => {
        const modality = mockOptionItem({ id: 'oi-1', name: { translation: { en: 'name-oi-1' } } });
        appointmentProgramStore.getAppointmentModalities = jest.fn(() => [modality]);
        mountWrapper(true, { computed: { serviceOption() {
          return mockServiceOption({ appointmentModalities: [{ optionItemId: modality.id }] });
        } } });
        expect(wrapper.vm.appointmentModalities).toEqual([modality]);
      });
    });

    describe('serviceOption', () => {
      it('returns the service options of the appt program', async () => {
        const so = mockServiceOption({ id: 'so-id' });
        appointmentProgramStore.fetch = jest.fn(() => mockAppointmentProgram({ serviceOptions: [so] }));
        await mountWrapper();
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram({ serviceOptions: [so] }) });
        expect(wrapper.vm.serviceOption).toEqual(so);
      });
    });

    describe('existingTypesIds', () => {
      it('returns the types ids without the id of the current service option type', async () => {
        const so1 = mockServiceOption({ id: 'so-id', serviceOptionType: { optionItemId: 'oi-1' } });
        const so2 = mockServiceOption({ serviceOptionType: { optionItemId: 'oi-2' } });
        const so3 = mockServiceOption({ serviceOptionType: { optionItemId: 'oi-3' } });
        appointmentProgramStore.fetch = jest.fn(() => mockAppointmentProgram({ serviceOptions: [so1, so2, so3] }));
        await mountWrapper(true, { computed: { serviceOption() {
          return mockServiceOption({ serviceOptionType: { optionItemId: 'oi-1' } });
        } } });
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram({ serviceOptions: [so1, so2, so3] }) });
        expect(wrapper.vm.existingTypesIds).toEqual(['oi-2', 'oi-3']);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call store fetchServiceOptionTypes and fetchAppointmentModalitiesand fetch by id', async () => {
        mountWrapper();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await wrapper.vm.$nextTick();
        expect(appointmentProgramStore.fetchServiceOptionTypes).toHaveBeenCalled();
        expect(appointmentProgramStore.fetchAppointmentModalities).toHaveBeenCalled();
        expect(appointmentProgramStore.fetch).toHaveBeenCalledWith(wrapper.vm.appointmentProgramId);
      });
    });
  });

  describe('Methods', () => {
    describe('navigateBack', () => {
      it('calls router back', async () => {
        await mountWrapper(false);
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.navigateBack();
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });
    });

    describe('deleteServiceOption', () => {
      it('calls helper method and router back if ', async () => {
        const so2 = mockServiceOption({ id: '2' });
        await mountWrapper(true, { computed: { serviceOption() {
          return so2;
        } } });
        helpers.canDeleteServiceOption = jest.fn(() => true);
        helpers.deleteServiceOption = jest.fn(() => true);
        await wrapper.vm.deleteServiceOption();
        expect(helpers.deleteServiceOption).toHaveBeenCalledWith(so2.id, wrapper.vm.appointmentProgram, wrapper.vm);
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });
    });
  });

  describe('template', () => {
    describe('type name', () => {
      it('contains the name of the service option type', async () => {
        await mountWrapper(true, { computed: { serviceOptionTypeName() {
          return { translation: { en: 'type-name' } };
        },
        serviceOption() {
          return mockServiceOption();
        } } });
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('serviceOption_details_type');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('type-name');
      });
    });

    describe('status', () => {
      it('renders', async () => {
        await mountWrapper(true, { computed: { serviceOption() {
          return mockServiceOption();
        } } });
        await wrapper.setData({ loading: false });
        const statusChip = wrapper.findComponent(StatusChip);
        expect(statusChip.exists()).toBeTruthy();
        expect(statusChip.attributes('status')).toEqual('1');
      });
    });

    describe('modalities', () => {
      it('displayes all modalities names', async () => {
        await mountWrapper(true, { computed: { appointmentModalities() {
          return [
            mockOptionItem({ id: 'mod-1', name: { translation: { en: 'mod-1-name' } } }),
            mockOptionItem({ id: 'mod-2', name: { translation: { en: 'mod-2-name' } } }),
          ];
        },
        serviceOption() {
          return mockServiceOption();
        } } });
        await wrapper.setData({ loading: false });

        const element = wrapper.findDataTest('serviceOption_modalities_name_mod-1');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('mod-1-name');
        const element2 = wrapper.findDataTest('serviceOption_modalities_name_mod-2');
        expect(element2.exists()).toBeTruthy();
        expect(element2.text()).toContain('mod-2-name');
      });

      it('displays which modalities are online', async () => {
        await mountWrapper(true, { computed: { appointmentModalities() {
          return [
            mockOptionItem({ id: 'mod-1', name: { translation: { en: 'mod-1-name' } }, isOnline: false }),
            mockOptionItem({ id: 'mod-2', name: { translation: { en: 'mod-2-name' } }, isOnline: true }),
          ];
        },
        serviceOption() {
          return mockServiceOption();
        } } });
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('serviceOption_modalities_isOnline_mod-1');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).not.toContain('appointmentProgram.serviceOption.details.isOnline');
        const element2 = wrapper.findDataTest('serviceOption_modalities_isOnline_mod-2');
        expect(element2.exists()).toBeTruthy();
        expect(element2.text()).toContain('appointmentProgram.serviceOption.details.isOnline');
      });
    });
  });
});
