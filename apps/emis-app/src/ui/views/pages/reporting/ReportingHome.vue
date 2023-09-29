<template>
  <v-container fluid class="py-4 px-6">
    <v-row>
      <v-col v-for="(card, $index) in accessibleCards" :key="$index" xs="12" sm="12" md="4" lg="3">
        <rc-menu-card
          :title="$t(card.title)"
          :text="card.description"
          :button-text="$t(card.button)"
          :data-test="card.dataTest"
          :route-name="card.route" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcMenuCard } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';
import { ICardSettings } from '@/types/interfaces/ICardSettings';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'ReportingHome',

  components: {
    RcMenuCard,
  },

  computed: {
    cards(): ICardSettings[] {
      return [{
        title: 'reporting.standardQueriesL6',
        button: 'reporting.start',
        route: routes.reporting.home.name,
        dataTest: 'standardQueriesL6',
        level: UserRoles.level6,
      }, {
        title: 'reporting.customQueries',
        button: 'reporting.start',
        route: routes.reporting.home.name,
        dataTest: 'customQueries',
        level: UserRoles.level6,
      }, {
        title: 'reporting.eventStatistics',
        button: 'reporting.start',
        route: routes.reporting.home.name,
        dataTest: 'eventStatistics',
        level: UserRoles.level6,
      },
      ];
    },

    accessibleCards(): ICardSettings[] {
      return helpers.availableItems(this, this.cards);
    },
  },
});
</script>
