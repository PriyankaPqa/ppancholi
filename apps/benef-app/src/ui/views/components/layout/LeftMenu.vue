<template>
  <v-navigation-drawer
    v-model="isLeftMenuOpen"
    :permanent="!xSmallOrSmallMenu"
    app
    clipped
    :mini-variant="!isLeftMenuOpen && !xSmallOrSmallMenu"
    mini-variant-width="80"
    height="100%"
    width="286">
    <v-list>
      <div class="pt-2 pb-4 pl-4">
        <v-btn class="d-md-none" data-test="self-Registration-close-icon" icon x-small>
          <v-icon size="24" color="grey darken-2" @click="isLeftMenuOpen = false">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
      <v-list-item
        v-for="(tab, index) in tabs"
        :key="index"
        :disabled="tab.disabled"
        :class="{ navMenu__active: currentTab.id === tab.id, 'rc-body14': true }"
        :data-test="`registration-tab-${tab.id}`"
        @click="$emit('jump', index)">
        <v-list-item-icon>
          <v-icon
            :disabled="tab.disabled"
            :color="currentTab.id === tab.id ? 'secondary' : 'primary darken-1'"
            :data-test="`registration-tab-icon-${tab.id}`">
            {{ tab.icon }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          {{ $t(tab.labelKey) }}
        </v-list-item-content>

        <v-list-item-icon>
          <v-icon v-if="tab.isTouched" :disabled="tab.disabled" :class="tab.isValid ? 'status_success--text' : 'status_error--text'">
            {{ tab.isValid ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { IRegistrationMenuItem } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { useRegistrationStore } from '@/pinia/registration/registration';

export default Vue.extend({
  name: 'LeftMenu',

  data() {
    return {
      showErrorIcon: true,
      showSuccessIcon: true,
    };
  },

  computed: {
    isLeftMenuOpen: {
      get(): boolean {
        return useRegistrationStore().isLeftMenuOpen;
      },
      set(val: boolean): void {
        useRegistrationStore().isLeftMenuOpen = val;
      },
    },
    tabs(): IRegistrationMenuItem[] {
      return useRegistrationStore().tabs;
    },
    currentTab(): IRegistrationMenuItem {
      return useRegistrationStore().getCurrentTab();
    },
    xSmallOrSmallMenu(): boolean {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },
  },
});
</script>

<style scoped lang="scss">
.v-navigation-drawer--mini-variant {
  .navMenu__active::before {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    margin: auto;
    background-color: var(--v-grey-lighten4);
    opacity: 1;
  }
}

.v-navigation-drawer:not(.v-navigation-drawer--mini-variant) {
  .navMenu__active {
    background: var(--v-grey-lighten4);
  }
}

.dev-container {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
