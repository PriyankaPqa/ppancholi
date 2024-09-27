import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockBookingRequest } from '@libs/entities-lib/booking-request';
import { mockEventEntity } from '@libs/entities-lib/event';
import Component from './ReviewBookingRequest.vue';

const localVue = createLocalVue();

const bookingRequest = mockBookingRequest();
bookingRequest.address.streetAddress = null;

describe('ReviewBookingRequest.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      computed: {
        event() {
          return mockEventEntity();
        },
      },
      propsData: {
        bookingRequest,
        id: 'cf-id',
      },
    });
  };

  beforeEach(async () => {
    await mountWrapper(false);
  });

  describe('Computed', () => {
    describe('requestData', () => {
      it('should return the labels and values', async () => {
        let result = wrapper.vm.requestData;

        expect(result.length).toBe(3);
        expect(result[0]).toEqual(
          [
            { data: 'common.yes', label: 'bookingRequest.isProvidedByCrc' },
            { data: 'registration.addresses.temporaryAddressTypes.HotelMotel', label: 'bookingRequest.addressType' },
            { data: 'May 1, 2023', label: 'bookingRequest.checkIn' },
            { data: 'May 31, 2023', label: 'bookingRequest.checkOut' },
            { data: 'Ottawa, ON, K1W 1G7, Canada', label: 'bookingRequest.address' },
          ],
        );

        expect(result[1]).toEqual(
          [
            { data: 3, label: 'bookingRequest.numberOfAdults' },
            { data: 2, label: 'bookingRequest.numberOfChildren' },
            { data: 2, label: 'bookingRequest.numberOfRooms' },
            { data: '2 beds (standard)', label: 'bookingRequest.roomType' },
            { data: 'Baby bed, Elevator', label: 'bookingRequest.roomOptions' },
          ],
        );

        expect(result[2]).toEqual([{ data: 'some notes', label: 'bookingRequest.notes' }]);

        await wrapper.setProps({ bookingRequest: { ...bookingRequest, shelterLocationId: mockEventEntity().shelterLocations[0].id } });
        result = wrapper.vm.requestData;

        expect(result.length).toBe(3);
        expect(result[0]).toEqual(
          [
            { data: 'common.yes', label: 'bookingRequest.isProvidedByCrc' },
            { data: 'registration.addresses.temporaryAddressTypes.HotelMotel', label: 'bookingRequest.addressType' },
            { data: 'May 1, 2023', label: 'bookingRequest.checkIn' },
            { data: 'May 31, 2023', label: 'bookingRequest.checkOut' },
            { data: 'shelter en', label: 'bookingRequest.address' },
          ],
        );
      });
    });
  });
});
