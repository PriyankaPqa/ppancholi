<template>
  <v-container>
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
              v-model="selectedAppointmentProgram"
              outlined
              data-test="select-appointment-program"
              attach
              return-object

              :label="`${$t('caseFile.appointments.appointmentProgram')} *`"
              :items="appointmentPrograms"
              :item-text="(item) => $m(item.name)" />
          </v-col>
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedServiceOption"
              outlined
              data-test="select-service-option"
              attach
              return-object
              :label="`${$t('caseFile.appointments.serviceOption')} *`"
              :item-data-test="item=> item.id"
              :items="serviceOptions"
              :item-text="(item) => getServiceOptionTypeName(item)" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedStaffMember"
              data-test="select-staff-member"
              :loading="loadingStaff"
              attach
              return-object
              :label="`${$t('caseFile.appointments.setMeetingFor')} *`"
              :item-data-test="item=> item.id"
              :item-value="(item) => item.id"
              :item-text="(item) => getStaffMemberName(item)"
              :items="displayedStaffMembers"
              :rules="rules.staff" />
          </v-col>
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedModality"
              data-test="select-appointment-modality"
              attach
              return-object
              :item-data-test="item=> item.optionItemId"
              :label="`${$t('caseFile.appointments.modality')} *`"
              :items="modalities"
              :item-text="(item) => getModalityName(item)"
              :rules="rules.modality" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedAttendee"
              data-test="select-attendee"
              attach
              :label="`${$t('caseFile.appointments.attendee')} *`"
              :item-text="(item) => getAttendeeName(item)"
              :item-data-test="item=> item.id"
              :items="attendees"
              return-object
              :rules="rules.attendee" />
          </v-col>
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedDuration"
              data-test="appointment-duration"
              attach
              :label="`${$t('caseFile.appointments.duration')} *`"
              :items="appointmentDurations"
              :rules="rules.duration" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12" class="pt-0">
            <div class="grey-container py-4 px-6">
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

              <p class="rc-body16 fw-bold mb-2">
                {{ $t('appointment.availabilitesFor', { date: getLocalStringDate(selectedDate, 'local', 'PP') }) }} :
              </p>
              <message-box
                v-if="selectedDate && (!selectedDuration || !selectedStaffMember)"
                icon="mdi-alert"
                class="failed  rc-body14 "
                data-test="appointment-time-picker-error">
                <div d-flex flex-column>
                  <p class="mb-0">
                    {{ $t('caseFile.appointments.timePicker.error') }}
                  </p>
                  <ul class="fw-normal">
                    <li v-if="!selectedAppointmentProgram">
                      {{ $t('caseFile.appointments.appointmentProgram') }}
                    </li>
                    <li v-if="!selectedServiceOption">
                      {{ $t('caseFile.appointments.serviceOption') }}
                    </li>
                    <li v-if="!selectedStaffMember">
                      {{ $t('caseFile.appointments.staffMember') }}
                    </li>
                    <li v-if="!selectedDuration">
                      {{ $t('caseFile.appointments.duration') }}
                    </li>
                  </ul>
                </div>
              </message-box>

              <appointment-time-picker
                v-if="selectedDate"
                :date="selectedDate"
                :duration="selectedDuration"
                :booked-time.sync="selectedTime"
                :availabilities="availabilities" />
              <div v-else class="no-date-section rc-body14">
                {{ $t('caseFile.appointments.noDate') }}
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12">
            <v-text-area-with-validation
              v-model="appointment.notes"
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
                <v-radio-group v-model="appointment.sendConfirmationEmail" :error-messages="errors" row class="mt-0 pb-4">
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
                v-if="appointment.sendConfirmationEmail"
                v-model="appointment.attendeeEmail"
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
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { VSelectWithValidation } from '@libs/component-lib/components';
import { Appointment, AppointmentStatus, IAppointment, IAppointmentProgram, IDateRange, IStaffMemberAvailabilityRequest } from '@libs/entities-lib/appointment';
import { useUserStore } from '@/pinia/user/user';
import helpers from '@/ui/helpers/helpers';
import { IMember, IMemberEntity } from '@libs/entities-lib/household-create';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IAppointmentStaffMember, IServiceOption } from '@libs/entities-lib/src/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IListOption } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/entities-lib/user';
import { useAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { TranslateResult } from 'vue-i18n';
import { APPOINTMENTS } from '../../../../appointments/home/mocks';
import AppointmentTimePicker from './AppointmentTimePicker.vue';

export default Vue.extend({
  name: 'AppointmentForm',

  components: {
    VSelectWithValidation,
    AppointmentTimePicker,
  },

  props: {
    appointment: {
      type: Object as () => IAppointment,
      required: true,
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
      required: true,
    },
    attendees: {
      type: Array as ()=> IMember[],
      required: true,
    },

  },

  data() {
    return {
      UserRoles,
      nextAvailableMemberId: 'next-available-member',
      localAppointment: null as IAppointment,
      loading: false,
      loadingStaff: false,
      getLocalStringDate: helpers.getLocalStringDate,
      selectedAppointmentProgram: null as IAppointmentProgram,
      selectedServiceOption: null as IServiceOption,
      selectedModality: null as IListOption,
      appointmentDurations: ['15', '20', '30', '60'],
      selectedDuration: '',
      selectedStaffMember: null as IAppointmentStaffMember,
      selectedAttendee: null as IMemberEntity,
      selectedDate: '',
      availabilities: [] as IDateRange[],
      // The selection the user made for SendConfirmation before it was forced set to true because modality is online
      initialSelectedSendConfirmation: null as boolean,
    };
  },

  computed: {
    statuses(): AppointmentStatus[] {
      return this.isEditMode ? [AppointmentStatus.Scheduled, AppointmentStatus.Rescheduled, AppointmentStatus.Cancelled]
      : [AppointmentStatus.Scheduled];
    },

    today(): string {
      return helpers.getLocalStringDate(new Date(), 'local');
    },

    rules(): Record<string, unknown> {
      return {
        staff: {
          required: true,
        },
      };
    },

    appointmentPrograms(): IAppointmentProgram[] {
      return useAppointmentProgramStore().getAppointmentProgramsByEventId(this.eventId);
    },

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.appointment?.serviceOptionId);
    },

    // Only display service options that are currently active
    serviceOptions(): IServiceOption[] {
      return this.selectedAppointmentProgram?.serviceOptions.filter((so) => this.serviceOptionTypes.map((t) => t.id).includes(so.serviceOptionType.optionItemId))
      || [];
    },

    allModalities(): IOptionItem[] {
      return useAppointmentProgramStore().getAppointmentModalities(this.appointment?.appointmentModalityId);
    },

    // Only display service options that are currently active
    modalities(): IListOption[] {
      return this.selectedServiceOption?.appointmentModalities.filter((m) => this.allModalities.map((mod) => mod.id).includes(m.optionItemId))
      || [];
    },

    isOnline(): boolean {
      if (!this.selectedModality) {
        return false;
      }
      return this.allModalities.find((m) => m.id === this.selectedModality.optionItemId)?.isOnline;
    },

    serviceOptionStaffMembers(): IAppointmentStaffMember[] {
      if (!this.selectedServiceOption) {
        return [];
      }
      const allStaffMembers = useAppointmentStaffMemberStore().getByAppointmentProgramId(this.selectedAppointmentProgram?.id);
      return allStaffMembers.filter((m) => m.serviceOptionIds.includes(this.selectedServiceOption.id));
    },

    displayedStaffMembers(): Partial<IAppointmentStaffMember>[] {
      if (!this.selectedServiceOption) {
        return [];
      }

      let members: Partial<IAppointmentStaffMember>[] = [];
      const currentUserId = useUserStore().getUserId();

      if (this.$hasLevel(UserRoles.level1)) {
        members = [this.serviceOptionStaffMembers.find((m) => m.userAccountId === currentUserId)].filter((x) => x);
      }

      if (this.$hasLevel(UserRoles.level3) || this.$hasLevel(UserRoles.level0, true)) {
        members.push({ id: this.nextAvailableMemberId });
      }

      if (this.$hasLevel(UserRoles.level3)) {
        const membersExceptCurrentUser = this.serviceOptionStaffMembers.filter((m) => m.userAccountId !== currentUserId);
        const orderedMembers = _orderBy(membersExceptCurrentUser, (member) => useUserAccountMetadataStore().getById(member.userAccountId).givenName);
        members.push(...orderedMembers);
      }

       return members;
    },

    selectedTime: {
      get() {
        return { startDateTime: this.localAppointment.startDate, endDateTime: this.localAppointment.endDate };
      },
      set(value: IDateRange) {
        this.localAppointment.startDate = value?.startDateTime;
        this.localAppointment.endDate = value?.endDateTime;
      },
    },
  },

  watch: {
    async selectedAppointmentProgram(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.selectedServiceOption = null;
        if (newValue) {
          await this.fetchStaffMembers();
        }
      }
    },

    selectedServiceOption(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.selectedModality = null;
        this.selectedStaffMember = null;
      }
    },

    async displayedStaffMembers(newValue: IAppointmentStaffMember[]) {
      if (newValue?.length) {
        const ids = newValue.map((i) => i.userAccountId).filter((i) => i);
        await useUserAccountMetadataStore().fetchByIds(ids, true);
      }
    },

    async selectedDate(newValue) {
      if (newValue && this.selectedStaffMember) {
        await this.fetchStaffMemberAvailability();
      }
    },

    async selectedStaffMember(newValue) {
      if (newValue && this.selectedDate) {
        await this.fetchStaffMemberAvailability();
      }
    },

    // If the user picks a value for sendConfirmationEmail, then picks a modality that forces this value to be true (because is online),
    // and then changes to a different modality, the user comes back to their initial selection
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
          if (!newValue) {
            this.localAppointment.attendeeEmail = this.primaryMemberEmail;
          }
      },
    },

    localAppointment: {
      handler(newValue) {
        this.$emit('update:appointment', newValue);
      },
      deep: true,
    },
 },

  async created() {
    this.localAppointment = new Appointment(this.appointment || APPOINTMENTS[0]);
    this.localAppointment.attendeeEmail = this.primaryMemberEmail;
  },

  methods: {
    getServiceOptionTypeName(serviceOption: IServiceOption): string {
      return this.$m(this.serviceOptionTypes.find((t) => t.id === serviceOption.serviceOptionType.optionItemId)?.name);
    },

    getModalityName(modality: IListOption): string {
      return this.$m(this.allModalities.find((m) => m.id === modality.optionItemId)?.name);
    },

    getAttendeeName(attendee: IMember) {
      let name = `${attendee.identitySet.firstName} ${attendee.identitySet.lastName}`;
      if (attendee.id === this.primaryMemberId) {
        name += ` (${this.$t('caseFile.appointments.attendee.primary')})`;
      }
      return name;
    },

  async  fetchStaffMemberAvailability() {
      const userAccountIds = this.selectedStaffMember.id === this.nextAvailableMemberId
        ? this.displayedStaffMembers.map((m) => m.userAccountId).filter((x) => x)
        : [this.selectedStaffMember.userAccountId];

      const payload: IStaffMemberAvailabilityRequest = {
        appointmentProgramId: this.selectedAppointmentProgram.id,
        userAccountIds,
        dateTime: new Date(`${this.selectedDate} 0:00`).toISOString(),
        localDayOfWeek: new Date(this.selectedDate).getDay(),
      };
      this.availabilities = await this.$services.appointmentStaffMembers.fetchAvailabilites(payload); //  STAFF_MEMBER_AVAILABILITIES; //
    },

    getStaffMemberName(item: IAppointmentStaffMember): TranslateResult | string {
      if (item.id === 'next-available-member') {
        return this.$t('caseFile.appointments.nextAvailable');
      }
      const currentUserId = useUserStore().getUserId();
      if (item.userAccountId === currentUserId) {
        return this.$t('caseFile.appointments.myself');
      }
      const user = useUserAccountMetadataStore().getById(item.userAccountId);

      if (user) {
        return `${user.displayName} (${this.$m(user.roleName)})`;
      }
      return '';
    },

  async fetchStaffMembers() {
    this.loadingStaff = false;
      await useAppointmentStaffMemberStore().fetchByAppointmentProgramId(this.selectedAppointmentProgram.id);
      this.loadingStaff = false;
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
