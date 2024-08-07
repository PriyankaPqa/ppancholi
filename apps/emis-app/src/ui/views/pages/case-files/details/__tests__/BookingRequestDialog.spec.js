import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockBookingRequestStore } from '@/pinia/booking-request/booking-request.mock';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import helpers from '@libs/entities-lib/helpers';
import Component from '../case-file-impacted-individualsV2/components/BookingRequestDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, bookingRequestStore } = useMockBookingRequestStore();
useMockCaseFileStore(pinia);
useMockHouseholdStore(pinia);

const mockShelters = [{
  id: '7c076603-580a-4400-bef2-5ddececb5555',
  name: {
    translation: {
      en: 'YMCA Gym',
      fr: 'Gymnase du YMCA',
    },
  },
  status: 1,
  address: {
    country: 'CA',
    streetAddress: 'Pioneer Street',
    unitSuite: null,
    province: ECanadaProvinces.BC,
    city: 'Pemberton',
    postalCode: 'V0N 1L0',
  },
},
{
  id: '7c076603-580a-4400-bef2-5ddecec123321',
  name: {
    translation: {
      en: 'YMCA school',
      fr: 'Gymnase du CBC',
    },
  },
  status: 2,
  address: {
    country: 'CA',
    streetAddress: 'Pioneer Street',
    unitSuite: null,
    province: ECanadaProvinces.BC,
    city: 'Pemberton',
    postalCode: 'V0N 1L0',
  },
}];

let featureList = [];

describe('BookingRequestDialog.vue', () => {
  let wrapper;
  const doMount = async (fullMount = false, level = 5, additionalOverwrites = {}, additionalComputeds = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      featureList,
      propsData: {
        id: 'cf-id',
        shelterLocationsList: mockShelters,
        show: true,
      },
      data() {
        return {
          apiKey: 'google-api-key',
        };
      },
      computed: {
        ...additionalComputeds,
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    featureList = [];
    jest.clearAllMocks();
    await doMount();
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('sets up the address details', async () => {
        expect(wrapper.vm.address.bookingRequestMode).toBeTruthy();
        expect(wrapper.vm.address.addressType).toEqual(ECurrentAddressTypes.HotelMotel);
      });
    });
  });

  describe('computed', () => {
    describe('shelterLocations', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.shelterLocations).toEqual([mockShelters[0]]);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(wrapper.vm.$i18n));
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.currentAddressTypeItems).toEqual(wrapper.vm.getCurrentAddressTypeItems(wrapper.vm.$i18n, false, true, true));
      });
    });
  });

  describe('methods', () => {
    describe('onSubmit', () => {
      it('calls store if valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(bookingRequestStore.createBookingRequest).not.toHaveBeenCalled();

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(bookingRequestStore.createBookingRequest).toHaveBeenCalledWith(
          {
            address: {
              city: null,
              country: 'CA',
              latitude: 0,
              longitude: 0,
              postalCode: null,
              province: null,
              specifiedOtherProvince: null,
              streetAddress: null,
              unitSuite: null,
            },
            addressType: 4,
            bookingRequestMode: true,
            caseFileId: 'cf-id',
            checkIn: null,
            checkOut: null,
            crcProvided: true,
            householdId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            placeName: '',
            placeNumber: '',
            roomOptions: [],
            roomTypes: [],
            shelterLocation: null,
            state: 1,
            takeover: false,
          },
        );
      });
    });
  });
});
