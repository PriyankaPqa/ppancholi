<template>
  <div>
    <rc-data-table
      data-test="teams-table"
      :items="teamSearchResults"
      :count="count"
      :labels="labels"
      :headers="[]"
      :sort-by="'name'"
      @search="search">
      <template v-if="$hasLevel('level5')" #headerLeft>
        <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="goToCreateTeam($event)" />
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcDataTable, RcAddButtonWithMenu } from '@crctech/component-library';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
  },

  props: {
    title: {
      type: String,
      default: 'teams.teams',
    },
  },

  data() {
    return {
      teamSearchResults: [],
      count: 0,
    };
  },

  computed: {
    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t(this.title),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },
    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('teams.types.create_standard') as string,
        value: 'standard',
        icon: 'mdi-account-multiple',
        dataTest: 'create-standard-team-link',
      }, {
        text: this.$t('teams.types.create_adhoc') as string,
        value: 'adhoc',
        icon: 'mdi-account-multiple-outline',
        dataTest: 'create-adhoc-team-link',
      }];
    },
  },

  methods: {
    goToCreateTeam(item: Record<string, string>) {
      const teamType = item.value;
      this.$router.push({ name: routes.teams.create.name, params: { teamType } });
    },

    async launchSearch() {
      const data = await this.$storage.team.actions.searchTeams({ filter: { } });
      return [];
    },

    search() {
      // TO DO call launchSearch with the parameters from the search field
      this.launchSearch();
      return false;
    },
  },
});
</script>
