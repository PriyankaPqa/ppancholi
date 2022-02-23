<template>
  <rc-dialog
    :title="$t('teams.add_new_members')"
    :submit-action-label="$t('common.buttons.add')"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-button-disabled="selectedUsers.length === 0"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :loading="loading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="8" class="px-6">
        <div class="left-container">
          <div>
            <p class="rc-body16 fw-bold">
              {{ $t('teams.search_member') }}
            </p>
            <v-text-field
              v-model="search"
              clearable
              outlined
              prepend-inner-icon="mdi-magnify"
              data-test="team-search-input"
              :placeholder="$t('common.search')" />
          </div>
          <div class="table-container">
            <v-data-table
              v-if="search"
              data-test="table"
              class="search_members"
              show-select
              must-sort
              hide-default-footer
              :headers="headers"
              :item-class="getClassRow"
              :items="availableMembers"
              :items-per-page="Math.max(availableMembers.length, 1)"
              @toggle-select-all="onSelectAll">
              <template #item.data-table-select="{ item }">
                <v-simple-checkbox
                  :data-test="`select_${item.id}`"
                  :ripple="false"
                  :value="isSelected(item) || isAlreadyInTeam(item)"
                  :readonly="isAlreadyInTeam(item)"
                  :disabled="isAlreadyInTeam(item)"
                  @input="updateSelection(item)" />
              </template>
              <template #item.role="{ item }">
                {{ $m(item.roleName) }}
              </template>
            </v-data-table>
          </div>
        </div>
      </v-col>

      <v-col cols="4" class="px-6">
        <div class="right-container">
          <div class="rc-body16 fw-bold pb-4">
            {{ $t('teams.selected_members') }}
          </div>
          <ul class="selected__members_container">
            <li v-for="user in selectedUsers" :key="user.id">
              <div class="py-2">
                <span class="rc-body14 fw-bold"> {{ user.displayName }}</span>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      icon
                      x-small
                      class="mr-4"
                      :data-test="`unselect_${user.id}`"
                      @click="updateSelection(user)"
                      v-on="on">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('eventSummary.deleteLinkTooltip') }}</span>
                </v-tooltip>
              </div>
            </li>
          </ul>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import _difference from 'lodash/difference';
import { ITeamMember } from '@/entities/team';
import { AccountStatus, IUserAccountCombined } from '@/entities/user-account';
import { Status } from '@/entities/base';
import { IMultilingual } from '@/types';

interface UserTeamMember {
  roleName: IMultilingual,
  displayName: string,
  id: string,
  emailAddress: string,
  isPrimaryContact: boolean,
}

export default Vue.extend({
  name: 'AddTeamMembers',

  components: {
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    teamMembers: {
      type: Array as () => ITeamMember[],
      required: true,
    },
    teamId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      search: '',
      selectedUsers: [] as UserTeamMember[],
      users: [] as Array<IUserAccountCombined>,
      loading: false,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
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
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'role',
        },
        {
          text: this.$t('teams.member_status') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
      ];
    },

    availableMembers(): UserTeamMember[] {
      const result:IUserAccountCombined[] = this.$storage.userAccount.getters.getByCriteria(
        this.search, false, ['displayName', 'emailAddress'],
      ) || [];
      return result.filter(
        (u) => u.entity.status === Status.Active && u.entity.accountStatus === AccountStatus.Active,
      ).map(
        (tm) => ({
          isPrimaryContact: false,
          roleName: tm.metadata.roleName,
          displayName: tm.metadata.displayName,
          id: tm.entity.id,
          emailAddress: tm.metadata.emailAddress,
        }),
      );
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    getClassRow(user: UserTeamMember): string {
      if (this.isAlreadyInTeam(user)) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    isAlreadyInTeam(user: UserTeamMember): boolean {
      return this.teamMembers.findIndex((u) => user.id === u.id) !== -1;
    },

    isSelected(user: UserTeamMember): boolean {
      return this.selectedUsers.findIndex((u) => user.id === u.id) !== -1;
    },

    onSelectAll({ items, value }: {items: Array<UserTeamMember>; value: boolean}) {
      if (value) { // select all, get the new ones + old ones
        this.selectedUsers = [...this.selectedUsers, ...items.filter((i) => !this.isAlreadyInTeam(i))];
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
    },

    async submit() {
      try {
        this.loading = true;
        await this.$storage.team.actions.addTeamMembers(this.teamId, this.selectedUsers);
        this.$toasted.global.success(this.$t('team.add_members.success'));
        this.close();
      } finally {
        this.loading = false;
      }
    },

    updateSelection(user: UserTeamMember) {
      if (this.isSelected(user)) { // remove
        this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
      } else { // add
        this.selectedUsers = [...this.selectedUsers, user];
      }
    },
  },
});
</script>

<style scoped lang="scss">

.left-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.selected__members_container {
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px;
  height: 100%;

  & > li {
    list-style-type:none;
    & div {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
