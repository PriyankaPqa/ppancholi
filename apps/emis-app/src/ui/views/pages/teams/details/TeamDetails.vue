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
                  <span class="rc-body14 fw-bold">{{ $t('teams.teamtype') }}</span>
                  <span class="rc-body14" data-test="team_type">{{ $m(teamMetadata.teamTypeName) }}</span>
                </v-col>

                <v-col class="team_data">
                  <span class="rc-body14 fw-bold">{{ $t('teams.team_members') }}</span>
                  <span class="rc-body14" data-test="team_members_count">{{ teamMemberAmount }}</span>
                </v-col>

                <v-col class="team_data">
                  <span class="rc-body14 fw-bold">
                    <v-icon size="24" color="red">mdi-account</v-icon>
                    {{ $t('teams.primary_contact') }}
                  </span>
                  <span
                    v-if="primaryContact"
                    class="rc-body14"
                    style="padding-left: 28px"
                    data-test="team_primary_contact">{{ primaryContact }}</span>
                </v-col>
              </v-row>

              <v-row no-gutters class="mt-6 flex justify-space-between">
                <v-col class="team_data">
                  <span class="rc-body14 fw-bold">{{ $tc('teams.related_events', eventAmount) }}</span>
                  <span class="rc-body14" data-test="team_events">{{ buildEventsString(teamMetadata.events) }}</span>
                </v-col>
                <v-col
                  v-if="$hasFeature(FeatureKeys.TaskManagement)"
                  :cols="displayEscalationLabel ? 4 : 8"
                  class="team_data"
                  data-test="team_isAssignable">
                  <span class="rc-body14 fw-bold">{{ $t('teams.set_assignable_team') }}</span>
                  <span class="rc-body14">{{ team.isAssignable ? $t('common.yes') : $t('common.no') }}</span>
                </v-col>
                <v-col
                  v-if="displayEscalationLabel"
                  cols="4"
                  class="team_data"
                  data-test="team_escalation">
                  <span class="rc-body14 fw-bold">{{ $t('teams.set_as') }}</span>
                  <span class="rc-body14">{{ $t('teams.escalation') }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="mt-12">
            <v-col class="pa-0">
              <team-members-table
                data-test="team-members-table"
                :team-id="teamId"
                disabled-delete-member
                :show-add-member="false"
                :is-edit-mode="false" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@libs/component-lib/components';
import {
  TeamType, ITeamEvent, ITeamEntity, ITeamMetadata,
} from '@libs/entities-lib/team';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useTeamMetadataStore, useTeamStore } from '@/pinia/team/team';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'TeamDetails',
  components: {
    StatusChip,
    RcPageContent,
    TeamMembersTable,
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
      FeatureKeys,
      isEscalation: true,
    };
  },

  computed: {
    team(): ITeamEntity {
      return useTeamStore().getById(this.id);
    },

    teamMetadata(): ITeamMetadata {
      return useTeamMetadataStore().getById(this.id);
    },

    primaryContactId() : string {
      return (this.team?.teamMembers || []).find((x) => x.isPrimaryContact)?.id;
    },

    primaryContact(): string {
      return useUserAccountMetadataStore().getById(this.primaryContactId)?.displayName || null;
    },

    eventAmount(): number {
      return this.teamMetadata?.events?.length;
    },

    teamMemberAmount(): number {
      return this.team?.teamMembers?.length;
    },

    teamId(): string {
      return this.team?.id || this.$route.params.id;
    },

    displayEscalationLabel(): boolean {
      return this.$hasFeature(FeatureKeys.TaskManagement) && this.team.teamType === TeamType.AdHoc && this.team.isEscalation;
    },
  },

  async created() {
    await this.loadTeam();
  },

  methods: {
    async loadTeam() {
      await useTeamStore().fetch(this.id);
      await useTeamMetadataStore().fetch(this.id, false);
      if (this.primaryContactId) {
        await useUserAccountMetadataStore().fetch(this.primaryContactId, false);
      }
    },

    navigateToHome() {
      this.$router.push({ name: routes.teams.home.name });
    },

    navigateToEdit() {
      const teamType = this.team.teamType === TeamType.Standard ? 'standard' : 'adhoc';
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id: this.id, from: this.$route.name } });
    },

    buildEventsString(events: ITeamEvent[]): string {
      if (!events) {
        return '';
      }
      return events.map((e: ITeamEvent) => this.$m(e.name)).join(', ');
    },
  },
});

</script>

<style scoped lang="scss">

.team_data {
  display: grid;
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
