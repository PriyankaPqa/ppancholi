<template>
  <div class="full-height grey lighten-4">
    <page-template
      :show-left-menu="true"
      :loading="false"
      :navigation-tabs="tabs"
      :left-menu-title="eventName"
      :left-menu-subtitle="$t('registration.menu.title')">
      <template #navigation>
        <tabs @jump="jump" />
      </template>

      <validation-observer ref="form" v-slot="{ failed }" slim>
        <rc-page-content
          :show-help="currentTab.helpLink !== '' "
          :help-link="$t(currentTab.helpLink)"
          :title="$t(currentTab.titleKey)"
          :subtitle="$t('registration.type.individual')"
          :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
          outer-scroll>
          <template slot="default">
            <v-row justify="center" class="mt-12" no-gutters>
              <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
                <component :is="currentTab.componentName" />
              </v-col>
            </v-row>
          </template>

          <template slot="actions">
            <div class="actions">
              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <v-btn :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" @click="back()">
                  <v-icon v-if="currentTab.id === 'confirmation'" size="20" color="grey darken-2" class="pr-2">
                    mdi-printer
                  </v-icon>
                  {{ $t(currentTab.backButtonTextKey) }}
                </v-btn>

                <span class="ml-2 d-sm-inline d-md-none">{{ previousTabName }}</span>
              </div>

              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
                <v-btn
                  color="primary"
                  data-test="nextButton"
                  :aria-label="$t(currentTab.nextButtonTextKey)"
                  :loading="requestOnGoing"
                  :disabled="failed"
                  @click="next()">
                  {{ $t(currentTab.nextButtonTextKey) }}
                </v-btn>
              </div>
            </div>
          </template>
        </rc-page-content>
      </validation-observer>
    </page-template>
  </div>
</template>

<script lang="ts">
import { RcPageContent } from '@crctech/component-library';
import routes from '@/constants/routes';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import Tabs from '@/ui/views/pages/registration/individual/Tabs.vue';
import IsRegistered from '@/ui/views/pages/registration/is-registered/IsRegistered.vue';
import PrivacyStatement from '@/ui/views/pages/registration/privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '@/ui/views/pages/registration/personal-information/PersonalInformation.vue';
import Addresses from '@/ui/views/pages/registration/addresses/Addresses.vue';
import HouseholdMembers from '@/ui/views/pages/registration/household-members/HouseholdMembers.vue';
import mixins from 'vue-typed-mixins';
import individual from '@crctech/registration-lib/src/ui/mixins/individual';
import { tabs } from '@/store/modules/registration/tabs';
import store from '@/store/store';
import { Route, NavigationGuardNext } from 'vue-router';

export default mixins(individual).extend({
  name: 'Individual',

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    const event = await store.state.registration.event;
    if (!event) {
      next((vm) => {
        vm.$router.replace({
          name: routes.registration.home.name,
        });
      });
    } else {
      next();
    }
  },

  components: {
    RcPageContent,
    PageTemplate,
    Tabs,
    IsRegistered,
    PersonalInformation,
    PrivacyStatement,
    Addresses,
    HouseholdMembers,
  },

  mixins: [individual],

  data() {
    return {
      tabs,
    };
  },

  computed: {
    eventName() {
      const event = this.$storage.registration.getters.event();
      return this.$m(event.name);
    },
  },
  methods: {
    async back() {
      if (this.currentTabIndex === 0) {
        await this.$router.push({ name: routes.registration.home.name });
        return;
      }
      await this.jump(this.currentTabIndex - 1);
    },
  },
});
</script>

<style scoped lang="scss">

::v-deep .actions {
  .pageContent__actions {
    padding: 10px !important;
  }
}

.actions {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
  height: 100%;
  & > div:nth-child(1) {
    display: flex;
    align-items: center;
    &.half {
      width: 50%;
    }
    &.column {
      height: 100%;
      flex-direction: column;
      align-items: flex-start;
    }
  }
  & > div:nth-child(2) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    justify-self: flex-end;

    &.half {
      width: 50%;
    }
    &.column {
      height: 100%;
      flex-direction: column-reverse;
      align-items: flex-end;
    }
  }
}
</style>
