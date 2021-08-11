<template>
  <div>
    <div
      :class="['table_top_header', showMembers? 'border-radius-top no-bottom-border' : 'border-radius-all']">
      <div class="team_member_toolbar">
        <v-btn v-if="showAddMember" color="primary" data-test="add-new-member" :disabled="disableAddMembers" @click="showAddTeamMemberDialog = true">
          {{ $t('teams.add_new_members') }}
        </v-btn>
        <div v-else />
        <div>
          <v-text-field
            v-if="showSearch"
            v-model="search"
            data-test="search"
            :placeholder="$t('common.search')"
            clearable
            prepend-inner-icon="mdi-magnify"
            background-color="grey lighten-4"
            outlined
            hide-details
            dense
            @click:clear="search = ''" />
        </div>
      </div>
    </div>
    <v-data-table
      v-if="showMembers"
      class="table border-radius-bottom"
      data-test="teamMembers__table"
      hide-default-footer
      :headers="headers"
      :items="computedTeamMembers"
      :items-per-page="Math.max(computedTeamMembers.length, 1)"
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #item.metadata.displayName="{ item }">
        <v-icon v-if="item.isPrimaryContact" data-test="primary_icon" size="18" color="red">
          mdi-account
        </v-icon>
        <span
          class="rc-link14 font-weight-bold"
          data-test="member_name"
          @keydown.enter="viewMemberDetails(item)"
          @click="viewMemberDetails(item)">
          {{ item.metadata.displayName }}
        </span>
      </template>

      <template #item.role="{ item }">
        {{ getRole(item) }}
      </template>

      <template #item.metadata.phoneNumber="{ item }">
        <rc-phone-display :value="item.metadata.phoneNumber" />
      </template>

      <template #item.metadata.teamCount="{ item }">
        {{ item.metadata.teamCount || '0' }}
      </template>

      <template #item.metadata.caseFilesCount="{ item }">
        {{ item.metadata.caseFilesCount || '0' }}
      </template>

      <template #item.metadata.openCaseFilesCount="{ item }">
        {{ item.metadata.openCaseFilesCount || '0' }}
      </template>

      <template #item.metadata.inactiveCaseFilesCount="{ item }">
        {{ item.metadata.inactiveCaseFilesCount || '0' }}
      </template>

      <template #item.delete="{ item }">
        <v-btn
          v-if="showDeleteIcon(item)"
          icon
          x-small
          :data-test="`remove_team_member_${item.entity.id}`"
          @click="handleRemoveTeamMember(item)">
          <v-icon color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <add-team-members
      v-if="showAddTeamMemberDialog"
      data-test="add-team-members"
      :team-members="team.entity.teamMembers"
      :team-id="team.entity.id"
      :show.sync="showAddTeamMemberDialog" />

    <team-member-teams v-if="showMemberDialog" :show.sync="showMemberDialog" :member="clickedMember" />

    <rc-confirmation-dialog
      v-if="showRemoveMemberConfirmationDialog"
      data-test="removeTeamMember_confirmDialog"
      :show.sync="showRemoveMemberConfirmationDialog"
      :title="$t('teams.remove_team_members')"
      :messages="$t('teams.remove_team_members_confirm')"
      :loading="removeLoading"
      @submit="removeTeamMember()"
      @cancel="showRemoveMemberConfirmationDialog = false"
      @close="showRemoveMemberConfirmationDialog = false" />

    <rc-dialog
      v-if="showRemoveMemberConfirmationDialog && hasCaseFiles"
      :title="$t('teams.remove_team_members_case_files')"
      :show-cancel="false"
      :submit-action-label="$t('common.buttons.ok')"
      :show="showRemoveMemberConfirmationDialog && hasCaseFiles"
      :persistent="true"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      @submit="hideConfirmationDialog()"
      @close="showRemoveMemberConfirmationDialog = false">
      <div class="rc-body14 pre-formatted" data-test="message__line_0">
        <span>{{ $t('teams.remove_team_member_with_case_files_confirm') }}</span>
      </div>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import _orderBy from 'lodash/orderBy';
import { RcConfirmationDialog, RcPhoneDisplay, RcDialog } from '@crctech/component-library';
import { ITeamCombined, ITeamMemberAsUser } from '@/entities/team';
import helpers from '@/ui/helpers';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import TeamMemberTeams from '@/ui/views/pages/teams/components/TeamMemberTeams.vue';

