<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row class="mt-0">
            <v-col cols="12" md="6" class="pb-2">
              <status-select
                v-model="appointment.appointmentStatus"
                data-test="select-appointment-status"
                :statuses="statuses"
                status-name="AppointmentStatus" />
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="localAppointment.appointmentProgramId"
                outlined
                data-test="select-appointment-program"
                attach
                :rules="rules.program"
                :label="`${$t('caseFile.appointments.appointmentProgram')} *`"
                :items="appointmentPrograms"
                :item-value="item=> item.id"
                :item-text="(item) => $m(item.name)" />
            </v-col>
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="localAppointment.serviceOptionId"
                outlined
                data-test="select-service-option"
                attach
                :rules="rules.serviceOption"
                :label="`${$t('caseFile.appointments.serviceOption')} *`"
                :item-data-test="item => item.id"
                :item-value="item => item.id"
                :items="serviceOptions"
                :item-text="(item) => helpers.getOptionItemNameFromListOption(serviceOptionTypes, item.serviceOptionType)" />
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="localAppointment.userAccountId"
                data-test="select-staff-member"
                :loading="loadingStaff"
                attach
                :item-value="item => item"
                :label="`${$t('caseFile.appointments.setMeetingFor')} *`"
                :item-text="(item) => appointmentHelpers.getStaffMemberName(item, NEXT_AVAILABLE_MEMBER_ID, this)"
                :items="displayedStaffMemberIds"
                :disabled="loadingStaff || $hasLevel(UserRoles.level0) && !$hasLevel(UserRoles.level3)"
                :rules="rules.staffMember">
                <template #selection="{ item }">
                  {{ getStaffMemberName(item) }}
                </template>
              </v-select-with-validation>
            </v-col>
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="localAppointment.appointmentModalityId"
                data-test="select-appointment-modality"
                attach
                :item-data-test="item=> item.id"
                :label="`${$t('caseFile.appointments.modality')} *`"
                :items="modalities"
                :item-value="item=> item.id"
                :item-text="(item) => $m(item.name)"
                :rules="rules.modality" />
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="localAppointment.attendeeId"
                data-test="select-attendee"
                attach
                :label="`${$t('caseFile.appointments.attendee')} *`"
                :item-text="(item) => appointmentHelpers.getAttendeeName(item, primaryMemberId, this)"
                :item-value="(item) => item.id"
                :item-data-test="item=> item.id"
                :items="attendees"
                :rules="rules.attendee" />
            </v-col>
            <v-col cols="12" md="6" class="pb-0">
              <v-select-with-validation
                v-model="selectedDuration"
                :item-text="item => $t('caseFile.appointments.duration.minutes', { minutes: item })"
                data-test="appointment-duration"
                attach
                :label="`${$t('caseFile.appointments.duration')} *`"
                :items="appointmentDurations"
                :rules="rules.duration">
                <template #selection="{ item }">
                  {{ $t('caseFile.appointments.duration.minutes', { minutes: item }) }}
                </template>
              </v-select-with-validation>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" class="pt-0">
              <div class="grey-container py-3 px-6">
                <p class="rc-body16 fw-bold">
                  {{ $t('caseFile.appointments.choseTime') }}
                </p>
                <v-date-field-with-validation
                  v-model="selectedDate"
                  data-test="appointment-selected-date"
                  :locale="$i18n.locale"
                  :rules="rules.date"
                  :label="`${$t('caseFile.appointments.date')} *`"
                  :min="today" />

                <template v-if="selectedDate">
                  <p class="rc-body16 fw-bold mb-2">
                    {{ $t('appointment.availabilitesFor', { date: getLocalStringDate(selectedDate, 'local', 'PP') }) }} :
                  </p>
                  <message-box
                    v-if="!selectedDuration || !localAppointment.userAccountId || showTimeSlotError"
                    icon="mdi-alert"
                    class="failed rc-body14 "
                    data-test="appointment-time-picker-error">
                    <div d-flex flex-column>
                      <p class="mb-0">
                        {{ showTimeSlotError ? $t('caseFile.appointments.timePicker.noTimeSlot') : $t('caseFile.appointments.timePicker.error') }}
                      </p>
                      <ul v-if="!showTimeSlotError" class="fw-normal">
                        <li v-if="!selectedAppointmentProgram">
                          {{ $t('caseFile.appointments.appointmentProgram') }}
                        </li>
                        <li v-if="!selectedServiceOption">
                          {{ $t('caseFile.appointments.serviceOption') }}
                        </li>
                        <li v-if="!localAppointment.userAccountId">
                          {{ $t('caseFile.appointments.staffMember') }}
                        </li>
                        <li v-if="!selectedDuration">
                          {{ $t('caseFile.appointments.duration') }}
                        </li>
                      </ul>
                    </div>
                  </message-box>
                  <template v-if="loadingAvailabilities">
                    <v-skeleton-loader class="my-6" type="article" />
                    <v-skeleton-loader class="my-6" type="article" />
                  </template>
                  <appointment-time-picker
                    v-else
                    :date="selectedDate"
                    :duration="selectedDuration"
                    :booked-time.sync="selectedTime"
                    :availabilities="availabilities" />
                </template>
                <div v-if="!selectedDate" class="no-date-section rc-body14">
                  {{ $t('caseFile.appointments.noDate') }}
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localAppointment.notes"
                data-test="appointment-notes"
                full-width
                hide-details
                :aria-label="$t('caseFile.appointments.notes')"
                :label="$t('caseFile.appointments.notes')"
                :rules="rules.notes" />
            </v-col>
          </v-row>

          <v-row class="my-0">
            <v-col cols="12" class="pb-0">
              <div class="grey-container pt-4 px-6">
                <p class="rc-body16 fw-bold">
                  {{ $t('caseFile.appointments.email.title') }}
                </p>
                <p class="rc-body14 mb-0">
                  {{ $t('caseFile.appointments.email.label') }} *
                </p>
                <p class="rc-body14 font-italic mb-2">
                  <v-icon size="16" color="grey darken-2">
                    mdi-information
                  </v-icon>
                  {{ $t('caseFile.appointments.email.label.second') }}
                </p>

                <validation-provider v-slot="{ errors }" :rules="rules.sendEmail">
                  <v-radio-group v-model="localAppointment.sendConfirmationEmail" :error-messages="errors" row class="mt-0 pb-4">
                    <v-radio
                      data-test="send-confirmation-email-yes"
                      :label="$t('common.buttons.yes')"
                      :value="true" />
                    <v-radio
                      data-test="send-confirmation-email-no"
                      :label="$t('common.buttons.no')"
                      :disabled="isOnline"
                      :value="false" />
                  </v-radio-group>
                </validation-provider>

                <v-text-field-with-validation
                  v-if="localAppointment.sendConfirmationEmail"
                  v-model="localAppointment.attendeeEmail"
                  background-color="white"
                  :disabled="!$hasLevel(UserRoles.level1)"
                  class="pb-0"
                  data-test="appointment-attendee-email"
                  :label="`${$t('caseFile.appointments.email')}*`"
                  :rules="rules.email" />
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { MessageBox, VDateFieldWithValidation, VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { Appointment, AppointmentStatus, IAppointment, IAppointmentProgram, IAppointmentRequest,
  IDateRange, IStaffMemberAvailabilityRequest } from '@libs/entities-lib/appointment';
import { useUserStore } from '@/pinia/user/user';
import helpers from '@/ui/helpers/helpers';
import { IMember } from '@libs/entities-lib/household-create';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IAppointmentStaffMember, IServiceOption } from '@libs/entities-lib/src/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { UserRoles } from '@libs/entities-lib/user';
import { useAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { TranslateResult } from 'vue-i18n';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { Status } from '@libs/shared-lib/types';
import AppointmentTimePicker from './AppointmentTimePicker.vue';
import appointmentHelpers from '../utils/appointmentHelpers';

export const NEXT_AVAILABLE_MEMBER_ID = 'next-available-member';

export default Vue.extend({
  name: 'AppointmentForm',

  components: {
    VSelectWithValidation,
    AppointmentTimePicker,
    VTextAreaWithValidation,
    StatusSelect,
    VDateFieldWithValidation,
    MessageBox,
    VTextFieldWithValidation,
  },

  props: {
    appointment: {
      type: Object as () => IAppointment,
      required: true,
    },
    submitRequestData: {
      type: Object as () => IAppointmentRequest,
      default: null,
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    primaryMemberId: {
      type: String,
      required: true,
    },
    primaryMemberEmail: {
      type: String,
      default: '',
    },
    attendees: {
      type: Array as ()=> IMember[],
      required: true,
    },
    showTimeSlotError: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      NEXT_AVAILABLE_MEMBER_ID,
      helpers,
      appointmentHelpers,
      UserRoles,
      loading: false,
      loadingStaff: false,
      loadingAvailabilities: false,
      getLocalStringDate: helpers.getLocalStringDate,
      localAppointment: new Appointment(),
      appointmentDurations: [15, 20, 30, 60],
      selectedDuration: null as Number,
      selectedDate: '',
      availabilities: [] as IDateRange[],
      // The selection the user made for SendConfirmation before it was forced set to true by an online modality
      initialSelectedSendConfirmation: null as boolean,
    };
  },

  computed: {
    today(): string {
      return helpers.getLocalStringDate(new Date(), 'local');
    },

    rules(): Record<string, unknown> {
      return {
        program: { required: true },
        serviceOption: { required: true },
        staffMember: { required: true },
        modality: { required: true },
        attendee: { required: true },
        duration: { required: true },
        date: { required: true },
        notes: { max: MAX_LENGTH_LG },
        sendEmail: { requiredCheckbox: true, oneOf: [false, true] },
        email: { required: true },
      };
    },

    statuses(): AppointmentStatus[] {
      return this.isEditMode ? [AppointmentStatus.Scheduled, AppointmentStatus.Rescheduled, AppointmentStatus.Cancelled]
      : [AppointmentStatus.Scheduled];
    },

    appointmentPrograms(): IAppointmentProgram[] {
      return useAppointmentProgramStore().getByCriteria(this.eventId, true, ['eventId']);
    },

    selectedAppointmentProgram(): IAppointmentProgram {
      return this.appointmentPrograms.find((p) => this.localAppointment.appointmentProgramId === p.id);
    },

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes();
    },

    // In the dropdown, only display service options of the selected appointment program that are currently active
    serviceOptions(): IServiceOption[] {
      return this.selectedAppointmentProgram?.serviceOptions.filter((so) => so.serviceOptionStatus === Status.Active) || [];
    },

    selectedServiceOption(): IServiceOption {
      return this.serviceOptions.find((so) => this.localAppointment.serviceOptionId === so.id);
    },

    allModalities(): IOptionItem[] {
      return useAppointmentProgramStore().getAppointmentModalities(this.appointment?.appointmentModalityId);
    },

    // In the dropdown, only display the modalities of the selected service option
    modalities(): IOptionItem[] {
      if (!this.selectedServiceOption) {
        return [];
      }
      return this.allModalities.filter((m) => this.selectedServiceOption.appointmentModalities.map((mod) => mod.optionItemId).includes(m.id));
    },

    // The appointment program staff members that are assigned to the selected service option
    serviceOptionStaffMembers(): IAppointmentStaffMember[] {
      if (!this.selectedServiceOption) {
        return [];
      }
      const allStaffMembers = useAppointmentStaffMemberStore().getByCriteria(this.selectedAppointmentProgram?.id, true, ['appointmentProgramId']);
      return allStaffMembers.filter((m) => m.serviceOptionIds.includes(this.selectedServiceOption.id));
    },

    // The user account ids of the staff members displayed in the dropdown 'Set meeting for', ordered in the required order - depending on user level
    displayedStaffMemberIds(): string[] {
      if (this.$hasLevel(UserRoles.level1) && !this.selectedServiceOption) {
        return [];
      }

      let memberIds: string[] = [];
      const currentUserId = useUserStore().getUserId();

      if (this.$hasLevel(UserRoles.level1)) {
        memberIds = this.serviceOptionStaffMembers.find((m) => m.userAccountId === currentUserId) ? [currentUserId] : [];
      }

      if (this.$hasLevel(UserRoles.level3) || this.$hasLevel(UserRoles.level0, true)) {
        if (this.serviceOptionStaffMembers.length) {
          memberIds.push(NEXT_AVAILABLE_MEMBER_ID);
        }
      }

      if (this.$hasLevel(UserRoles.level3)) {
        const membersExceptCurrentUser: string[] = this.serviceOptionStaffMembers.filter((m) => m.userAccountId !== currentUserId).map((m) => m.userAccountId);

        const orderedMembers: string[] = _orderBy(membersExceptCurrentUser, (m) => useUserAccountMetadataStore().getById(m).givenName);
        memberIds.push(...orderedMembers);
      }

       return memberIds;
    },

    isOnline(): boolean {
      if (!this.localAppointment?.appointmentModalityId) {
        return false;
      }
      return this.allModalities.find((m) => m.id === this.localAppointment.appointmentModalityId)?.isOnline;
    },

    // the selected time slot, as passed to or received from to the component AppointmentTimePicker
    selectedTime: {
      get(): IDateRange {
        return { startDate: this.localAppointment.startDate, endDate: this.localAppointment.endDate };
      },
      set(value: IDateRange) {
        this.localAppointment.startDate = value?.startDate;
        this.localAppointment.endDate = value?.endDate;
      },
    },
  },

  watch: {
    async selectedAppointmentProgram(newValue:IAppointmentProgram, oldValue: IAppointmentProgram) {
      if (!!oldValue && newValue !== oldValue) {
        this.localAppointment.serviceOptionId = null;
      }
      if (newValue) {
        await this.fetchStaffMembers();
        if (!newValue.serviceOptions.length || !newValue.serviceOptions.some((so) => so.serviceOptionStatus === Status.Active)) {
          this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.appointments.error.noServiceOptions') });
        }
      }
    },

    selectedServiceOption(newValue, oldValue) {
      if (!!oldValue && newValue !== oldValue) {
        this.localAppointment.appointmentModalityId = null;
        if (this.$hasLevel(UserRoles.level1)) {
          this.localAppointment.userAccountId = null;
        }
      }
    },

    serviceOptionStaffMembers(newValue) {
      if (this.selectedServiceOption && !newValue.length) {
        this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.appointments.error.noStaffMembersInServiceOption') });
      }
    },

    async displayedStaffMemberIds(newValue: string[]) {
      if (this.$hasLevel(UserRoles.level3) && newValue?.length) {
        const ids = newValue.filter((i) => i !== NEXT_AVAILABLE_MEMBER_ID);
        await useUserAccountMetadataStore().fetchByIds(ids, true);
      }
      // For Level 1 and 2 users, the appointment is assigned to them automatically if they are part if the service option staff
      if (this.$hasLevel(UserRoles.level1) && !this.$hasLevel(UserRoles.level3) && this.selectedServiceOption) {
        const currentUserId = useUserStore().getUserId();
        if (newValue.includes(currentUserId)) {
          this.localAppointment.userAccountId = currentUserId;
        } else {
          this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.appointments.error.notAssignedToServiceOption') });
        }
      }
    },

    selectedDuration(newValue, oldValue) {
      if (!!oldValue && newValue !== oldValue) {
        this.localAppointment.startDate = null;
        this.localAppointment.endDate = null;
      }
    },

    async selectedDate(newValue, oldValue) {
      this.$emit('update:showTimeSlotError', false);
      if (newValue && this.localAppointment?.userAccountId) {
        await this.fetchStaffMemberAvailability();
      }
      if (!!oldValue && oldValue !== newValue) {
        this.localAppointment.startDate = null;
        this.localAppointment.endDate = null;
      }
    },

    'localAppointment.userAccountId': {
      async handler(newValue) {
        if (newValue && this.selectedDate) {
          await this.fetchStaffMemberAvailability();
        }
      },
    },

    // If the user picks a value for sendConfirmationEmail, then picks a modality that forces this value to be true (because is online),
    // and then changes to a different modality that is not online, the user comes back to their initial selection
    isOnline(newValue) {
      if (newValue) {
        this.initialSelectedSendConfirmation = this.localAppointment.sendConfirmationEmail;
        this.localAppointment.sendConfirmationEmail = true;
      } else {
        this.localAppointment.sendConfirmationEmail = this.initialSelectedSendConfirmation;
        this.initialSelectedSendConfirmation = null;
      }
    },

    'localAppointment.sendConfirmationEmail': {
      handler(newValue) {
        if (newValue === false) {
          this.localAppointment.attendeeEmail = null;
        } else {
          this.localAppointment.attendeeEmail = this.primaryMemberEmail;
        }
      },
    },

    localAppointment: {
      handler(newValue) {
        const payload = {
          ...newValue,
          ...this.getRequestPayload() || {},
        };
        this.$emit('update:submitRequestData', payload);
      },
      deep: true,
    },
  },

  // TODO develop when coding the edit part
  async created() {
    this.localAppointment = new Appointment(this.appointment);
    if (this.isEditMode) {
      // TODO - move this to a computed var
      this.selectedDuration = ((new Date(this.appointment.endDate).getTime() - new Date(this.appointment.startDate).getTime()) / (1000 * 60));
    } else {
      this.localAppointment.attendeeEmail = this.primaryMemberEmail;
    }

    if (this.$hasLevel(UserRoles.level0, true)) {
      this.localAppointment.userAccountId = NEXT_AVAILABLE_MEMBER_ID;
    }
  },

  methods: {
    getStaffMemberName(id: string): TranslateResult | string {
      if (id === NEXT_AVAILABLE_MEMBER_ID) {
        return this.$t('caseFile.appointments.nextAvailable');
      }
      const currentUserId = useUserStore().getUserId();
      if (id === currentUserId) {
        return this.$t('caseFile.appointments.myself');
      }
      const user = useUserAccountMetadataStore().getById(id);
      if (user?.displayName) {
        return `${user.displayName} (${this.$m(user.roleName)})`;
      }
      return '';
    },

    async fetchStaffMembers() {
      if (!this.selectedAppointmentProgram?.id) {
        return;
      }
      this.loadingStaff = true;
      const staffMembers = await useAppointmentStaffMemberStore().fetchByAppointmentProgramId(this.selectedAppointmentProgram.id);
      if (!staffMembers?.length) {
        this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.appointments.error.noStaffMembersInAppointmentProgram') });
      }
      this.loadingStaff = false;
    },

    getRequestPayload(): IStaffMemberAvailabilityRequest {
      if (!this.selectedAppointmentProgram?.id || !this.selectedServiceOption || !this.localAppointment?.userAccountId || !this.selectedDate) {
        return null;
      }
      const userAccountIds = this.localAppointment?.userAccountId === NEXT_AVAILABLE_MEMBER_ID
      // The next available case file manager was selected, so we fetch the availability of all the staff members
        ? this.displayedStaffMemberIds.filter((id) => id !== NEXT_AVAILABLE_MEMBER_ID)
        : [this.localAppointment.userAccountId];

      return {
        appointmentProgramId: this.selectedAppointmentProgram.id,
        userAccountIds,
        selectedDateStartInUtc: new Date(`${this.selectedDate} 0:00`).toISOString(), // The midnight of the selected date, in UTC
      };
    },

    async fetchStaffMemberAvailability() {
      this.loadingAvailabilities = true;
      const payload = this.getRequestPayload();
      if (payload) {
        this.availabilities = await this.$services.appointmentStaffMembers.fetchAvailabilites(payload);
      }
      this.loadingAvailabilities = false;
    },
  },
});
</script>

<style scoped lang="scss">
  .no-date-section {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
