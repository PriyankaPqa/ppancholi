<template>
  <v-container class="px-0">
    <v-row class="my-2 mx-0">
      <v-col v-if="team.teamType === TeamType.Standard" md="4" class="pl-0 py-0">
        <v-select-a11y
          v-model="selectedEvent"
          outlined
          data-test="team_assignServiceOptions_event"
          :label="$t('teams.assignServiceOptions.event')"
          :items="events"
          attach
          hide-details
          :loading="loading"
          dense
          :menu-props="{ top: !selectedAppointmentProgram, offsetY: true, zIndex: 100 }"
          :item-text="(item) => $m(item.name)"
          return-object />
      </v-col>
      <v-col md="4" class="pa-0">
        <v-select-a11y
          v-model="selectedAppointmentProgram"
          outlined
          data-test="team_assignServiceOptions_appointmentProgram"
          attach
          hide-details
          dense
          :menu-props="{ top: !selectedAppointmentProgram, offsetY: true, zIndex: 100 }"
          :label="$t('teams.assignServiceOptions.appointmentProgram')"
          :items="appointmentPrograms"
          :item-text="(item) => $m(item.name)"
          return-object />
      </v-col>
    </v-row>

    <v-row v-if="selectedAppointmentProgram" class="mx-0">
      <v-col md="12" class="px-0">
        <assign-service-options
          :service-options="selectedAppointmentProgram.serviceOptions"
          :users="teamMembers.map(m=> m.metadata)"
          :appointment-program-id="selectedAppointmentProgram.id"
          :staff-members.sync="staffMembers"
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
import AssignServiceOptions from '../../appointment-programs/components/AssignServiceOptions.vue';

export default Vue.extend({
  name: 'TeamAssignServiceOptions',

  components: {
    AssignServiceOptions,
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
      selectedAppointmentProgram: null as IAppointmentProgram,
      appointmentProgramIds: [] as string[],
      loading: false,
    };
  },

  computed: {
    team(): ITeamEntity {
      return useTeamStore().getById(this.teamId);
    },

    appointmentPrograms(): IAppointmentProgram[] {
      return useAppointmentProgramStore().getByIds(this.appointmentProgramIds);
    },

    staffMembers(): Partial<IAppointmentStaffMember>[] {
      return useAppointmentStaffMemberStore().getByAppointmentProgramId(this.selectedAppointmentProgram.id);
    },
  },

  watch: {
    events() {
      if (this.team.teamType === TeamType.AdHoc) {
        this.selectedEvent = this.events[0];
      }
    },

    selectedEvent() {
      this.onSelectEvent();
    },

    selectedAppointmentProgram() {
      this.fetchStaffMembers();
    },
  },

 async created() {
    if (this.team.teamType === TeamType.AdHoc) {
      this.selectedEvent = this.events[0];
    }
  },

  methods: {
    async onSelectEvent() {
      this.selectedAppointmentProgram = null;
      await this.fetchAppointmentPrograms();
    },

    async fetchAppointmentPrograms() {
      const res = await useAppointmentProgramStore().search({ params: {
        filter: { 'Entity/EventId': { value: this.selectedEvent.id, type: EFilterKeyType.Guid }, 'Entity/AppointmentProgramStatus': 'Active' },
        top: 999,
        skip: 0,
      } });
      if (res) {
        this.appointmentProgramIds = res.ids;
      }
    },

    async fetchStaffMembers() {
      this.loading = true;
      await useAppointmentStaffMemberStore().search({ params: {
        filter: { 'Entity/AppointmentProgramId': { value: this.selectedAppointmentProgram.id, type: EFilterKeyType.Guid } },
        top: 999,
        skip: 0,
      } });
      this.loading = false;
    },

  },
});
</script>
