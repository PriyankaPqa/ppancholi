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
import helpers from '@libs/entities-lib/helpers';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { mockMember } from '@libs/entities-lib/household-create';
import { CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
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

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(wrapper.vm.$i18n));
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
      });
    });
  });

  describe('Methods', () => {
    describe('addRoom', () => {
      it('sets up a booking', async () => {
        const oldBookings = [...wrapper.vm.bookings];
        wrapper.vm.addRoom();
        const c = new CurrentAddress();
        c.reset(oldBookings[0].address.addressType);
        expect(wrapper.vm.bookings).toEqual([...oldBookings,
          {
            address: c,
            confirmationNumber: '',
            estimatedAmount: 1,
            numberOfNights: null,
            peopleInRoom: [],
            uniqueNb: 2,
          },
        ]);
      });
    });

    describe('removeRoom', () => {
      it('removes a booking', async () => {
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();
        const oldBookings = [...wrapper.vm.bookings];

        wrapper.vm.removeRoom(oldBookings[1]);
        expect(wrapper.vm.bookings).toEqual([oldBookings[0], oldBookings[2]]);
      });
    });

    describe('changeType', () => {
      it('clears bookings and adds 1 of the right type', async () => {
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();

        wrapper.vm.changeType(1);
        expect(wrapper.vm.bookings.map((b) => b.address.addressType)).toEqual([1]);
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalled();
      });
    });

    describe('selectPaymentDetails', () => {
      it('sets the payment details', async () => {
        wrapper.vm.bookings[0].estimatedAmount = 0;
        jest.clearAllMocks();
        const detail = wrapper.vm.paymentDetails[0];
        wrapper.vm.selectPaymentDetails(detail);
        expect(wrapper.vm.bookings[0].estimatedAmount).toEqual(1);
        expect(paymentStore.getFinancialAssistanceCategories).toHaveBeenCalled();
        expect(tableStore.setFinancialAssistance).toHaveBeenCalledWith({
          fa: detail.table, categories: paymentStore.getFinancialAssistanceCategories(), newProgram: detail.program, removeInactiveItems: true,
        });
      });
    });

    describe('setCurrentAddress', () => {
      it('sets the number of nights', async () => {
        wrapper.vm.addRoom();
        const c = new CurrentAddress();
        c.checkIn = '2024-01-01';
        c.checkOut = '2024-01-06';
        wrapper.vm.setCurrentAddress(c, 1);
        expect(wrapper.vm.bookings[1].numberOfNights).toEqual(5);
        expect(wrapper.vm.bookings[1].address).toEqual(c);

        c.checkOut = '';
        wrapper.vm.setCurrentAddress(c, 1);
        expect(wrapper.vm.bookings[1].numberOfNights).toEqual(null);
        expect(wrapper.vm.bookings[1].address).toEqual(c);

        c.checkOut = '2024-01-01';
        wrapper.vm.setCurrentAddress(c, 1);
        expect(wrapper.vm.bookings[1].numberOfNights).toEqual(1);
        expect(wrapper.vm.bookings[1].address).toEqual(c);
      });
    });

    describe('isMemberAlreadySelected', () => {
      it('returns true when people are already in another booking', async () => {
        wrapper.vm.addRoom();
        wrapper.vm.bookings[0].peopleInRoom = ['pid1', 'pid2'];
        wrapper.vm.bookings[1].peopleInRoom = ['pid3'];
        expect(wrapper.vm.isMemberAlreadySelected(wrapper.vm.bookings[0], 'pid3')).toBeTruthy();
        expect(wrapper.vm.isMemberAlreadySelected(wrapper.vm.bookings[0], 'pid4')).toBeFalsy();
        expect(wrapper.vm.isMemberAlreadySelected(wrapper.vm.bookings[0], 'pid1')).toBeFalsy();
        expect(wrapper.vm.isMemberAlreadySelected(wrapper.vm.bookings[1], 'pid1')).toBeTruthy();
        expect(wrapper.vm.isMemberAlreadySelected(null, 'pid1')).toBeTruthy();
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
        wrapper.vm.isMemberAlreadySelected = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        wrapper.vm.isMemberAlreadySelected = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ cancelActionLabel: 'common.buttons.back', htmlContent: 'bookingRequest.notAllMembersPicked.confirm', messages: null, submitActionLabel: 'common.buttons.continue', title: 'bookingRequest.notAllMembersPicked.confirm.title' });
      });

      it('does the calls to save data', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.isMemberAlreadySelected = jest.fn(() => true);
        const payment = { id: 'some payment' };
        wrapper.vm.generatePayment = jest.fn(() => payment);
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(payment);
        expect(paymentStore.submitFinancialAssistancePayment).toHaveBeenCalledWith('some payment');
        expect(bookingStore.fulfillBooking).toHaveBeenCalledWith(wrapper.vm.bookingRequest, paymentStore.submitFinancialAssistancePayment().id, wrapper.vm.bookings);
      });
    });

    describe('generatePayment', () => {
      it('sets up the right payment', async () => {
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();
        let b = wrapper.vm.bookings[0];
        b.numberOfNights = 2;
        b.confirmationNumber = 'abc';
        b.estimatedAmount = 100;
        b = wrapper.vm.bookings[1];
        b.numberOfNights = 1;
        b.estimatedAmount = 200;
        b.confirmationNumber = 'abc';
        b = wrapper.vm.bookings[2];
        b.numberOfNights = 6;
        b.estimatedAmount = 200;
        b.confirmationNumber = 'def';
        b = wrapper.vm.bookings[3];
        b.numberOfNights = 6;
        b.estimatedAmount = 200;
        b.confirmationNumber = '';

        const payment = wrapper.vm.generatePayment();
        expect(payment.caseFileId).toEqual(wrapper.vm.caseFileId);
        expect(payment.description).toEqual({ key: 'bookingRequest.paymentDescription', params: [{ amountPerNight: '100, 200', numberOfNights: 15, numberOfRooms: 4 }] });
        expect(payment.name.substring(0, 20)).toEqual('Program A - Children');
        expect(payment.financialAssistanceTableId).toEqual(table.id);
        expect(payment.groups).toEqual([
          {
            groupingInformation: {
              modality: 2,
              payeeName: 'Bob Smith',
              payeeType: 1,
            },
            lines: [
              {
                amount: 2800,
                mainCategoryId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
                relatedNumber: 'abc, def',
                status: 1,
                subCategoryId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
              },
            ],
          },
        ]);
      });
    });
  });
});
