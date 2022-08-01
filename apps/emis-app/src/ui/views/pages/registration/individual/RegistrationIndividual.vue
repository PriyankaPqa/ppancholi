<template>
  <div class="full-height grey lighten-4">
    <page-template
      :show-left-menu="!associationMode"
      :loading="false"
      :navigation-tabs="tabs"
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
              <v-col v-if="currentTab.componentName === 'isRegistered'" cols="12">
                <component :is="currentTab.componentName" :disable-autocomplete="!enableAutocomplete" />
              </v-col>
              <v-col v-else cols="12" xl="10" lg="10" md="11" sm="12" xs="12">
                <component :is="currentTab.componentName" :disable-autocomplete="!enableAutocomplete" />
              </v-col>
            </v-row>
          </template>

          <template slot="actions">
            <div class="actions">
              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <template v-if="currentTab.id === 'confirmation'">
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

              <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
                <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
                <v-btn v-if="currentTab.id === 'confirmation' && registrationSuccess" data-test="new-registration-button" @click="routeToNewRegistration">
                  {{ $t('registration.new_registration.label') }}
                </v-btn>
                <v-btn
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
    <confirmation-print ref="printConfirm" :event="event" :registration-number="registrationNumber" />

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
import { IEvent } from '@libs/registration-lib/entities/event';
import ConfirmationPrint from '@libs/registration-lib/components/confirm-registration/ConfirmationPrint.vue';
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
import { tabs } from '@/store/modules/registration/tabs';
import store from '@/store/store';
import { VForm } from '@/types';
import helpers from '@/ui/helpers/helpers';
import { FeatureKeys } from '@/entities/tenantSettings';
import { EventHub } from '@libs/core-lib/plugins/event-hub';
import SystemErrorDialog from '@libs/registration-lib/components/review/SystemErrorDialog.vue';

export default mixins(individual).extend({
  name: 'Individual',

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    const event = store.state.registration.event;
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
    if (this.currentTab.id !== 'confirmation') {
      const userChoice = await (this.$confirm({
        title: this.titleLeave,
        messages: this.messagesLeave,
      }) as Promise<unknown>);
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
    ConfirmationPrint,
    SystemErrorDialog,
  },

  data() {
    return {
      tabs: tabs(),
      showErrorDialog: false,
    };
  },

  computed: {
    showBackButton(): boolean {
      return this.associationMode && this.currentTab.id !== 'confirmation';
    },

    eventName(): string {
      return this.$m(this.event.name);
    },

    titleLeave(): TranslateResult {
      if (this.currentTab.id === 'review' && this.associationMode) {
        return this.$t('registration.associate.confirmation.title');
      }
      return this.$t('confirmLeaveDialog.title');
    },

    messagesLeave(): Array<TranslateResult> {
      if (this.currentTab.id === 'review' && this.associationMode) {
        return [
          this.$t('registration.associate.confirmation.message1'),
          this.$t('registration.associate.confirmation.message2'),
        ];
      }
      return [
        this.$t('confirmLeaveDialog.message_1'),
        this.$t('confirmLeaveDialog.message_2'),
      ];
    },

    getTitle(): TranslateResult {
      if (this.currentTab.id === 'review' && this.associationMode) {
        return this.$t('registration.details.associateBeneficiaryButton.label');
      }
      return this.$t(this.currentTab.titleKey);
    },

    getNextButtonLabel(): TranslateResult {
      if (this.currentTab.id === 'review') {
        if (this.householdAlreadyRegistered) {
          return this.$t('registration.associate.confirmation.next.label');
        }
        if (this.associationMode) {
          return this.$t('registration.details.associateBeneficiaryButton.label');
        }
      }
      return this.$t(this.currentTab.nextButtonTextKey);
    },

    householdAlreadyRegistered(): boolean {
      return this.$store.state.registration.householdAlreadyRegistered;
    },

    associationMode(): boolean {
      return this.$store.state.registration.householdAssociationMode;
    },

    event(): IEvent {
      return this.$storage.registration.getters.event();
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },

  },

  methods: {
    async back() {
      if (this.currentTab.id === 'isRegistered' && this.$store.state.registration.householdResultsShown) {
        this.$storage.registration.mutations.setHouseholdResultsShown(false);
        return;
      }

      if (this.currentTab.id === 'review' && this.associationMode) {
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
        case 'personalInfo':
          EventHub.$emit('checkEmailValidation', this.nextDefault);
          return;

        case 'review':
          await this.nextOnReview();
          return;

        case 'confirmation':
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
      await this.$storage.registration.actions.submitRegistration();

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
      this.$storage.registration.mutations.resetHouseholdCreate();
      this.$storage.registration.mutations.setHouseholdAssociationMode(false);
      this.$storage.registration.mutations.setCurrentTabIndex(tabs().findIndex((t) => t.id === 'isRegistered'));
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
        title: this.titleLeave,
        messages: this.messagesLeave,
      }));
      if (userChoice) {
        const success = await this.createNewCaseFile();
        if (!success) {
          this.handleErrors(this.createNewCaseFile);
        } else {
          await this.jump(this.currentTabIndex + 1);
        }
      }
    },

    async createNewCaseFile(): Promise<boolean> {
      const res = await this.$storage.caseFile.actions.createCaseFile({
        householdId: this.household.id,
        eventId: this.event.id,
        consentInformation: this.household.consentInformation,
      });
      if (!res) {
        this.$storage.registration.mutations.setRegistrationErrors({ name: 'case-file-create-error', message: 'Case file create error' });
      } else {
        this.$storage.registration.mutations.setRegistrationErrors(null);
      }

      this.$storage.registration.mutations.setRegistrationResponse(res);
      return !!res;
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
