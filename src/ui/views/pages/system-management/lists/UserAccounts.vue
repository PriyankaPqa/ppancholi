<template>
  <rc-page-content
    :full-height="false"
    :outer-scroll="true"
    :title="$t('system_management.leftMenu.user_accounts_title')"
    :help-link="$t('zendesk.help_link.manageEMISUsers')"
    :show-add-button="true"
    :labels="labels"
    :table-props="tableProps"
    :search="search"
    show-help
    show-search
    content-padding="0"
    @search="setSearch($event)"
    @clear-search="clearSearch()"
    @add-button="addUser()">
    <div class="lists__container">
      <div>
        <v-data-table
          data-test="users-table"
          hide-header
          must-sort
          :loading="loading"
          :loading-text="loadingText"
          :items="filteredUserAccounts"
          :table-props="tableProps"
          :count="filteredUserAccounts.length"
          :labels="labels"
          :headers="headers"
          :sort-by.sync="options.sortBy"
          :sort-desc.sync="options.sortDesc"
          :custom-columns="Object.values(customColumns)"
          :options.sync="options">
          <template slot="default">
            <div>{{ $t('system_management.userAccounts.no_users_found') }}</div>
          </template>

          <template #[`item.${customColumns.displayName}`]="{ item }">
            <span data-test="user_displayName"> {{ item.metadata.displayName }}</span>
          </template>

          <template #[`item.${customColumns.email}`]="{ item }">
            <span data-test="user_email"> {{ item.metadata.emailAddress }}</span>
          </template>

          <template #[`item.${customColumns.roleId}`]="{ item }">
            <v-select-with-validation
              dense
              outlined
              return-object
              hide-details
              data-test="user_roleId"
              :value="getRoleListItem(item.metadata.roleId)"
              :item-text="(item) => item ? $m(item.text): ''"
              :label="$t('system_management.userAccounts.role_header')"
              :items="allAccessLevelRoles"
              @change="assignRoleToUser($event, item)" />
          </template>

          <template #[`item.${customColumns.accountStatus}`]="{ item }">
            <status-chip
              data-test="user_status"
              status-name="AccountStatus"
              :status="item.entity.accountStatus" />
          </template>

          <template #[`item.${customColumns.edit}`]="{ item }">
            <div v-if="itemIsChanged(item)" class="inline-flex align-vertical-centre">
              <v-btn
                small
                color="primary"
                data-test="apply-role-button"
                @click="applyRoleChange(item)">
                {{ $t('common.apply') }}
              </v-btn>
              <v-btn
                icon
                data-test="cancel-role-change"
                @click="cancelRoleChange(item)">
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
          </template>

          <template #[`item.${customColumns.delete}`]="{ item }">
            <v-btn
              icon
              data-test="delete-user"
              @click="deleteUserAccount(item)">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </div>

    <add-emis-user
      v-if="showAddEmisUserDialog"
      data-test="add-emis-user"
      :all-sub-roles="allSubRoles"
      :all-access-level-roles="allAccessLevelRoles"
      :all-emis-users="allUsers"
      :show.sync="showAddEmisUserDialog"
      @hide="showAddEmisUserDialog = false"
      @users-added="handleUsersAdded" />

    <rc-confirmation-dialog
      v-if="showDeleteUserAccountDialog"
      data-test="delete-user-account-dialog"
      :show.sync="showDeleteUserAccountDialog"
      :title="$t('system_management.userAccounts.delete_user.title')"
      :messages="$t('system_management.userAccounts.confirmDeleteDialog.message')"
      @submit="applyDeleteUserAccount()"
      @cancel="clearDeletionStatus()"
      @close="clearDeletionStatus()" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import {
  RcPageContent,
  VSelectWithValidation,
  RcConfirmationDialog,
} from '@crctech/component-library';
import AddEmisUser from '@/ui/views/pages/system-management/lists/add-emis-user/AddEmisUser.vue';
import { DataTableHeader } from 'vuetify';
import { TranslateResult } from 'vue-i18n';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  EOptionListItemStatus,
  EOptionLists,
  IOptionItem,
  IOptionSubItem,
} from '@/entities/optionItem';

import { isEmpty } from 'lodash';
import _cloneDeep from 'lodash/cloneDeep';
import { IUserAccountCombined, IUserAccountEntity } from '@/entities/user-account';
import { Status } from '@/entities/base';
import { IMultilingual } from '@/types';

