import { mockEvent } from '@libs/entities-lib/registration-event/registrationEvent.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockStorage } from '@/storage';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockOptionItem, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import Component from './FinancialAssistanceCreate.vue';

const localVue = createLocalVue();

// eslint-disable-next-line max-len
const filtersString = '{"search":"Metadata/PrimaryBeneficiary/ContactInformation/Email: /.*tammy.*/","skip":0,"top":10,"orderBy":"","filter":{"and":{"Entity/EventId":"60983874-18bb-467d-b55a-94dc55818151"}}}';

const storage = mockStorage();

describe('FinancialAssistanceCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $route: {
            query: {
              azureSearchParams: filtersString,
              mode: MassActionMode.List,
            },
          },
        },
        stubs: {
          FinancialAssistancePaymentDetailsCreate: true,
        },
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked to the correct props upload-url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/financial-assistance');
      });

      it('should be linked to the correct props mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.List);
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

      it('should call onPost when creating from a list', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onPost = jest.fn();
        component.vm.$emit('post');
        expect(wrapper.vm.onPost).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
          $route: {
            query: {
              azureSearchParams: filtersString,
              mode: MassActionMode.List,
            },
          },
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
      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalledWith(mockMassActionEntity().id);
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
        wrapper.vm.$refs.base.upload = jest.fn();

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

      it('should call upload method of the child', () => {
        const formCopy = {
          event: mockEvent(),
          table: mockFinancialAssistanceTableEntity(),
          item: mockOptionItem(),
          subItem: mockOptionSubItem(),
          amount: 25,
          paymentModality: 1,
        };

        wrapper.vm.onUpdate(formCopy);

        wrapper.vm.$refs.base.upload = jest.fn();

        wrapper.vm.onUploadStart();

        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });

    describe('onPost', () => {
      it('should call create action with proper parameters', async () => {
        wrapper.vm.formData.append = jest.fn();

        const name = 'Mass action';
        const description = '';

        const azureSearchParams = JSON.parse(filtersString);

        await wrapper.setData({
          form: {
            event: mockEvent(),
            table: mockFinancialAssistanceTableEntity(),
            item: mockOptionItem(),
            subItem: mockOptionSubItem(),
            amount: 25,
            paymentModality: 1,
          },
        });

        const payload = {
          name,
          description,
          eventId: wrapper.vm.form.event.id,
          tableId: wrapper.vm.form.table.id,
          programId: wrapper.vm.form.table.programId,
          mainCategoryId: wrapper.vm.form.item.id,
          subCategoryId: wrapper.vm.form.subItem.id,
          paymentModality: wrapper.vm.form.paymentModality,
          amount: wrapper.vm.form.amount,
          search: azureSearchParams.search,
          filter: "Entity/EventId eq '60983874-18bb-467d-b55a-94dc55818151' and Entity/Status eq 1",
        };

        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.$storage.massAction.actions.create).toHaveBeenCalledWith(MassActionType.FinancialAssistance, payload);
      });

      it('should call onSuccess method with proper parameters', async () => {
        const name = 'Mass action';
        const description = '';
        await wrapper.setData({
          form: {
            event: mockEvent(),
            table: mockFinancialAssistanceTableEntity(),
            item: mockOptionItem(),
            subItem: mockOptionSubItem(),
            amount: 25,
            paymentModality: 1,
          },
        });
        wrapper.vm.onSuccess = jest.fn();

        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.onSuccess).toHaveBeenLastCalledWith(mockMassActionEntity());
      });
    });
  });
});
