import { mockEventSummary } from '@libs/entities-lib/event/event.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockOptionItem, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import { format } from 'date-fns';

import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import Component from './FinancialAssistanceCreate.vue';

const localVue = createLocalVue();
jest.mock('date-fns', () => ({ format: jest.fn() }));

// eslint-disable-next-line max-len,vue/max-len
const filtersString = '{"search":"Metadata/PrimaryBeneficiary/ContactInformation/Email: /.*tammy.*/","skip":0,"top":10,"orderBy":"","filter":{"Entity/EventId":"60983874-18bb-467d-b55a-94dc55818151"}}';

const { pinia, massActionStore } = useMockMassActionStore();

describe('FinancialAssistanceCreate.vue', () => {
  let wrapper;

  const doMount = (shallow, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      mocks: {
        $route: {
          query: {
            searchParams: filtersString,
            mode: MassActionMode.List,
          },
        },
      },
      ...otherOptions,
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, option);
    } else {
      wrapper = mount(Component, option);
    }
  };

  describe('Template', () => {
    beforeEach(() => {
      doMount(false, {
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
      doMount(true);
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
          event: mockEventSummary(),
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
          event: mockEventSummary(),
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
          event: mockEventSummary(),
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
      it('should call create action with proper parameters and generate name', async () => {
        doMount(true);
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.makeFormName = jest.fn(() => 'form-name');
        massActionStore.create = jest.fn();

        const name = 'Mass action';
        const description = '';

        await wrapper.setData({
          form: {
            event: mockEventSummary(),
            table: mockFinancialAssistanceTableEntity(),
            item: mockOptionItem(),
            subItem: mockOptionSubItem(),
            amount: 25,
            paymentModality: 1,
          },
        });

        const payload = {
          name: 'form-name',
          description,
          eventId: wrapper.vm.form.event.id,
          tableId: wrapper.vm.form.table.id,
          programId: wrapper.vm.form.table.programId,
          mainCategoryId: wrapper.vm.form.item.id,
          subCategoryId: wrapper.vm.form.subItem.id,
          paymentModality: wrapper.vm.form.paymentModality,
          amount: wrapper.vm.form.amount,
          search: null,
          filter: "?$filter=Entity/EventId eq '60983874-18bb-467d-b55a-94dc55818151' and Entity/Status eq 'Active'",
        };
        await wrapper.vm.onPost({ name, description });

        expect(massActionStore.create).toHaveBeenCalledWith(MassActionType.FinancialAssistance, payload);
      });

      it('should call onSuccess method with proper parameters', async () => {
        const description = '';
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              form: {
                event: mockEventSummary(),
                table: mockFinancialAssistanceTableEntity(),
                item: mockOptionItem(),
                subItem: mockOptionSubItem(),
                amount: 25,
                paymentModality: 1,
              },
            };
          },
          mocks: {

            $route: {
              query: {
                searchParams: filtersString,
                mode: MassActionMode.List,
              },
            },
          },
        });
        wrapper.vm.onSuccess = jest.fn();
        wrapper.vm.makeFormName = jest.fn(() => 'form-name');
        massActionStore.create = jest.fn(() => mockMassActionEntity());
        await wrapper.vm.onPost({ description });

        expect(wrapper.vm.onSuccess).toHaveBeenLastCalledWith(mockMassActionEntity());
      });

      it('should call helper convertDateStringToDateObject with proper parameters', async () => {
        const description = '';
        sharedHelpers.convertDateStringToDateObject = jest.fn();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              form: {
                event: mockEventSummary(),
                table: mockFinancialAssistanceTableEntity(),
                item: mockOptionItem(),
                subItem: mockOptionSubItem(),
                amount: 25,
                paymentModality: 1,
              },
            };
          },
          mocks: {

            $route: {
              query: {
                searchParams: filtersString,
                mode: MassActionMode.List,
              },
            },
          },
        });
        await wrapper.vm.onPost({ description });

        expect(sharedHelpers.convertDateStringToDateObject).toHaveBeenLastCalledWith(JSON.parse(wrapper.vm.$route.query.searchParams));
      });
    });

    describe('makeFormName', () => {
      it('returns the correct name format', async () => {
        format.mockImplementation(() => '20220530 101010');
        await wrapper.setData({
          form: {
            program: { name: { translation: { en: 'programName' } } },
            item: mockOptionItem({ name: { translation: { en: 'itemName' } } }),
          },
        });

        const name = wrapper.vm.makeFormName();
        expect(name).toEqual('programName - itemName - 20220530 101010');
      });
    });
  });
});
