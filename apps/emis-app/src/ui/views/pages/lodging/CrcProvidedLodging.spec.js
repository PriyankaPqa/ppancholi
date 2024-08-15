/* eslint-disable vue/max-len */
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { createTestingPinia } from '@pinia/testing';
import helpers from '@libs/entities-lib/helpers';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { mockMember } from '@libs/entities-lib/household-create';
import { CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';

import Component from './CrcProvidedLodging.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
const personStore = useMockPersonStore(pinia).personStore;
useMockHouseholdStore(pinia);
const eventStore = useMockEventStore(pinia).eventStore;
useMockCaseFileStore(pinia);
const individualStore = useMockCaseFileIndividualStore(pinia).caseFileIndividualStore;
useMockFinancialAssistanceStore(pinia);

const program = mockProgramEntity();
const individuals = individualStore.getByCaseFile();
personStore.getByIds = jest.fn(() => [mockMember({ id: 'pid1' }), mockMember({ id: 'pid2' }), mockMember({ id: 'pid3' })]);
individuals[0].personId = 'pid1';
individuals[1].personId = 'pid2';
individuals[2].personId = 'pid3';
individualStore.getByCaseFile = jest.fn(() => individuals);

let bookings = [];

describe('CrcProvidedLodging.vue', () => {
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
        addressType: ECurrentAddressTypes.HotelMotel,
        bookings,
        program,
        defaultAmount: 125,
        id: 'cf-id',
        tableId: 'table-id',
        peopleToLodge: [
          { ...mockMember({ id: 'pid1' }), caseFileIndividualId: individuals[0].id },
          { ...mockMember({ id: 'pid3' }), caseFileIndividualId: individuals[2].id },
        ],
      },
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    bookings = [];
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
  });

  describe('Methods', () => {
    describe('addRoom', () => {
      it('sets up a booking', async () => {
        const oldBookings = [...wrapper.vm.bookings];
        wrapper.vm.addRoom();
        const c = new CurrentAddress();
        c.reset(oldBookings[0].address.addressType);
        c.crcProvided = true;
        expect(wrapper.vm.bookings).toEqual([...oldBookings,
          {
            address: c,
            confirmationNumber: '',
            nightlyRate: 125,
            numberOfNights: null,
            peopleInRoom: [],
            uniqueNb: 2,
          },
        ]);
      });

      it('doesnt add when not empty when ifEmptyOnly is true', async () => {
        const oldBookings = [...wrapper.vm.bookings];
        wrapper.vm.addRoom(true);
        expect(wrapper.vm.bookings).toEqual([...oldBookings]);
        wrapper.vm.addRoom();
        expect(wrapper.vm.bookings.length).toEqual(oldBookings.length + 1);
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

    describe('generatePayment', () => {
      it('sets up the right payment', async () => {
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();
        wrapper.vm.addRoom();
        let b = wrapper.vm.bookings[0];
        b.numberOfNights = 2;
        b.confirmationNumber = 'abc';
        b.nightlyRate = 100;
        b = wrapper.vm.bookings[1];
        b.numberOfNights = 1;
        b.nightlyRate = 200;
        b.confirmationNumber = 'abc';
        b = wrapper.vm.bookings[2];
        b.numberOfNights = 6;
        b.nightlyRate = 200;
        b.confirmationNumber = 'def';
        b = wrapper.vm.bookings[3];
        b.numberOfNights = 6;
        b.nightlyRate = 200;
        b.confirmationNumber = '';

        const payment = wrapper.vm.generatePayment();
        expect(payment.caseFileId).toEqual(wrapper.vm.caseFileId);
        expect(payment.description).toEqual({ key: 'bookingRequest.paymentDescription', params: [{ nightlyRate: '100, 200', numberOfNights: 15, numberOfRooms: 4 }] });
        expect(payment.name.substring(0, 20)).toEqual('Program A - Children');
        expect(payment.financialAssistanceTableId).toEqual('table-id');
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
