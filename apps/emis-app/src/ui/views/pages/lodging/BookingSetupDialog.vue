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
            <template v-if="preselectedIndividuals && preselectedIndividuals.length">
              <v-row>
                <v-col cols="12">
                  <div class="rc-heading-5">
                    {{ $t('impactedIndividuals.selectedMembersToMove') }}
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

            <v-row class="mt-8">
              <v-col cols="12">
                <div class="rc-heading-5">
                  {{ $t('impactedIndividuals.newAddress') }}
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="8">
                <v-select-with-validation
                  v-model="addressType"
                  background-color="white"
                  rules="required"
                  hide-details
                  item-value="value"
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
              v-if="isCrcProvided && selectedPaymentDetails && !showSelectTable && addressType"
              :id="caseFileId"
              ref="crcProvidedLodging"
              :address-type="addressType"
              :default-amount="defaultAmount"
              :bookings="bookings"
              :people-to-lodge="peopleToLodge"
              :program="selectedPaymentDetails.program"
              :table-id="selectedPaymentDetails.table.id" />
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
          </v-col>
        </v-row>
      </div>
    </rc-dialog>
    <rc-dialog
      v-if="showSelectTable && isCrcProvided"
      :title="$t('bookingRequest.selectPaymentDetails')"
      :show.sync="showSelectTable"
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
import { TranslateResult } from 'vue-i18n';
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Status, VForm } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { addressTypeHasCrcProvided, CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType, IBooking } from '@libs/entities-lib/booking-request';
import { IMemberForSelection } from '@libs/entities-lib/value-objects/member';
import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import mixins from 'vue-typed-mixins';
import { IProgramEntity } from '@libs/entities-lib/program';
import { EFilterKeyType } from '@libs/component-lib/types';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';
import CrcProvidedLodging, { ICrcProvidedLodging } from './CrcProvidedLodging.vue';

interface IPaymentDetails { program: IProgramEntity, table: IFinancialAssistanceTableEntity, name: string }
export enum LodgingMode {
  BookingMode,
  MoveCrcProvidedAllowed,
  MoveCrcProvidedNotAllowed,
}

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
      showSelectTable: false,
      MAX_LENGTH_SM,
      defaultAmount: 0,
      addressType: null as ECurrentAddressTypes,
      isCrcProvided: false,
      showCrcProvidedSelection: false,
      lockCrcProvided: false,
    };
  },

  computed: {
    title(): TranslateResult {
      switch (this.lodgingMode) {
        case LodgingMode.BookingMode:
          return this.$t('bookingRequest.setup.title');
        default:
          return this.$t('impactedIndividuals.moveNewAddress');
      }
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
      let individuals = this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active);
      if (!this.preselectedIndividuals?.length) {
        individuals = individuals.filter((i) => i.receivingAssistance);
      } else {
        individuals = individuals.filter((i) => this.preselectedIndividuals.indexOf(i.id) > -1);
      }

      return individuals.map((i) => ({
        ...this.members.find((m) => m.id === i.personId && m.status === Status.Active),
        caseFileIndividualId: i.id,
        receivingAssistance: i.receivingAssistance,
        isPrimary: i.personId === this.primaryMember?.id,
       })).filter((m) => m.id);
    },
  },

  async mounted() {
    this.loading = true;
    if (this.bookingRequest) {
      this.addressType = this.bookingRequest.addressType;
      this.isCrcProvided = true;
    }

    this.lockCrcProvided = this.lodgingMode === LodgingMode.MoveCrcProvidedNotAllowed;

    await this.loadMissingCaseFileDetails();
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
    this.loading = false;

    this.selectPaymentDetails(this.paymentDetails[0]);

    this.showSelectTable = this.paymentDetails.length > 1;
  },

  methods: {
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

    selectPaymentDetails(detail: IPaymentDetails) {
      if (detail) {
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        useFinancialAssistanceStore().setFinancialAssistance({
          fa: detail.table, categories, newProgram: detail.program, removeInactiveItems: true,
        });

        this.defaultAmount = useFinancialAssistanceStore().mainItems[0].subItems[0].maximumAmount;

        this.showSelectTable = false;
        this.selectedPaymentDetails = detail;
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
      this.bookings.forEach((b) => {
        b.address.crcProvided = this.isCrcProvided;
      });

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

        this.loading = true;

        try {
          if (this.isCrcProvided) {
            await this.provideCrcAddress();
          } else {
            await this.provideNonCrcAddress();
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

      const paymentResult = await useFinancialAssistancePaymentStore().addFinancialAssistancePayment(paymentPayload);
      if (!paymentResult) {
        throw new Error('addFinancialAssistancePayment failed');
      }

      const submitPaymentResult = await useFinancialAssistancePaymentStore().submitFinancialAssistancePayment(paymentResult.id);
      if (!submitPaymentResult) {
        throw new Error('submitFinancialAssistancePayment failed');
      }

      if (this.lodgingMode === LodgingMode.BookingMode) {
        const bookingresult = await useBookingRequestStore().fulfillBooking(this.bookingRequest, submitPaymentResult.id, this.bookings);
        if (!bookingresult) {
          throw new Error('fulfillBooking failed');
        }
      } else {
        this.bookings.forEach(async (b) => {
          b.address.relatedPaymentIds = [submitPaymentResult.id];
          await b.peopleInRoom.forEach(async (p) => {
            const moveResult = await useCaseFileIndividualStore().addTemporaryAddress(this.caseFileId, p, b.address);
            if (!moveResult) {
              throw new Error('addTemporaryAddress failed');
            }
          });
        });
      }
      this.$toasted.global.success(this.$t('bookingRequest.fulfilledAndPaid'));
    },

    async provideNonCrcAddress() {
      this.bookings.forEach(async (b) => {
        if (!b.address.hasCrcProvided()) {
          b.address.crcProvided = null;
        }
        await this.peopleToLodge.forEach(async (p) => {
          const moveResult = await useCaseFileIndividualStore().addTemporaryAddress(this.caseFileId, p.caseFileIndividualId, b.address);
          if (!moveResult) {
            throw new Error('addTemporaryAddress failed');
          }
        });
      });
      this.$toasted.global.success(this.$t('impactedIndividuals.membersMoved'));
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
