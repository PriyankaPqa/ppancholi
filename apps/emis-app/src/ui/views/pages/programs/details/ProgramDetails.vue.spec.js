import { mockStorage } from '@/storage';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockProgramEntity, EPaymentModalities } from '@libs/entities-lib/program';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import Component from './ProgramDetails.vue';

const localVue = createLocalVue();

describe('ProgramDetails.vue', () => {
  let wrapper;

  const storage = mockStorage();
  const program = mockProgramEntity();

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      propsData: {
        programId: 'PROGRAM_ID',
        id: 'EVENT_ID',
      },
      computed: {
        program() {
          return program;
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    test('the edit button is associated to the correct route', async () => {
      wrapper = await mount(Component, {
        localVue,
        propsData: {
          programId: 'PROGRAM_ID',
          id: 'EVENT_ID',
        },
        computed: {
          program() {
            return program;
          },
        },
        mocks: {
          $storage: storage,
        },
      });

      await wrapper.setData({
        loading: false,
      });

      const button = wrapper.findDataTest('edit-button');

      expect(button.props('to')).toEqual({
        name: routes.programs.edit.name,
        params: {
          programId: 'PROGRAM_ID',
        },
      });
    });

    test('the back to programs button calls the cancel method', async () => {
      jest.spyOn(wrapper.vm, 'back');

      const button = wrapper.findDataTest('cancel');

      await button.trigger('click');

      expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
    });

    describe('financial assistance tables', () => {
      it('displays correct text if no financial assistance', async () => {
        await wrapper.setData({
          financialAssistanceTables: [],
        });

        const col = wrapper.findDataTest('no-financialAssistance');

        expect(col.exists()).toBeTruthy();
      });

      it('displays financial assistance name', async () => {
        await wrapper.setData({
          financialAssistanceTables: [mockFinancialAssistanceTableEntity()],
        });

        const col = wrapper.findDataTest('financialAssistance-0');

        expect(col.exists()).toBeTruthy();
        expect(col.text()).toBe(mockFinancialAssistanceTableEntity().name.translation.en);
      });
    });
  });

  describe('Life cycle', () => {
    describe('created', () => {
      it('tries to get program from local', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            programId: 'PROGRAM_ID',
            id: 'EVENT_ID',
          },
          computed: {
            program() {
              return program;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.program.actions.fetch).toHaveBeenCalledTimes(0);
      });

      it('fetches program if not found locally', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            programId: 'PROGRAM_ID',
            id: 'EVENT_ID',
          },
          computed: {
            program() {
              return program;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$storage.program.getters.get = jest.fn(() => null);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.program.actions.fetch).toHaveBeenCalledTimes(1);
      });

      it('calls method to fetch and set financial assistance tables', async () => {
        jest.clearAllMocks();

        await wrapper.setData({
          financialAssistanceTables: [],
        });
        expect(wrapper.vm.financialAssistanceTables).toEqual([]);

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.financialAssistance.actions.fetchByProgramId).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.actions.fetchByProgramId).toHaveBeenCalledWith('PROGRAM_ID');
        expect(wrapper.vm.financialAssistanceTables).toEqual([mockFinancialAssistanceTableEntity()]);
      });
    });
  });

  describe('Methods', () => {
    describe('getTranslatedPaymentModality', () => {
      it('returns the correct translation key for the payment modality', () => {
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.ETransfer))
          .toBe('enums.PaymentModality.ETransfer');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Cheque))
          .toBe('enums.PaymentModality.Cheque');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.DirectDeposit))
          .toBe('enums.PaymentModality.DirectDeposit');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.GiftCard))
          .toBe('enums.PaymentModality.GiftCard');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Invoice))
          .toBe('enums.PaymentModality.Invoice');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.PrepaidCard))
          .toBe('enums.PaymentModality.PrepaidCard');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Voucher))
          .toBe('enums.PaymentModality.Voucher');
      });
    });

    describe('getEligibilityIcon', () => {
      it('returns check icon for true', () => {
        expect(wrapper.vm.getEligibilityIcon(true)).toBe('mdi-check-circle');
      });

      it('returns minus icon for false', () => {
        expect(wrapper.vm.getEligibilityIcon(false)).toBe('mdi-minus-circle');
      });
    });

    describe('getEligibilityIconColor', () => {
      it('returns status_success for true', () => {
        expect(wrapper.vm.getEligibilityIconColor(true)).toBe('status_success');
      });

      it('returns grey-darken-2 for false', () => {
        expect(wrapper.vm.getEligibilityIconColor(false)).toBe('grey-darken-2');
      });
    });

    describe('getEditRoute', () => {
      it('returns the correct edit route & id param', () => {
        expect(wrapper.vm.getEditRoute()).toEqual({
          name: routes.programs.edit.name,
          params: {
            programId: 'PROGRAM_ID',
          },
        });
      });
    });

    describe('back', () => {
      it('returns to the program home page', () => {
        wrapper.vm.back();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.programs.home.name,
        });
      });
    });
  });
});