export default Vue.extend({
  name: 'TeamMembersTable',

  components: {
    AddTeamMembers,
    RcConfirmationDialog,
    RcPhoneDisplay,
    TeamMemberTeams,
    RcDialog,
  },

  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },

    showMembers: {
      type: Boolean,
      default: true,
    },

    disableAddMembers: {
      type: Boolean,
      default: false,
    },

    showAddMember: {
      type: Boolean,
      default: true,
    },

    disabledDeleteMember: {
      type: Boolean,
      default: false,
    },

    teamId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'metadata.displayName',
      search: '',
      showAddTeamMemberDialog: false,
      showRemoveMemberConfirmationDialog: false,
      hasCaseFiles: false,
      removeMemberId: '',
      searchAmong: [
        'metadata.displayName',
        'metadata.emailAddress',
        'metadata.phoneNumber',
        'metadata.teamCount',
        'metadata.caseFilesCount',
        'metadata.openCaseFilesCount',
        'metadata.inactiveCaseFilesCount',
        'metadata.roleName',
      ],
      showMemberDialog: false,
      clickedMember: null as ITeamMemberAsUser,
      removeLoading: false,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.displayName',
        },
        {
          text: this.$t('teams.member_email') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'metadata.emailAddress',
        },
        {
          text: this.$t('teams.phone_number') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'metadata.phoneNumber',
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'role',
          width: '100px',
        },
        {
          text: this.$t('teams.teams') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'metadata.teamCount',
          width: '20px',
        },
        {
          text: this.$t('teams.count_file.total') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.caseFilesCount',
        },
        {
          text: this.$t('teams.count_file.open') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.openCaseFilesCount',
        },
        {
          text: this.$t('teams.count_file.inactive') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.inactiveCaseFilesCount',
        },
        {
          text: '',
          value: 'delete',
          width: '10px',
          sortable: false,
          filterable: false,
        },
      ];
      if (this.disabledDeleteMember) {
        return headers.filter((h) => h.value !== 'delete');
      }
      return headers;
    },

    computedTeamMembers(): Array<ITeamMemberAsUser> {
      const users = this.$storage.userAccount.getters.getByIds(this.team.entity.teamMembers.map((m) => m.id)).map((x) => ({
        entity: x.entity,
        metadata: x.metadata,
        isPrimaryContact: this.team.entity.teamMembers.find((tm) => tm.id === x.entity?.id)?.isPrimaryContact,
      }));
      const direction = this.sortDesc ? 'desc' : 'asc';
      const filtered = helpers.filterCollectionByValue(users, this.search, false, this.searchAmong, true);
      return _orderBy(filtered, this.sortBy, direction);
    },

    team(): ITeamCombined {
      return this.$storage.team.getters.get(this.teamId);
    },

  },
  async mounted() {
    await this.loadUsers();
  },

  methods: {
    async loadUsers() {
      await this.$storage.userAccount.actions.fetchAll();
    },

    showRemoveConfirmationDialog(id: string) {
      this.removeMemberId = id;
      this.showRemoveMemberConfirmationDialog = true;
      this.hasCaseFiles = false;
    },
    showRemoveConfirmationDialogWithCaseFiles(id: string) {
      this.removeMemberId = id;
      this.showRemoveMemberConfirmationDialog = true;
      this.hasCaseFiles = true;
    },
    showPrimaryContactMessage() {
      this.$toasted.global.warning(this.$t('teams.remove_team_members_change_contact'));
    },
    hideConfirmationDialog() {
      this.showRemoveMemberConfirmationDialog = false;
    },

    async removeTeamMember() {
      try {
        this.removeLoading = true;
        await this.$storage.team.actions.removeTeamMember(this.teamId, this.removeMemberId);
        this.$toasted.global.success(this.$t('teams.remove_team_members_success'));
      } finally {
        this.showRemoveMemberConfirmationDialog = false;
        this.removeLoading = false;
      }
    },

    getRole(user: ITeamMemberAsUser): string {
      if (user.metadata.roleName) return this.$m(user.metadata.roleName);
      return '';
    },

    showDeleteIcon(member: ITeamMemberAsUser): boolean {
      if (member.isPrimaryContact) {
        return this.$hasLevel('level5');
      }
      return this.$hasLevel('level4');
    },

    async viewMemberDetails(member: ITeamMemberAsUser) {
      this.showMemberDialog = true;
      this.clickedMember = member;
    },

    handleRemoveTeamMember(item: ITeamMemberAsUser) {
      if (item.isPrimaryContact) {
        this.showPrimaryContactMessage();
      } else if (item.metadata.openCaseFilesCount === 0) {
        this.showRemoveConfirmationDialog(item.entity.id);
      } else if (item.metadata.caseFilesCount) {
        this.showRemoveConfirmationDialogWithCaseFiles(item.entity.id);
      } else {
        this.showRemoveConfirmationDialog(item.entity.id);
      }
    },

  },
});

</script>

<style scoped lang="scss">

.team_member_toolbar {
  display: flex;
  width: 100%;
  justify-content: space-between;

  & div:nth-child(2) {
    max-width: 500px;
  }
}

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  padding: 10px 15px;
}

.table {
  border: solid 1px var(--v-grey-lighten2);
}

.team_member_header {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--v-grey-darken4) !important;;
}

.no-bottom-border {
  border-bottom: none;
}

</style>
