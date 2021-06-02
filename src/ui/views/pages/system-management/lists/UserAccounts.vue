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
          data-test="teams-table"
          hide-header
          :loading="loading"
          :loading-text="loadingText"
          :items="filteredUserAccounts"
          :table-props="tableProps"
          :count="filteredUserAccounts.length"
          :labels="labels"
          :headers="headers"
          :custom-columns="Object.values(customColumns)"
          :options.sync="options">
          <template slot="default">
            <div>{{ $t('system_management.userAccounts.no_users_found') }}</div>
          </template>

          <template #[`item.${customColumns.displayName}`]="{ item }">
            <span data-test="user_displayName"> {{ item.displayName }}</span>
          </template>

          <template #[`item.${customColumns.email}`]="{ item }">
            <span data-test="user_email"> {{ item.email }}</span>
          </template>

          <template #[`item.${customColumns.roleId}`]="{ item }">
            <v-select-with-validation
              dense
              outlined
              return-object
              hide-details
              data-test="user_roleId"
              :value="getSubRoleById(item.roleId)"
              :item-text="(item) => item ? $m(item.name) : ''"
              :label="$t('system_management.userAccounts.role_header')"
              :items="allSubRoles"
              @change="assignRoleToUser($event, item)" />
          </template>

          <template #[`item.${customColumns.accountStatus}`]="{ item }">
            <status-chip
              data-test="user_status"
              status-name="EUserAccountStatus"
              :status="item.accountStatus" />
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
  IOptionItemData,
  IOptionSubItem,
} from '@/entities/optionItem';
import { IAddRoleToUserRequest } from '@/services/user-accounts/user-accounts.types';
import { EUserAccountStatus, IUserAccount } from '@/entities/user-account';
import { isEmpty } from 'lodash';
import _cloneDeep from 'lodash/cloneDeep';

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
        sortBy: ['displayName'],
        sortDesc: [false],
      },
      search: '',
      showAddEmisUserDialog: false,
      showDeleteUserAccountDialog: false,
      userToDelete: null as IUserAccount,
      loading: true,
      allUsers: [] as IUserAccount[], // All users, minus "deleted in EMIS"
      allSubRoles: [] as IOptionSubItem[],
      changedAccounts: [] as IUserAccount[],
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
          value: 'displayName',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.emailUsername_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          value: 'email',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.role_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'roleId',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.status_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'accountStatus',
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
        displayName: 'displayName',
        email: 'email',
        roleId: 'roleId',
        accountStatus: 'accountStatus',
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

    filteredUserAccounts(): IUserAccount[] {
      let filteredUsers:IUserAccount[];
      if (isEmpty(this.search) || this.allUsers === null) {
        filteredUsers = this.allUsers;
      } else {
        filteredUsers = this.allUsers.filter((user) => user.displayName && user.displayName.toLowerCase().indexOf(this.search.toLowerCase()) >= 0);
      }
      return filteredUsers;
    },

    originalUsers(): IUserAccount[] {
      return this.$storage.userAccount.getters.userAccounts();
    },
  },

  mounted() {
    this.fetchAllEmisUsers();
    this.loadAllActiveSubRoles();
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

    itemIsChanged(user: IUserAccount): boolean {
      return this.changedAccounts.indexOf(user) >= 0;
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    assignRoleToUser(roleData: IOptionItemData, user: IUserAccount) {
      // Only update if this changes the user role
      if (roleData && user && roleData.id !== user.roleId) {
        const role:IOptionSubItem = this.allSubRoles.find((r) => r.id === roleData.id);
        user.roleId = role.id;
        user.roleName = role.name;
        this.changedAccounts.push(user); // Register for pending change
      }
    },

    async applyRoleChange(user: IUserAccount) {
      if (this.itemIsChanged(user) && this.getSubRoleById(user.roleId)) {
        try {
          this.loading = true; // Visual cue of busy state
          const request:IAddRoleToUserRequest = {
            subRole: this.getSubRoleById(user.roleId),
            userId: user.id,
          };
          const resultAccount:IUserAccount = await this.$storage.userAccount.actions.addRoleToUser(request);
          // Update status
          user.status = resultAccount.status;
          user.accountStatus = resultAccount.accountStatus;
          user.roleName = request.subRole.name;
          user.roleId = request.subRole.id;
          this.changedAccounts.splice(this.changedAccounts.indexOf(user), 1);
          this.replaceOrAddToAllUsersById([user]);
          this.$toasted.global.success(this.$t('system_management.userAccounts.role_update_success'));
        } catch (errors) {
          this.$toasted.global.error(this.$t('errors.user-account-role-assign.fail'));
        } finally {
          this.loading = false;
        }
      }
    },

    cancelRoleChange(user: IUserAccount) {
      // Remove from pending role change
      if (this.itemIsChanged(user)) {
        this.changedAccounts.splice(this.changedAccounts.indexOf(user), 1);
      }
      this.revertToOriginalRole(user);
    },

    revertToOriginalRole(user: IUserAccount) {
      const originalUser = this.originalUsers.find((u) => u.id === user.id);
      user.roleId = originalUser.roleId;
      user.roleName = originalUser.roleName;
    },

    deleteUserAccount(user: IUserAccount) {
      this.userToDelete = user;
      this.showDeleteUserAccountDialog = true;
    },

    async applyDeleteUserAccount() {
      if (this.userToDelete) {
        this.loading = true;
        try {
          await this.$storage.userAccount.actions.deleteUserAccount(this.userToDelete.id);
          this.removeUserAccountById(this.allUsers, this.userToDelete.id);
          this.clearDeletionStatus();
          this.$toasted.global.success(this.$t('system_management.userAccounts.delete_success'));
        } catch (errors) {
          this.$toasted.global.error(this.$t('errors.user-account-deleted.fail'));
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
      await this.$storage.userAccount.actions.fetchAllUserAccounts();
      this.allUsers = this.excludeDeletedUsers(_cloneDeep(this.originalUsers));
      this.loading = false;
    },

    async loadAllActiveSubRoles() {
      await this.$storage.optionList.mutations.setList(EOptionLists.Roles);
      const subRoles = await this.$storage.optionList.actions.fetchSubItems();
      this.allSubRoles = subRoles ? subRoles.filter((role: IOptionSubItem) => role.status === EOptionListItemStatus.Active) : [];
    },

    excludeDeletedUsers(users: IUserAccount[]): IUserAccount[] {
      if (users) {
        return users.filter((u) => u.status !== EUserAccountStatus.Inactive);
      }
      return [];
    },

    handleUsersAdded(users: IUserAccount[]) {
      this.replaceOrAddToAllUsersById(users);
    },

    replaceOrAddToAllUsersById(newUsers: IUserAccount[]) {
      newUsers.forEach((u) => this.removeUserAccountById(this.allUsers, u.id));
      this.allUsers = this.excludeDeletedUsers(this.allUsers.concat(newUsers));
    },

    findUserAccountById(array: IUserAccount[], userId: string): IUserAccount {
      return array.find((u) => u.id === userId);
    },

    removeUserAccountById(array: IUserAccount[], userId: string) {
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
