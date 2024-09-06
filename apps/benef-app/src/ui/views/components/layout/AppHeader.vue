<template>
  <v-app-bar clipped-left clipped-right app color="white">
    <v-app-bar-nav-icon
      v-if="!isLandingPage"
      class="ml-0"
      :aria-label="$t('aria.label.menu')"
      color="primary darken-1"
      data-test="left-menu-trigger"
      @click.stop="toggleLeftMenu" />

    <v-toolbar-title class="pl-0">
      <img alt="logo" :src="logoUrl" class="logo" data-test="registration-portal-logo">
    </v-toolbar-title>
    <div v-if="branding && branding.showName" class="branding-name">
      <v-divider vertical class="mx-5" />
      <span class="rc-heading-4">{{ $m(branding.name) }}</span>
    </div>

    <template v-if="isTemporaryBranch">
      <div class="branch-box">
        You are on the branch {{ branchId }}
        <v-btn small class="ml-1" @click="refreshToSameFeatureBranch">
          Refresh
        </v-btn>
      </div>
    </template>

    <v-spacer />

    <div class="d-flex flex-column align-end">
      <span class="toolbar-title fw-bold mr-2  text-truncate" data-test="registration-portal-toolbar-event-name">
        {{ eventName }}
      </span>
      <span v-if="eventPhoneNumber" class="rc-body14 text-truncate mr-2" data-test="registration-portal-toolbar-event-phone-number">
        {{ $t('common.help') }}: <rc-phone-display show-as-link :value="eventPhoneNumber" />
      </span>
    </div>

    <language-selector data-test="registration-portal-language-selector" />

    <v-btn v-if="false" icon data-test="general-help-trigger" :aria-label="$t('common.help')" @click="openHelp()">
      <v-icon color="grey darken-2">
        mdi-information
      </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPhoneDisplay } from '@libs/component-lib/components';
import { IBrandingEntity } from '@libs/entities-lib/tenantSettings';
import LanguageSelector from '@/ui/views/components/shared/LanguageSelector.vue';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { IEventSummary } from '@libs/entities-lib/event';
import { sessionStorageKeys } from '@/constants/sessionStorage';

export default Vue.extend({
  name: 'AppHeader',

  components: {
    LanguageSelector,
    RcPhoneDisplay,
  },

  data() {
    return {
      helpLink: 'zendesk.beneficiary_registration.introduction',
      branchId: '',
    };
  },

  computed: {
    logoUrl(): string {
      return this.$services.tenantSettings.getLogoUrl(this.$i18n.locale);
    },

    branding(): IBrandingEntity {
      return useTenantSettingsStore().getBranding();
    },

    event(): IEventSummary {
      return useRegistrationStore().getEvent();
    },

    eventName(): string {
      return this.event ? this.$m(this.event.name) : '';
    },

    eventPhoneNumber(): string {
      return this.event?.responseDetails?.assistanceNumber;
    },

    isLandingPage(): boolean {
      return this.$route.name === routes.landingPage.name;
    },
    isTemporaryBranch() {
      return !!process.env.VITE_TEMP_BRANCH_ID;
    },
  },

  created() {
    this.branchId = process.env.VITE_TEMP_BRANCH_ID;
  },

  methods: {
    toggleLeftMenu() {
      useRegistrationStore().isLeftMenuOpen = !useRegistrationStore().isLeftMenuOpen;
    },
    openHelp() {
      helpers.openHelpCenterWindow(this.$t(this.helpLink) as string, 300);
    },
    refreshToSameFeatureBranch() {
      // Save where we are to go back there after the refresh
      sessionStorage.setItem(sessionStorageKeys.pathBeforeRefresh.name, this.$route.path);
      const branchId = process.env.VITE_TEMP_BRANCH_ID;
      window.location.href = `${window.location.origin}/?fb=${branchId}`;
    },
  },
});
</script>

<style scoped lang="scss">
.logo {
  background-size: cover;
}

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .logo {
      max-width: 80px;
      max-height: 40px;
  }

  .branding-name {
    display: none;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-sm-max) {
  .logo {
    max-width: 133px;
    max-height: 48px;
  }

  .branding-name {
    display: none;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 300px;
  }
}
@media only screen and (min-width: $breakpoint-md-min) and (max-width: $breakpoint-md-max) {
  .logo {
    max-width: 133px;
    max-height: 48px;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 650px;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .logo {
    max-width: 160px;
    max-height: 64px;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 900px;
  }
}

.branch-box {
    margin-left: 20px;
    background-color: rgb(232, 151, 10);
    font-size: 20px;
    font-weight: 600;
    padding: 10px;
    border-radius: 4px;
  }
</style>
