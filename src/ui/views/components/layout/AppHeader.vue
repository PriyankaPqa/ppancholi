<template>
  <v-app-bar clipped-left clipped-right app color="white">
    <v-app-bar-nav-icon
      v-if="!isLandingPage"
      class="ml-0"
      :aria-label="$t('aria.label.menu')"
      color="primary darken-1"
      data-test="left-menu-trigger"
      @click.stop="toggleLeftMenu" />

    <div :class="$i18n.locale === 'en' ? 'logoEn' : 'logoFr'" data-test="registration-portal-logo" />

    <v-spacer />

    <span class="toolbar-title fw-bold mr-2 text-truncate" data-test="registration-portal-toolbar-event-name">
      {{ eventName }}
    </span>

    <language-selector data-test="registration-portal-language-selector" />

    <v-btn icon data-test="general-help-trigger" :aria-label="$t('common.help')">
      <v-icon color="grey darken-2">
        mdi-information
      </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue';
import LanguageSelector from '@/ui/shared-components/LanguageSelector.vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'AppHeader',

  components: {
    LanguageSelector,
  },

  data() {
    return {};
  },

  computed: {
    eventName() {
      const event = this.$storage.registration.getters.event();
      return this.$m(event.name);
    },
    isLandingPage(): boolean {
      return this.$route.name === routes.landingPage.name;
    },
  },

  methods: {
    toggleLeftMenu() {
      const isLeftMenuOpen = this.$storage.registration.getters.isLeftMenuOpen();
      this.$storage.registration.mutations.toggleLeftMenu(!isLeftMenuOpen);
    },
  },
});
</script>

<style scoped lang="scss">
$url-logo: '../../../../../public/img/logo.png';
$url-rc-en-logo: '../../../../../public/img/logos/rc/rc-en.svg';
$url-rc-fr-logo: '../../../../../public/img/logos/rc/rc-fr.svg';

.logoEn {
  background-size: cover;
  background-image: url($url-rc-en-logo);
}

.logoFr {
  background-size: cover;
  background-image: url($url-rc-fr-logo);
}

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .logoEn,
  .logoFr {
    background-image: url($url-logo);
    width: 30px;
    height: 30px;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-sm-max) {
  .logoEn,
  .logoFr {
    width: 140px;
    height: 56px;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 300px;
  }
}
@media only screen and (min-width: $breakpoint-md-min) and (max-width: $breakpoint-md-max) {
  .logoEn,
  .logoFr {
    width: 140px;
    height: 56px;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 650px;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .logoEn,
  .logoFr {
    width: 160px;
    height: 64px;
  }

  .toolbar-title {
    font-size: 18px;
    max-width: 900px;
  }
}
</style>
