<template>
  <rc-dialog
    :title="$t('caseFileDetail.viewAssigned')"
    :submit-action-label="$t('common.buttons.close')"
    data-test="view-assigned-dialog"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    :persistent="true"
    :max-width="750"
    :min-height="500"
    :show-submit="!loading"
    :tooltip-label="$t('common.tooltip_label')"
    :show-cancel="false"
    @close="close"
    @submit="close">
    <rc-page-loading v-if="loading" />
    <v-row v-else>
      <v-col cols="12" class="px-6 py-0 my-4">
        <assigned-list
          :assigned-individuals="assignedIndividuals"
          :assigned-teams="assignedTeams"
          is-view-only />
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, RcPageLoading } from '@libs/component-lib/components';
import { IdParams, ITeamEntity, ITeamMetadata } from '@libs/entities-lib/team';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { useTeamMetadataStore, useTeamStore } from '@/pinia/team/team';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import AssignedList, { IIndividual } from './AssignedList.vue';

export default Vue.extend({
  name: 'ViewAssigned',

  components: {
    RcDialog,
    RcPageLoading,
    AssignedList,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
  },

  data() {
    return {
      assignedIndividuals: [] as IIndividual[],
      allAssignedTeams: [] as ITeamEntity[],
      loading: false,
      combinedTeamStore: new CombinedStoreFactory<ITeamEntity, ITeamMetadata, IdParams>(useTeamStore(), useTeamMetadataStore()),
    };
  },

  computed: {
    teamsIdsFromIndividuals(): string[] {
      return this.caseFile.assignedTeamMembers.map((t) => t.teamId);
    },
    individualsIds(): string[] {
      return this.caseFile.assignedTeamMembers.reduce((acc, i) => i.teamMembersIds.concat(acc), []);
    },
    assignedTeams(): ITeamEntity[] {
      return this.allAssignedTeams.filter((t) => this.caseFile.assignedTeamIds.includes(t.id));
    },
  },

  async created() {
    try {
      this.loading = true;
      await this.fetchUserAccounts(this.individualsIds);
      this.allAssignedTeams = await useTeamStore().getTeamsAssigned(this.caseFile.id);
      await this.setAssignedIndividuals();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async fetchUserAccounts(ids: string[]): Promise<void> {
      const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
      await this.$storage.userAccount.actions.search({ filter });
    },

    async fetchTeams(ids: string[]): Promise<void> {
      const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
      await this.combinedTeamStore.search({ filter });
    },

    setAssignedIndividuals() {
      const teamsThroughIndividuals = this.combinedTeamStore.getByIds(this.teamsIdsFromIndividuals);
      const userAccounts = this.$storage.userAccount.getters.getByIds(this.individualsIds);

      this.caseFile.assignedTeamMembers.forEach((team) => {
        const teamId = team.teamId;
        const teamName = teamsThroughIndividuals.find((t) => t.entity.id === teamId)?.entity.name;

        team.teamMembersIds.forEach((id) => {
          const user = userAccounts.find((u) => u.entity.id === id);
          this.assignedIndividuals.push({
            ...user,
            id: user?.entity?.id,
            teamId,
            teamName,
            isPrimaryContact: false,
          });
        });
      });
    },
  },
});

</script>
