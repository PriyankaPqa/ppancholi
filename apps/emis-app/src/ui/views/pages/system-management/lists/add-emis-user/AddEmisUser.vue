<template>
  <rc-dialog
    :title="$t('system_management.userAccounts.add_user_account_title')"
    :submit-action-label="$t('common.buttons.add')"
    :submit-button-disabled="!isSubmitAllowed"
    :loading="loading"
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
              v-if="searchTerm"
              ref="userResultTable"
              :key="componentKey"
              data-test="table"
              class="search_members"
              show-select
              hide-default-footer
              must-sort
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
              <template #[`item.data-table-select`]="{ item }">
                <v-simple-checkbox
                  :data-test="`select_${item.id}`"
                  :ripple="false"
                  :value="isSelected(item) || isAlreadyInEmis(item)"
                  :readonly="isAlreadyInEmis(item)"
                  :disabled="isAlreadyInEmis(item)"
                  @input="toggleUserSelection(item)" />
              </template>
              <template #[`item.displayName`]="{ item }">
                {{ item.displayName }}
              </template>
              <template #[`item.emailAddress`]="{ item }">
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
                  hide-details
                  :item-text="(item) => item ? $m(item.text) : ''"
                  :label="$t('system_management.userAccounts.role_header')"
                  :items="allAccessLevelRoles"
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
import { RcDialog, VSelectWithValidation } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import _difference from 'lodash/difference';
import _debounce from 'lodash/debounce';
import { DataTableHeader } from 'vuetify';
import _cloneDeep from 'lodash/cloneDeep';
import {
  IOptionSubItem,
} from '@libs/entities-lib/optionItem';
import { i18n } from '@/ui/plugins';
import { IUserAccountCombined } from '@libs/entities-lib/user-account';
import { IAppUserData } from '@libs/entities-lib/app-user';
import { IMultilingual } from '@libs/shared-lib/types';
import { Status } from '@libs/entities-lib/base';

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
    allSubRoles: {
      type: Array,
      default: () => [] as Array<IOptionSubItem>,
      required: true,
    },
    allAccessLevelRoles: {
      type: Array as ()=> {header?: string, value?: string, name?: IMultilingual}[],
      required: true,
    },
    allEmisUsers: {
      type: Array,
      default: () => [] as IUserAccountCombined[],
      required: true,
    },
  },

  data() {
    return {
      error: false,
      formReady: false,
      searchTerm: '', // The search term
      appUsers: [] as IUserAccountCombined[],
      searchResults: [] as IAppUserData[],
      selectedUsers: [] as IAppUserData[],
      componentKey: 0,
      loading: false,
      isSubmitAllowed: false as boolean,
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
          width: '35%',
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

    loadingText(): TranslateResult {
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
    this.fetchAllAppUsers();
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    back() {
      this.$emit('hide');
    },

    async fetchAllAppUsers() {
      this.appUsers = await this.$storage.userAccount.actions.fetchAll();
      this.formReady = true;
    },

    async findUsers() {
      if (this.searchTerm) {
        this.loading = true;
        // Exception here since we should normally not call the service directly
        const result:IAppUserData[] = await this.$services.appUsers.findAppUsers(this.searchTerm);
        this.searchResults = _cloneDeep(result);
        this.sortOnDisplayName(this.searchResults);
        this.componentKey = new Date().getTime(); // Force a redraw of the results list
        this.loading = false;
      } else {
        this.searchResults = [];
      }
    },

    isAlreadyInEmis(user: IAppUserData): boolean {
      if (this.appUsers && this.allEmisUsers) {
        const foundUser = this.appUsers.find((u) => user.id === u.entity.id);
        const emisUser = (this.allEmisUsers as IUserAccountCombined[]).find((u) => user.id === u.entity.id);
        if (foundUser && emisUser && emisUser.entity.status === Status.Active) {
          return true;
        }
      }
      return false;
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
        this.updateIsSubmitAllowed();
      }
    },

    getClassRow(user: IAppUserData): string {
      if (this.isAlreadyInEmis(user)) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    onSelectAll({ items, value }: {items: Array<IAppUserData>; value: boolean}) {
      if (value) { // select all, get the new ones + old ones
        const selectedUsers = [...this.selectedUsers, ...items.filter((i) => !this.isAlreadyInEmis(i))];
        this.selectedUsers = selectedUsers.filter((user, index) => selectedUsers.findIndex((u) => u.id === user.id) === index); // deduplicate the list of users
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
    },

    sortOnDisplayName(users: IAppUserData[]) {
      if (users && users.length > 0) {
        users.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }
    },

    assignRoleToUser(roleData: {text: IMultilingual, value: string}, user: IAppUserData) {
      if (roleData) {
        const { locale } = i18n;
        user.roles = [
          {
            id: roleData.value,
            displayName: roleData.text.translation[locale],
            value: null,
          },
        ];
        this.updateIsSubmitAllowed();
      }
    },

    allSelectedUsersHaveRole(users: IAppUserData[]): boolean {
      return !users
        || users.length === 0
        || (users.filter((u) => u.roles?.length > 0).length === users.length);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(function func(this:any, value) {
      this.findUsers(value);
    }, 500),

    async submit() {
      if (this.isSubmitAllowed) {
        this.loading = true; // So the user knows we're working
        // eslint-disable-next-line
        for (let user of this.selectedUsers) {
          // eslint-disable-next-line no-await-in-loop
          await this.setUserRole(user);
        }
        this.close();
        this.$emit('users-added');
        this.selectedUsers = [];
        this.loading = false;
      }
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    async setUserRole(user: IAppUserData) {
      const subRole:IOptionSubItem = this.getSubRoleById(user.roles[0].id);

      if (subRole) {
        const payload = {
          subRole,
          userId: user.id,
        };

        const userAccount = await this.$storage.userAccount.actions.assignRole(payload);
        if (userAccount) {
          this.$toasted.global.success(this.$t('system_management.add_users.success'));
        } else {
          this.$toasted.global.error(this.$t('system_management.add_users.error'));
        }
      }
    },

    updateIsSubmitAllowed() {
      this.isSubmitAllowed = this.selectedUsers?.length > 0 && this.allSelectedUsersHaveRole(this.selectedUsers);
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
