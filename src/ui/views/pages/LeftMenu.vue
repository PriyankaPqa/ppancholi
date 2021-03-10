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
          <v-icon size="24" color="grey darken-2">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
      <v-list-item
        v-for="(tab, index) in tabs"
        :key="index"
        :disabled="tab.disabled"
        :class="{ navMenu__active: currentTab.id === tab.id }"
        :data-test="`registration-tab-${tab.id}`"
        @click="$emit('jump', index)">
        <v-list-item-icon>
          <v-icon
            :color="currentTab.id === tab.id ? 'secondary' : 'primary darken-1'"
            :data-test="`registration-tab-icon-${tab.id}`"
            v-text="tab.icon" />
        </v-list-item-icon>

        <v-list-item-content class="rc-body14">
          {{ $t(tab.labelKey) }}
        </v-list-item-content>

        <v-list-item-icon>
          <v-icon v-if="tab.isTouched" :class="tab.isValid ? 'status_success--text' : 'status_error--text'">
            {{ tab.isValid ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';
import Vue from 'vue';

export default Vue.extend({
  name: 'LeftMenu',

  data() {
    return {
      showErrorIcon: true,
      showSuccessIcon: true,
      requestOnGoing: false,
    };
  },

  computed: {
    isLeftMenuOpen: {
      get(): boolean {
        return this.$storage.registration.getters.isLeftMenuOpen();
      },
      set(val: boolean): void {
        this.$storage.registration.mutations.toggleLeftMenu(val);
      },
    },
    tabs(): ILeftMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },
    currentTab(): ILeftMenuItem {
      return this.$storage.registration.getters.currentTab();
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
</style>
