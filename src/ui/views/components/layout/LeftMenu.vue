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
            :data-test="`registration-tab-icon-${tab.id}`"
            v-text="tab.icon" />
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

      <div v-if="isDev" class="dev-container">
        <v-btn @click="prefill">
          Fill data
        </v-btn>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  mockMember, mockAddress, mockContactInformation, mockCampGround,
} from '@crctech/registration-lib/src/entities/household-create';
import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types/interfaces/IRegistrationMenuItem';

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
        return this.$storage.registration.getters.isLeftMenuOpen();
      },
      set(val: boolean): void {
        this.$storage.registration.mutations.toggleLeftMenu(val);
      },
    },
    tabs(): IRegistrationMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },
    currentTab(): IRegistrationMenuItem {
      return this.$storage.registration.getters.currentTab();
    },
    xSmallOrSmallMenu(): boolean {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },
    isDev() {
      return process.env.NODE_ENV === 'development';
    },
  },

  methods: {
    prefill() {
      this.$storage.registration.mutations.setIsPrivacyAgreed(true);
      this.$storage.registration.mutations.setPrimaryBeneficiary(mockMember());
      this.$storage.registration.mutations.setContactInformation(mockContactInformation());
      this.$storage.registration.mutations.setHomeAddress(mockAddress());
      this.$storage.registration.mutations.setCurrentAddress(mockCampGround());
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
