import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import {
  MassActionDataCorrectionType, MassActionMode, MassActionRunType, mockMassActionEntity,
} from '@libs/entities-lib/mass-action';
import { format } from 'date-fns';
import { mockProvider } from '@/services/provider';

import Component from './DataCorrectionCreate.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('DataCorrectionCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $services: services,
        },
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should have massActionType dropdown', () => {
        expect(wrapper.findDataTest('massActionType').exists()).toBe(true);
      });

      it('should have not have events dropdown initially', () => {
        expect(wrapper.findDataTest('data-correction-events').exists()).toBe(false);
      });

      it('should have events dropdown when financial assistance chosen', async () => {
        await wrapper.setData({
          selectedType: MassActionDataCorrectionType.DataCorrectionFinancialAssistance,
        });
        expect(wrapper.findDataTest('data-correction-events').exists()).toBe(true);
      });

      it('should be linked the correct props url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/data-correction');
      });

      it('should have the proper mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.File);
      });

      it('should have the proper run type', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('runType')).toBe(MassActionRunType.PreProcess);
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
      });

      it('should have the hide name', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('hideName')).toBe(true);
      });

      it('should call onSuccess when upload is successful', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onSuccess = jest.fn();
        component.vm.$emit('upload:success');
        expect(wrapper.vm.onSuccess).toBeCalled();
      });

      it('should call onUploadStart when upload is starting', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onUploadStart = jest.fn();
        component.vm.$emit('upload:start');
        expect(wrapper.vm.onUploadStart).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    const dataCorrectionTypes = [
      null,
      MassActionDataCorrectionType.DataCorrectionHomeAddress,
      MassActionDataCorrectionType.DataCorrectionLabels,
      MassActionDataCorrectionType.DataCorrectionTemporaryAddress,
      MassActionDataCorrectionType.DataCorrectionAuthentication,
      MassActionDataCorrectionType.DataCorrectionIdentitySet,
      MassActionDataCorrectionType.DataCorrectionContactInformation,
      MassActionDataCorrectionType.DataCorrectionFinancialAssistance,
    ];

    describe('massActionTypes', () => {
      it('should return list of mass action types', () => {
        const massActionTypes = wrapper.vm.massActionTypes;
        dataCorrectionTypes.filter((t) => !!t).forEach((type) => {
          expect(massActionTypes.find((t) => t.value === type)).toBeTruthy();
        });
      });

      it('should not return AuthenticationSpecifiedOther', () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        const maType = wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.DataCorrectionAuthenticationSpecifiedOther);
        expect(maType).toBeFalsy();
      });

      it('should return DataCorrectionMovePayments when feature flag is on', () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [wrapper.vm.$featureKeys.MovePayments],
        });
        const maType = wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.DataCorrectionMovePayments);
        expect(maType).toBeTruthy();
      });

      it('should not return DataCorrectionMovePayments when feature flag is off', () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        const maType = wrapper.vm.massActionTypes.find((t) => t.value === MassActionDataCorrectionType.DataCorrectionMovePayments);
        expect(maType).toBeFalsy();
      });
    });

    describe('rules', () => {
      it('should only require events when data correction type is Financial Assistance', () => {
        dataCorrectionTypes.forEach((t) => {
          wrapper.vm.selectedType = t;
          expect(wrapper.vm.rules.event.required).toBe(t === MassActionDataCorrectionType.DataCorrectionFinancialAssistance);
        });
      });
    });

    describe('isEventRequired', () => {
      it('should be true when selected type is Financial Assistance', () => {
        wrapper.vm.selectedType = MassActionDataCorrectionType.DataCorrectionFinancialAssistance;
        expect(wrapper.vm.isEventRequired).toBe(true);
      });

      it('should be false when selected type is not Financial Assistance', () => {
        wrapper.vm.selectedType = MassActionDataCorrectionType.DataCorrectionHomeAddress;
        expect(wrapper.vm.isEventRequired).toBe(false);
      });
    });

    describe('allowedExtensions', () => {
      it('should be xlsx', () => {
        wrapper.vm.selectedType = MassActionDataCorrectionType.DataCorrectionContactInformation;
        expect(wrapper.vm.allowedExtensions).toEqual(['xlsx']);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,

      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.dataCorrection.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.dataCorrection.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onSuccess', () => {
      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalledWith(mockMassActionEntity().id);
      });
    });

    describe('generateName', () => {
      it('should generate the proper name', async () => {
        const dateNow = format(new Date(), 'yyyyMMdd HHmmss');
        await wrapper.setData({ selectedType: MassActionDataCorrectionType.DataCorrectionContactInformation });
        expect(wrapper.vm.generateName()).toEqual(`enums.MassActionDataCorrectionType.DataCorrectionContactInformation - ${dateNow}`);
      });
    });

    describe('onUploadStart', () => {
      it('should add the name to the form', async () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.generateName = jest.fn(() => 'generatedName');

        await wrapper.vm.onUploadStart();

        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('name', 'generatedName');
      });

      it('should add the mass action type to the form', async () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.formData.set = jest.fn();
        await wrapper.setData({ selectedType: MassActionDataCorrectionType.DataCorrectionContactInformation });
        await wrapper.vm.onUploadStart();
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('massActionType', MassActionDataCorrectionType.DataCorrectionContactInformation);
      });

      it('should add the event id to the form if selected', async () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.formData.set = jest.fn();
        await wrapper.setData({ selectedEventId: 'eventId' });
        await wrapper.vm.onUploadStart();
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('eventId', 'eventId');
      });

      it('should not add the event id to the form if not selected', async () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.formData.set = jest.fn();
        await wrapper.vm.onUploadStart();
        expect(wrapper.vm.formData.set).not.toBeCalledWith('eventId');
      });

      it('should call upload method of the child', async () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.generateName = jest.fn(() => 'generatedName');

        await wrapper.vm.onUploadStart();

        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });
  });
});
