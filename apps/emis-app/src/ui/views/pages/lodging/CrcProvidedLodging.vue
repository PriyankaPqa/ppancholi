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
            :disabled="lodgingMode === LodgingMode.ExtendStay || lodgingMode === LodgingMode.EditCrcProvidedAsNonLodging"
            :label="$t('bookingRequest.takeover')"
            hide-details />
        </div>
      </v-col>
      <v-col cols="1" class="float-right">
        <v-btn
          v-if="index > 0 && !isEditOfAddress"
          icon
          @click="removeRoom(booking)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" class="grey-container pa-4">
        <v-row :class="program ? '' : 'pb-4'">
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
                  :disabled="isEditOfAddress || isMemberAlreadySelected(booking, individual.caseFileIndividualId)"
                  hide-details />
              </v-col>
            </v-radio-group>
          </validation-provider>
        </v-row>
        <v-row v-if="program">
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
          <v-col cols="3" class="pb-0 fw-bold">
            <div>{{ $t('bookingRequest.numberOfNights') }}:</div>
            <div>{{ booking.numberOfNights }}</div>
          </v-col>
          <v-col cols="3" class="pb-0 fw-bold">
            <div>{{ $t('bookingRequest.numberOfRooms') }}:</div>
            <div>{{ bookings.length }}</div>
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
          :extend-stay-mode="lodgingMode === LodgingMode.ExtendStay"
          :room-edit-mode="lodgingMode === LodgingMode.EditCrcProvidedAsNonLodging"
          lock-crc-provided
          booking-mode
          hide-title
          compact-view
          show-crc-provided-and-check-in-check-out
          @change="setCurrentAddress($event, index)" />
      </v-col>
    </v-row>
    <v-row v-if="!isEditOfAddress">
      <v-col>
        <v-btn class="secondary" @click="addRoom()">
          <v-icon class="mr-2">
            mdi-plus
          </v-icon>
          {{ $t('bookingRequest.addRoom') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-card v-if="program" outlined class="mt-8 pa-4 text-right rc-heading-5">
      {{ $t('bookingRequest.totalEstimatedAmount') }}: {{ $formatCurrency(currentAmount) }}
    </v-card>
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
import { IMemberForSelection } from '@libs/entities-lib/value-objects/member';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import { differenceInDays, parseISO } from 'date-fns';
import mixins from 'vue-typed-mixins';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { FinancialAssistancePaymentEntity, IFinancialAssistancePaymentEntity, PayeeType } from '@libs/entities-lib/financial-assistance-payment';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';
import { LodgingMode, isEditMode } from './bookingHelper';

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
    lodgingMode: {
      type: Number as () => LodgingMode,
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
      required: false,
    },
    tableId: {
      type: String,
      required: false,
    },
    peopleToLodge: {
      type: Array as () => IMemberForSelection[],
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
      MAX_LENGTH_SM,
      LodgingMode,
    };
  },

  computed: {
    isEditOfAddress(): boolean {
      return isEditMode(this.lodgingMode);
    },

    shelterLocations(): IEventGenericLocation[] {
      const locations = this.event?.shelterLocations || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAmount(): number {
      return this.bookings.map((b) => b.numberOfNights * b.nightlyRate).reduce((a, b) => a + b);
    },
  },

  async mounted() {
    this.addRoom(true);
    await this.loadMissingCaseFileDetails();
  },

  methods: {
    addRoom(ifEmptyOnly = false) {
      if (ifEmptyOnly && this.bookings.length) {
        return;
      }
      const address = new CurrentAddress();
      this.uniqueNb += 1;
      address.reset(this.addressType);
      address.crcProvided = true;
      if (address.hasPlaceNumber() || address.requiresShelterLocation()) {
        address.placeNumber = this.$t('bookingRequest.roomNumber', { index: this.bookings.length + 1 }) as string;
      }
      this.bookings.push({ address, peopleInRoom: [], confirmationNumber: '', nightlyRate: this.defaultAmount, numberOfNights: null, uniqueNb: this.uniqueNb });
    },

    removeRoom(booking: IBooking) {
      this.bookings.splice(this.bookings.indexOf(booking), 1);
    },

    setCurrentAddress(form: CurrentAddress, index: number) {
      this.bookings[index].address = form;
      if ((form.hasPlaceNumber() || form.requiresShelterLocation()) && !form.placeNumber) {
        form.placeNumber = this.$t('bookingRequest.roomNumber', { index: index + 1 }) as string;
      }

      if (this.lodgingMode !== LodgingMode.ExtendStay) {
        this.bookings[index].numberOfNights = form.checkOut && form.checkIn
          ? (differenceInDays(parseISO(`${form.checkOut}Z`), parseISO(`${form.checkIn}Z`)) || 1) : null;
      } else {
        this.bookings[index].numberOfNights = form.checkOut && this.bookings[index].originalCheckoutDate
        ? differenceInDays(parseISO(`${form.checkOut}Z`), parseISO(`${this.bookings[index].originalCheckoutDate}Z`)) : null;
      }
    },

    isMemberAlreadySelected(booking: IBooking, id: string) {
      return !!this.bookings.find((b) => b !== booking && b.peopleInRoom.indexOf(id) > -1);
    },

    generatePayment() : IFinancialAssistancePaymentEntity {
      if (this.currentAmount === 0 || !this.program) {
        return null;
      }
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
                amount: this.currentAmount,
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
