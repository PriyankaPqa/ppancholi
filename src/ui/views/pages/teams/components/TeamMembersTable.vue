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
      <template #item.displayName="{ item }">
        <v-icon v-if="item.isPrimaryContact" data-test="primary_icon" size="18" color="red">
          mdi-account
        </v-icon>
        <span
          class="rc-link14 font-weight-bold"
          data-test="member_name"
          @keydown.enter="viewMemberDetails(item)"
          @click="viewMemberDetails(item)">
          {{ item.displayName }}
        </span>
      </template>

      <template #item.role="{ item }">
        {{ getRole(item) }}
      </template>

      <template #item.phoneNumber="{ item }">
        <rc-phone-display :value="item.phoneNumber" />
      </template>

      <template #item.teamCount="{ item }">
        {{ item.teamCount || '0' }}
      </template>

      <template #item.caseFilesCount="{ item }">
        {{ item.caseFilesCount || '0' }}
      </template>

      <template #item.openCaseFilesCount="{ item }">
        {{ item.openCaseFilesCount || '0' }}
      </template>

      <template #item.inactiveCaseFilesCount="{ item }">
        {{ item.inactiveCaseFilesCount || '0' }}
      </template>

      <template #item.delete="{ item }">
        <v-btn
          v-if="showDeleteIcon(item)"
          icon
          x-small
          :data-test="`remove_team_member_${item.userAccountId}`"
          @click="item.isPrimaryContact ? showPrimaryContactMessage() : showRemoveConfirmationDialog(item.userAccountId)">
          <v-icon color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <add-team-members
      v-if="showAddTeamMemberDialog"
      data-test="add-team-members"
      :team-members="team.teamMembers"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import _orderBy from 'lodash/orderBy';
import { ITeamMemberData, Team } from '@/entities/team';
import helpers from '@/ui/helpers';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import { RcConfirmationDialog, RcPhoneDisplay } from '@crctech/component-library';
import TeamMemberTeams from '@/ui/views/pages/teams/components/TeamMemberTeams.vue';

export default Vue.extend({
  name: 'TeamMembersTable',

  components: {
    AddTeamMembers,
    RcConfirmationDialog,
    RcPhoneDisplay,
    TeamMemberTeams,
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
  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'displayName',
      search: '',
      showAddTeamMemberDialog: false,
      showRemoveMemberConfirmationDialog: false,
      removeMemberId: '',
      searchAmong: [
        'displayName',
        'emailAddress',
        'phoneNumber',
        'teamCount',
        'caseFilesCount',
        'openCaseFilesCount',
        'inactiveCaseFilesCount',
        'role',
      ],
      showMemberDialog: false,
      clickedMember: null,
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
          value: 'displayName',
        },
        {
          text: this.$t('teams.member_email') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'emailAddress',
        },
        {
          text: this.$t('teams.phone_number') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'phoneNumber',
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
          value: 'teamCount',
          width: '20px',
        },
        {
          text: this.$t('teams.count_file.total') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'caseFilesCount',
        },
        {
          text: this.$t('teams.count_file.open') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'openCaseFilesCount',
        },
        {
          text: this.$t('teams.count_file.inactive') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'inactiveCaseFilesCount',
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

    computedTeamMembers(): Array<ITeamMemberData> {
      const direction = this.sortDesc ? 'desc' : 'asc';
      const filtered = helpers.filterCollectionByValue(this.team.teamMembers, this.search, false, this.searchAmong);
      return _orderBy(filtered, this.sortBy, direction) as ITeamMemberData[];
    },

    teamMembersId(): Array<string> {
      return this.team.teamMembers.map((m: ITeamMemberData) => m.userAccountId);
    },

    removeLoading(): boolean {
      return this.$store.state.team.removeLoading;
    },

    team(): Team {
      return this.$storage.team.getters.team();
    },

  },

  methods: {
    showRemoveConfirmationDialog(id: string) {
      this.removeMemberId = id;
      this.showRemoveMemberConfirmationDialog = true;
    },

    showPrimaryContactMessage() {
      this.$toasted.global.warning(this.$t('teams.remove_team_members_change_contact'));
    },

    async removeTeamMember() {
      try {
        await this.$storage.team.actions.removeTeamMember(this.removeMemberId);
        this.$toasted.global.success(this.$t('teams.remove_team_members_success'));
      } finally {
        this.showRemoveMemberConfirmationDialog = false;
      }
    },

    getRole(user: ITeamMemberData): string {
      if (user.roleName) return this.$m(user.roleName);
      return '';
    },

    showDeleteIcon(member: ITeamMemberData): boolean {
      if (member.isPrimaryContact) {
        return this.$hasLevel('level5');
      }
      return this.$hasLevel('level4');
    },

    async viewMemberDetails(member: ITeamMemberData) {
      this.showMemberDialog = true;
      this.clickedMember = member;
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
