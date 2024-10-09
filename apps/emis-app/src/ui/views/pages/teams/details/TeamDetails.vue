<template>
  <rc-page-content
    :title="$t('teams.team_details')"
    :show-add-button="false"
    show-back-button
    :show-edit-button="$hasLevel(UserRoles.level4)"
    @edit="navigateToEdit"
    @back="navigateToHome">
    <v-container v-if="!team">
      <v-row justify="center">
        <v-col cols="12" lg="10" class="mt-10">
          <v-skeleton-loader class="my-6" type="article" />
          <v-skeleton-loader class="my-6" type="article" />
          <v-skeleton-loader class="my-6" type="article" />
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row justify="center" class="my-8">
        <v-col xl="10" md="11" sm="12">
          <v-row class="firstSection">
            <v-col md="11" sm="12">
              <div class="flex flex-row mb-4">
                <div data-test="team-title" class="rc-heading-5 mr-3">
                  {{ team.name }}
                </div>
                <div v-if="displayEscalationLabel" data-test="team-title-escalation" class="rc-heading-5 mr-3">
                  {{ `(${$t('teams.escalation')})` }}
                </div>
                <status-chip :status="team.status" data-test="team_status" status-name="Status" />
              </div>

              <v-row no-gutters class="mt-6">
                <v-col class="team_data">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.teamtype') }}
                  </div>
                  <div class="rc-body14" data-test="team_type">
                    {{ $t(`enums.TeamType.${TeamType[team.teamType]}`) }}
                  </div>
                </v-col>

                <v-col class="team_data">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.team_members') }}
                  </div>
                  <div class="rc-body14" data-test="team_members_count">
                    {{ teamMemberAmount }}
                  </div>
                </v-col>

                <v-col class="team_data">
                  <div class="rc-body14 fw-bold">
                    <v-icon size="24" color="red">
                      mdi-account
                    </v-icon>
                    {{ $t('teams.primary_contact') }}
                  </div>
                  <div
                    v-if="primaryContact"
                    class="rc-body14"
                    style="padding-left: 28px"
                    data-test="team_primary_contact">
                    {{ primaryContact }}
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters class="mt-6 flex">
                <v-col
                  v-if="$hasFeature($featureKeys.TaskManagement)"
                  :cols="4"
                  class="team_data"
                  data-test="team_isAssignable">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.set_assignable_team') }}
                  </div>
                  <div class="rc-body14">
                    {{ team.isAssignable ? $t('common.yes') : $t('common.no') }}
                  </div>
                </v-col>
                <v-col
                  v-if="!$hasFeature($featureKeys.AppointmentBooking) && displayEscalationLabel"
                  cols="4"
                  class="team_data"
                  data-test="team_escalation">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.set_as') }}
                  </div>
                  <div class="rc-body14">
                    {{ $t('teams.escalation') }}
                  </div>
                </v-col>
                <v-col
                  v-if="!$hasFeature($featureKeys.AppointmentBooking) && displayUseLodging"
                  cols="4"
                  class="team_data"
                  data-test="team_lodging">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.set_as') }}
                  </div>
                  <div class="rc-body14">
                    {{ $t('teams.lodging') }}
                  </div>
                </v-col>
                <v-col
                  v-if="displayAllSetAs"
                  cols="4"
                  class="team_data"
                  data-test="team_all_sets">
                  <div class="rc-body14 fw-bold">
                    {{ $t('teams.set_as') }}
                  </div>
                  <div class="rc-body14" data-test="team_all_sets_label">
                    {{ labelForSetAs }}
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters class="mt-6 flex">
                <v-col class="team_data">
                  <div class="rc-body14 fw-bold">
                    {{ $tc('teams.related_events', eventCount) }}
                  </div>
                  <div class="rc-body14" data-test="team_events">
                    {{ getEventNames() }}
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="mt-8">
            <v-col v-if="!$hasFeature($featureKeys.AppointmentBooking) || !team.useForAppointments" class="pa-0 mt-6">
              <team-members-table
                data-test="team-members-table"
                :team-id="teamId"
                disabled-delete-member
                :show-add-member="false"
                :team-members-data.sync="teamMembers"
                :is-edit-mode="false" />
            </v-col>
            <v-col v-else class="pt-0">
              <rc-tabs class="mb-2">
                <rc-tab
                  v-for="tab in tabs"
                  :key="tab"
                  :label="$t(`team.tab.title--${SelectedTab[tab]}`)"
                  :data-test="`team.tab.title--${SelectedTab[tab]}`"
                  :active="selectedTab === tab"
                  @click="selectedTab = tab" />
              </rc-tabs>
              <team-members-table
                v-if="selectedTab === SelectedTab.TeamMembers"
                data-test="team-members-table"
                :team-id="teamId"
                disabled-delete-member
                :show-add-member="false"
                :team-members-data.sync="teamMembers"
                :is-edit-mode="false" />
              <team-assign-service-options
                v-if="selectedTab === SelectedTab.AssignServiceOptions"
                data-test="assign-service-options-table"
                :team-id="team.id"
                :events="events"
                :team-members="teamMembers" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcTab, RcTabs } from '@libs/component-lib/components';
