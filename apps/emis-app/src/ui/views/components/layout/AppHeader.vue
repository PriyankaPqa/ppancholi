<template>
  <div>
    <v-app-bar color="white" app clipped-right clipped-left class="elevation-2">
      <rc-tooltip v-if="hasRole" bottom>
        <template #activator="{ on }">
          <v-app-bar-nav-icon id="hamburgerMenu" data-test="left-menu-trigger" v-on="on" @click.stop="handleLeftMenu" />
        </template>
        {{ $t('aria.label.menu') }}
      </rc-tooltip>
      <v-toolbar-title>
        <img alt="logo" :src="logoUrl" class="logo ml-n4 ml-md-0" data-test="appHeader__logo">
      </v-toolbar-title>

      <template v-if="branding && branding.showName">
        <v-divider vertical class="mx-5" />
        <span class="rc-heading-4">{{ $m(branding.name) }}</span>
      </template>

      <v-spacer />
      <v-btn
        v-if="displayRegistrationButton"
        color="primary"
        class="mx-md-4 my-4"
        data-test="appHeader__registerBeneficiaries"
        @click.stop="routeToRegistration">
        <v-icon left>
          mdi-plus
        </v-icon>
        {{ $t('header.beginRegistration') }}
      </v-btn>

      <language-selector />

      <rc-tooltip v-if="false" bottom>
        <template #activator="{ on }">
          <v-btn icon data-test="general-help-trigger" :aria-label="$t('common.help')" v-on="on" @click.stop="handleGeneralHelpMenu">
            <v-icon color="grey darken-2">
              mdi-information
            </v-icon>
          </v-btn>
        </template>
        {{ $t('common.help') }}
      </rc-tooltip>

      <rc-tooltip bottom>
        <template #activator="{ on }">
          <v-btn icon data-test="right-menu-trigger" v-on="on" @click.stop="handleRightMenu">
            <v-avatar color="grey darken-2" size="36">
              <span class="white--text">{{ getAvatarName }}</span>
            </v-avatar>
          </v-btn>
        </template>
        {{ $t('rightmenu.title') }}
      </rc-tooltip>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTooltip } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import LanguageSelector from '@/ui/shared-components/LanguageSelector.vue';
import { IBrandingEntity, FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useUserStore } from '@/pinia/user/user';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { UserRoles } from '@libs/entities-lib/user';

export default Vue.extend({
  name: 'AppHeader',

  components: {
    LanguageSelector,
    RcTooltip,
  },

  data() {
    return {
      showGeneralHelp: false,
      routes,
      FeatureKeys,
    };
  },

  computed: {
    getAvatarName() {
      const user = useUserStore().getUser();
      return user.getInitials();
    },

    displayRegistrationButton(): boolean {
      return this.$route.name !== routes.registration.home.name
        && this.$route.name !== routes.registration.individual.name
        && this.$hasLevel(UserRoles.level0);
    },

    logoUrl(): string {
      const tenantSettings = useTenantSettingsStore().currentTenantSettings.id;
      return `${this.$services.tenantSettings.getLogoUrl(this.$i18n.locale, tenantSettings)
      }?d=${useTenantSettingsStore().currentTenantSettings.timestamp}`;
    },

    branding(): IBrandingEntity {
      return useTenantSettingsStore().currentTenantSettings.branding;
    },

    hasRole():boolean {
      return !this.$hasRole(UserRoles.noAccess);
    },
  },

  methods: {
    handleLeftMenu() {
      const dashboardStore = useDashboardStore();
      if (this.$vuetify.breakpoint.mdAndDown) {
        dashboardStore.leftMenuVisible = !dashboardStore.leftMenuVisible;
      }
      dashboardStore.leftMenuExpanded = !dashboardStore.leftMenuExpanded;
    },

    handleRightMenu() {
      const dashboardStore = useDashboardStore();
      dashboardStore.rightMenuVisible = !dashboardStore.rightMenuVisible;
    },

    handleGeneralHelpMenu() {
      const dashboardStore = useDashboardStore();
      dashboardStore.generalHelpMenuVisible = !dashboardStore.generalHelpMenuVisible;
    },

    routeToRegistration() {
      this.$router.push({
        name: routes.registration.home.name,
      });
    },
  },
});
</script>

<style scoped lang="scss">
  .v-app-bar__nav-icon {
    margin-left: 0px!important;
  }

  .logo {
    background-size: cover;
  }

  @media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
    .logo {
      max-width: 40px;
      max-height: 40px;
    }
  }
  @media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
    .logo {
      max-width: 133px;
      max-height: 48px;
    }
  }
  @media only screen and (min-width: $breakpoint-lg-min) {
    .logo {
      max-width:  160px;
      max-height: 64px;
    }
  }
</style>
