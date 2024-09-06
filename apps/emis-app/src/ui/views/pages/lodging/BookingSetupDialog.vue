<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.buttons.confirm')"
      :submit-button-disabled="failed || loading"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      :loading="loading"
      fullscreen
      content-padding="10"
      data-test="booking-request-dialog"
      @cancel="$emit('close');"
      @close="$emit('close');"
      @submit="onSubmit">
      <div v-if="!loading" class="px-16 mx-8">
        <v-row justify="center" no-gutters>
          <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
            <template v-if="lodgingMode !== LodgingMode.BookingMode && lodgingMode !== LodgingMode.ExtendStay">
              <v-row>
                <v-col cols="12">
                  <div class="rc-heading-5">
                    {{ isEditOfAddress ? $t('impactedIndividuals.selectedMembersToEdit') : $t('impactedIndividuals.selectedMembersToMove') }}
                  </div>
                </v-col>
                <v-col cols="12" class="grey-container">
                  <div v-for="individual in peopleToLodge" :key="individual.caseFileIndividualId" class="d-flex">
                    <div class="mr-auto my-1">
                      {{ individual.identitySet.firstName + ' ' + individual.identitySet.lastName }}
                    </div>
                    <v-chip
                      v-if="individual.isPrimary"
                      class="px-2"
                      small
                      label
                      color="white"
                      text-color="grey-darken"
                      data-test="primary_member_label">
                      <v-icon color="secondary" small class="mr-1">
                        mdi-account
                      </v-icon>
                      <span class="text-uppercase"> {{ $t('household.profile.member.primary_member') }} </span>
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </template>

            <template v-if="bookingRequest">
              <v-row>
                <v-col cols="12" class="d-flex justify-space-between">
                  <div class="rc-heading-5">
                    {{ $t('bookingRequest.initialRequest') }}
                  </div>
                  <div>
                    <v-btn @click="rejectBooking">
                      <v-icon class="pr-2">
                        mdi-close-box-outline
                      </v-icon>
                      {{ $t('bookingRequest.rejectRequest') }}
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <review-booking-request :id="bookingRequest.caseFileId" :booking-request="bookingRequest" />
              </v-row>
            </template>

            <template v-if="lodgingMode === LodgingMode.MoveCrcProvidedAllowed || lodgingMode === LodgingMode.MoveCrcProvidedNotAllowed">
              <v-row class="mt-8">
                <validation-provider v-slot="{ errors }" class="cb-validation" :rules="{ required: moveIntoExistingAddress == null }">
                  <v-col cols="12" sm="6" md="8">
                    <div class="font-weight-bold ">
                      {{ $t('impactedIndividuals.moveIntoExistingAddress') }}
                    </div>
                    <div>
                      <v-radio-group
                        v-model="moveIntoExistingAddress"
                        :error-messages="errors"
                        row
                        hide-details>
                        <v-radio :label="$t('common.yes')" :value="true" data-test="moveIntoExistingAddress_yes" />
                        <v-radio :label="$t('common.no')" :value="false" data-test="moveIntoExistingAddress_no" />
                      </v-radio-group>
                    </div>
                  </v-col>
                </validation-provider>
              </v-row>
            </template>

            <template v-if="moveIntoExistingAddress === true">
              <div class="mt-8">
                <validation-provider v-slot="{ errors }" class="cb-validation" rules="required">
                  <v-radio-group
                    v-model="existingAddress"
                    :error-messages="errors"
                    hide-details>
                    <v-row v-for="(address, index) in uniqueAddresses" :key="index">
                      <v-col cols="1" class="d-flex justify-center">
                        <v-radio :value="address" :data-test="'moveIntoExistingAddress_' + index" />
                      </v-col>
                      <v-col cols="11">
                        <impacted-individual-address-template-v2
                          :address="address"
                          :shelter-locations-list="shelterLocations"
                          full-width-read-only-view
                          is-previous-temporary-address />
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </validation-provider>
              </div>
            </template>

            <template v-if="moveIntoExistingAddress === false">
              <v-row v-if="lodgingMode !== LodgingMode.ExtendStay" class="mt-8">
                <v-col cols="12">
                  <div class="rc-heading-5">
                    {{ isEditOfAddress ? $t('impactedIndividuals.editedAddress') : $t('impactedIndividuals.newAddress') }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="8">
                  <v-select-with-validation
                    v-model="addressType"
                    background-color="white"
                    rules="required"
                    hide-details
                    item-value="value"
                    :disabled="isEditOfAddress"
                    :data-test="'currentAddressType'"
                    :label="`${$t('registration.addresses.addressType')} *`"
                    :items="currentAddressTypeItems"
                    @change="changeType(true)" />
                </v-col>
              </v-row>
              <v-row v-if="showCrcProvidedSelection">
                <validation-provider v-slot="{ errors }" class="cb-validation" :rules="{ required: isCrcProvided == null }">
                  <v-col cols="12" sm="6" md="8">
                    <div class="font-weight-bold ">
                      {{ $t('impactedIndividuals.temporary_address.edit.crc_provided_title') }}
                    </div>
                    <div class="pb-8">
                      <v-radio-group
                        v-model="isCrcProvided"
                        :error-messages="errors"
                        :disabled="lockCrcProvided"
                        row
                        hide-details
                        @change="changeType(false)">
                        <v-radio :label="$t('common.yes')" :value="true" data-test="CRC_provided_yes" />
                        <v-radio :label="$t('common.no')" :value="false" data-test="CRC_provided_no" />
                      </v-radio-group>
                    </div>
                  </v-col>
                </validation-provider>
              </v-row>
              <crc-provided-lodging
                v-if="isCrcProvided && (!mayTriggerPayment || selectedPaymentDetails && !showSelectPaymentDetails) && addressType"
                :id="caseFileId"
                ref="crcProvidedLodging"
                :address-type="addressType"
                :default-amount="defaultAmount"
                :bookings="bookings"
                :lodging-mode="lodgingMode"
                :people-to-lodge="peopleToLodge"
                :program="selectedPaymentDetails ? selectedPaymentDetails.program : null"
                :table-id="selectedPaymentDetails ? selectedPaymentDetails.table.id : null" />
              <current-address-form
                v-if="isCrcProvided === false && bookings[0]"
                :shelter-locations="shelterLocations"
                :canadian-provinces-items="canadianProvincesItems"
                :current-address-type-items="[]"
                :no-fixed-home="false"
                :api-key="apiKey"
                :disable-autocomplete="false"
                :current-address="bookings[0].address"
                lock-crc-provided
                hide-title
                booking-mode
                compact-view
                show-crc-provided-and-check-in-check-out
                @change="bookings[0].address = $event" />
            </template>
          </v-col>
        </v-row>
      </div>
    </rc-dialog>
    <rc-dialog
      v-if="showSelectPaymentDetails && isCrcProvided"
      :title="$t('bookingRequest.selectPaymentDetails')"
      :show.sync="showSelectPaymentDetails"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.buttons.ok')"
      :persistent="true"
      max-width="750"
      min-height="300"
      :show-close="false"
      :show-cancel="false"
      data-test="select-table-dialog"
      @submit="selectPaymentDetails(selectedPaymentDetails)">
      <div>
        <div class="pb-4">
          {{ $t('bookingRequest.pleaseSelectPaymentDetails') }}
        </div>

        <v-select-with-validation
          v-model="selectedPaymentDetails"
          data-test="selectedPaymentDetails"
          :items="paymentDetails"
          :item-text="(item) => item.name"
          return-object />
      </div>
    </rc-dialog>

    <rationale-dialog ref="rationaleDialog" />
  </validation-observer>
</template>

<script lang='ts'>
/* eslint-disable max-depth */
/* eslint-disable no-await-in-loop */

import { TranslateResult } from 'vue-i18n';
import _groupBy from 'lodash/groupBy';
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import uiHelpers from '@/ui/helpers/helpers';
import { Status, VForm } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { addressTypeHasCrcProvided, CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType, IBooking } from '@libs/entities-lib/booking-request';
import { IMemberForSelection } from '@libs/entities-lib/value-objects/member';
import { TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import mixins from 'vue-typed-mixins';
import { EFilterKeyType } from '@libs/component-lib/types';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';
import CrcProvidedLodging, { ICrcProvidedLodging } from './CrcProvidedLodging.vue';
import ImpactedIndividualAddressTemplateV2 from '../case-files/details/case-file-impacted-individualsV2/components/ImpactedIndividualAddressTemplateV2.vue';
import bookingHelper, { IPaymentDetails, LodgingMode } from './bookingHelper';

export default mixins(caseFileDetail).extend({
  name: 'BookingSetupDialog',

  components: {
    RcDialog,
    CurrentAddressForm,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    ReviewBookingRequest,
    RationaleDialog,
    VSelectWithValidation,
    CrcProvidedLodging,
    ImpactedIndividualAddressTemplateV2,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    bookingRequest: {
      type: Object as () => IBookingRequest,
      required: false,
    },
    preselectedIndividuals: {
      type: Array as () => string[],
      default: null,
    },
    lodgingMode: {
      type: Number as () => LodgingMode,
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
    return {
      bookings: [] as IBooking[],
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      loading: true,
      RoomType,
      RoomOption,
      helpers,
      paymentDetails: [] as IPaymentDetails[],
      selectedPaymentDetails: null as IPaymentDetails,
      showSelectPaymentDetails: false,
      MAX_LENGTH_SM,
      defaultAmount: 0,
      addressType: null as ECurrentAddressTypes,
      isCrcProvided: false,
      showCrcProvidedSelection: false,
      lockCrcProvided: false,
      LodgingMode,
      moveIntoExistingAddress: null as boolean,
      existingAddress: null as TemporaryAddress,
    };
  },

  computed: {
    isEditOfAddress(): boolean {
      return bookingHelper.isEditMode(this.lodgingMode);
    },

    mayTriggerPayment(): boolean {
      return bookingHelper.modeMayTriggerPayment(this.lodgingMode);
    },

    title(): TranslateResult {
      switch (this.lodgingMode) {
        case LodgingMode.BookingMode:
          return this.$t('bookingRequest.setup.title');
        case LodgingMode.ExtendStay:
          return this.$t('impactedIndividuals.extendStay');
        default:
          return this.isEditOfAddress ? this.$t('impactedIndividuals.editAddress') : this.$t('impactedIndividuals.moveNewAddress');
      }
    },

    uniqueAddresses(): TemporaryAddress[] {
      const addresses = this.activeIndividuals.map((m) => m.currentAddress);
      return addresses.filter((a, index) => !addresses.find((a2, index2) => index > index2 && CurrentAddress.areSimilar(a, a2)));
    },

    shelterLocations(): IEventGenericLocation[] {
      const locations = this.event?.shelterLocations || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, !this.household.address?.address, !!this.shelterLocations.length, this.lodgingMode === LodgingMode.BookingMode);
    },

    peopleToLodge(): IMemberForSelection[] {
      let individuals = this.activeIndividuals;
      if (!this.preselectedIndividuals?.length) {
        individuals = individuals.filter((i) => i.receivingAssistance);
      } else {
        individuals = individuals.filter((i) => this.preselectedIndividuals.indexOf(i.id) > -1);
      }

      return individuals.map((i) => ({
        ...this.members.find((m) => m.id === i.personId && m.status === Status.Active),
        caseFileIndividualId: i.id,
        caseFileIndividual: i,
        receivingAssistance: i.receivingAssistance,
        isPrimary: i.personId === this.primaryMember?.id,
       })).filter((m) => m.id);
    },
  },

  watch: {
    async isCrcProvided() {
      await this.checkForCrcProvidedSetupComplete();
    },
  },

  async mounted() {
    this.loading = true;
    if (this.bookingRequest) {
      this.addressType = this.bookingRequest.addressType;
      this.isCrcProvided = true;
    }

    this.lockCrcProvided = this.lodgingMode !== LodgingMode.MoveCrcProvidedAllowed && this.lodgingMode !== LodgingMode.BookingMode;

    await this.loadMissingCaseFileDetails();

    if (this.mayTriggerPayment) {
      await useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories();
      const programs = (await useProgramStore().search({ params: {
          filter: {
            'Entity/EventId': { type: EFilterKeyType.Guid, value: this.caseFile.eventId },
            'Entity/UseForLodging': true,
          },
        },
      })).values;
      const faTables = (await useFinancialAssistanceStore().search({ params: {
          filter: {
            'Entity/UseForLodging': true,
            'Entity/ProgramId': { in: programs.map((p) => p.id) },
          },
        },
      })).values;

      this.paymentDetails = faTables.map((t) => ({ table: t, program: programs.find((p) => t.programId === p.id) }))
        .map((tp) => ({ ...tp, name: `${this.$m(tp.program.name)} - ${this.$m(tp.table.name)}` }));

      await this.selectPaymentDetails(this.paymentDetails[0]);
    }

    if (this.isEditOfAddress) {
      await this.setupBookingsForEdit();
    }

    if (this.lodgingMode !== LodgingMode.MoveCrcProvidedAllowed && this.lodgingMode !== LodgingMode.MoveCrcProvidedNotAllowed) {
      this.moveIntoExistingAddress = false;
    }

    this.loading = false;

    if (!await this.checkForCrcProvidedSetupComplete()) {
      return;
    }
    this.showSelectPaymentDetails = this.paymentDetails.length > 1;
  },

  methods: {
    async checkForCrcProvidedSetupComplete() {
      if (this.loading || !this.isCrcProvided || !this.mayTriggerPayment) {
        return true;
      }

      if (!await bookingHelper.checkLodgingTaskExists(this)) {
        this.$emit('update:show', false);
        return false;
      }

      if (!this.paymentDetails.length) {
        await this.$message({
          title: this.$t('impactedIndividuals.noFinancialDetails.title'),
          message: this.$t('impactedIndividuals.noFinancialDetails.message'),
        });
        this.$emit('update:show', false);
        return false;
      }

      return true;
    },

    async setupBookingsForEdit() {
      const groupedAddresses = _groupBy(this.peopleToLodge, (p) => JSON.stringify(this.temporaryAddressAsCurrentAddress({ ...p.caseFileIndividual.currentAddress, id: null })));

      this.bookings = Object.values(groupedAddresses).map((group, index) => (
        {
          address: this.temporaryAddressAsCurrentAddress(group[0].caseFileIndividual.currentAddress),
          peopleInRoom: group.map((p) => p.caseFileIndividualId),
          confirmationNumber: '',
          nightlyRate: this.defaultAmount,
          numberOfNights: null,
          uniqueNb: index,
        }
      ));

      this.bookings.forEach((b) => {
        b.originalCheckoutDate = uiHelpers.getLocalStringDate(b.address.checkOut, 'CaseFileIndividual.checkOut');
        b.address.checkIn = uiHelpers.getLocalStringDate(b.address.checkIn, 'CaseFileIndividual.checkIn');
        b.address.checkOut = uiHelpers.getLocalStringDate(b.address.checkOut, 'CaseFileIndividual.checkOut');
      });

      // some addresses are set as "crcprovided = null" - these we'll consider as a "false"
      this.isCrcProvided = this.bookings[0].address.crcProvided || false;
      this.addressType = this.bookings[0].address.addressType;
      this.showCrcProvidedSelection = true;
      this.lockCrcProvided = true;

      // to allow for isCrcProvided watcher promise to complete
      await this.$nextTick();
    },

    temporaryAddressAsCurrentAddress(address: TemporaryAddress) : CurrentAddress {
      const currentAddress = new CurrentAddress(address);
      // find when not found return undefined which is not equal to the default null
      currentAddress.shelterLocation = this.shelterLocations.find((s) => s.id === address?.shelterLocationId) || null;
      return currentAddress;
    },

    async changeType(clearCrcProvided = false) {
      if (this.lodgingMode === LodgingMode.MoveCrcProvidedAllowed || this.lodgingMode === LodgingMode.MoveCrcProvidedNotAllowed) {
        if (addressTypeHasCrcProvided.indexOf(this.addressType) === -1) {
          this.showCrcProvidedSelection = false;
          this.isCrcProvided = false;
        } else {
          this.showCrcProvidedSelection = true;
          if (this.lodgingMode === LodgingMode.MoveCrcProvidedAllowed && clearCrcProvided) {
            this.isCrcProvided = null;
          }
        }
      }

      if (this.isCrcProvided && this.peopleToLodge.find((p) => !p.receivingAssistance)) {
        // this is to force the UI to reset the radio buttons
        this.showCrcProvidedSelection = false;
        this.isCrcProvided = false;
        await this.$nextTick();
        this.showCrcProvidedSelection = true;
        this.$message({
          title: this.$t('impactedIndividuals.crcProvided.notReceivingAssistance.title'),
          message: this.$t('impactedIndividuals.crcProvided.notReceivingAssistance.message'),
          maxWidth: 750,
        });
      }

      this.bookings = [];
      (this.$refs.form as VForm).reset();
      await this.$nextTick();
      const crcProvidedSection = (this.$refs.crcProvidedLodging as any) as ICrcProvidedLodging;

      if (this.bookings.length === 0) {
        if (crcProvidedSection?.addRoom) {
          crcProvidedSection.addRoom();
        } else {
          const address = new CurrentAddress();
          address.reset(this.addressType);
          this.bookings.push({ address, peopleInRoom: [], confirmationNumber: '', nightlyRate: this.defaultAmount, numberOfNights: null, uniqueNb: -1 });
        }
      }
    },

    async selectPaymentDetails(detail: IPaymentDetails) {
      if (detail) {
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        useFinancialAssistanceStore().setFinancialAssistance({
          fa: detail.table, categories, newProgram: detail.program, removeInactiveItems: true,
        });

        this.defaultAmount = useFinancialAssistanceStore().mainItems[0].subItems[0].maximumAmount;

        this.showSelectPaymentDetails = false;
        this.selectedPaymentDetails = detail;

        if (this.isEditOfAddress) {
          await this.setupBookingsForEdit();
        }
      }
    },

    async rejectBooking() {
      const dialog = this.$refs.rationaleDialog as any;
      const userInput = (await dialog.open({
        title: this.$t('bookingRequest.rejectRequest.title'),
        userBoxText: this.$t('bookingRequest.rejectRequest.message'),
      })) as { answered: boolean, rationale: string };
      if (userInput.answered) {
        const res = await useBookingRequestStore().rejectBooking(this.bookingRequest, userInput.rationale);
        if (res) {
          dialog.close();
          this.$toasted.global.success(this.$t('bookingRequest.rejected'));
          this.$emit('update:show', false);
        }
      }
    },

    async onSubmit() {
      if (this.moveIntoExistingAddress && this.existingAddress) {
        if (this.existingAddress.crcProvided && this.peopleToLodge.find((p) => !p.receivingAssistance)) {
          this.$message({
            title: this.$t('impactedIndividuals.crcProvided.notReceivingAssistance.title'),
            message: this.$t('impactedIndividuals.crcProvided.notReceivingAssistance.message'),
            maxWidth: 750,
          });
          return;
        }

        // the address might be crc provided but this move will not require creating payments since the address is already paid for
        this.isCrcProvided = false;
        this.bookings = [{ address: this.temporaryAddressAsCurrentAddress(this.existingAddress), peopleInRoom: this.peopleToLodge.map((p) => p.caseFileIndividualId) }];
      } else {
        this.bookings.forEach((b) => {
          b.address.crcProvided = this.isCrcProvided;
        });
      }

      const crcProvidedSection = (this.$refs.crcProvidedLodging as any) as ICrcProvidedLodging;
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        if (this.isCrcProvided && this.peopleToLodge.find((p) => !crcProvidedSection.isMemberAlreadySelected(null, p.caseFileIndividualId))) {
          if (!(await this.$confirm({
              title: this.$t('bookingRequest.notAllMembersPicked.confirm.title'),
              messages: null,
              htmlContent: this.$t('bookingRequest.notAllMembersPicked.confirm') as string,
              submitActionLabel: this.$t('common.buttons.continue'),
              cancelActionLabel: this.$t('common.buttons.back'),
            }))) {
            return;
          }
        }

        if (!this.isEditOfAddress
            // checks if anyone was booked into a new crc address and had a current crc address but with a checkout date thats not the new checkin date
            && this.bookings.find((b) => b.address.crcProvided
                && b.peopleInRoom.find((cId) => this.peopleToLodge.find((p) => p.caseFileIndividualId === cId
                    && p.caseFileIndividual.currentAddress.crcProvided
                    && new Date(p.caseFileIndividual.currentAddress.checkOut).toISOString() !== new Date(b.address.checkIn).toISOString())))) {
          if (!(await this.$confirm({
              title: this.$t('impactedIndividuals.checkInDateDoesntMatch.confirm.title'),
              messages: null,
              htmlContent: this.$t('impactedIndividuals.checkInDateDoesntMatch.confirm') as string,
              submitActionLabel: this.$t('common.buttons.continue'),
              cancelActionLabel: this.$t('common.buttons.back'),
            }))) {
            return;
          }
        }

        this.loading = true;

        try {
          if (this.isCrcProvided) {
            await this.provideCrcAddress();
          } else {
            // non crc provided is always one booking only with everyone in it
            this.bookings[0].peopleInRoom = this.peopleToLodge.map((p) => p.caseFileIndividualId);
            await this.provideAddress();
          }
        } catch (e) {
          this.loading = false;
          return;
        }
        this.$emit('update:show', false);
      }
    },

    async provideCrcAddress() {
      const crcProvidedSection = (this.$refs.crcProvidedLodging as any) as ICrcProvidedLodging;
      const paymentPayload = crcProvidedSection.generatePayment();
      let paymentId = null as string;

      if (paymentPayload) {
        const paymentResult = await useFinancialAssistancePaymentStore().addFinancialAssistancePayment(paymentPayload);
        if (!paymentResult) {
          throw new Error('addFinancialAssistancePayment failed');
        }

        const submitPaymentResult = await useFinancialAssistancePaymentStore().submitFinancialAssistancePayment(paymentResult.id);
        if (!submitPaymentResult) {
          throw new Error('submitFinancialAssistancePayment failed');
        }
        paymentId = submitPaymentResult.id;
      }

      if (this.lodgingMode === LodgingMode.BookingMode) {
        const bookingresult = await useBookingRequestStore().fulfillBooking(this.bookingRequest, paymentId, this.bookings);
        if (!bookingresult) {
          throw new Error('fulfillBooking failed');
        }
        // refresh the addresses since they are not returned by the endpoint
        await useCaseFileIndividualStore().fetchAll({ caseFileId: this.caseFileId });
        this.$toasted.global.success(this.$t(paymentId ? 'bookingRequest.fulfilledAndPaid' : 'impactedIndividuals.membersMoved'));
      } else {
        await this.provideAddress(paymentId);
      }
    },

    async provideAddress(paymentId: string = null) {
      let saveOccured = false;
      for (const b of this.bookings) {
        if (!b.address.hasCrcProvided()) {
          // BE doesnt allow this to false for addresses which cant be true or false...
          b.address.crcProvided = null;
        }
        // no need to send people to the same address if they've picked the same one that some already have or havent made a change
        const peopleToMove = this.peopleToLodge.filter((p) => b.peopleInRoom.indexOf(p.caseFileIndividualId) > -1
            && !CurrentAddress.areSimilar(p.caseFileIndividual.currentAddress, b.address));

        if (paymentId) {
          b.address.relatedPaymentIds.push(paymentId);
        }

        for (const p of peopleToMove) {
          if (this.isEditOfAddress) {
            const editResult = await useCaseFileIndividualStore()
                                  .editTemporaryAddress(this.caseFileId, p.caseFileIndividualId, { ...b.address, id: p.caseFileIndividual.currentAddress.id });
            if (!editResult) {
              throw new Error('editTemporaryAddress failed');
            }
          } else {
            const moveResult = await useCaseFileIndividualStore().addTemporaryAddress(this.caseFileId, p.caseFileIndividualId, b.address);
            if (!moveResult) {
              throw new Error('addTemporaryAddress failed');
            }
          }
          saveOccured = true;
        }
      }

      if (saveOccured) {
        // eslint-disable-next-line no-nested-ternary
        let message = this.$t(this.lodgingMode === LodgingMode.ExtendStay ? 'impactedIndividuals.extendedStay'
          : (this.isEditOfAddress ? 'impactedIndividuals.updatedAddress' : 'impactedIndividuals.membersMoved')) as string;
        if (paymentId) {
          message += this.$t('impactedIndividuals.andPaid');
        }
        this.$toasted.global.success(message);
      }
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
