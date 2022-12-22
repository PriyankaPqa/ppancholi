import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
    const leftMenuExpanded = ref(false);
    const leftMenuVisible = ref(false);
    const rightMenuVisible = ref(false);
    const generalHelpMenuVisible = ref(false);
    const initLoading = ref(false);
    const checkingAccount = ref(true);

    return {
      leftMenuExpanded,
      leftMenuVisible,
      rightMenuVisible,
      generalHelpMenuVisible,
      initLoading,
      checkingAccount,
    };
});
