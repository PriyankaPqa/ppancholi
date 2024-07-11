<template>
  <confirm-registration-lib @search-household="goToSearch()" />
</template>

<script lang="ts">
import Vue from 'vue';
import ConfirmRegistrationLib from '@libs/registration-lib/components/confirm-registration/ConfirmRegistrationLib.vue';
import { IRegistrationMenuItem, TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { tabs } from '@/pinia/registration/tabs';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    ConfirmRegistrationLib,
  },

  computed: {
    allTabs(): IRegistrationMenuItem[] {
     return useRegistrationStore().tabs;
    },
  },
  methods: {
    goToSearch() {
      useRegistrationStore().currentTabIndex = tabs().findIndex((t) => t.id === TabId.IsRegistered);
      useRegistrationStore().resetHouseholdCreate();
      useRegistrationStore().resetTabs();
    },
  },
});
</script>
