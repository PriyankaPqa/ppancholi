<template>
  <div class="full-height grey lighten-4">
    <page-template
      :loading="false"
      :navigation-tabs="allTabs"
      :left-menu-title="splitMemberName"
      :left-menu-subtitle="$t('household.split.sub-title.split_household_member')">
      <template #navigation>
        <tabs @jump="jump" />
      </template>

      <validation-observer ref="form" v-slot="{ failed }" slim>
        <rc-page-content
          :show-back-button="false"
          :title="title || ''"
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
              <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
                <v-btn
                  v-if="currentTab.id === TabId.Confirmation"
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

              <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
                <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
                <v-btn
                  data-test="nextButton"
                  :color="currentTab.id === TabId.Confirmation && registrationAssessment ? '' : 'primary'"
                  :aria-label="nextButtonLabel"
                  :loading="submitLoading"
                  :disabled="failed"
                  @click="next()">
                  {{ nextButtonLabel }}
                </v-btn>
                <v-btn v-if="currentTab.id === TabId.Confirmation && registrationAssessment" color="primary" data-test="new-registration-button" @click="openAssessmentIfAvailable">
                  {{ $t('registration.start_assessment.label') }}
                </v-btn>
              </div>
            </div>
          </template>
        </rc-page-content>
      </validation-observer>
    </page-template>
    <confirmation-print ref="printConfirm" :event="event" :registration-number="registrationNumber" />
  </div>
</template>

<script lang="ts">
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import individual from '@libs/registration-lib/ui/mixins/individual';
import { RcPageContent } from '@libs/component-lib/components';
import { ContactInformation, IMember, ISplitHousehold } from '@libs/entities-lib/household-create';
import { IRegistrationAssessment } from '@libs/entities-lib/event';
import ConfirmationPrint from '@libs/registration-lib/components/confirm-registration/ConfirmationPrintLib.vue';
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

import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { tabs } from '@/ui/views/pages/household/split/tabs';
import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { UserRoles } from '@libs/entities-lib/user';

export default mixins(individual).extend({
  name: 'SplitHousehold',

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.currentTab.id === TabId.Confirmation) {
      useRegistrationStore().resetSplitHousehold();
      next();
    } else if (!this.allowExit) {
      const userChoice = await (this.$confirm({
        title: this.titleLeave,
        messages: this.messagesLeave,
      }) as Promise<unknown>);
      if (userChoice) {
        useRegistrationStore().resetSplitHousehold();
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
    ConfirmationPrint,
  },

  data() {
    return {
      allowExit: false,
      awaiting: false,
      TabId,
    };
  },

  computed: {
    registrationAssessment(): IRegistrationAssessment {
      return (!this.$hasRole(UserRoles.level0) || this.event.assessmentsForL0usersEnabled) && useRegistrationStore().getAssessmentToComplete()?.registrationAssessment;
    },

    splitMemberName(): string {
      if (this.splitHousehold?.splitMembers?.primaryMember) {
        const { primaryMember } = this.splitHousehold.splitMembers;
        return `${primaryMember.identitySet.firstName} ${primaryMember.identitySet.lastName}`;
      }
      return '';
    },

    splitHousehold(): ISplitHousehold {
      return useRegistrationStore().splitHouseholdState;
    },

    submitLoading(): boolean {
      return this.awaiting;
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
      return this.$t(this.allTabs[this.currentTabIndex].titleKey);
    },

    nextButtonLabel(): TranslateResult {
      return this.$t(this.currentTab.nextButtonTextKey);
    },
  },

  created() {
    let allTabs = tabs();
    if (!this.splitHousehold?.splitMembers.additionalMembers.length) {
      allTabs = allTabs.filter((t) => t.id !== TabId.AdditionalSplitMembers);
    }
    useRegistrationStore().setTabs(allTabs);
    useRegistrationStore().setAssessmentToComplete(null);
    if (!this.splitHousehold) {
      this.back();
    }
  },

  methods: {
    async back() {
      if (this.currentTabIndex === 0 || !this.splitHousehold) {
        if (useRegistrationStore().householdResultsShown) {
          useRegistrationStore().householdResultsShown = false;
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
      switch (this.currentTab.id) {
        case TabId.IsRegistered:
          this.createNewHousehold();
          this.nextDefault();
          return;

        case TabId.PersonalInfo:
          EventHub.$emit('checkEmailValidation', this.nextDefault);
          return;

        case TabId.ReviewSplitInfo:
          this.nextDefault(true);
          return;

        case TabId.Confirmation:
          this.closeSplit();
          return;

        default:
          this.nextDefault();
      }
    },

    async nextDefault(performSplit?: boolean) {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('app');
        return;
      }

      if (performSplit) {
        this.awaiting = true;
        await useRegistrationStore().splitHousehold();
        this.awaiting = false;
      }

      if (this.currentTabIndex < this.allTabs.length - 1) {
        await this.jump(this.currentTabIndex + 1);
      }
    },

    closeSplit() {
      const householdId = useRegistrationStore().registrationResponse?.household?.id;

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

      useRegistrationStore().resetHouseholdCreate();
      useRegistrationStore().householdCreate.setPrimaryBeneficiary(primaryMember);

      if (additionalMembers) {
        additionalMembers.forEach((m: IMember) => {
          const member = _cloneDeep(m);
          member.setCurrentAddress(null);
          useRegistrationStore().householdCreate.addAdditionalMember(member, true);
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
