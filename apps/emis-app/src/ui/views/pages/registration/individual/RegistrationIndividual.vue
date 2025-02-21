<template>
  <div class="full-height grey lighten-4">
    <page-template
      :show-left-menu="!associationMode"
      :loading="false"
      :navigation-tabs="allTabs"
      :left-menu-title="eventName"
      :left-menu-subtitle="$t('registration.menu.title')">
      <template #navigation>
        <tabs @jump="jump" />
      </template>

      <validation-observer ref="form" v-slot="{ failed }" slim>
        <rc-page-content
          :show-back-button="showBackButton"
          :show-help="false && currentTab.helpLink !== '' "
          :help-link="$t(currentTab.helpLink)"
          :title="getTitle"
          :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
          outer-scroll
          @back="backToHouseholdResults()">
          <template slot="default">
            <v-row justify="center" class="mt-12 full-height" no-gutters>
              <v-col v-if="currentTab.componentName === TabId.IsRegistered" cols="12">
                <component :is="currentTab.componentName" :disable-autocomplete="!enableAutocomplete" />
              </v-col>
              <v-col v-else cols="12" xl="10" lg="10" md="11" sm="12" xs="12">
                <component :is="currentTab.componentName" :disable-autocomplete="!enableAutocomplete" />
              </v-col>
            </v-row>
          </template>

          <template slot="actions">
            <div class="actions">
              <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
                <template v-if="currentTab.id === TabId.Confirmation">
                  <v-btn
                    v-if="registrationSuccess"
                    class="printButton"
                    :aria-label="$t(currentTab.backButtonTextKey)"
                    data-test="printButton"
                    @click="print()">
                    <v-icon size="20" color="grey darken-2" class="pr-2">
                      mdi-printer
                    </v-icon>
                    {{ $t(currentTab.backButtonTextKey) }}
                  </v-btn>
                </template>
                <v-btn v-else :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" :disabled="submitLoading" @click="back()">
                  {{ $t(currentTab.backButtonTextKey) }}
                </v-btn>

                <span class="ml-2 d-sm-inline d-md-none">{{ previousTabName }}</span>
              </div>

              <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
                <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
                <div v-if="currentTab.id === TabId.Confirmation && registrationSuccess">
                  <v-btn data-test="new-registration-button" @click="routeToNewRegistration">
                    {{ $t('registration.new_registration.label') }}
                  </v-btn>
                  <v-btn
                    data-test="nextButton"
                    :color="registrationAssessment ? '' : 'primary'"
                    :aria-label="getNextButtonLabel"
                    @click="next()">
                    {{ getNextButtonLabel }}
                  </v-btn>
                  <v-btn v-if="registrationAssessment" color="primary" data-test="new-registration-button" @click="openAssessmentIfAvailable">
                    {{ $t('registration.start_assessment.label') }}
                  </v-btn>
                </div>
                <v-btn
                  v-else
                  color="primary"
                  data-test="nextButton"
                  :aria-label="getNextButtonLabel"
                  :loading="submitLoading || retrying"
                  :disabled="submitLoading || failed || inlineEdit || retrying"
                  @click="next()">
                  {{ getNextButtonLabel }}
                </v-btn>
              </div>
            </div>
          </template>
        </rc-page-content>
      </validation-observer>
    </page-template>
    <confirmation-print-lib ref="printConfirm" :event="event" :registration-number="registrationNumber" />

    <system-error-dialog
      v-if="showErrorDialog"
      :show.sync="showErrorDialog" />
  </div>
</template>

<script lang="ts">
import { RcPageContent } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import individual from '@libs/registration-lib/ui/mixins/individual';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import ConfirmationPrintLib from '@libs/registration-lib/components/confirm-registration/ConfirmationPrintLib.vue';
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
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';

