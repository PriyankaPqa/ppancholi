<template>
  <rc-page-content
    :full-height="false"
    :outer-scroll="true"
    :title="$t('system_management.leftMenu.user_accounts_title')"
    :help-link="$t('zendesk.help_link.addEMISUser')"
    :show-add-button="true"
    show-help
    show-search
    content-padding="0"
    @search="searchString = $event"
    @add-button="addUser">
    <div class="lists__container">
      <div class="lists__list">
        <v-list>
          <v-subheader class="rc-body14 fw-bold pl-4 pointer" @click="toggleSorting">
            {{ $t('system_management.lists.lists_header') }}
            <v-icon size="16px">
              {{ sortingIcon }}
            </v-icon>
          </v-subheader>
        </v-list>
      </div>
    </div>

    <add-emis-user
      v-if="showAddEMISUserDialog"
      data-test="add-emis-user"
      :show.sync="showAddEMISUserDialog"
      @hide="showAddEMISUserDialog = false" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import { RcPageContent } from '@crctech/component-library';
import AddEmisUser from '@/ui/views/pages/system-management/lists/add-emis-user/AddEmisUser.vue';

export default Vue.extend({
  name: 'UserAccounts',

  components: {
    RcPageContent,
    AddEmisUser,
  },

  data() {
    return {
      routes,
      ascendingSort: true,
      searchString: '',
      showAddEMISUserDialog: false,
    };
  },

  computed: {
    sortingIcon() {
      if (this.ascendingSort) {
        return 'arrow_upward';
      }
      return 'arrow_downward';
    },

    customColumns(): Record<string, string> {
      return {
        name: `EventName/Translation/${this.$i18n.locale}`,
        emailUsername: `ResponseLevelName/Translation/${this.$i18n.locale}`,
        role: 'Schedule/OpenDate',
        userStatus: `ScheduleEventStatusName/Translation/${this.$i18n.locale}`,
      };
    },
  },

  methods: {
    /**
     * Clear the search related data.
     * @public
     */
    clearSearch() {
      this.searchString = '';
    },

    /**
     * Instract to change the order direction (asc/desc)
     * @public
     */
    toggleSorting() {
      this.ascendingSort = !this.ascendingSort;
    },

    addUser() {
      this.showAddEMISUserDialog = true;
    },
  },
});
</script>
