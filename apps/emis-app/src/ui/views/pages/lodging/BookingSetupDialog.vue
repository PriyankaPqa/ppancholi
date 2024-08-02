<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('bookingRequest.submitBookingRequest')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('bookingRequest.submit')"
      :submit-button-disabled="failed || loading"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      content-padding="10"
      data-test="booking-request-dialog"
      @cancel="$emit('close');"
      @close="$emit('close');"
      @submit="onSubmit">
      <div class="px-16 mx-8">
        <v-row justify="center" no-gutters>
          <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
            <v-row>
              <v-col cols="12" sm="6" md="8">
                <v-select-with-validation
                  ref="addressType"
                  background-color="white"
                  :value="bookings[0].address.addressType"
                  rules="required"
                  item-value="value"
                  :data-test="'currentAddressType'"
                  :label="`${$t('registration.addresses.addressType')} *`"
                  :items="currentAddressTypeItems"
                  @change="changeType($event)" />
              </v-col>
            </v-row>
            <v-row>
              <div class="rc-heading-5">
                {{ $t('bookingRequest.initialRequest') }}
              </div>
            </v-row>
            <v-row>
              <review-booking-request :id="bookingRequest.caseFileId" :booking-request="bookingRequest" />
            </v-row>
            <v-row v-for="(booking, index) in bookings" :key="index">
              <div class="rc-heading-5 mt-4 mb-2">
                {{ $t('bookingRequest.roomNumber', { index: index + 1 }) }}
              </div>
              <div class="grey-container pa-4">
                <v-row>
                  <v-col cols="3" class="pb-0">
                    <v-text-field-with-validation
                      v-model="booking.estimatedAmount"
                      data-test="estimated-amount"
                      autocomplete="off"
                      background-color="white"
                      :rules="{ required: true, numeric: true }"
                      :label="`${$t('bookingRequest.estimatedAmount')} *`" />
                  </v-col>
                  <v-col cols="3" class="pb-0">
                    <v-text-field-with-validation
                      v-model="booking.confirmationNumber"
                      data-test="confirmation-number"
                      autocomplete="off"
                      background-color="white"
                      :rules="{ numeric: true }"
                      :label="`${$t('bookingRequest.confirmationNumber')}`" />
                  </v-col>
                  <v-col cols="3" class="pb-0">
                    <v-text-field-with-validation
                      v-model="booking.numberOfNights"
                      disabled
                      data-test="number-of-rooms"
                      autocomplete="off"
                      background-color="white"
                      :label="`${$t('bookingRequest.numberOfNights')} *`" />
                  </v-col>
                  <v-col cols="3" class="pb-0">
                    <v-text-field-with-validation
                      v-model="bookings.length"
                      disabled
                      data-test="number-of-rooms"
                      autocomplete="off"
                      background-color="white"
                      :label="`${$t('bookingRequest.numberOfRooms')} *`" />
                  </v-col>
                </v-row>

                <current-address-form
                  :shelter-locations="shelterLocations"
                  :canadian-provinces-items="canadianProvincesItems"
                  :current-address-type-items="currentAddressTypeItems"
                  :no-fixed-home="false"
                  :api-key="apiKey"
                  :disable-autocomplete="false"
                  :current-address="booking.address"
                  lock-crc-provided
                  booking-mode
                  hide-title
                  compact-view
                  show-crc-provided-and-check-in-check-out
                  @change="setCurrentAddress($event, index)" />
              </div>
            </v-row>
            <v-row>
              <v-col>
                <v-btn class="secondary" @click="addRoom()">
                  <v-icon class="mr-2">
                    mdi-plus
                  </v-icon>
                  {{ $t('bookingRequest.addRoom') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
} from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType } from '@libs/entities-lib/booking-request';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';

interface IBooking {
  estimatedAmount: number,
  confirmationNumber: string,
  numberOfNights: number,
  peopleInRoom: string[],
  address: CurrentAddress,
}

export default mixins(caseFileDetail).extend({
  name: 'BookingSetupDialog',

  components: {
    RcDialog,
    CurrentAddressForm,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    ReviewBookingRequest,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    bookingRequest: {
      type: Object as () => IBookingRequest,
      required: true,
    },
  },

  setup() {
    const { getCurrentAddressTypeItems } = useAddresses();
    return {
      getCurrentAddressTypeItems,
    };
  },

  data() {
    const address = new CurrentAddress();
    address.reset(ECurrentAddressTypes.HotelMotel);
    return {
      bookings: [{ address }] as IBooking[],
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      loading: false,
      RoomType,
      RoomOption,
      helpers,
    };
  },

  computed: {
    shelterLocations(): IEventGenericLocation[] {
      const locations = this.event?.shelterLocations || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, false, !!this.shelterLocations.length, true);
    },
  },

  mounted() {
    this.changeType(ECurrentAddressTypes.HotelMotel);
  },

  methods: {
    addRoom() {
      const address = new CurrentAddress();
      address.reset(ECurrentAddressTypes.HotelMotel);
      this.bookings.push({ address } as IBooking);
    },

    changeType(type: ECurrentAddressTypes) {
      for (let i = 0; i < this.bookings.length; i += 1) {
        this.bookings[i].address.reset(type);
      }
      (this.$refs.form as VForm).reset();
    },

    setCurrentAddress(form: CurrentAddress, index: number) {
      this.bookings[index].address = form;
      this.bookings[index].numberOfNights = form.checkOut && form.checkIn && form.checkOut >= form.checkIn ? 2 : null;
      this.$forceUpdate();
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        // this.loading = true;
        // const params = {
        //   ...this.bookingRequest, ...this.address, shelterLocationId: this.address.shelterLocation?.id, caseFileId: this.caseFileId, householdId: this.household.id,
        // } as IBookingRequest;
        // const res = await useBookingRequestStore().createBookingRequest(params);
        // if (res) {
          this.$emit('update:show', false);
        // }
      }
    },
  },

});

</script>
