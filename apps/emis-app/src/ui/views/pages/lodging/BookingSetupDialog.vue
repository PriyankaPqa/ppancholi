<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('bookingRequest.setup.title')"
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
            <v-row class="mt-8">
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
                  @change="changeType()" />
              </v-col>
            </v-row>
            <crc-provided-lodging
              v-if="selectedPaymentDetails && !showSelectTable"
              :id="caseFileId"
              ref="crcProvidedLodging"
              :address-type="addressType"
              :default-amount="defaultAmount"
              :bookings="bookings"
              :people-to-lodge="peopleToLodge"
              :program="selectedPaymentDetails.program"
              :table-id="selectedPaymentDetails.table.id" />
          </v-col>
        </v-row>
      </div>
    </rc-dialog>
    <rc-dialog
      v-if="showSelectTable"
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
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Status, VForm } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType, IBooking } from '@libs/entities-lib/booking-request';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
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
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';
import CrcProvidedLodging, { ICrcProvidedLodging } from './CrcProvidedLodging.vue';

interface IPaymentDetails { program: IProgramEntity, table: IFinancialAssistanceTableEntity, name: string }

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
      uniqueNb: 0,
      showSelectTable: false,
      MAX_LENGTH_SM,
      defaultAmount: 0,
      addressType: null as ECurrentAddressTypes,
    };
  },

  computed: {
    shelterLocations(): IEventGenericLocation[] {
      const locations = this.event?.shelterLocations || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, false, !!this.shelterLocations.length, true);
    },

    peopleToLodge(): (IMemberEntity & { caseFileIndividualId: string })[] {
      return this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active && i.receivingAssistance)
        .map((i) => ({ ...this.members.find((m) => m.id === i.personId && m.status === Status.Active), caseFileIndividualId: i.id })).filter((m) => m);
    },
  },

  async mounted() {
    this.loading = true;
    this.addressType = this.bookingRequest.addressType;
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
    async changeType() {
      this.bookings = [];
      (this.$refs.form as VForm).reset();
      const crcProvidedSection = (this.$refs.crcProvidedLodging as any) as ICrcProvidedLodging;
      await this.$nextTick();
      crcProvidedSection.addRoom();
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
      const crcProvidedSection = (this.$refs.crcProvidedLodging as any) as ICrcProvidedLodging;
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        if (this.peopleToLodge.find((p) => !crcProvidedSection.isMemberAlreadySelected(null, p.caseFileIndividualId))) {
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
          const paymentPayload = crcProvidedSection.generatePayment();

          const paymentResult = await useFinancialAssistancePaymentStore().addFinancialAssistancePayment(paymentPayload);
          if (!paymentResult) {
            this.loading = false;
            return;
          }

          const submitPaymentResult = await useFinancialAssistancePaymentStore().submitFinancialAssistancePayment(paymentResult.id);
          if (!submitPaymentResult) {
            this.loading = false;
            return;
          }

          this.bookings.forEach((b) => {
            b.address.crcProvided = true;
          });

          const bookingresult = await useBookingRequestStore().fulfillBooking(this.bookingRequest, submitPaymentResult.id, this.bookings);
          if (!bookingresult) {
            this.loading = false;
            return;
          }
        } catch (e) {
          this.loading = false;
          return;
        }
        this.$toasted.global.success(this.$t('bookingRequest.fulfilledAndPaid'));
        this.$emit('update:show', false);
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
