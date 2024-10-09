import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockServiceOption } from '@libs/entities-lib/appointment';
import { VDataTableA11y } from '@libs/component-lib/components';
import helpers from '../appointmentProgramsHelpers';
import Component from './ServiceOptionsTable.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('ServiceOptionsTable.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, isEditMode = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        appointmentProgramId: 'appt-program-id',
        serviceOptions: [mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' }, appointmentModalities: [{ optionItemId: 'mod-id-1' }] })],
        isEditMode,
      },
      ...otherOptions,
    });
  };

  describe('Computed', () => {
    describe('customColumns', () => {
      it('returns the right value', () => {
        mountWrapper();
        expect(wrapper.vm.customColumns).toEqual({ serviceOptionType: 'serviceOptionType',
          modality: 'modality',
          status: 'status',
          edit: 'edit',
          delete: 'delete' });
      });
    });

    describe('headers', () => {
      it('returns the right value', () => {
        mountWrapper();
        expect(JSON.stringify(wrapper.vm.headers)).toEqual(JSON.stringify(
          [
            {
              text: 'appointmentProgram.serviceOption.table.type',
              filterable: false,
              value: wrapper.vm.customColumns.serviceOptionType,
              sort: () => {},
            },
            {
              text: 'appointmentProgram.serviceOption.table.modality',
              filterable: false,
              sortable: false,
              value: wrapper.vm.customColumns.modality,
            },
            {
              text: 'appointmentProgram.serviceOption.table.status',
              filterable: false,
              sortable: false,
              value: wrapper.vm.customColumns.status,
            }, {
              text: 'common.edit',
              class: 'rc-transparent-text',
              sortable: false,
              value: wrapper.vm.customColumns.edit,
              width: '5%',
            },
            {
              text: 'common.delete',
              class: 'rc-transparent-text',
              sortable: false,
              value: wrapper.vm.customColumns.delete,
              width: '5%',
            },
          ],
        ));
      });
    });

    describe('existingTypesIds', () => {
      it('returns the types ids without the id of the selected service option', async () => {
        mountWrapper();
        await wrapper.setProps({ serviceOptions: [mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' } }),
          mockServiceOption({ serviceOptionType: { optionItemId: 'id-2' } })] });
        await wrapper.setData({ selectedServiceOption: mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' } }) });
        expect(wrapper.vm.existingTypesIds).toEqual(['id-2']);
      });
    });

    describe('serviceOptionTypes', () => {
      it('calls getServiceOptionTypes', async () => {
        await mountWrapper(false);
        expect(appointmentProgramStore.getServiceOptionTypes).toHaveBeenCalledWith(['id-1']);
      });
    });

    describe('appointmentModalities', () => {
      it('calls getAppointmentModalities', async () => {
        await mountWrapper(false);
        expect(appointmentProgramStore.getAppointmentModalities).toHaveBeenCalledWith(['mod-id-1']);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call store fetchServiceOptionTypes and fetchAppointmentModalities', async () => {
        mountWrapper();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(appointmentProgramStore.fetchServiceOptionTypes).toHaveBeenCalled();
        expect(appointmentProgramStore.fetchAppointmentModalities).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('getModalitiesNames', () => {
      it('returns the modalities names from the option item list', async () => {
        appointmentProgramStore.getAppointmentModalities = jest.fn(() => [
          { id: '1', name: { translation: { en: 'name-1' } } }, { id: '2', name: { translation: { en: 'name-2' } } },
        ]);
        await mountWrapper();
        const res = await wrapper.vm.getModalitiesNames([{ optionItemId: '2' }, { optionItemId: '1' }]);
        expect(res).toEqual('name-2, name-1');
      });
    });

    describe('selectServiceOption', () => {
      it('sets selectedServiceOption and showServiceOptionDialog values', async () => {
        mountWrapper();
        const so = mockServiceOption({ id: 'id-3' });
        await wrapper.vm.selectServiceOption(so);
        expect(wrapper.vm.selectedServiceOption).toEqual(so);
        expect(wrapper.vm.showServiceOptionDialog).toBeTruthy();
      });
    });

    describe('deleteServiceOption', () => {
      describe('in edit mode', () => {
        it('calls helper method', async () => {
          helpers.canDeleteServiceOption = jest.fn(() => true);
          helpers.deleteServiceOption = jest.fn();
          await mountWrapper(true, true);
          const so1 = mockServiceOption({ id: '1' });
          const so2 = mockServiceOption({ id: '2' });
          await wrapper.setProps({ serviceOptions: [so1, so2] });
          await wrapper.vm.deleteServiceOption(so2);
          expect(helpers.deleteServiceOption).toHaveBeenCalledWith(so2.id, wrapper.vm.appointmentProgram, wrapper.vm);
        });
      });

      describe('in create mode', () => {
        it('emits the updated list of service option with the removed element', async () => {
          mountWrapper(true, false);
          const so1 = mockServiceOption({ tempId: '1' });
          const so2 = mockServiceOption({ tempId: '2' });
          await wrapper.setProps({ serviceOptions: [so1, so2] });
          await wrapper.vm.deleteServiceOption(so2);
          expect(wrapper.emitted('update:serviceOptions')[0][0]).toEqual([so1]);
        });
      });
    });

    describe('onCloseDialog', () => {
      it('sets selectedServiceOption and showServiceOptionDialog values', async () => {
        mountWrapper();
        await wrapper.vm.onCloseDialog();
        expect(wrapper.vm.selectedServiceOption).toBeNull();
        expect(wrapper.vm.showServiceOptionDialog).toBeFalsy();
      });
    });

    describe('onAdd', () => {
      it('sets serviceOptionTempId and showServiceOptionDialog values', async () => {
        mountWrapper();
        await wrapper.setData({ serviceOptionTempId: '4' });
        await wrapper.vm.onAdd();
        expect(wrapper.vm.serviceOptionTempId).toEqual('5');
        expect(wrapper.vm.showServiceOptionDialog).toBeTruthy();
      });
    });

    describe('onUpdateServiceOption', () => {
      it('updates the service options correctly if the argument passed does not exist yet and emits the new list', async () => {
        mountWrapper();
        const newSO = mockServiceOption({ tempId: 10, type: { optionItemId: 'mock-id' } });
        await wrapper.vm.onUpdateServiceOption(newSO);
        expect(wrapper.emitted('update:serviceOptions')[0][0])
          .toEqual([mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' }, appointmentModalities: [{ optionItemId: 'mod-id-1' }] }), newSO]);
      });
      it('updates the service options correctly if the serviode option passed exists already and emits the new list', async () => {
        mountWrapper();
        const existingSO = mockServiceOption({ tempId: 10, type: { optionItemId: 'mock-id' } });
        const updatedSO = mockServiceOption({ tempId: 10, type: { optionItemId: 'mock-id-new' } });
        await wrapper.setProps({ serviceOptions: [existingSO, mockServiceOption()] });
        await wrapper.vm.onUpdateServiceOption(updatedSO);
        expect(wrapper.emitted('update:serviceOptions')[0][0]).toEqual([updatedSO, mockServiceOption()]);
      });
    });
  });

  describe('Template', () => {
    describe('data table', () => {
      it('renders', async () => {
        await mountWrapper(false);
        const dataTable = wrapper.findComponent(VDataTableA11y);
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', async () => {
        await mountWrapper(false);
        const headers = wrapper.findAll('th');

        expect(headers.wrappers[0].find('span').text()).toBe('appointmentProgram.serviceOption.table.type');
        expect(headers.wrappers[1].find('span').text()).toBe('appointmentProgram.serviceOption.table.modality');
        expect(headers.wrappers[2].find('span').text()).toBe('appointmentProgram.serviceOption.table.status');
        expect(headers.wrappers[3].find('span').text()).toBe('common.edit');
        expect(headers.wrappers[4].find('span').text()).toBe('common.delete');
      });
    });
  });
});
