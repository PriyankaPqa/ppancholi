<template>
  <div class="full-height grey lighten-4">
    <page-template
      :loading="false"
      :navigation-tabs="flowTabs"
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
            <v-row justify="center" class="mt-8 full-height" no-gutters>
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
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import individual from '@crctech/registration-lib/src/ui/mixins/individual';
import { RcPageContent } from '@crctech/component-library';
import { ContactInformation, IMember, ISplitHousehold } from '@crctech/registration-lib/src/entities/household-create';
import routes from '@/constants/routes';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import Tabs from '@/ui/views/pages/registration/individual/Tabs.vue';
import IsRegistered from '@/ui/views/pages/registration/is-registered/IsRegistered.vue';
import PrivacyStatement from '@/ui/views/pages/registration/privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '@/ui/views/pages/registration/personal-information/PersonalInformation.vue';
import Addresses from '@/ui/views/pages/registration/addresses/Addresses.vue';
import ConfirmRegistration from '@/ui/views/pages/registration/confirmation/ConfirmRegistration.vue';
import SplitHouseholdEvent from '@/ui/views/pages/household/split/SplitHouseholdEvent.vue';
import SplitHouseholdMembers from '@/ui/views/pages/household/split/SplitHouseholdMembers.vue';
import ReviewSplit from '@/ui/views/pages/household/split/ReviewSplit.vue';

import { tabs } from '@/store/modules/household/tabs';
import { VForm } from '@/types';
import helpers from '@/ui/helpers/helpers';

export default mixins(individual).extend({
  name: 'SplitHousehold',

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.currentTab.id === 'confirmation') {
      this.$storage.registration.mutations.resetSplitHousehold();
      next();
    } else if (!this.allowExit) {
      const userChoice = await (this.$confirm(this.titleLeave, this.messagesLeave) as Promise<unknown>);
      if (userChoice) {
        this.$storage.registration.mutations.resetSplitHousehold();
      }
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
    ReviewSplit,
    ConfirmRegistration,
    SplitHouseholdEvent,
    SplitHouseholdMembers,
  },

  data() {
    return {
      allowExit: false,
    };
  },

  computed: {
    flowTabs() {
      if (this.splitHousehold?.splitMembers.additionalMembers.length) {
        return tabs();
      }
      return tabs().filter((t) => t.id !== 'additionalSplitMembers');
    },

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
    this.$storage.registration.mutations.setTabs(this.flowTabs);
    if (!this.splitHousehold) {
      this.back();
    }
  },

  methods: {
    async back() {
      if (this.currentTabIndex === 0 || !this.splitHousehold) {
        if (this.$store.state.registration.householdResultsShown) {
          this.$storage.registration.mutations.setHouseholdResultsShown(false);
          return;
        }

        this.allowExit = true;
        await this.$router.push({
          name: routes.household.householdProfile.name,
          params: {
            id: this.$route.params.id,
          },
        });
        return;
      }

      await this.jump(this.currentTabIndex - 1);
    },

    async next() {
      if (!this.splitHousehold) {
        return;
      }

      if (this.currentTab.id === 'confirmation') {
        this.closeSplit();
        return;
      }

      if (this.currentTabIndex === 0) {
        this.createNewHousehold();
      }

      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('app');
        return;
      }

      if (this.currentTab.id === 'reviewSplitInfo') {
        await this.$storage.registration.actions.splitHousehold();
      }

      if (this.currentTabIndex < this.flowTabs.length - 1) {
        await this.jump(this.currentTabIndex + 1);
      }
    },

    closeSplit() {
      const householdId = this.$storage.registration.getters.registrationResponse()?.id;

      this.$router.replace({
        name: routes.household.householdProfile.name,
        params: {
          id: householdId || this.splitHousehold.originHouseholdId,
        },
      });
    },

    createNewHousehold() {
      const primaryMember = _cloneDeep(this.splitHousehold.splitMembers.primaryMember);
      const { additionalMembers } = this.splitHousehold.splitMembers;
      primaryMember.setCurrentAddress(null);
      primaryMember.contactInformation = new ContactInformation();

      this.$storage.registration.mutations.resetHouseholdCreate();
      this.$storage.registration.mutations.setPrimaryBeneficiary(primaryMember);

      if (additionalMembers) {
        additionalMembers.forEach((m: IMember) => {
          const member = _cloneDeep(m);
          member.setCurrentAddress(null);
          this.$storage.registration.mutations.addAdditionalMember(member, true);
        });
      }
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
