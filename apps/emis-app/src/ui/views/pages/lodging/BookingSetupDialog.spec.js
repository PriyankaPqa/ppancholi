/* eslint-disable vue/max-len */
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockBookingRequestStore } from '@/pinia/booking-request/booking-request.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { mockBookingRequest } from '@libs/entities-lib/booking-request';
import { createTestingPinia } from '@pinia/testing';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { mockMember } from '@libs/entities-lib/household-create';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';

import Component from './BookingSetupDialog.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
const personStore = useMockPersonStore(pinia).personStore;
const eventStore = useMockEventStore(pinia).eventStore;
const householdStore = useMockHouseholdStore(pinia).householdStore;
const bookingStore = useMockBookingRequestStore(pinia).bookingRequestStore;
useMockCaseFileStore(pinia);
const individualStore = useMockCaseFileIndividualStore(pinia).caseFileIndividualStore;
const tableStore = useMockFinancialAssistanceStore(pinia).financialAssistanceStore;
const paymentStore = useMockFinancialAssistancePaymentStore(pinia).financialAssistancePaymentStore;
const programStore = useMockProgramStore(pinia).programStore;

const table = tableStore.getById();
const program = mockProgramEntity({ id: table.programId });
programStore.search = jest.fn(() => ({ values: [program] }));
const bookingRequest = mockBookingRequest();
const individuals = individualStore.getByCaseFile();
personStore.getByIds = jest.fn(() => [mockMember({ id: 'pid1' }), mockMember({ id: 'pid2' }), mockMember({ id: 'pid3' })]);
individuals[0].personId = 'pid1';
individuals[1].personId = 'pid2';
individuals[2].personId = 'pid3';
individualStore.getByCaseFile = jest.fn(() => individuals);

describe('BookingSetupDialog.vue', () => {
  let wrapper;
  let crcProvidedLodging;

  const mountWrapper = async (fullMount = true, level = 5) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      data() {
        return {
          apiKey: 'google-api-key',
        };
      },
      propsData: {
        bookingRequest,
        id: 'cf-id',
        show: true,
      },
    });

    crcProvidedLodging = { addRoom: jest.fn(), isMemberAlreadySelected: jest.fn() };
    wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await mountWrapper(false);
  });

  describe('Computed', () => {
    describe('shelterLocations', () => {
      it('should return active shelters', async () => {
        expect(wrapper.vm.shelterLocations).toEqual([eventStore.getById().shelterLocations[1]]);
      });
    });

    describe('peopleToLodge', () => {
      it('returns the people receiving assistance', async () => {
        expect(wrapper.vm.peopleToLodge.length).toEqual(wrapper.vm.individuals.length - 1);
        expect(wrapper.vm.peopleToLodge).toEqual([
          { ...mockMember({ id: 'pid1' }), caseFileIndividualId: individuals[0].id },
          { ...mockMember({ id: 'pid3' }), caseFileIndividualId: individuals[2].id },
        ]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls the storage and sets itself up', async () => {
        // in cfdetail mixin
        expect(personStore.fetchByIds).toHaveBeenCalled();
        expect(householdStore.fetchByIds).toHaveBeenCalled();
        expect(eventStore.fetchByIds).toHaveBeenCalled();
        expect(individualStore.fetchAll).toHaveBeenCalled();

        expect(paymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
        expect(programStore.search).toHaveBeenCalledWith({ params: {
          filter: {
            'Entity/EventId': { type: 'guid', value: wrapper.vm.caseFile.eventId },
            'Entity/UseForLodging': true,
          },
        } });
        expect(tableStore.search).toHaveBeenCalledWith({ params: {
          filter: {
            'Entity/UseForLodging': true,
            'Entity/ProgramId': { in: programStore.search().values.map((p) => p.id) },
          },
        } });
        expect(wrapper.vm.paymentDetails).toEqual([{ table: tableStore.getById(), program, name: 'Program A - abcd' }]);
        expect(wrapper.vm.showSelectTable).toBeFalsy();
        expect(wrapper.vm.selectedPaymentDetails).toEqual(wrapper.vm.paymentDetails[0]);
        expect(wrapper.vm.addressType).toEqual(wrapper.vm.bookingRequest.addressType);
      });
    });
  });

  describe('Methods', () => {
    describe('changeType', () => {
      it('clears bookings and adds 1', async () => {
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;

        await wrapper.vm.changeType();
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalled();
        expect(wrapper.vm.$refs.crcProvidedLodging.addRoom).toHaveBeenCalled();
      });
    });

    describe('selectPaymentDetails', () => {
      it('sets the payment details', async () => {
        wrapper.vm.defaultAmount = 0;
        jest.clearAllMocks();
        const detail = wrapper.vm.paymentDetails[0];
        wrapper.vm.selectPaymentDetails(detail);
        expect(wrapper.vm.defaultAmount).toEqual(1);
        expect(paymentStore.getFinancialAssistanceCategories).toHaveBeenCalled();
        expect(tableStore.setFinancialAssistance).toHaveBeenCalledWith({
          fa: detail.table, categories: paymentStore.getFinancialAssistanceCategories(), newProgram: detail.program, removeInactiveItems: true,
        });
      });
    });

    describe('rejectBooking', () => {
      it('should show the dialog and save if answered', async () => {
        const answer = { answered: true, rationale: 'some rationale' };
        wrapper.vm.$refs.rationaleDialog.open = jest.fn(() => answer);
        wrapper.vm.$refs.rationaleDialog.close = jest.fn();
        await wrapper.vm.rejectBooking();

        expect(wrapper.vm.$refs.rationaleDialog.open).toHaveBeenCalledWith({
          title: 'bookingRequest.rejectRequest.title',
          userBoxText: 'bookingRequest.rejectRequest.message',
        });

        expect(bookingStore.rejectBooking)
          .toHaveBeenCalledWith(wrapper.vm.bookingRequest, 'some rationale');
        expect(wrapper.vm.$refs.rationaleDialog.close).toHaveBeenCalled();
      });

      it('should show the dialog and reset isreceivingassistance if not answered', async () => {
        const answer = { answered: false, rationale: null };
        wrapper.vm.$refs.rationaleDialog.open = jest.fn(() => answer);
        wrapper.vm.$refs.rationaleDialog.close = jest.fn();
        await wrapper.vm.rejectBooking();

        expect(bookingStore.rejectBooking).not.toHaveBeenCalled();
      });
    });

    describe('onSubmit', () => {
      it('shows confirm when not everyone is lodged', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.isMemberAlreadySelected = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        crcProvidedLodging.isMemberAlreadySelected = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ cancelActionLabel: 'common.buttons.back', htmlContent: 'bookingRequest.notAllMembersPicked.confirm', messages: null, submitActionLabel: 'common.buttons.continue', title: 'bookingRequest.notAllMembersPicked.confirm.title' });
      });

      it('does the calls to save data', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.isMemberAlreadySelected = jest.fn(() => true);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        const payment = { id: 'some payment' };
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        await wrapper.vm.onSubmit();

        expect(crcProvidedLodging.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(payment);
        expect(paymentStore.submitFinancialAssistancePayment).toHaveBeenCalledWith('some payment');
        expect(bookingStore.fulfillBooking).toHaveBeenCalledWith(wrapper.vm.bookingRequest, paymentStore.submitFinancialAssistancePayment().id, wrapper.vm.bookings);
      });
    });
  });
});
