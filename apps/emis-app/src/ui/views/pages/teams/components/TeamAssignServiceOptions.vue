<template>
  <v-container class="px-0">
    <v-row class="ma-0">
      <v-col v-if="team.teamType === TeamType.Standard" md="4" class="pl-0 py-0">
        <v-select-a11y
          v-model="selectedEvent"
          outlined
          data-test="team_assignServiceOptions_event"
          :label="$t('teams.assignServiceOptions.event')"
          :items="events"
          attach
          hide-details
          :loading="loadingPrograms"
          dense
          :menu-props="{ top: !selectedAppointmentProgram, offsetY: true, zIndex: 100 }"
          :item-text="(item) => $m(item.name)"
          return-object />
      </v-col>
      <v-col md="4" class="pa-0">
        <v-select-a11y
          v-model="selectedAppointmentProgramId"
          outlined
          data-test="team_assignServiceOptions_appointmentProgram"
          attach
          hide-details
          dense
          :return-object="false"
          :loading="loadingStaff"
          :menu-props="{ top: !selectedAppointmentProgram, offsetY: true, zIndex: 100 }"
          :label="$t('teams.assignServiceOptions.appointmentProgram')"
          :items="appointmentPrograms"
          :item-value="(item) => item.id"
          :item-text="(item) => $m(item.name)" />
      </v-col>
    </v-row>

    <v-row v-if="selectedAppointmentProgram" class="mx-0">
      <v-col md="12" class="px-0">
        <assign-service-options
          data-test="team_assignServiceOptions_table"
          :service-options="selectedAppointmentProgram.serviceOptions"
          :users="teamMembers.map(m => m.metadata)"
          :appointment-program-id="selectedAppointmentProgram.id"
          :staff-members="staffMembers"
          in-team-management />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { useTeamStore } from '@/pinia/team/team';
import { EFilterKeyType } from '@libs/component-lib/types';
import { IAppointmentProgram, IAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { IEventEntity } from '@libs/entities-lib/event';
import { ITeamEntity, ITeamMemberAsUser, TeamType } from '@libs/entities-lib/team';
import { useAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member';
import { VSelectA11y } from '@libs/component-lib/components';
import AssignServiceOptions from '../../appointment-programs/components/AssignServiceOptions.vue';

export default Vue.extend({
  name: 'TeamAssignServiceOptions',

  components: {
    AssignServiceOptions,
    VSelectA11y,
  },

  props: {
    teamId: {
      type: String,
      required: true,
    },

    teamMembers: {
      type: Array as ()=> ITeamMemberAsUser[],
      default: () => [] as ITeamMemberAsUser[],
    },

    events: {
      type: Array as ()=> IEventEntity[],
      required: true,
    },
  },

  data() {
    return {
      TeamType,
      selectedEvent: null as IEventEntity,
      selectedAppointmentProgramId: '',
      loadingPrograms: false,
      loadingStaff: false,
    };
  },

  computed: {
    team(): ITeamEntity {
      return useTeamStore().getById(this.teamId);
    },

    selectedAppointmentProgram(): IAppointmentProgram {
      if (this.selectedAppointmentProgramId) {
        return useAppointmentProgramStore().getById(this.selectedAppointmentProgramId);
      }
      return null;
    },

    staffMembers(): Partial<IAppointmentStaffMember>[] {
      if (this.selectedAppointmentProgramId) {
        return useAppointmentStaffMemberStore().getByAppointmentProgramId(this.selectedAppointmentProgramId);
      }
      return [];
    },

    appointmentPrograms(): IAppointmentProgram[] {
      return useAppointmentProgramStore().getByCriteria(this.selectedEvent?.id, true, ['eventId']);
    },
  },

  watch: {
    events() {
      if (this.team.teamType === TeamType.AdHoc) {
        this.selectedEvent = this.events?.[0];
      }
    },

    async selectedEvent(newValue) {
      if (newValue?.id) {
        this.selectedAppointmentProgramId = '';
        await this.fetchAppointmentPrograms();
      }
    },

    selectedAppointmentProgramId(newValue) {
      if (newValue) {
        this.fetchStaffMembers();
      }
    },
  },

 async created() {
    if (this.team.teamType === TeamType.AdHoc) {
      this.selectedEvent = this.events?.[0];
    }
  },

  methods: {
    async fetchAppointmentPrograms() {
      this.loadingPrograms = true;
      await useAppointmentProgramStore().fetchByEventId(this.selectedEvent.id);
      this.loadingPrograms = false;
    },

    async fetchStaffMembers() {
      this.loadingStaff = true;
      await useAppointmentStaffMemberStore().search({ params: {
        filter: { 'Entity/AppointmentProgramId': { value: this.selectedAppointmentProgramId, type: EFilterKeyType.Guid } },
        skip: 0,
      },
includeInactiveItems: true });
      this.loadingStaff = false;
    },

  },
});
</script>
