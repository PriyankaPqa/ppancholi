<template>
  <rc-dialog
    :title="$t('system_management.userAccounts.add_user_account_title')"
    :submit-action-label="$t('common.buttons.add')"
    :submit-button-disabled="!submitButtonEnabled"
    :cancel-action-label="$t('common.buttons.cancel')"
    :show.sync="show"
    :help-link="$t('zendesk.help_link.addEMISUser')"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="6" class="px-6">
        <div class="left-container">
          <div>
            <p class="rc-body16 fw-bold">
              {{ $t('system_management.userAccounts.search_title') }}
            </p>
            <v-text-field
              ref="userSearch"
              v-model="searchTerm"
              clearable
              outlined
              prepend-inner-icon="mdi-magnify"
              data-test="team-search-input"
              :disabled="!formReady"
              :label="$t('common.search')"
              @input="debounceSearch($event)" />
          </div>
          <div class="table-container">
            <v-data-table
              v-if="isDirty"
              ref="userResultTable"
              :key="componentKey"
              data-test="table"
              class="search_members"
              show-select
              hide-default-footer
              :loading-text="loadingText"
              :headers="headers"
              :item-class="getClassRow"
              :items="searchResults"
              :items-per-page="itemsPerPage"
              :loading="loading"
              @toggle-select-all="onSelectAll">
              <template slot="no-data">
                <div>{{ $t('system_management.userAccounts.no_users_found') }}</div>
              </template>
              <template #item.data-table-select="{ item }">
                <v-simple-checkbox
                  :data-test="`select_${item.id}`"
                  :ripple="false"
                  :value="isSelected(item) || isAlreadyInEMIS(item)"
                  :readonly="isAlreadyInEMIS(item)"
                  :disabled="isAlreadyInEMIS(item)"
                  @input="toggleUserSelection(item)" />
              </template>
              <template #item.displayName="{ item }">
                {{ item.displayName }}
              </template>
              <template #item.emailAddress="{ item }">
                {{ item.mail }}
              </template>
            </v-data-table>
          </div>
        </div>
      </v-col>

      <v-col cols="6" class="px-6">
        <div class="right-container">
          <div class="rc-body16 fw-bold pb-4">
            {{ $t('system_management.userAccounts.selected_members') }}
          </div>
          <ul class="selected__members_container">
            <li v-for="user in selectedUsers" :key="user.id">
              <div class="py-2">
                <span class="rc-body14 fw-bold"> {{ user.displayName }}</span>
                <v-select-with-validation
                  dense
                  outlined
                  return-object
                  :item-text="(e) => e.subitems ? $m(e.subitems[0].name) : ''"
                  :label="$t('system_management.userAccounts.role_header')"
                  :items="allRoles"
                  @change="assignRoleToUser($event, user)" />
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      icon
                      x-small
                      class="mr-4"
                      :data-test="`unselect_${user.id}`"
                      @click="toggleUserSelection(user)"
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
import { RcDialog, VSelectWithValidation } from '@crctech/component-library';
import { IAppUserAzureData, IAppUserData } from '@/entities/app-user';
import { IAddRoleToUserRequest } from '@/services/user-accounts/user-accounts.types';
import { TranslateResult } from 'vue-i18n';
import _difference from 'lodash/difference';
import _debounce from 'lodash/debounce';
import { DataTableHeader } from 'vuetify';
import { IUserAccountData } from '@/entities/user';
import { EOptionLists, IOptionItemData } from '@/entities/optionItem';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'AddEmisUser',

  components: {
    RcDialog,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      error: false,
      formReady: false,
      searchTerm: '', // The search term
      allUsers: [] as IAppUserAzureData[],
      allRoles: [] as IOptionItemData[],
      searchResults: [] as IAppUserData[],
      selectedUsers: [] as IAppUserData[],
      isDirty: false,
      componentKey: 0,
      loading: false,
      submitButtonEnabled: false,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('system_management.userAccounts.member_name') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'displayName',
        },
        {
          text: this.$t('system_management.userAccounts.member_email') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          value: 'emailAddress',
        },
      ];
    },

    loadingText():TranslateResult {
      return this.$t('system_management.userAccounts.loading_users');
    },

    submitLabel(): TranslateResult {
      return this.$t('common.add');
    },

    helpLink(): TranslateResult {
      return this.$t('zendesk.help_link.addEMISUser');
    },

    customColumns(): Record<string, string> {
      return {
        name: `EventName/Translation/${this.$i18n.locale}`,
        email: `ResponseLevelName/Translation/${this.$i18n.locale}`,
      };
    },

    itemsPerPage(): number {
      return this.searchResults ? this.searchResults.length : 10;
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs?.userSearch) {
        (this.$refs.userSearch as HTMLInputElement).focus();
      }
    });
    this.fetchAllEMISUsers();
    this.loadAllRoles();
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    back(): void {
      this.$emit('hide');
    },

    async fetchAllEMISUsers() {
      this.allUsers = await this.$storage.appUser.actions.fetchAppUsers();
      this.formReady = true;
    },

    async loadAllRoles() {
      this.allRoles = await this.$services.optionItems.getOptionList(EOptionLists.Roles);
      this.sortOnLocaleName(this.allRoles);
    },

    async findUsers() {
      if (this.searchTerm) {
        this.isDirty = true;
        this.loading = true;
        const result:IAppUserData[] = await this.$services.appUsers.findAppUsers(this.searchTerm) as IAppUserData[];
        this.searchResults = result;
        this.sortOnDisplayName(this.searchResults);
        this.componentKey = new Date().getTime(); // Force a redraw of the results list
        this.loading = false;
      } else {
        this.searchResults = [];
      }
    },

    isAlreadyInEMIS(user: IAppUserData):boolean {
      const returned = this.allUsers && this.allUsers.findIndex((u) => user.id === u.id) > -1;
      return returned;
    },

    isSelected(user: IAppUserData):boolean {
      return this.selectedUsers && this.selectedUsers.findIndex((u) => user.id === u.id) > -1;
    },

    toggleUserSelection(user: IAppUserData) {
      if (user) {
        user.roles = []; // Reset role assignment
        const indexOfSelectedUser:number = this.selectedUsers.findIndex((item) => item.id === user.id);
        if (indexOfSelectedUser >= 0) {
          this.selectedUsers.splice(indexOfSelectedUser, 1);
        } else {
          this.selectedUsers.push(user);
        }
        this.sortOnDisplayName(this.selectedUsers);
        this.isDirty = true;
        this.updateSubmitButton();
      }
    },

    getClassRow(user: IAppUserData): string {
      if (this.isAlreadyInEMIS(user)) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    onSelectAll({ items, value }: {items: Array<IAppUserData>; value: boolean}) {
      if (value) { // select all, get the new ones + old ones
        this.selectedUsers = [...this.selectedUsers, ...items.filter((i) => !this.isAlreadyInEMIS(i))];
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
    },

    sortOnDisplayName(users: IAppUserData[]) {
      if (users && users.length > 0) {
        users.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortOnLocaleName(entities: any[]) {
      const { locale } = i18n;
      if (entities && entities.length > 0) {
        entities.sort((a, b) => a.name.translation[locale].localeCompare(b.name.translation[locale]));
      }
    },

    assignRoleToUser(roleData:IOptionItemData, user:IAppUserData) {
      if (roleData && roleData.subitems && roleData.subitems[0]) {
        const roleSubItem = roleData.subitems[0];
        const { locale } = i18n;
        if (roleSubItem) {
          user.roles = [
            {
              id: roleData.subitems[0].id,
              displayName: roleData.subitems[0].name.translation[locale],
              value: null,
            },
          ];
        }
        this.updateSubmitButton();
      }
    },

    updateSubmitButton() {
      this.submitButtonEnabled = this.selectedUsers.length > 0 && this.allSelectedUsersHaveRole(this.selectedUsers);
    },

    allSelectedUsersHaveRole(users:IAppUserData[]):boolean {
      return !users
      || users.length === 0
      || (users.filter((u) => !!u.roles && u.roles.length > 0).length === users.length);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(function func(this:any, value) { this.findUsers(value); }, 500),

    async submit() {
      if (this.submitButtonEnabled) {
        let userAccount:IUserAccountData;
        this.selectedUsers.forEach(async (user) => {
          const payload = { roleId: user.roles[0].id, userId: user.id } as IAddRoleToUserRequest;
          userAccount = await this.$storage.userAccount.actions.addRoleToUser(payload);
          if (userAccount) {
            this.selectedUsers.splice(this.selectedUsers.indexOf(user), 1);
            this.$toasted.global.success(this.$t('system_management.add_users.success'));
          } else {
            this.$toasted.global.error(this.$t('system_management.add_users.error'));
          }
        });
        await this.$storage.appUser.mutations.invalidateAppUserCache();
        this.close();
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
      align-items: baseline;
    }
  }
}
</style>