import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import SystemErrorDialog from '@libs/registration-lib/components/review/SystemErrorDialog.vue';
import { IEventSummary, IRegistrationAssessment } from '@libs/entities-lib/event';
import { IRegistrationMenuItem, TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import { CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { ICaseFileIndividualCreateRequest, MembershipStatus } from '@libs/entities-lib/case-file-individual';

export default mixins(individual).extend({
  name: 'Individual',

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    const event = useRegistrationStore().event;
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

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.currentTab.id === TabId.Confirmation || (this.currentTab.id === 'review' && this.householdAlreadyRegistered)) {
      next();
    } else {
      const userChoice = await (this.$confirm({
        title: this.$t('confirmLeaveDialog.title'),
        messages: [
          this.$t('confirmLeaveDialog.message_1'),
          this.$t('confirmLeaveDialog.message_2'),
        ],
      }) as Promise<unknown>);
      next(userChoice);
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
    ConfirmationPrintLib,
    SystemErrorDialog,
  },

  data() {
    return {
      showErrorDialog: false,
      TabId,
    };
  },

  computed: {
    showBackButton(): boolean {
      return this.associationMode && this.currentTab.id !== TabId.Confirmation;
    },

    eventName(): string {
      return this.$m(this.event.name);
    },

    getTitle(): TranslateResult {
      if (this.currentTab.id === 'review' && this.associationMode) {
        return this.$t('registration.details.associateHouseholdButton.label');
      }
      return this.$t(this.allTabs[this.currentTabIndex].titleKey);
    },

    getNextButtonLabel(): TranslateResult {
      if (this.currentTab.id === 'review') {
        if (this.householdAlreadyRegistered) {
          return this.$t('registration.associate.confirmation.next.label');
        }
      }
      return this.$t(this.currentTab.nextButtonTextKey);
    },

    householdAlreadyRegistered(): boolean {
      return useRegistrationStore().householdAlreadyRegistered;
    },

    associationMode(): boolean {
      return useRegistrationStore().householdAssociationMode;
    },

    event(): IEventSummary {
      return useRegistrationStore().getEvent();
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(this.$featureKeys.AddressAutoFill);
    },

    registrationAssessment(): IRegistrationAssessment {
      return (!this.$hasRole(UserRoles.level0) || this.event.assessmentsForL0usersEnabled) && useRegistrationStore().getAssessmentToComplete()?.registrationAssessment;
    },

    isPersonalInfoTouched(): boolean {
      return useRegistrationStore().tabs.filter((el) => el.id === TabId.PersonalInfo)[0].isTouched;
    },

  },

  methods: {
    async back() {
      if (this.currentTab.id === TabId.IsRegistered && useRegistrationStore().householdResultsShown) {
        useRegistrationStore().householdResultsShown = false;
        return;
      }

      if (this.currentTab.id === 'review' && this.associationMode) {
        if (this.householdAlreadyRegistered) {
          useRegistrationStore().householdAlreadyRegistered = false;
        }
        this.backToHouseholdResults();
        return;
      }

      if (this.currentTabIndex === 0) {
        await this.$router.push({ name: routes.registration.home.name });
        return;
      }

      await this.jump(this.currentTabIndex - 1);
    },

    routeToNewRegistration() {
      this.$router.replace({
        name: routes.registration.home.name,
      });
    },

    async next() {
      switch (this.currentTab.id) {
        case TabId.IsRegistered:
          await this.resetPersonalInfoTab();
          return;

        case TabId.PersonalInfo:
          EventHub.$emit('checkEmailValidation', this.nextDefault);
          return;

        case TabId.Review:
          await this.nextOnReview();
          return;

        case TabId.Confirmation:
          await this.closeRegistration();
          return;

        default:
          await this.nextDefault();
      }
    },

    async nextOnReview() {
      if (this.householdAlreadyRegistered) {
        this.goToHouseholdProfile(this.household.id);
        return;
      }
      if (this.associationMode) {
        const isValid = await (this.$refs.form as VForm).validate();

        if (!isValid) {
          helpers.scrollToFirstError('app');
          return;
        }
        await this.associateHousehold();

        return;
      }
      await useRegistrationStore().submitRegistration();

      if (this.submitErrors && !this.isDuplicateError) {
        if (this.containsErrorCode) { // If no duplicate errors, but errors have a code
          await this.jump(this.currentTabIndex + 1);
          return;
        }
        await this.handleErrors(this.submitRegistration); // If we want to start the retry process
        return;
      }
      await this.nextDefault();
    },

    async nextDefault() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('app');
        return;
      }

      await this.jump(this.currentTabIndex + 1);
    },

    backToHouseholdResults() {
      useRegistrationStore().resetHouseholdCreate();
      useRegistrationStore().householdAssociationMode = false;
      useRegistrationStore().householdAlreadyRegistered = false;
      useRegistrationStore().currentTabIndex = (this.allTabs.findIndex((t) => t.id === TabId.IsRegistered));
    },

    goToHouseholdProfile(householdId: string) {
      this.$router.replace({
        name: routes.household.householdProfile.name,
        params: {
          id: householdId,
        },
      });
    },

    async associateHousehold() {
      const userChoice = await (this.$confirm({
        title: this.$t('registration.associate.confirmation.title'),
        messages: [
          this.$t('registration.associate.confirmation.message1'),
          this.$t('registration.associate.confirmation.message2.household'),
        ],
      }));
      if (userChoice) {
        useRegistrationStore().submitLoading = true;
        const success = await this.createNewCaseFile();
        if (!success) {
          this.handleErrors(this.createNewCaseFile);
        } else {
          await this.jump(this.currentTabIndex + 1);
        }
        useRegistrationStore().submitLoading = false;
      }
    },

    async createNewCaseFile(): Promise<boolean> {
      const res = await useCaseFileStore().createCaseFile({
        householdId: this.household.id,
        eventId: this.event.id,
        consentInformation: this.household.consentInformation,
        individuals: [this.household.primaryBeneficiary, ...this.household.additionalMembers].filter((m) => m).map((m) => ({
          personId: m.id,
          temporaryAddressHistory: [CurrentAddress.parseCurrentAddress(m.currentAddress)],
          receivingAssistanceDetails: [{ receivingAssistance: true }],
          membershipStatus: MembershipStatus.Active,
        }) as ICaseFileIndividualCreateRequest),
      });
      if (!res) {
        useRegistrationStore().registrationErrors = { name: 'case-file-create-error', message: 'Case file create error' }; // TODO Check in real app the type of errors
      } else {
        useRegistrationStore().registrationErrors = null;
      }
      useRegistrationStore().registrationResponse = res;
      return !!res;
    },

    async resetPersonalInfoTab() {
      if (this.isPersonalInfoTouched) {
        useRegistrationStore().mutateTabAtIndex(2, (tab: IRegistrationMenuItem) => {
          tab.disabled = false;
          tab.isValid = true;
          tab.isTouched = false;
        });
      }
      await this.nextDefault();
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
