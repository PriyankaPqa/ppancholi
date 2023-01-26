<template>
  <confirm-registration-lib :i18n="i18n" @search-household="goToSearch()" />
</template>

<script lang="ts">
import Vue from 'vue';
import ConfirmRegistrationLib from '@libs/registration-lib/components/confirm-registration/ConfirmRegistrationLib.vue';
import { IRegistrationMenuItem } from '@libs/registration-lib/types';
import { i18n } from '@/ui/plugins';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { tabs } from '@/pinia/registration/tabs';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    ConfirmRegistrationLib,
  },
  data() {
    return {
      i18n,
    };
  },

  computed: {
    allTabs(): IRegistrationMenuItem[] {
     return useRegistrationStore().tabs;
    },
  },
  methods: {
    goToSearch() {
      this.resetAllTabs();
      useRegistrationStore().currentTabIndex = tabs().findIndex((t) => t.id === 'isRegistered');
      useRegistrationStore().resetHouseholdCreate();
      useRegistrationStore().registrationErrors = null;
    },

    resetAllTabs() {
      for (let index = 0; index < this.allTabs.length; index += 1) {
        useRegistrationStore().mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = false;
          tab.isValid = true;
          tab.isTouched = false;
        });
      }
    },
  },
});
</script>
