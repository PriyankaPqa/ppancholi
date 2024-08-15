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
            <current-address-form
              :shelter-locations="shelterLocations"
              :canadian-provinces-items="canadianProvincesItems"
              :current-address-type-items="currentAddressTypeItems"
              :no-fixed-home="false"
              :api-key="apiKey"
              :disable-autocomplete="false"
              compact-view
              :current-address="address"
              lock-crc-provided
              show-crc-provided-and-check-in-check-out
              @change="setCurrentAddress($event)" />

            <v-row>
              <v-col cols="4">
                <v-text-field-with-validation
                  v-model="bookingRequest.numberOfAdults"
                  data-test="number-of-adults"
                  autocomplete="off"
                  :rules="{ required: true, numeric: true }"
                  :label="`${$t('bookingRequest.numberOfAdults')} *`" />
              </v-col>
              <v-col cols="4">
                <v-text-field-with-validation
                  v-model="bookingRequest.numberOfChildren"
                  data-test="number-of-children"
                  autocomplete="off"
                  :rules="{ numeric: true }"
                  :label="`${$t('bookingRequest.numberOfChildren')}`" />
              </v-col>
              <v-col cols="4">
                <v-text-field-with-validation
                  v-model="bookingRequest.numberOfRooms"
                  data-test="number-of-rooms"
                  autocomplete="off"
                  :rules="{ required: true, numeric: true }"
                  :label="`${$t('bookingRequest.numberOfRooms')} *`" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <validation-provider v-slot="{ errors }" :rules="{ required: true }">
                  <!-- there are no v-checkbox-group - this does the same for error handling-->
                  <v-radio-group :error-messages="errors" class="ma-0 pa-0">
                    {{ $t('bookingRequest.roomType') }}*
                    <div class="grey-container pa-2">
                      <div v-for="item in helpers.enumToTranslatedCollection(RoomType, 'enums.RoomType', $i18n)" :key="item.value">
                        <v-checkbox
                          v-model="bookingRequest.roomTypes"
                          dense
                          hide-details
                          data-test="roomTypes"
                          :label="item.text"
                          :value="item.value" />
                      </div>
                    </div>
                  </v-radio-group>
                </validation-provider>
              </v-col>
              <v-col cols="6">
                {{ $t('bookingRequest.roomOptions') }}
                <div class="grey-container pa-2">
                  <div v-for="item in helpers.enumToTranslatedCollection(RoomOption, 'enums.RoomOption', $i18n)" :key="item.value">
                    <v-checkbox
                      v-model="bookingRequest.roomOptions"
                      dense
                      hide-details
                      data-test="roomOptions"
                      :label="item.text"
                      :value="item.value" />
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-area-with-validation
                  v-model="bookingRequest.notes"
                  data-test="notes"
                  :rules="{ required: true, max: MAX_LENGTH_LG }"
                  :label="`${$t('bookingRequest.notes')} *`"
                  rows="3" />
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
import { BookingRequestState, IBookingRequest, RoomOption, RoomType } from '@libs/entities-lib/booking-request';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import mixins from 'vue-typed-mixins';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'BookingRequestDialog',

  components: {
    RcDialog,
    CurrentAddressForm,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IEventGenericLocation[],
      default: null,
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
    address.setBookingRequestMode();
    const bookingRequest = {
      roomOptions: [],
      roomTypes: [],
      state: BookingRequestState.Pending,
    } as IBookingRequest;
    return {
      address,
      bookingRequest,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      loading: false,
      RoomType,
      RoomOption,
      helpers,
      MAX_LENGTH_LG,
    };
  },

  computed: {
    shelterLocations(): IEventGenericLocation[] {
      const locations = this.shelterLocationsList || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, false, !!this.shelterLocations.length, 'CrcProvidedOnly');
    },
  },

  methods: {
    setCurrentAddress(form: CurrentAddress) {
      this.address = form;
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.loading = true;
        const params = {
          ...this.bookingRequest, ...this.address, shelterLocationId: this.address.shelterLocation?.id, caseFileId: this.caseFileId, householdId: this.household.id,
        } as IBookingRequest;
        if (params.addressType === ECurrentAddressTypes.Other || params.addressType === ECurrentAddressTypes.Shelter) {
          params.address = null;
        }
        const res = await useBookingRequestStore().createBookingRequest(params);
        if (res) {
          this.$emit('update:show', false);
        }
      }
    },
  },

});

</script>
