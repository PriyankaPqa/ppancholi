import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import flushPromises from 'flush-promises';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { BookingRequestState } from '@libs/entities-lib/booking-request';
import { useMockBookingRequestStore } from '@/pinia/booking-request/booking-request.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { createTestingPinia } from '@pinia/testing';
import helpers from '@/ui/helpers/helpers';

import Component from './BookingRequestsTable.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
let personStore = useMockPersonStore(pinia).personStore;
let eventStore = useMockEventStore(pinia).eventStore;
let householdStore = useMockHouseholdStore(pinia).householdStore;
let bookingStore = useMockBookingRequestStore(pinia).bookingRequestStore;
let caseFileStore = useMockCaseFileStore(pinia).caseFileStore;

describe('BookingRequestsTable.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,

      },
    });
    await flushPromises();
  };

  beforeEach(async () => {
    personStore = useMockPersonStore(pinia).personStore;
    eventStore = useMockEventStore(pinia).eventStore;
    householdStore = useMockHouseholdStore(pinia).householdStore;
    bookingStore = useMockBookingRequestStore(pinia).bookingRequestStore;
    caseFileStore = useMockCaseFileStore(pinia).caseFileStore;

    await mountWrapper(false);
  });

  describe('Computed', () => {
    describe('tableData', () => {
      it('should return the mapped objects from the different stores', async () => {
        const result = wrapper.vm.tableData;
        expect(bookingStore.getByIdsWithPinnedItems).toHaveBeenCalledWith(wrapper.vm.searchResultIds, { baseDate: wrapper.vm.searchExecutionDate });

        const firstItem = bookingStore.getByIdsWithPinnedItems()[0];
        expect(householdStore.getById).toHaveBeenCalledWith(firstItem.householdId);
        expect(personStore.getById).toHaveBeenCalledWith(householdStore.getById().primaryBeneficiary);
        expect(caseFileStore.getById).toHaveBeenCalledWith(firstItem.caseFileId);
        expect(eventStore.getById).toHaveBeenCalledWith(caseFileStore.getById().eventId);
        expect(result.length).toBe(3);
        expect(result[0]).toEqual({
          ...firstItem,
          caseFileNumber: caseFileStore.getById().caseFileNumber,
          eventName: wrapper.vm.$m(eventStore.getById().name),
          primaryMemberName: 'Bob Smith',
          roomOptionsStr: 'Baby bed, Elevator',
        });
      });
    });

    describe('labels', () => {
      it('returns the right labels', async () => {
        expect(wrapper.vm.labels)
          .toEqual({
            header: {
              title: 'bookingRequests.title',
              searchPlaceholder: 'common.inputs.quick_search',
            },
          });
      });
    });

    describe('customColumns', () => {
      it('returns the right columns', () => {
        expect(wrapper.vm.customColumns).toEqual({
          caseFileNumber: 'Metadata/CaseFileNumber',
          primaryMemberName: 'Metadata/PrimaryMemberName',
          eventName: 'Metadata/EventName/Translation/en',
          numberOfRooms: 'Entity/NumberOfRooms',
          checkIn: 'Entity/CheckIn',
          checkOut: 'Entity/CheckOut',
          roomOptions: 'Metadata/RoomOptionStr/Translation/en',
          action: 'action',
        });
      });
    });

    describe('headers', () => {
      test('they are defined correctly', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'bookingRequest.caseFileNumber',
            sortable: true,
            value: wrapper.vm.customColumns.caseFileNumber,
          },
          {
            text: 'bookingRequest.primaryMemberName',
            value: wrapper.vm.customColumns.primaryMemberName,
            sortable: true,
          },
          {
            text: 'bookingRequest.eventName',
            value: wrapper.vm.customColumns.eventName,
            sortable: true,
          },
          {
            text: 'bookingRequest.numberOfRooms',
            value: wrapper.vm.customColumns.numberOfRooms,
            sortable: true,
          },
          {
            text: 'bookingRequest.checkIn',
            value: wrapper.vm.customColumns.checkIn,
            sortable: true,
          },
          {
            text: 'bookingRequest.checkOut',
            value: wrapper.vm.customColumns.checkOut,
            sortable: true,
          },
          {
            text: 'bookingRequest.roomOptions',
            value: wrapper.vm.customColumns.roomOptions,
            sortable: false,
          },
          {
            text: '',
            value: wrapper.vm.customColumns.action,
            sortable: false,
          },
        ]);
      });
    });

    describe('filters', () => {
      it('returns the right filters', async () => {
        expect(wrapper.vm.filters)
          .toEqual([{ items: [],
            key: 'Metadata/EventId',
            keyType: 'guid',
            label: 'bookingRequest.eventName',
            loading: false,
            props: { 'no-data-text': 'common.inputs.start_typing_to_search',
              'no-filter': true,
              placeholder: 'common.filters.autocomplete.placeholder',
              'return-object': true,
              'search-input': null },
            type: 'select' },
          { dateMode: 'static', key: 'Entity/CheckIn', label: 'bookingRequest.checkIn', type: 'date' },
          { dateMode: 'static', key: 'Entity/CheckOut', label: 'bookingRequest.checkOut', type: 'date' }]);
      });
    });
  });

  describe('Methods', () => {
    describe('getCaseFileDetailsRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getCaseFileDetailsRoute(bookingStore.getById()))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: {
              id: bookingStore.getById().caseFileId,
            },
          });
      });
    });

    describe('getHouseholdProfileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getHouseholdProfileRoute(bookingStore.getById()))
          .toEqual({
            name: routes.household.householdProfile.name,
            params: {
              id: bookingStore.getById().householdId,
            },
          });
      });
    });

    describe('fetchData', () => {
      const params = {
        filter: { f: 'filter' }, top: 10, skip: 20, orderBy: 'name asc',
      };

      it('should call storage actions with proper parameters', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchData(params);
        expect(bookingStore.search).toHaveBeenCalledWith({ params: {
          filter: { f: 'filter', 'Entity/State': helpers.getEnumKeyText(BookingRequestState, BookingRequestState.Pending) },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        } });
        const items = bookingStore.search().values;
        expect(householdStore.fetchByIds).toHaveBeenCalledWith(items.map((x) => x.householdId), true);
        expect(personStore.fetchByIds).toHaveBeenCalledWith(householdStore.fetchByIds().map((x) => x.primaryBeneficiary), true);
        expect(caseFileStore.fetchByIds).toHaveBeenCalledWith(items.map((x) => x.caseFileId), true);
        expect(eventStore.fetchByIds).toHaveBeenCalledWith(caseFileStore.fetchByIds().map((x) => x.eventId), true);
      });
    });
  });
});
