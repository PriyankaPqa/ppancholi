<template>
  <v-navigation-drawer
    v-if="!$slots['navigation']"
    floating
    color="grey lighten-5"
    width="100%"
    style="height: auto;"
    :value="true"
    permanent>
    <v-list>
      <v-list-item
        v-for="(tab, index) in allTabs"
        :key="index"
        :disabled="tab.disabled"
        :class="{ navMenu__active: currentTab.id === tab.id, 'rc-body14': true }"
        :data-test="`registration-tab-${tab.id}`"
        @click="$emit('jump', index)">
        <v-list-item-icon v-if="tab.icon">
          <v-icon
            :disabled="tab.disabled"
            :color="currentTab.id === tab.id ? 'secondary' : 'primary darken-1'"
            :data-test="`registration-tab-icon-${tab.id}`">
            {{ tab.icon }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content class="fw-bold">
          {{ $t(tab.labelKey) }}
        </v-list-item-content>

        <v-list-item-icon class="ml-0">
          <v-icon v-if="tab.isTouched" size="18" :disabled="tab.disabled" :class="[tab.isValid ? 'status_success--text' : 'status_error--text']">
            {{ tab.isValid ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { IRegistrationMenuItem } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import Vue from 'vue';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'Tabs',

  data() {
    return {
      showErrorIcon: true,
      showSuccessIcon: true,
    };
  },

  computed: {
    allTabs(): IRegistrationMenuItem[] {
      const allTabs = useRegistrationStore().tabs;
      // When feature flag is removed, the new translation keys need to be set in the files 'tabs'
      if (this.$hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)) {
        return allTabs.map((t) => {
          if (t.id === 'isRegistered') {
            return {
              ...t,
              labelKey: t.labelKey === 'registration.menu.is_registered' ? 'registration.menu.isIndividualRegistered' : 'household.split.household_search',
              titleKey: 'registration.menu.isIndividualRegistered',
            };
          }
          return t;
        });
      }
      return allTabs;
    },

    currentTab(): IRegistrationMenuItem {
      return useRegistrationStore().getCurrentTab();
    },
  },
});
</script>

<style scoped lang="scss">
.dev-container {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.navMenu__active {
  background: var(--v-grey-lighten4);
  border-left: 4px solid var(--v-secondary-base);
}
</style>
