<template>
  <div class="full-height grey lighten-4">
    <page-template
      :loading="false"
      :navigation-tabs="tabs"
      :left-menu-title="splitMemberName"
      :left-menu-subtitle="$t('household.split.sub-title.split_household_member')">
      <template #navigation>
        <tabs @jump="jump" />
      </template>

      <validation-observer ref="form" v-slot="{ failed }" slim>
        <rc-page-content
          :show-back-button="false"
          :title="title"
          :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
          outer-scroll>
          <template slot="default">
            <v-row justify="center" class="mt-12 full-height" no-gutters>
              <v-col cols="12" xl="10" lg="10" md="11" sm="12" xs="12">
                <component :is="currentTab.componentName" />
              </v-col>
            </v-row>
          </template>

          <template slot="actions">
            <div class="actions">
              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <v-btn
                  v-if="currentTab.id === 'confirmation'"
                  class="printButton"
                  :aria-label="$t(currentTab.backButtonTextKey)"
                  data-test="printButton"
                  @click="print()">
                  <v-icon size="20" color="grey darken-2" class="pr-2">
                    mdi-printer
                  </v-icon>
                  {{ $t(currentTab.backButtonTextKey) }}
                </v-btn>
                <v-btn v-else :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" :disabled="submitLoading" @click="back()">
                  {{ $t(currentTab.backButtonTextKey) }}
                </v-btn>

                <span class="ml-2 d-sm-inline d-md-none">{{ previousTabName }}</span>
              </div>

              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
                <v-btn
                  color="primary"
                  data-test="nextButton"
                  :aria-label="nextButtonLabel"
                  :loading="submitLoading"
                  :disabled="failed"
                  @click="next()">
                  {{ nextButtonLabel }}
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
import mixins from 'vue-typed-mixins';
import individual from '@crctech/registration-lib/src/ui/mixins/individual';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import { ISplitHousehold } from '@crctech/registration-lib/src/entities/household-create';
import routes from '@/constants/routes';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import Tabs from '@/ui/views/pages/registration/individual/Tabs.vue';
import IsRegistered from '@/ui/views/pages/registration/is-registered/IsRegistered.vue';
import PrivacyStatement from '@/ui/views/pages/registration/privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '@/ui/views/pages/registration/personal-information/PersonalInformation.vue';
import Addresses from '@/ui/views/pages/registration/addresses/Addresses.vue';
import AdditionalMembers from '@/ui/views/pages/registration/additional-members/AdditionalMembers.vue';
import ReviewRegistration from '@/ui/views/pages/registration/review/ReviewRegistration.vue';
import ConfirmRegistration from '@/ui/views/pages/registration/confirmation/ConfirmRegistration.vue';
import { tabs } from '@/store/modules/household/tabs';

export default mixins(individual).extend({
  name: 'SplitHousehold',

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.currentTab.id !== 'isRegistered') {
      const userChoice = await (this.$confirm(this.titleLeave, this.messagesLeave) as Promise<unknown>);
      next(userChoice);
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
    AdditionalMembers,
    ReviewRegistration,
    ConfirmRegistration,
  },

  mixins: [individual],

  data() {
    return {
      tabs: tabs(),
    };
  },

  computed: {

    splitMemberName(): string {
      if (this.splitHousehold?.splitMembers?.primaryMember) {
        const { primaryMember } = this.splitHousehold.splitMembers;
        return `${primaryMember.identitySet.firstName} ${primaryMember.identitySet.lastName}`;
      }
      return '';
    },

    splitHousehold(): ISplitHousehold {
      return this.$store.state.registration.splitHousehold;
    },

    submitLoading(): boolean {
      // TO DO in later stories
      return false;
    },

    titleLeave(): TranslateResult {
      return this.$t('confirmLeaveDialog.title');
    },

    messagesLeave(): Array<TranslateResult> {
      return [
        this.$t('confirmLeaveDialog.message_1'),
        this.$t('confirmLeaveDialog.message_2'),
      ];
    },

    title(): TranslateResult {
      return this.$t(this.currentTab.titleKey);
    },

    nextButtonLabel(): TranslateResult {
      return this.$t(this.currentTab.nextButtonTextKey);
    },

  },

  created() {
    this.$storage.registration.mutations.setTabs(this.tabs);
  },

  methods: {
    async back() {
      if (this.currentTab.id === 'isRegistered' && this.$store.state.registration.householdResultsShown) {
        this.$storage.registration.mutations.setHouseholdResultsShown(false);
        return;
      }

      if (this.currentTabIndex === 0) {
        await this.$router.push({
          name: routes.household.householdProfile.name,
          params: {
            id: this.splitHousehold.originHouseholdId,
          },
        });
        return;
      }

      await this.jump(this.currentTabIndex - 1);
    },

    async next() {
      await this.jump(this.currentTabIndex + 1);
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

.printButton {
  position: absolute;
  left: 10px;
}
</style>
