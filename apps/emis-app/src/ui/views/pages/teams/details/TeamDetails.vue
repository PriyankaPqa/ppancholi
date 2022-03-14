<template>
  <rc-page-content
    :title="$t('teams.team_details')"
    :show-add-button="false"
    show-back-button
    :show-edit-button="$hasLevel('level4')"
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
        <v-col xl="9" md="11" sm="12">
          <v-row class="firstSection">
            <v-col md="11" sm="12">
              <div class="flex flex-row mb-4">
                <h5 data-test="team-title" class="rc-heading-5 mr-3">
                  {{ team.entity.name }}
                </h5>
                <status-chip :status="team.entity.status" data-test="team_status" status-name="Status" />
              </div>

              <v-row no-gutters class="flex justify-space-between mt-6">
                <div class="team_data">
                  <span class="rc-body14 fw-bold">{{ $t('teams.teamtype') }}</span>
                  <span class="rc-body14" data-test="team_type">{{ $m(team.metadata.teamTypeName) }}</span>
                </div>

                <div class="team_data">
                  <span class="rc-body14 fw-bold">{{ $t('teams.team_members') }}</span>
                  <span class="rc-body14" data-test="team_members_count">{{ team.entity.teamMembers.length }}</span>
                </div>

                <div class="team_data">
                  <span class="rc-body14 fw-bold">
                    <v-icon size="24" color="red">mdi-account</v-icon>
                    {{ $t('teams.primary_contact') }}
                  </span>
                  <span
                    v-if="primaryContact"
                    class="rc-body14"
                    style="padding-left: 28px"
                    data-test="team_primary_contact">{{ primaryContact }}</span>
                </div>
              </v-row>

              <v-row no-gutters class="mt-6">
                <div class="team_data">
                  <span class="rc-body14 fw-bold">{{ $tc('teams.related_events', team.metadata.events.length) }}</span>
                  <span class="rc-body14" data-test="team_events">{{ buildEventsString(team.metadata.events) }}</span>
                </div>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="mt-12">
            <v-col class="pa-0">
              <team-members-table
                data-test="team-members-table"
                :team-id="team.entity.id"
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
import { TeamType, ITeamCombined, ITeamEvent } from '@/entities/team';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

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

  computed: {
    team(): ITeamCombined {
      const t = this.$storage.team.getters.get(this.id);
      if (!t?.entity?.id || !t?.metadata?.id) {
        return null;
      }
      return t;
    },

    primaryContactId() : string {
      return (this.team?.entity?.teamMembers || []).find((x) => x.isPrimaryContact)?.id;
    },

    primaryContact(): string {
      return this.$storage.userAccount.getters.get(this.primaryContactId)?.metadata?.displayName || null;
    },
  },

  async mounted() {
    await this.loadTeam();
  },

  methods: {
    async loadTeam() {
      await this.$storage.team.actions.fetch(this.id);
      if (this.primaryContactId) {
        await this.$storage.userAccount.actions.fetch(this.primaryContactId);
      }
    },

    navigateToHome() {
      this.$router.push({ name: routes.teams.home.name });
    },

    navigateToEdit() {
      const teamType = this.team.entity.teamType === TeamType.Standard ? 'standard' : 'adhoc';
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id: this.id, from: this.$route.name } });
    },

    buildEventsString(events: ITeamEvent[]): string {
      if (events.length === 0) {
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