import { TeamType, ITeamEntity, ITeamMemberAsUser } from '@libs/entities-lib/team';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useTeamStore } from '@/pinia/team/team';
import { UserRoles } from '@libs/entities-lib/user';
import { GlobalHandler } from '@libs/services-lib/http-client';
import { IEventSummary } from '@libs/entities-lib/event';
import TeamAssignServiceOptions from '../components/TeamAssignServiceOptions.vue';

export enum SelectedTab {
  TeamMembers = 1,
  AssignServiceOptions = 2,
}

export default Vue.extend({
  name: 'TeamDetails',
  components: {
    StatusChip,
    RcPageContent,
    TeamMembersTable,
    RcTab,
    RcTabs,
    TeamAssignServiceOptions,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      UserRoles,
      TeamType,
      isEscalation: true,
      tabs: [SelectedTab.TeamMembers, SelectedTab.AssignServiceOptions],
      SelectedTab,
      selectedTab: SelectedTab.TeamMembers,
      teamMembers: [] as ITeamMemberAsUser[],
      events: [] as IEventSummary[],
    };
  },

  computed: {
    team(): ITeamEntity {
      return useTeamStore().getById(this.id);
    },

    primaryContactId() : string {
      return (this.team?.teamMembers || []).find((x) => x.isPrimaryContact)?.id;
    },

    primaryContact(): string {
      return useUserAccountMetadataStore().getById(this.primaryContactId)?.displayName || null;
    },

    eventCount(): number {
      return this.team?.eventIds?.length;
    },

    teamMemberAmount(): number {
      return this.team?.teamMembers?.length;
    },

    teamId(): string {
      return this.team?.id || this.$route.params.id;
    },

    displayEscalationLabel(): boolean {
      return this.$hasFeature(this.$featureKeys.TaskManagement) && this.team.teamType === TeamType.AdHoc && this.team.isEscalation;
    },

    displayUseLodging(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && this.team.useForLodging;
    },

    displayAllSetAs(): boolean {
      return this.$hasFeature(this.$featureKeys.AppointmentBooking) && (this.displayUseLodging || this.displayEscalationLabel || this.team.useForAppointments);
    },

    labelForSetAs(): string {
      const lodgingLabel = this.displayUseLodging ? this.$t('teams.lodging') : null;
      const escalationLabel = this.displayEscalationLabel ? this.$t('teams.escalation') : null;
      const appointmentsLabel = this.team.useForAppointments ? this.$t('teams.appointments') : null;

      return [lodgingLabel, escalationLabel, appointmentsLabel].filter((x) => x).join(', ');
    },
  },

  async created() {
    await this.loadTeam();
  },

  methods: {
    getEventNames() {
      return this.events.map((e) => this.$m(e.name)).sort((a, b) => a?.toLowerCase()?.localeCompare(b?.toLowerCase())).join(', ');
    },

    async loadTeam() {
      const t = await useTeamStore().fetch(this.id);
      this.events = (await this.$services.publicApi.searchEventsById(t.eventIds)).value;
      if (this.primaryContactId) {
        await useUserAccountMetadataStore().fetch(this.primaryContactId, GlobalHandler.Disabled);
      }
    },

    navigateToHome() {
      this.$router.push({ name: routes.teams.home.name });
    },

    navigateToEdit() {
      const teamType = this.team.teamType === TeamType.Standard ? 'standard' : 'adhoc';
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id: this.id, from: this.$route.name } });
    },
  },
});

</script>

<style scoped lang="scss">

.team_data {
  display: flex;
  flex-direction: column;
}

.firstSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
}

</style>
