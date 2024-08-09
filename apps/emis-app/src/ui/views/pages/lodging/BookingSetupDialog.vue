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
                  ref="addressType"
                  background-color="white"
                  :value="bookings[0].address.addressType"
                  rules="required"
                  hide-details
                  item-value="value"
                  :data-test="'currentAddressType'"
                  :label="`${$t('registration.addresses.addressType')} *`"
                  :items="currentAddressTypeItems"
                  @change="changeType($event)" />
              </v-col>
            </v-row>
            <template v-if="bookings.length">
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
                </v-col>
              </v-row>
            </template>
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
} from '@libs/component-lib/components';
import { Status, VForm } from '@libs/shared-lib/types';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType, IBooking } from '@libs/entities-lib/booking-request';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import { differenceInDays, parseISO } from 'date-fns';
import mixins from 'vue-typed-mixins';
import { IProgramEntity } from '@libs/entities-lib/program';
import { EFilterKeyType } from '@libs/component-lib/types';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { FinancialAssistancePaymentEntity, IFinancialAssistancePaymentEntity, PayeeType } from '@libs/entities-lib/financial-assistance-payment';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import caseFileDetail from '../case-files/details/caseFileDetail';
import ReviewBookingRequest from './ReviewBookingRequest.vue';

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
      paymentDetails: [] as { program: IProgramEntity, table: IFinancialAssistanceTableEntity, name: string }[],
      selectedPaymentDetails: null as { program: IProgramEntity, table: IFinancialAssistanceTableEntity, name: string },
      uniqueNb: 0,
      showSelectTable: false,
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

    peopleToLodge(): (IMemberEntity & { caseFileIndividualId: string })[] {
      return this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active && i.receivingAssistance)
        .map((i) => ({ ...this.members.find((m) => m.id === i.personId && m.status === Status.Active), caseFileIndividualId: i.id })).filter((m) => m);
    },
  },

  async mounted() {
    this.loading = true;
    this.addRoom();
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
          'Entity/EventId': { type: EFilterKeyType.Guid, value: this.caseFile.eventId },
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
    addRoom(type?: ECurrentAddressTypes) {
      const address = new CurrentAddress();
      this.uniqueNb += 1;
      address.reset(this.bookings[0]?.address?.addressType || type || this.bookingRequest.addressType);
      const amount = this.selectedPaymentDetails?.table?.items[0]?.subItems[0]?.maximumAmount;
      this.bookings.push({ address, peopleInRoom: [], confirmationNumber: '', estimatedAmount: amount, numberOfNights: null, uniqueNb: this.uniqueNb });
    },

    removeRoom(booking: IBooking) {
      this.bookings = this.bookings.filter((b) => b !== booking);
    },

    async changeType(type: ECurrentAddressTypes) {
      this.bookings = [];
      this.addRoom(type);
      (this.$refs.form as VForm).reset();
    },

    selectPaymentDetails(detail: IPaymentDetails) {
      if (detail) {
        this.showSelectTable = false;
        this.selectedPaymentDetails = detail;
        this.bookings[0].estimatedAmount = detail?.table?.items[0]?.subItems[0]?.maximumAmount;
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        useFinancialAssistanceStore().setFinancialAssistance({
          fa: detail.table, categories, newProgram: detail.program, removeInactiveItems: true,
        });
      }
    },

    setCurrentAddress(form: CurrentAddress, index: number) {
      this.bookings[index].address = form;
      this.bookings[index].numberOfNights = form.checkOut && form.checkIn
        ? (differenceInDays(parseISO(`${form.checkOut}Z`), parseISO(`${form.checkIn}Z`)) || 1) : null;
    },

    isMemberAlreadySelected(booking: IBooking, id: string) {
      return !!this.bookings.find((b) => b !== booking && b.peopleInRoom.indexOf(id) > -1);
    },

    async rejectBooking() {
      const dialog = this.$refs.rationaleDialog as any;
      const answer = (await dialog.open({
        title: this.$t('bookingRequest.rejectRequest.title'),
        userBoxText: this.$t('bookingRequest.rejectRequest.message'),
      })) as { answered: boolean, rationale: string };
      if (answer.answered) {
        const res = await useBookingRequestStore().rejectBooking(this.bookingRequest, answer.rationale);
        if (res) {
          dialog.close();
          this.$toasted.global.success(this.$t('bookingRequest.rejected'));
          this.$emit('update:show', false);
        }
      }
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        if (this.peopleToLodge.find((p) => !this.isMemberAlreadySelected(null, p.caseFileIndividualId))) {
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
          const paymentPayload = this.generatePayment();

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

    generatePayment() : IFinancialAssistancePaymentEntity {
      const paymentPayload = {
        caseFileId: this.caseFileId,
        description: this.$t(
          'bookingRequest.paymentDescription',
          {
            amountPerNight: [...new Set(this.bookings.map((b) => b.estimatedAmount))].join(', '),
            numberOfNights: this.bookings.map((b) => b.numberOfNights).reduce((a, b) => a + b),
            numberOfRooms: this.bookings.length + 1,
          },
        ),
        financialAssistanceTableId: this.selectedPaymentDetails.table.id,
        groups: [
          {
            groupingInformation: {
              modality: this.selectedPaymentDetails.program.paymentModalities[0],
              payeeType: PayeeType.Individual,
              payeeName: `${this.primaryMember.identitySet.firstName} ${this.primaryMember.identitySet.lastName}`,
            },
            lines: [
              {
                amount: this.bookings.map((b) => b.numberOfNights * b.estimatedAmount).reduce((a, b) => a + b),
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
        { payment: paymentPayload, items: useFinancialAssistanceStore().mainItems, keepCurrentDate: false, program: this.selectedPaymentDetails.program },
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
