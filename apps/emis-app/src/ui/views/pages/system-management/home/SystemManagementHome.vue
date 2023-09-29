<template>
  <v-container fluid class="py-4 px-6">
    <v-row>
      <v-col v-for="(card, $index) in accessibleCards" :key="$index" xs="12" sm="12" md="6" lg="4">
        <rc-menu-card
          :title="$t(card.title)"
          :text="$t(card.description)"
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
  name: 'SystemManagementHome',

  components: {
    RcMenuCard,
  },

  computed: {
    routes() {
      return routes;
    },

    cards(): ICardSettings[] {
      return [{
        title: 'system_management.card.lists_title',
        description: 'system_management.card.lists_description',
        button: 'system_management.card.btn.lists_title',
        route: routes.systemManagement.lists.name,
        dataTest: 'sysManagementHome__lists',
        level: UserRoles.level6,
      }, {
        title: 'system_management.card.user_accounts_title',
        description: 'system_management.card.user_accounts_description',
        button: 'system_management.card.btn.user_accounts_title',
        route: routes.systemManagement.userAccounts.home.name,
        dataTest: 'sysManagementHome__accounts',
        level: UserRoles.level5,
      }, {
        title: 'system_management.card.roles_title',
        description: 'system_management.card.roles_description',
        button: 'system_management.card.btn.roles_title',
        route: routes.systemManagement.roles.name,
        dataTest: 'sysManagementHome__roles',
        level: UserRoles.level6,
      }, {
        title: 'system_management.card.branding.title',
        description: 'system_management.card.branding.description',
        button: 'system_management.card.branding.btn.label',
        route: routes.systemManagement.branding.name,
        dataTest: 'sysManagementHome__branding',
        level: UserRoles.level6,
      }, {
        title: 'system_management.card.tenantSettings.title',
        description: 'system_management.card.tenantSettings.description',
        button: 'system_management.card.tenantSettings.btn.label',
        route: routes.systemManagement.tenantSettings.name,
        dataTest: 'sysManagementHome__tenantSettings',
        level: UserRoles.level6,
      }, {
        title: 'system_management.card.features.title',
        description: 'system_management.card.features.description',
        button: 'system_management.card.features.btn.label',
        route: routes.systemManagement.features.name,
        dataTest: 'sysManagementHome__features',
        level: UserRoles.level6,
      }];
    },

    accessibleCards(): ICardSettings[] {
      return helpers.availableItems(this, this.cards);
    },
  },
});
</script>

<style scoped lang="scss">
  .sysManagement_cardsContent {
    min-height: 100px;
  };
</style>
