<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" xl="8" lg="9" md="11">
        <v-row class="mt-4">
          <v-col cols="12" md="6" class="pb-0">
            <v-select-a11y
              v-model="selectedAppointmentProgram"
              outlined
              data-test="select-appointment-program"
              attach
              :return-object="false"
              :label="`${$t('caseFile.appointments.appointmentProgram')} *`"
              :items="appointmentPrograms"
              :item-value="(item) => item.id"
              :item-text="(item) => $m(item.name)" />
          </v-col>
          <v-col cols="12" md="6" class="pb-0">
            <v-select-a11y
              v-model="selectedServiceOption"
              outlined
              data-test="select-service-option"
              attach
              :return-object="false"
              :label="`${$t('caseFile.appointments.serviceOption')} *`"
              :items="serviceOptions"
              :item-value="(item) => item.id"
              :item-text="(item) => $m(item.name)" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedStaffMember"
              data-test="select-staff-member"
              attach
              :label="`${$t('caseFile.appointments.setMeetingFor')} *`"
              :item-value="(item) => item.id"
              :item-text="(item) => getStaffMemberName(item)"
              :items="staffMembers"
              :rules="rules.staff" />
          </v-col>
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedModality"
              data-test="select-appointment-duration"
              attach
              :label="`${$t('caseFile.appointments.modality')} *`"
              :items="modalities"
              :rules="rules.duration" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12" md="6" class="pb-0">
            <v-select-with-validation
              v-model="selectedAttendee"
              data-test="select-attendee"
              attach
              :label="`${$t('caseFile.appointments.attendee')} *`"
              :item-value="(item) => item.id"
              :item-text="(item) => item"
              :items="attendees"
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

        <v-row>
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

              <appointment-time-picker
                v-if="selectedDate && selectedDuration"
                :date="selectedDate"
                :duration="selectedDuration"
                :availabilities="availabilities" />
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Appointment, IAppointment, IAppointmentProgram, IDateRange } from '@libs/entities-lib/appointment';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserStore } from '@/pinia/user/user';
import { BaseEntity } from '@libs/entities-lib/base';
import helpers from '@/ui/helpers/helpers';
import { IDaySchedule } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IMemberEntity } from '@libs/entities-lib/household-create';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IServiceOption } from '@libs/entities-lib/src/appointment';
import { STAFF_MEMBER_IDS, STAFF_MEMBER_AVAILABILITIES, APPOINTMENTS } from '../../../../appointments/home/mocks';
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
  },

  data() {
    return {
      localAppointment: null as IAppointment,
      loading: false,
      getLocalStringDate: helpers.getLocalStringDate,
      availabilities: [] as IDateRange[],
      staffMemberSchedule: null as IDaySchedule,

      appointmentPrograms: [] as IAppointmentProgram[],
      selectedAppointmentProgram: null as IAppointmentProgram,
      serviceOptions: [] as IServiceOption[],
      selectedServiceOption: null as IServiceOption,
      appointmentDurations: ['15', '20', '30', '60'],
      selectedDuration: '30',
      selectedStaffMember: null as IUserAccountMetadata,
      modalities: [] as IOptionItem[],
      selectedModality: null as IOptionItem,
      attendees: [] as IMemberEntity[],
      selectedAttendee: null as IMemberEntity,
      selectedDate: '',
    };
  },

  computed: {
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

    staffMemberIds(): string[] {
      return STAFF_MEMBER_IDS;
    },

    staffMembers(): IUserAccountMetadata[] {
      const nextAvailableMember = new BaseEntity();
      nextAvailableMember.id = 'next-available-member';
      return useUserAccountMetadataStore().getByIds(this.staffMemberIds, true).concat([nextAvailableMember]);
    },
  },

  watch: {
    selectedDate(newValue) {
      if (newValue && !this.selectedStaffMember) {
        this.getStaffMemberAvailability();
      }
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
  },

  methods: {
    getStaffMemberAvailability() {
      // TODO: Call BE for availability, pass this.selectedStaffMember.id. if id === 'next-available-member', send all ids
      this.availabilities = STAFF_MEMBER_AVAILABILITIES;
    },

    getStaffMemberName(item: IUserAccountMetadata): string {
      if (item.id === 'next-available-member') {
        return 'Next available member TBT';
      }
      const currentUserId = useUserStore().getUserId();
      if (item.id === currentUserId) {
        return 'MYSELF TBT';
      }
      if (item) {
        return item.displayName;
      }
      return '';
    },

  },
});
</script>
