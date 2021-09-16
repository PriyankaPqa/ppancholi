import { mockEvent } from '@crctech/registration-lib/src/entities/event/event.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { mockMassActionEntity } from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistanceCreateFile.vue';
import { mockFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { mockOptionItem, mockOptionSubItem } from '@/entities/optionItem';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked the correct props url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('url')).toBe('case-file/mass-actions/financial-assistance');
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
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

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.financialAssistance.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.financialAssistance.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onSuccess', () => {
      it('should add the new mass action to the store', () => {
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.$storage.massAction.mutations.setEntity).toHaveBeenLastCalledWith(mockMassActionEntity());
      });

      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalled();
      });
    });

    describe('onUpdate', () => {
      it('should update the form', () => {
        const formCopy = {
          event: mockEvent(),
          table: mockFinancialAssistanceTableEntity(),
          item: mockOptionItem(),
          subItem: mockOptionSubItem(),
          amount: 25,
          paymentModality: 1,
        };

        wrapper.vm.onUpdate(formCopy);

        expect(wrapper.vm.form).toEqual(formCopy);
      });
    });

    describe('onUploadStart', () => {
      it('should add the payment details to the form data', () => {
        wrapper.vm.formData.append = jest.fn();

        const formCopy = {
          event: mockEvent(),
          table: mockFinancialAssistanceTableEntity(),
          item: mockOptionItem(),
          subItem: mockOptionSubItem(),
          amount: 25,
          paymentModality: 1,
        };

        wrapper.vm.onUpdate(formCopy);

        wrapper.vm.onUploadStart();

        wrapper.vm.formData.set('eventId', wrapper.vm.form.event.id);
        wrapper.vm.formData.set('tableId', wrapper.vm.form.table.id);
        wrapper.vm.formData.set('programId', wrapper.vm.form.table.programId);
        wrapper.vm.formData.set('itemId', wrapper.vm.form.item.id);
        wrapper.vm.formData.set('subItemId', wrapper.vm.form.subItem.id);
        wrapper.vm.formData.set('paymentModality', wrapper.vm.form.paymentModality.toString());
        wrapper.vm.formData.set('amount', wrapper.vm.form.amount.toString());
      });
    });
  });
});
