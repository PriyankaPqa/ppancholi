<template>
  <rc-dialog
    :title="$t('caseFileDetail.viewAssigned')"
    :submit-action-label="$t('common.buttons.back')"
    data-test="view-assigned-dialog"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    :persistent="true"
    :max-width="750"
    :min-height="480"
    :tooltip-label="$t('common.tooltip_label')"
    :loading="loading"
    :show-cancel="false"
    @close="close"
    @submit="close">
    <v-row>
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
import { RcDialog } from '@libs/component-lib/components';
import { ITeamEntity, ITeamMemberAsUser } from '@/entities/team';
import { IUserAccountCombined } from '@/entities/user-account';
import { IAzureTableSearchResults } from '@libs/core-lib/types';
import AssignedList from './AssignedList.vue';

export default Vue.extend({
  name: 'ViewAssignedOld',

  components: {
    RcDialog,
    AssignedList,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    assignedTeams: {
      type: Array as ()=> ITeamEntity[],
      required: true,
    },
    assignedIndividualIds: {
      type: Array as ()=> string[],
      required: true,
    },
  },

  data() {
    return {
      assignedIndividuals: [] as ITeamMemberAsUser[],
      searchTerm: '',
      loading: false,
    };
  },

  async created() {
    try {
      this.loading = true;
      await this.setAssignedIndividuals();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async setAssignedIndividuals() {
      try {
        this.loading = true;
        const filter = `search.in(Entity/Id, '${this.assignedIndividualIds.join('|')}', '|')`;
        const individualsData: IAzureTableSearchResults = await this.$storage.userAccount.actions.search({ filter });
        const { ids } = individualsData;
        const individuals = this.$storage.userAccount.getters.getByIds(ids);

        this.assignedIndividuals = individuals?.map((i: IUserAccountCombined) => ({
          ...i,
          isPrimaryContact: false,
        })) || [];
      } finally {
        this.loading = false;
      }
    },
  },
});

</script>
