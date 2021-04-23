<template>
  <div>
    <v-app-bar color="white" app clipped-right clipped-left class="elevation-2">
      <v-app-bar-nav-icon id="hamburgerMenu" data-test="left-menu-trigger" @click.stop="handleLeftMenu" />
      <v-toolbar-title>
        <div :class="`${$i18n.locale === 'en' ? 'logoEn' : 'logoFr'} ml-n4 ml-md-0`" data-test="appHeader__logo" />
      </v-toolbar-title>

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
        {{ $t('header.registerBeneficiaries') }}
      </v-btn>

      <language-selector />

      <v-btn icon data-test="general-help-trigger" :aria-label="$t('common.help')" @click.stop="handleGeneralHelpMenu">
        <v-icon color="grey darken-2">
          mdi-information
        </v-icon>
      </v-btn>

      <v-btn icon data-test="right-menu-trigger" @click.stop="handleRightMenu">
        <v-avatar color="grey darken-2" size="36">
          <span class="white--text">{{ getAvatarName }}</span>
        </v-avatar>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import LanguageSelector from '@/ui/shared-components/LanguageSelector.vue';

export default Vue.extend({
  name: 'Header',

  components: {
    LanguageSelector,
  },

  data() {
    return {
      showGeneralHelp: false,
      routes,
    };
  },

  computed: {
    getAvatarName() {
      const user = this.$storage.user.getters.user();
      return user.getInitials();
    },

    displayRegistrationButton(): boolean {
      return this.$route.name !== routes.registration.home.name
        && this.$route.name !== routes.registration.individual.name
        && this.$hasLevel('level1');
    },
  },

  methods: {
    handleLeftMenu() {
      if (this.$vuetify.breakpoint.mdAndDown) {
        this.$storage.dashboard.mutations.setProperty({
          property: 'leftMenuVisible',
          value: !this.$store.state.dashboard.leftMenuVisible,
        });
      }

      this.$storage.dashboard.mutations.setProperty({
        property: 'leftMenuExpanded',
        value: !this.$store.state.dashboard.leftMenuExpanded,
      });
    },

    handleRightMenu() {
      this.$storage.dashboard.mutations.setProperty({
        property: 'rightMenuVisible',
        value: !this.$store.state.dashboard.rightMenuVisible,
      });
    },

    handleGeneralHelpMenu() {
      this.$storage.dashboard.mutations.setProperty({
        property: 'generalHelpMenuVisible',
        value: !this.$store.state.dashboard.generalHelpMenuVisible,
      });
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
  $url-logo: "../../../../../public/img/logo.png";
  $url-rc-en-logo: "../../../../../public/img/logos/rc/rc-en.svg";
  $url-rc-fr-logo: "../../../../../public/img/logos/rc/rc-fr.svg";

  .v-app-bar__nav-icon {
    margin-left: 0px!important;
  }

  .logoEn {
    background-size: cover;
    background-image: url($url-rc-en-logo);
  }

  .logoFr {
    background-size: cover;
    background-image: url($url-rc-fr-logo);
  }

  @media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
    .logoEn, .logoFr {
      background-image: url($url-logo);
      width: 40px;
      height: 40px;
    }
  }
  @media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
    .logoEn, .logoFr {
      width: 133px;
      height: 48px;
    }
  }
  @media only screen and (min-width: $breakpoint-lg-min) {
    .logoEn, .logoFr {
      width:  160px;
      height: 64px;
    }
  }
</style>