export default Vue.extend({
  name: 'UserAccounts',

  components: {
    RcPageContent,
    AddEmisUser,
    StatusChip,
    VSelectWithValidation,
    RcConfirmationDialog,
  },

  data() {
    return {
      routes,
      options: {
        page: 1,
        sortBy: ['metadata.displayName'],
        sortDesc: [false],
      },
      search: '',
      showAddEmisUserDialog: false,
      showDeleteUserAccountDialog: false,
      userToDelete: null as IUserAccountCombined,
      loading: true,
      allUsers: [] as IUserAccountCombined[], // All users, minus "deleted in EMIS"
      allSubRoles: [] as IOptionSubItem[],
      allAccessLevelRoles: [],
      changedAccounts: [] as IUserAccountCombined[],
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('system_management.userAccounts.name_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          align: 'start',
          value: 'metadata.displayName',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.emailUsername_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          value: 'metadata.emailAddress',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.role_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.roleId',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.status_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'entity.accountStatus',
        },
        {
          text: '',
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          value: 'edit',
        },
        {
          text: '',
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          align: 'end',
          value: 'delete',
        },
      ];
    },

    customColumns(): Record<string, string> {
      return {
        displayName: 'metadata.displayName',
        email: 'metadata.email',
        roleId: 'metadata.roleId',
        accountStatus: 'entity.accountStatus',
        edit: 'edit',
        delete: 'delete',
      };
    },

    loadingText(): TranslateResult {
      return this.$t('system_management.userAccounts.loading_users');
    },

    tableProps(): Record<string, string> {
      return {
        loading: this.$store.state.event.searchLoading,
      };
    },

    itemsPerPage(): number {
      return this.allUsers ? this.allUsers.length : 0;
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t('system_management.leftMenu.user_accounts_title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    filteredUserAccounts(): IUserAccountCombined[] {
      let filteredUsers:IUserAccountCombined[];
      if (isEmpty(this.search) || this.allUsers === null) {
        filteredUsers = this.allUsers ? this.allUsers : [];
      } else {
        filteredUsers = this.allUsers.filter(
          (user) => user.metadata.displayName && user.metadata.displayName.toLowerCase().indexOf(this.search.toLowerCase()) >= 0,
        );
      }
      return filteredUsers;
    },

    originalUsers(): IUserAccountCombined[] {
      return this.$storage.userAccount.getters.getAll();
    },
  },

  mounted() {
    this.fetchAllEmisUsers();
    this.setRoles();
  },

  methods: {
    /**
     * Clear the search related data.
     * @public
     */
    clearSearch() {
      this.search = '';
    },

    setSearch(search: string): void {
      this.search = search;
    },

    addUser() {
      this.showAddEmisUserDialog = true;
    },

    itemIsChanged(user: IUserAccountCombined): boolean {
      return this.changedAccounts.indexOf(user) >= 0;
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    getRoleListItem(roleId: string) : {text:IMultilingual, value: string} {
      const role = this.getSubRoleById(roleId);
      if (role) {
        return {
          text: role.name,
          value: role.id,
        };
      }
      return null;
    },

    assignRoleToUser(roleData: {text: IMultilingual, value: string}, user: IUserAccountCombined) {
      // Only update if this changes the user role
      if (roleData && user && roleData.value !== user.metadata.roleId) {
        const role:IOptionSubItem = this.allSubRoles.find((r) => r.id === roleData.value);

        user.metadata.roleId = role.id;
        user.metadata.roleName = role.name;
        this.changedAccounts.push(user); // Register for pending change
      }
    },

    async applyRoleChange(user: IUserAccountCombined) {
      const newRole = this.getSubRoleById(user.metadata.roleId);
      if (this.itemIsChanged(user) && newRole) {
        try {
          this.loading = true; // Visual cue of busy state
          const request = {
            subRole: newRole,
            userId: user.entity.id,
          };
          const resultAccount:IUserAccountEntity = await this.$storage.userAccount.actions.assignRole(request);
          // Update status
          user.entity = resultAccount;
          user.metadata.roleName = request.subRole.name;
          user.metadata.roleId = request.subRole.id;
          this.changedAccounts.splice(this.changedAccounts.indexOf(user), 1);
          this.replaceOrAddToAllUsersById([user]);
          this.$toasted.global.success(this.$t('system_management.userAccounts.role_update_success'));
        } finally {
          this.loading = false;
        }
      }
    },

    cancelRoleChange(user: IUserAccountCombined) {
      // Remove from pending role change
      if (this.itemIsChanged(user)) {
        this.changedAccounts.splice(this.changedAccounts.indexOf(user), 1);
      }
      this.revertToOriginalRole(user);
    },

    revertToOriginalRole(user: IUserAccountCombined) {
      const originalUser = this.originalUsers.find((u) => u.entity.id === user.entity.id);
      user.metadata.roleId = originalUser.metadata.roleId;
      user.metadata.roleName = originalUser.metadata.roleName;
    },

    deleteUserAccount(user: IUserAccountCombined) {
      this.userToDelete = user;
      this.showDeleteUserAccountDialog = true;
    },

    async applyDeleteUserAccount() {
      if (this.userToDelete) {
        this.loading = true;
        try {
          await this.$storage.userAccount.actions.deactivate(this.userToDelete.entity.id);
          this.removeUserAccountById(this.allUsers, this.userToDelete.entity.id);
          this.clearDeletionStatus();
          this.$toasted.global.success(this.$t('system_management.userAccounts.delete_success'));
        } finally {
          this.loading = false;
        }
      }
    },

    clearDeletionStatus() {
      this.userToDelete = null;
      this.showDeleteUserAccountDialog = false;
    },

    async fetchAllEmisUsers() {
      this.loading = true;
      await this.$storage.userAccount.actions.fetchAll();
      this.allUsers = this.excludeDeletedUsers(_cloneDeep(this.originalUsers));
      this.loading = false;
    },

    async setRoles() {
      this.$storage.optionList.mutations.setList(EOptionLists.Roles);
      const roles = await this.$storage.optionList.actions.fetchItems();
      this.setAllActiveSubRoles(roles);
      this.setAllAccessLevelRoles(roles);
    },

    setAllActiveSubRoles(roles: IOptionItem[]) {
      const subRoles = roles.reduce((acc: IOptionSubItem[], curr:IOptionItem) => {
        acc.push(...curr.subitems);
        return acc;
      }, []);
      this.allSubRoles = subRoles ? subRoles.filter((role: IOptionSubItem) => role.status === EOptionListItemStatus.Active) : [];
    },

    // set the hierarchical list of roles and subroles in the format needed for the dropdown of the select component
    setAllAccessLevelRoles(roles: IOptionItem[]) {
      roles.forEach((accessLevel : IOptionItem) => {
        this.allAccessLevelRoles.push({
          header: this.$m(accessLevel.name),
        });
        accessLevel.subitems.forEach((role: IOptionSubItem) => {
          if (role.status === EOptionListItemStatus.Active) {
            this.allAccessLevelRoles.push({
              text: role.name,
              value: role.id,
            });
          }
        });
      });
    },

    excludeDeletedUsers(users: IUserAccountCombined[]): IUserAccountCombined[] {
      if (users) {
        return users.filter((u) => u.entity.status === Status.Active);
      }
      return [];
    },

    handleUsersAdded(users: IUserAccountCombined[]) {
      this.replaceOrAddToAllUsersById(users);
    },

    replaceOrAddToAllUsersById(newUsers: IUserAccountCombined[]) {
      // Replace the "guts" of these updated users and build new ones, as needed
      newUsers.forEach((u) => this.removeUserAccountById(this.allUsers, u.entity.id));
      this.allUsers = this.excludeDeletedUsers(this.allUsers.concat(newUsers));
    },

    findUserAccountById(array: IUserAccountCombined[], userId: string): IUserAccountCombined {
      return array.find((u) => u.entity.id === userId);
    },

    removeUserAccountById(array: IUserAccountCombined[], userId: string) {
      const item = this.findUserAccountById(array, userId);
      if (item) {
        array.splice(array.indexOf(item), 1);
      }
    },
  },
});
</script>

<style scoped lang="scss">
  .inline-flex {
    display: inline-flex;
  }
  .align-vertical-centre {
    align-items: center;
  }
</style>

<style  lang="scss">
  .v-select-with-validation-dropdown {
    max-width: min-content;
  }
</style>
