<template>
  <rc-dialog
    :title="title"
    :submit-action-label="$t(submitActionLabel)"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-button-disabled="selectedUsers.length === 0"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :loading="loading || internalLoading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="8" class="px-6">
        <div class="left-container">
          <div>
            <p class="rc-body16 fw-bold">
              {{ topSearchTitle }}
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
            <v-data-table-a11y
              v-if="search"
              data-test="table"
              class="search_members"
              show-select
              must-sort
              hide-default-footer
              :headers="headers"
              :item-class="getClassRow"
              :items="filteredUsers"
              :items-per-page="Math.max(filteredUsers.length, 1)"
              @toggle-select-all="onSelectAll">
              <template #[`item.data-table-select`]="{ item }">
                <div data-test="teams_addTeamMember_checkbox">
                  <v-simple-checkbox
                    :data-test="`select_${item.id}`"
                    :ripple="false"
                    :value="isSelected(item) || isAlreadySelected(item)"
                    :readonly="isAlreadySelected(item)"
                    :disabled="isAlreadySelected(item)"
                    @input="updateSelection(item)" />
                </div>
              </template>
              <template #[`item.displayName`]="{ item }">
                <span data-test="teams_addTeamMember_displayName">
                  {{ item.displayName }}
                </span>
              </template>
              <template #[`item.emailAddress`]="{ item }">
                <span data-test="teams_addTeamMember_emailAddress">
                  {{ item.emailAddress }}
                </span>
              </template>
              <template #[`item.role`]="{ item }">
                <span data-test="teams_addTeamMember_roleName">
                  {{ $m(item.roleName) }}
                </span>
              </template>
            </v-data-table-a11y>
          </div>
        </div>
      </v-col>

      <v-col cols="4" class="px-6">
        <div class="right-container">
          <div class="rc-body16 fw-bold pb-4">
            {{ topSelectedTitle }}
          </div>
          <ul class="selected__members_container">
            <li v-for="user in selectedUsers" :key="user.id">
              <div class="py-2">
                <span class="rc-body14 fw-bold" :data-test="`teams_addTeamMember_selectedUser_${user.id}`">
                  {{ user.displayName }}
                </span>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      icon
                      x-small
                      class="mr-4"
                      :aria-label="$t('common.delete')"
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
import _debounce from 'lodash/debounce';
import _difference from 'lodash/difference';
import helpers from '@/ui/helpers/helpers';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { IdParams, IUserAccountEntity, IUserAccountMetadata, UserTeamMember } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { IAzureSearchParams } from '@libs/shared-lib/src/types';

export default Vue.extend({
  name: 'SelectUsersPopup',

  components: {
    RcDialog,
    VDataTableA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    preselectedIds: {
      type: Array as () => string[],
      default: () => [] as string[],
    },
    excludedIds: {
      type: Array as () => string[],
      default: () => [] as string[],
    },
    title: {
      type: String,
      required: true,
    },
    topSearchTitle: {
      type: String,
      required: true,
    },
    topSelectedTitle: {
      type: String,
      required: true,
    },
    submitActionLabel: {
      type: String,
      default: () => 'common.buttons.add',
    },
    maxNbResults: {
      type: Number,
      default: () => null as Number,
    },
    searchFields: {
      type: String,
      default: () => null as string,
    },
    levels: {
      type: Array as () => string[],
      default: () => null as string[],
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
  },

  data() {
    return {
      search: '',
      selectedUsers: [] as UserTeamMember[],
      internalLoading: false,
      filteredUsersIds: [] as string[],
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
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
      ];
    },

    filteredUsers(): UserTeamMember[] {
      return this.combinedUserAccountStore.getByIds(_difference(this.filteredUsersIds, this.excludedIds || [])).map(
        (tm) => ({
          roleName: tm.metadata.roleName,
          displayName: tm.metadata.displayName,
          id: tm.entity.id,
          emailAddress: tm.metadata.emailAddress,
        }),
      );
    },
  },

  watch: {
    search(newVal, oldVal) {
      if (newVal && newVal.trim() !== oldVal && newVal.length >= 2) {
        this.debounceSearch(newVal.trim());
      }
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    getClassRow(user: UserTeamMember): string {
      if (this.isAlreadySelected(user)) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    isAlreadySelected(user: UserTeamMember): boolean {
      return this.preselectedIds.findIndex((u) => user.id === u) !== -1;
    },

    isSelected(user: UserTeamMember): boolean {
      return this.selectedUsers.findIndex((u) => user.id === u.id) !== -1;
    },

    onSelectAll({ items, value }: { items: Array<UserTeamMember>; value: boolean }) {
      if (value) { // select all, get the new ones + old ones
        this.selectedUsers = [...this.selectedUsers, ...items.filter((i) => !this.isAlreadySelected(i))];
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
    },

    async fetchFilteredUsers() {
      this.internalLoading = true;
      await useUserAccountStore().fetchRoles();
      const rolesId = this.levels?.length ? useUserAccountStore().rolesByLevels(this.levels)?.map((r) => r.id) : null;

      const searchParam = helpers.toQuickSearch(this.search);
      const params = {
        search: searchParam,
        searchFields: this.searchFields,
        top: this.maxNbResults,
        orderBy: 'Metadata/DisplayName',
        queryType: 'full',
        searchMode: 'all',
      } as IAzureSearchParams;

      let searchResults;
      if (rolesId?.length) {
        searchResults = await sharedHelpers.callSearchInInBatches({
          ids: rolesId,
          searchInFilter: "Entity/Roles/any(r: search.in(r/OptionItemId, '{ids}'))",
          otherOptions: { ...params },
          service: this.combinedUserAccountStore,
        });
      } else {
        searchResults = await this.combinedUserAccountStore.search(params);
      }

      if (searchResults) {
        this.filteredUsersIds = searchResults.ids;
      }
      this.internalLoading = false;
    },

    async submit() {
      this.$emit('submit', this.selectedUsers);
    },

    updateSelection(user: UserTeamMember) {
      if (this.isSelected(user)) { // remove
        this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
      } else { // add
        this.selectedUsers = [...this.selectedUsers, user];
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(function func(this:any, value) {
      this.fetchFilteredUsers(value);
    }, 500),

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
