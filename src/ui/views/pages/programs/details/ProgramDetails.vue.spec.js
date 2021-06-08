import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockProgramsSearchData, Program, EPaymentModalities } from '@/entities/program';
import Component from './ProgramDetails.vue';

const localVue = createLocalVue();

describe('ProgramDetails.vue', () => {
  let wrapper;

  beforeEach(() => {
    const program = new Program(mockProgramsSearchData()[0]);

    wrapper = mount(Component, {
      localVue,
      propsData: {
        programId: 'PROGRAM_ID',
      },
      computed: {
        program() {
          return program;
        },
      },
    });
  });

  describe('Template', () => {
    test('the edit button is associated to the correct route', () => {
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
  });

  describe('Methods', () => {
    describe('getTranslatedPaymentModality', () => {
      it('returns the correct translation key for the payment modality', () => {
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.ETransfer))
          .toBe('event.programManagement.paymentModalities.ETransfer');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Cheque))
          .toBe('event.programManagement.paymentModalities.Cheque');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.DirectDeposit))
          .toBe('event.programManagement.paymentModalities.DirectDeposit');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.GiftCard))
          .toBe('event.programManagement.paymentModalities.GiftCard');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Invoice))
          .toBe('event.programManagement.paymentModalities.Invoice');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.PrepaidCard))
          .toBe('event.programManagement.paymentModalities.PrepaidCard');
        expect(wrapper.vm.getTranslatedPaymentModality(EPaymentModalities.Voucher))
          .toBe('event.programManagement.paymentModalities.Voucher');
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
