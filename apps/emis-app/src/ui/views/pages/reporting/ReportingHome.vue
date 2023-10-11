<template>
  <v-container fluid class="py-4 px-6">
    <v-row>
      <v-col v-for="(card, $index) in accessibleCards" :key="$index" xs="12" sm="12" md="4" lg="3">
        <rc-menu-card
          :title="$t(card.title)"
          :text="card.description"
          :button-text="$t(card.button)"
          :data-test="card.dataTest"
          :route="card.route" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcMenuCard } from '@libs/component-lib/components';
import { ReportingPages } from './reportingPages';

export default Vue.extend({
  name: 'ReportingHome',

  components: {
    RcMenuCard,
  },

  data() {
    return {
      reportingMenus: new ReportingPages(),
    };
  },

  computed: {
    accessibleCards() {
      return this.reportingMenus.availableCards(this);
    },
  },
});
</script>
