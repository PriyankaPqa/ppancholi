<template>
  <v-container fluid class="py-4 px-6">
    <v-row>
      <v-col v-for="(card, $index) in cards" :key="$index" xs="12" sm="12" md="6" lg="4">
        <rc-menu-card
          :title="$t(card.title)"
          :text="$t(card.description)"
          :button-text="$t(card.button)"
          :data-test="card.dataTest"
          @click="goTo(card.route)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcMenuCard } from '@crctech/component-library';

export default Vue.extend({
  name: 'SystemManagementHome',
  components: {
    RcMenuCard,
  },
  computed: {
    cards(): Array<Record<string, string>> {
      return [
        {
          title: 'system_management.card.lists_title',
          description: 'system_management.card.lists_description',
          button: 'system_management.card.btn.lists_title',
          route: '',
          dataTest: 'sysManagementHome__lists',
        },
        {
          title: 'system_management.card.user_accounts_title',
          description: 'system_management.card.user_accounts_description',
          button: 'system_management.card.btn.user_accounts_title',
          route: '',
          dataTest: 'sysManagementHome__accounts',
        },
        {
          title: 'system_management.card.roles_title',
          description: 'system_management.card.roles_description',
          button: 'system_management.card.btn.roles_title',
          route: '',
          dataTest: 'sysManagementHome__roles',
        },
      ];
    },
  },
  methods: {
    goTo(route: string) {
      this.$router.push({ name: route });
    },
  },
});
</script>
