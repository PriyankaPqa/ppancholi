<template>
  <lib-confirm-registration :i18n="i18n" @search-household="goToSearch()" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ConfirmRegistration as LibConfirmRegistration } from '@crctech/registration-lib';
import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types';
import { i18n } from '@/ui/plugins';
import { tabs } from '@/store/modules/registration/tabs';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    LibConfirmRegistration,
  },
  data() {
    return {
      i18n,
    };
  },

  computed: {
    allTabs(): IRegistrationMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },
  },
  methods: {
    goToSearch() {
      this.resetAllTabs();
      this.$storage.registration.mutations.setCurrentTabIndex(tabs().findIndex((t) => t.id === 'isRegistered'));
      this.$storage.registration.mutations.resetHouseholdCreate();
      this.$storage.registration.mutations.setRegistrationErrors([]);
    },

    resetAllTabs() {
      for (let index = 0; index < this.allTabs.length; index += 1) {
        this.$storage.registration.mutations.mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = false;
          tab.isValid = true;
          tab.isTouched = false;
        });
      }
    },
  },
});
</script>
