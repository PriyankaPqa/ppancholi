/* eslint-disable max-statements */
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
import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import { CurrentAddress, ECurrentAddressTypes, mockOther } from '@libs/entities-lib/value-objects/current-address';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';

import Component, { LodgingMode } from './BookingSetupDialog.vue';

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

  const mountWrapper = async (fullMount = true, level = 5, lodgingMode = LodgingMode.BookingMode, additionalComputeds = {}) => {
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
        bookingRequest: lodgingMode === LodgingMode.BookingMode ? bookingRequest : null,
        id: 'cf-id',
        show: true,
        lodgingMode,
      },
      computed: {
        ...additionalComputeds,
      },
    });

    crcProvidedLodging = { addRoom: jest.fn(), isMemberAlreadySelected: jest.fn() };
    if (lodgingMode === LodgingMode.BookingMode) {
      wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
    }

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await mountWrapper(false);
  });

  describe('Computed', () => {
    describe('title', () => {
      it('depends on lodging mode', async () => {
        await wrapper.setProps({ lodgingMode: LodgingMode.BookingMode });
        expect(wrapper.vm.title).toEqual('bookingRequest.setup.title');
        await wrapper.setProps({ lodgingMode: LodgingMode.ExtendStay });
        expect(wrapper.vm.title).toEqual('impactedIndividuals.extendStay');
        await wrapper.setProps({ lodgingMode: LodgingMode.MoveCrcProvidedAllowed });
        expect(wrapper.vm.title).toEqual('impactedIndividuals.moveNewAddress');
        await wrapper.setProps({ lodgingMode: LodgingMode.MoveCrcProvidedNotAllowed });
        expect(wrapper.vm.title).toEqual('impactedIndividuals.moveNewAddress');
      });
    });
    describe('shelterLocations', () => {
      it('should return active shelters', async () => {
        expect(wrapper.vm.shelterLocations).toEqual([eventStore.getById().shelterLocations[1]]);
      });
    });

    describe('peopleToLodge', () => {
      it('returns the people receiving assistance when no preselected people in props, or preselected people', async () => {
        expect(wrapper.vm.peopleToLodge.length).toEqual(wrapper.vm.individuals.length - 1);
        expect(wrapper.vm.peopleToLodge).toEqual([
          { ...mockMember({ id: 'pid1' }), caseFileIndividualId: individuals[0].id, isPrimary: false, receivingAssistance: true, caseFileIndividual: individuals[0] },
          { ...mockMember({ id: 'pid3' }), caseFileIndividualId: individuals[2].id, isPrimary: false, receivingAssistance: true, caseFileIndividual: individuals[2] },
        ]);

        await wrapper.setProps({ preselectedIndividuals: [individuals[0].id] });
        expect(wrapper.vm.peopleToLodge.length).toEqual(1);
        expect(wrapper.vm.peopleToLodge).toEqual([
          { ...mockMember({ id: 'pid1' }), caseFileIndividualId: individuals[0].id, isPrimary: false, receivingAssistance: true, caseFileIndividual: individuals[0] },
        ]);
      });
    });

    describe('uniqueAddresses', () => {
      it('returns the addresses that differ from the list of current addresses', async () => {
        const individuals = individualStore.getByCaseFile();
        individuals[0].membershipStatus = MembershipStatus.Active;
        individuals[1].membershipStatus = MembershipStatus.Active;
        individuals[2].membershipStatus = MembershipStatus.Active;
        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed, { individuals: () => individuals });
        expect(wrapper.vm.uniqueAddresses).toEqual([individuals[0].currentAddress]);

        individuals[1].currentAddress = mockOther();
        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed, { individuals: () => individuals });
        expect(wrapper.vm.uniqueAddresses).toEqual([individuals[0].currentAddress, individuals[1].currentAddress]);

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed, { individuals: () => individuals });
        individuals[1].membershipStatus = MembershipStatus.Removed;
        expect(wrapper.vm.uniqueAddresses).toEqual([individuals[0].currentAddress]);
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

        // when lodgingMode = booking
        expect(wrapper.vm.addressType).toEqual(wrapper.vm.bookingRequest.addressType);
        expect(wrapper.vm.isCrcProvided).toEqual(true);
        expect(wrapper.vm.lockCrcProvided).toEqual(false);

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed);
        expect(wrapper.vm.addressType).toBeNull();
        expect(wrapper.vm.isCrcProvided).toEqual(false);
        expect(wrapper.vm.lockCrcProvided).toEqual(false);

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedNotAllowed);
        expect(wrapper.vm.addressType).toBeNull();
        expect(wrapper.vm.isCrcProvided).toEqual(false);
        expect(wrapper.vm.lockCrcProvided).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('setupBookingsForExtendStay', () => {
      it('creates bookings per address', async () => {
        const individuals = individualStore.getByCaseFile();
        individuals[0].membershipStatus = MembershipStatus.Active;
        individuals[1].membershipStatus = MembershipStatus.Active;
        individuals[2].membershipStatus = MembershipStatus.Active;
        await mountWrapper(false, 5, LodgingMode.ExtendStay, { individuals: () => individuals });
        wrapper.vm.setupBookingsForExtendStay();
        const address = new CurrentAddress(individuals[0].currentAddress);
        address.checkIn = '';
        address.checkOut = '';
        expect(wrapper.vm.bookings).toEqual([{
          address,
          peopleInRoom: ['1', '2', '3'],
          confirmationNumber: '',
          nightlyRate: wrapper.vm.defaultAmount,
          numberOfNights: null,
          uniqueNb: 0,
          originalCheckoutDate: '',
        }]);

        individuals[0].currentAddress.checkIn = new Date('2002-02-02');
        individuals[0].currentAddress.checkOut = new Date('2002-02-05');

        wrapper.vm.setupBookingsForExtendStay();
        const address2 = new CurrentAddress(individuals[0].currentAddress);
        address2.checkIn = '2002-02-02';
        address2.checkOut = '2002-02-05';
        expect(wrapper.vm.bookings).toEqual([{
          address: address2,
          peopleInRoom: ['1'],
          confirmationNumber: '',
          nightlyRate: wrapper.vm.defaultAmount,
          numberOfNights: null,
          uniqueNb: 0,
          originalCheckoutDate: '2002-02-05',
        }, {
          address,
          peopleInRoom: ['2', '3'],
          confirmationNumber: '',
          nightlyRate: wrapper.vm.defaultAmount,
          numberOfNights: null,
          uniqueNb: 1,
          originalCheckoutDate: '',
        }]);

        expect(wrapper.vm.isCrcProvided).toBeTruthy();
        expect(wrapper.vm.addressType).toBeTruthy();
        expect(wrapper.vm.showCrcProvidedSelection).toBeTruthy();
        expect(wrapper.vm.lockCrcProvided).toBeTruthy();
      });
    });

    describe('changeType', () => {
      it('clears bookings and adds 1', async () => {
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;

        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel });
        await wrapper.vm.changeType();
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalled();
        expect(wrapper.vm.$refs.crcProvidedLodging.addRoom).toHaveBeenCalled();

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed);
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel });
        await wrapper.vm.changeType();
        const address = new CurrentAddress();
        address.reset(ECurrentAddressTypes.HotelMotel);
        expect(wrapper.vm.bookings).toEqual([{ address, peopleInRoom: [], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1 }]);
      });

      it('sets up crc provided depending on address type', async () => {
        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed);
        wrapper.vm.$refs.form.reset = jest.fn();

        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel, isCrcProvided: true });
        await wrapper.vm.changeType(true);
        expect(wrapper.vm.showCrcProvidedSelection).toBeTruthy();
        expect(wrapper.vm.isCrcProvided).toBeNull();

        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel, isCrcProvided: true });
        await wrapper.vm.changeType();
        expect(wrapper.vm.showCrcProvidedSelection).toBeTruthy();
        expect(wrapper.vm.isCrcProvided).toBeTruthy();

        await wrapper.setData({ addressType: ECurrentAddressTypes.FriendsFamily, isCrcProvided: true });
        await wrapper.vm.changeType(true);
        expect(wrapper.vm.showCrcProvidedSelection).toBeFalsy();
        expect(wrapper.vm.isCrcProvided).toBeFalsy();
      });

      it('warns if trying to set CRCProvided but one person cant receive it', async () => {
        const peopleToLodge = wrapper.vm.peopleToLodge;

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed, { peopleToLodge() {
          return peopleToLodge;
        } });
        wrapper.vm.$refs.form.reset = jest.fn();

        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel, isCrcProvided: true });
        await wrapper.vm.changeType();

        expect(wrapper.vm.$message).not.toHaveBeenCalled();
        expect(wrapper.vm.isCrcProvided).toBeTruthy();

        peopleToLodge[0].receivingAssistance = false;
        await wrapper.setData({ addressType: ECurrentAddressTypes.HotelMotel, isCrcProvided: true });
        await wrapper.vm.changeType();

        expect(wrapper.vm.$message).toHaveBeenCalledWith({
          maxWidth: 750, message: 'impactedIndividuals.crcProvided.notReceivingAssistance.message', title: 'impactedIndividuals.crcProvided.notReceivingAssistance.title',
        });
        expect(wrapper.vm.isCrcProvided).toBeFalsy();

        jest.clearAllMocks();
        await wrapper.setData({ addressType: ECurrentAddressTypes.FriendsFamily, isCrcProvided: false });
        await wrapper.vm.changeType();

        expect(wrapper.vm.$message).not.toHaveBeenCalled();
        expect(wrapper.vm.isCrcProvided).toBeFalsy();
      });
    });

    describe('selectPaymentDetails', () => {
      it('sets the payment details', async () => {
        wrapper.vm.defaultAmount = 0;
        wrapper.vm.setupBookingsForExtendStay = jest.fn();
        jest.clearAllMocks();
        const detail = wrapper.vm.paymentDetails[0];
        wrapper.vm.selectPaymentDetails(detail);
        expect(wrapper.vm.defaultAmount).toEqual(1);
        expect(paymentStore.getFinancialAssistanceCategories).toHaveBeenCalled();
        expect(tableStore.setFinancialAssistance).toHaveBeenCalledWith({
          fa: detail.table, categories: paymentStore.getFinancialAssistanceCategories(), newProgram: detail.program, removeInactiveItems: true,
        });
        expect(wrapper.vm.setupBookingsForExtendStay).not.toHaveBeenCalled();

        await mountWrapper(false, 5, LodgingMode.ExtendStay);
        wrapper.vm.setupBookingsForExtendStay = jest.fn();
        jest.clearAllMocks();
        wrapper.vm.selectPaymentDetails(detail);
        expect(wrapper.vm.setupBookingsForExtendStay).toHaveBeenCalled();
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
      it('when moving into an existing address, show message if crc provided and not receiving assistance', async () => {
        const peopleToLodge = wrapper.vm.peopleToLodge;

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed, { peopleToLodge() {
          return peopleToLodge;
        } });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        wrapper.vm.provideCrcAddress = jest.fn();
        wrapper.vm.provideNonCrcAddress = jest.fn();
        peopleToLodge[0].receivingAssistance = false;

        await wrapper.setData({ moveIntoExistingAddress: true, existingAddress: { crcProvided: false } });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$message).not.toHaveBeenCalled();
        expect(wrapper.vm.provideCrcAddress).not.toHaveBeenCalled();
        expect(wrapper.vm.provideNonCrcAddress).toHaveBeenCalled();
        jest.clearAllMocks();

        await wrapper.setData({ moveIntoExistingAddress: true, existingAddress: { crcProvided: true } });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({
          maxWidth: 750, message: 'impactedIndividuals.crcProvided.notReceivingAssistance.message', title: 'impactedIndividuals.crcProvided.notReceivingAssistance.title',
        });
        expect(wrapper.vm.provideCrcAddress).not.toHaveBeenCalled();
        expect(wrapper.vm.provideNonCrcAddress).not.toHaveBeenCalled();
        jest.clearAllMocks();

        peopleToLodge[0].receivingAssistance = true;
        await wrapper.setData({ moveIntoExistingAddress: true, existingAddress: { crcProvided: true } });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$message).not.toHaveBeenCalled();
        expect(wrapper.vm.provideCrcAddress).not.toHaveBeenCalled();
        expect(wrapper.vm.provideNonCrcAddress).toHaveBeenCalled();
        expect(wrapper.vm.bookings).toEqual([{ address: new CurrentAddress(wrapper.vm.existingAddress), peopleInRoom: [] }]);
      });

      it('shows confirm when not everyone is lodged', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.isMemberAlreadySelected = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.isMemberAlreadySelected = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ cancelActionLabel: 'common.buttons.back', htmlContent: 'bookingRequest.notAllMembersPicked.confirm', messages: null, submitActionLabel: 'common.buttons.continue', title: 'bookingRequest.notAllMembersPicked.confirm.title' });
      });

      it('does the calls to save data', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        crcProvidedLodging.isMemberAlreadySelected = jest.fn(() => true);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        const payment = { id: 'some payment' };
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        wrapper.vm.provideCrcAddress = jest.fn();
        wrapper.vm.provideNonCrcAddress = jest.fn();

        await wrapper.setData({ isCrcProvided: true });
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.provideCrcAddress).toHaveBeenCalled();
        expect(wrapper.vm.provideNonCrcAddress).not.toHaveBeenCalled();

        jest.clearAllMocks();
        await wrapper.setData({ isCrcProvided: false });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.provideCrcAddress).not.toHaveBeenCalled();
        expect(wrapper.vm.provideNonCrcAddress).toHaveBeenCalled();
      });
    });

    describe('provideCrcAddress', () => {
      it('does the calls to save data', async () => {
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        const payment = { id: 'some payment' };
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        const address = new CurrentAddress();
        address.reset(ECurrentAddressTypes.HotelMotel);
        address.checkIn = '2022-01-01';
        address.checkOut = '2022-02-01';
        await wrapper.setData({ bookings: [{ address, peopleInRoom: ['someone', 'someother'], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1 }] });

        await wrapper.vm.provideCrcAddress();

        expect(crcProvidedLodging.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(payment);
        expect(paymentStore.submitFinancialAssistancePayment).toHaveBeenCalledWith('some payment');
        expect(bookingStore.fulfillBooking).toHaveBeenCalledWith(wrapper.vm.bookingRequest, paymentStore.submitFinancialAssistancePayment().id, wrapper.vm.bookings);
        expect(individualStore.addTemporaryAddress).not.toHaveBeenCalled();

        crcProvidedLodging.generatePayment = jest.fn(() => null);
        jest.clearAllMocks();
        await wrapper.vm.provideCrcAddress();

        expect(crcProvidedLodging.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).not.toHaveBeenCalled();
        expect(paymentStore.submitFinancialAssistancePayment).not.toHaveBeenCalled();
        expect(bookingStore.fulfillBooking).toHaveBeenCalledWith(wrapper.vm.bookingRequest, null, wrapper.vm.bookings);
        expect(individualStore.addTemporaryAddress).not.toHaveBeenCalled();

        await mountWrapper(false, 5, LodgingMode.MoveCrcProvidedAllowed);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        await wrapper.setData({ bookings: [{ address, peopleInRoom: ['someone', 'someother'], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1 }] });

        jest.clearAllMocks();
        await wrapper.vm.provideCrcAddress();

        expect(crcProvidedLodging.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(payment);
        expect(paymentStore.submitFinancialAssistancePayment).toHaveBeenCalledWith('some payment');
        expect(bookingStore.fulfillBooking).not.toHaveBeenCalled();
        expect(individualStore.addTemporaryAddress).toHaveBeenCalled();

        await mountWrapper(false, 5, LodgingMode.ExtendStay);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        await wrapper.setData({ bookings: [{ address, peopleInRoom: ['1', '2'], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1, originalCheckoutDate: '2022-01-05' }] });

        jest.clearAllMocks();
        await wrapper.vm.provideCrcAddress();

        expect(crcProvidedLodging.generatePayment).toHaveBeenCalled();
        expect(paymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(payment);
        expect(paymentStore.submitFinancialAssistancePayment).toHaveBeenCalledWith('some payment');
        expect(individualStore.editTemporaryAddress).toHaveBeenCalledTimes(2);

        // when checkout date hasnt changed, we dont save the booking (not extended)
        await mountWrapper(false, 5, LodgingMode.ExtendStay);
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        await wrapper.setData({ bookings: [{ address, peopleInRoom: ['1', '2'], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1, originalCheckoutDate: '2022-02-01' }] });

        jest.clearAllMocks();
        await wrapper.vm.provideCrcAddress();
        expect(individualStore.editTemporaryAddress).not.toHaveBeenCalled();
      });
    });

    describe('provideNonCrcAddress', () => {
      it('does the calls to save data', async () => {
        wrapper.vm.$refs.crcProvidedLodging = crcProvidedLodging;
        const payment = { id: 'some payment' };
        crcProvidedLodging.generatePayment = jest.fn(() => payment);
        const address = new CurrentAddress();
        address.reset(ECurrentAddressTypes.HotelMotel);

        await wrapper.setData({ bookings: [{ address, peopleInRoom: ['someone', 'someother'], confirmationNumber: '', nightlyRate: wrapper.vm.defaultAmount, numberOfNights: null, uniqueNb: -1 }] });

        await wrapper.vm.provideNonCrcAddress();

        expect(crcProvidedLodging.generatePayment).not.toHaveBeenCalled();
        expect(individualStore.addTemporaryAddress).toHaveBeenCalled();
      });
    });
  });
});
