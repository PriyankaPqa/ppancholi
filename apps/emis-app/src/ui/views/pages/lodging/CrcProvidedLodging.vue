<template>
  <div v-if="bookings.length">
    <v-row v-for="(booking, index) in bookings" :key="bookings[0].address.addressType + '_' + booking.uniqueNb">
      <v-col cols="11" class="rc-heading-5 mb-2 d-flex">
        <div class="pr-4">
          {{ $t('bookingRequest.roomNumber', { index: index + 1 }) }}
        </div>
        <v-divider vertical />
        <div class="pl-4">
          <v-checkbox
            v-model="booking.address.takeover"
            class="mt-0"
            :label="$t('bookingRequest.takeover')"
            hide-details />
        </div>
      </v-col>
      <v-col cols="1" class="float-right">
        <v-btn
          v-if="index > 0"
          icon
          @click="removeRoom(booking)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" class="grey-container pa-4">
        <v-row>
          <validation-provider v-slot="{ errors }" class="cb-validation" :rules="{ required: { messageKey: 'bookingRequest.mustSelectIndividuals' } }">
            <!-- there are no v-checkbox-group - this does the same for error handling-->
            <v-radio-group :error-messages="errors" row class="ma-0 pa-0">
              <v-col cols="12" class="pb-0">
                <div class="fw-bold">
                  {{ $t('bookingRequest.individualsToOccupyRoom') }}
                </div>
              </v-col>
              <v-col v-for="individual in peopleToLodge" :key="individual.caseFileIndividualId" lg="3" md="4" sm="6" class="pb-0">
                <v-checkbox
                  v-model="booking.peopleInRoom"
                  class="mt-0"
                  :label="individual.identitySet.firstName + ' ' + individual.identitySet.lastName"
                  :value="individual.caseFileIndividualId"
                  :disabled="isMemberAlreadySelected(booking, individual.caseFileIndividualId)"
                  hide-details />
              </v-col>
            </v-radio-group>
          </validation-provider>
        </v-row>
        <v-row>
          <v-col cols="3" class="pb-0">
            <v-text-field-with-validation
              v-model="booking.nightlyRate"
              data-test="nightly-rate"
              autocomplete="off"
              background-color="white"
              :rules="{ required: true, numeric: true }"
              :label="`${$t('bookingRequest.nightlyRate')} *`" />
          </v-col>
          <v-col cols="3" class="pb-0">
            <v-text-field-with-validation
              v-model="booking.confirmationNumber"
              data-test="confirmation-number"
              autocomplete="off"
              background-color="white"
              :rules="{ max: MAX_LENGTH_SM }"
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
          :current-address-type-items="[]"
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
      </v-col>
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
  </div>
</template>

<script lang='ts'>
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Status } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { RoomOption, RoomType, IBooking } from '@libs/entities-lib/booking-request';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import { differenceInDays, parseISO } from 'date-fns';
import mixins from 'vue-typed-mixins';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { FinancialAssistancePaymentEntity, IFinancialAssistancePaymentEntity, PayeeType } from '@libs/entities-lib/financial-assistance-payment';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';

export interface ICrcProvidedLodging {
  generatePayment(): IFinancialAssistancePaymentEntity;
  isMemberAlreadySelected(booking: IBooking, id: string): boolean;
  addRoom(): void;
}

export default mixins(caseFileDetail).extend({
  name: 'CrcProvidedLodging',

  components: {
    RcDialog,
    CurrentAddressForm,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    ReviewBookingRequest,
    RationaleDialog,
    VSelectWithValidation,
  },

  props: {
    addressType: {
      type: Number as () => ECurrentAddressTypes,
      required: true,
    },
    defaultAmount: {
      type: Number,
      required: true,
    },
    bookings: {
      type: Array as () => IBooking[],
      required: true,
    },
    program: {
      type: Object as () => IProgramEntity,
      required: true,
    },
    tableId: {
      type: String,
      required: true,
    },
    peopleToLodge: {
      type: Array as () => (IMemberEntity & { caseFileIndividualId: string })[],
      required: true,
    },
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      RoomType,
      RoomOption,
      helpers,
      uniqueNb: 0,
      showSelectTable: false,
      MAX_LENGTH_SM,
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
  },

  async mounted() {
    this.addRoom();
    await this.loadMissingCaseFileDetails();
  },

  methods: {
    addRoom() {
      const address = new CurrentAddress();
      this.uniqueNb += 1;
      address.reset(this.addressType);
      this.bookings.push({ address, peopleInRoom: [], confirmationNumber: '', nightlyRate: this.defaultAmount, numberOfNights: null, uniqueNb: this.uniqueNb });
    },

    removeRoom(booking: IBooking) {
      this.bookings.splice(this.bookings.indexOf(booking), 1);
    },

    setCurrentAddress(form: CurrentAddress, index: number) {
      this.bookings[index].address = form;
      this.bookings[index].numberOfNights = form.checkOut && form.checkIn
        ? (differenceInDays(parseISO(`${form.checkOut}Z`), parseISO(`${form.checkIn}Z`)) || 1) : null;
    },

    isMemberAlreadySelected(booking: IBooking, id: string) {
      return !!this.bookings.find((b) => b !== booking && b.peopleInRoom.indexOf(id) > -1);
    },

    generatePayment() : IFinancialAssistancePaymentEntity {
      const paymentPayload = {
        caseFileId: this.caseFileId,
        description: this.$t(
          'bookingRequest.paymentDescription',
          {
            nightlyRate: [...new Set(this.bookings.map((b) => b.nightlyRate))].join(', '),
            numberOfNights: this.bookings.map((b) => b.numberOfNights).reduce((a, b) => a + b),
            numberOfRooms: this.bookings.length,
          },
        ),
        financialAssistanceTableId: this.tableId,
        groups: [
          {
            groupingInformation: {
              modality: this.program.paymentModalities[0],
              payeeType: PayeeType.Individual,
              payeeName: `${this.primaryMember.identitySet.firstName} ${this.primaryMember.identitySet.lastName}`,
            },
            lines: [
              {
                amount: this.bookings.map((b) => b.numberOfNights * b.nightlyRate).reduce((a, b) => a + b),
                mainCategoryId: useFinancialAssistanceStore().mainItems[0].mainCategory.id,
                relatedNumber: [...new Set(this.bookings.map((b) => b.confirmationNumber).filter((x) => x))].join(', '),
                subCategoryId: useFinancialAssistanceStore().mainItems[0].subItems[0].subCategory.id,
                status: Status.Active,
              },
            ],
          } as any,
        ],
      } as IFinancialAssistancePaymentEntity;

      FinancialAssistancePaymentEntity.generateName(
        { payment: paymentPayload, items: useFinancialAssistanceStore().mainItems, keepCurrentDate: false, program: this.program },
        this,
      );
      return paymentPayload;
    },
  },

});

</script>

<style scoped lang="scss">
  .cb-validation {
    width: 100%;
  }
  ::v-deep .cb-validation .error--text {
    padding-left: 16px;
    padding-bottom: 4px;
  }
</style>
