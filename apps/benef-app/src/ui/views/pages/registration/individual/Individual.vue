<template>
  <div class="full-height grey lighten-4" :class="[currentTab.id, { tier2ProcessStarted: tier2ProcessStarted }]">
    <left-menu @jump="jump" />

    <!-- eslint-disable-next-line vue/no-unused-vars  (validation observer reacts differently without failed in tests somehow...) -->
    <ValidationObserver ref="form" v-slot="{ failed }" slim>
      <rc-page-content
        :show-help="false && currentTab.helpLink !== '' "
        :help-link="$t(currentTab.helpLink)"
        :title="$t(currentTab.titleKey) || ''"
        :subtitle="$t('registration.type.individual')"
        :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
        :content-padding="currentTab.id === TabId.Tier2auth ? '0' : '4'"
        outer-scroll>
        <template slot="default">
          <v-row v-if="currentTab.id !== TabId.Tier2auth" justify="center" class="mt-12 full-height" no-gutters>
            <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
              <component :is="currentTab.componentName" :disable-autocomplete="!$hasFeature(FeatureKeys.AddressAutoFill)" />
            </v-col>
          </v-row>
          <template v-else>
            <component :is="currentTab.componentName" :disable-autocomplete="!$hasFeature(FeatureKeys.AddressAutoFill)" class="full-height" />
          </template>
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
              <template v-if="currentTab.id === TabId.Tier2auth">
                <!-- buttons are in the individual page for now but we want to move them to the component eventually - we'll use events to communicate -->
                <v-btn
                  v-if="tier2ProcessStarted"
                  :disabled="submitLoading || tier2ProcessError"
                  @click="restartAuthentication()">
                  {{ $t('registration.button.select_different_id') }}
                </v-btn>
                <v-btn
                  :disabled="submitLoading || tier2ProcessError"
                  @click="skipAuthentication()">
                  {{ $t('registration.button.skip_authentication') }}
                </v-btn>
              </template>
              <v-btn v-else-if="!!previousTabName" :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" :disabled="submitLoading || retrying" @click="back()">
                {{ $t(currentTab.backButtonTextKey) }}
              </v-btn>

              <span class="ml-2 d-sm-inline d-md-none tabtext">{{ previousTabName }}</span>
            </div>

            <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
              <span class="fw-bold d-sm-inline d-md-none tabtext">{{ nextTabName }}</span>
              <google-recaptcha
                v-if="$hasFeature(FeatureKeys.BotProtection) && !isCaptchaAllowedIpAddress"
                ref="recaptchaSubmit"
                data-test="google-recaptcha"
                :sitekey="recaptchaKey"
                element-id="recaptchaSubmit"
                badge-position="left"
                :lang="$i18n.locale"
                :show-badge-mobile="false"
                :show-badge-desktop="false"
                @recaptcha-callback="recaptchaCallBack" />

              <!-- during tier 2 we prefer disabling to loading during a server action since its not always the buttons that do this... -->
              <v-btn
                color="primary"
                data-test="nextButton"
                :aria-label="$t(currentTab.nextButtonTextKey)"
                :loading="(submitLoading && !(tier2ProcessStarted && !tier2ProcessCompleted)) || retrying"
                :disabled="inlineEdit || (tier2ProcessStarted && !tier2ProcessCompleted)"
                @click="goNext()">
                {{ $t(currentTab.nextButtonTextKey) }}
              </v-btn>
            </div>
          </div>
        </template>
      </rc-page-content>
    </ValidationObserver>
    <confirmation-print-lib ref="printConfirm" :event="event" :registration-number="registrationNumber" />
    <system-error-dialog
      v-if="showErrorDialog"
      :show.sync="showErrorDialog"
      :phone="phoneAssistance" />
    <duplicate-dialog
      v-if="showDuplicateDialog"
      :show.sync="showDuplicateDialog"
      :duplicate-results="duplicateResult"
      :phone="phoneAssistance"
      @verified-individual="loadHousehold" />
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@libs/component-lib/components';
import individual from '@libs/registration-lib/ui/mixins/individual';
import ConfirmationPrintLib from '@libs/registration-lib/components/confirm-registration/ConfirmationPrintLib.vue';
import SystemErrorDialog from '@libs/registration-lib/components/review/SystemErrorDialog.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { localStorageKeys } from '@/constants/localStorage';
import routes from '@/constants/routes';
import { IServerError, VForm } from '@libs/shared-lib/types';
import helpers from '@libs/entities-lib/helpers';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import GoogleRecaptcha from '@/ui/views/components/shared/GoogleRecaptcha.vue';
import LeftMenu from '../../../components/layout/LeftMenu.vue';
import PrivacyStatement from '../privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '../personal-information/PersonalInformation.vue';
import Addresses from '../addresses/Addresses.vue';
import AdditionalMembers from '../additional-members/AdditionalMembers.vue';
import ReviewRegistration from '../review/ReviewRegistration.vue';
import ConfirmRegistration from '../confirmation/ConfirmRegistration.vue';
import CompleteAssessment from '../complete-assessment/CompleteAssessment.vue';
import DuplicateDialog from '../duplicate-dialog/DuplicateDialog.vue';
import Tier2Selection from '../tier2auth/Tier2Selection.vue';

export default mixins(individual).extend({
  name: 'Individual',
  components: {
    RcPageContent,
    LeftMenu,
    PrivacyStatement,
    PersonalInformation,
    Addresses,
    AdditionalMembers,
    ReviewRegistration,
    ConfirmRegistration,
    CompleteAssessment,
    ConfirmationPrintLib,
    SystemErrorDialog,
    DuplicateDialog,
    Tier2Selection,
    GoogleRecaptcha,
  },

  data: () => ({
    recaptchaKey: localStorage.getItem(localStorageKeys.recaptchaKey.name),
    FeatureKeys,
    showErrorDialog: false,
    showDuplicateDialog: false,
    functionAfterToken: null as () => void,
    tokenFetchedLast: null as Date,
    tier2ProcessStarted: false,
    TabId,
  }),

  computed: {
    isCaptchaAllowedIpAddress(): boolean {
      return useTenantSettingsStore().recaptcha.ipAddressIsAllowed;
    },
    tier2ProcessCompleted(): boolean {
      return useRegistrationStore().tier2State?.completed;
    },
    tier2ProcessError(): boolean {
      return useRegistrationStore().tier2State?.hasErrors;
    },
  },

  created() {
    // fetch public token will try to do a recaptcha if needed and return a valid beneficiary token
    // if the token was last fetched less then 30 minutes ago we dont do anything as it is valid for an hour
    EventHub.$on('fetchPublicToken', this.fetchPublicToken);

    // for when a component wants to trigger moving to the next step without a button pressed
    EventHub.$on('next', this.goNext);

    if (this.$hasFeature(FeatureKeys.BotProtection) && !this.isCaptchaAllowedIpAddress) {
      EventHub.$on('setLanguage', this.renderRecaptcha);
    }
  },

  destroyed() {
    if (EventHub) {
      EventHub.$off('fetchPublicToken', this.fetchPublicToken);
      EventHub.$off('next', this.goNext);

      if (this.$hasFeature(FeatureKeys.BotProtection) && !this.isCaptchaAllowedIpAddress) {
        EventHub.$off('setLanguage', this.renderRecaptcha);
      }
    }
  },

  methods: {
    renderRecaptcha(lang: string) {
      (this.$refs.recaptchaSubmit as any).render(lang);
    },

    executeRecaptcha() {
      (this.$refs.recaptchaSubmit as any).execute();
    },

    async fetchPublicToken(continueFnct: () => void, onlyIfNotFetchedRecently: boolean = true) {
      // unless we specifically ask to renew the token, if one was fetched less then 30 minutes ago we continue
      if (onlyIfNotFetchedRecently && this.tokenFetchedLast > new Date(new Date().getTime() - (30 * 60 * 1000))) {
        await continueFnct();
        return;
      }
      // if we have to do a recaptcha validation the token endpoint will require it first
      // then we will be able to get the token on the recaptcha callback
      if (this.$hasFeature(FeatureKeys.BotProtection) && !this.isCaptchaAllowedIpAddress) {
        this.functionAfterToken = continueFnct;
        // eslint-disable-next-line
        this.executeRecaptcha();
      } else {
        // no need for recaptcha the BE will not require one
        await this.$services.households.getPublicToken(null);
        this.tokenFetchedLast = new Date();
        await continueFnct();
      }
    },

    async back() {
      if (this.currentTabIndex === 0) {
        await this.$router.push({ name: routes.landingPage.name });
        return;
      }
      await this.jump(this.currentTabIndex - 1);
    },

    async goNext() {
      if (this.currentTab.id === TabId.PersonalInfo) {
        await this.fetchPublicToken(this.validateAndNextPersonalInfo_prepareValidation);
      } else if (this.currentTabIndex === 0 && this.currentTab.id === TabId.Tier2auth) {
        this.localSubmitLoading = true;
        await this.fetchPublicToken(this.validateAndNext);
      } else if (this.tokenFetchedLast != null) {
        // if we are passed personal info we keep the token alive
        await this.fetchPublicToken(this.validateAndNext);
      } else {
        // this is too early to have a token
        await this.validateAndNext();
      }
    },

    async skipAuthentication() {
      // user does not wish to complete the authentication process for now, we complete the registration
      if (await this.$confirm({
        title: this.$t('registration.tier2.skipConfirmationTitle'),
        messages: this.$t('registration.tier2.skipConfirmationMessage'),
      })) {
        this.restartAuthentication();
        await this.next();
      }
    },

    restartAuthentication() {
      // component will restart the authentication process
      this.tier2ProcessStarted = false;
      EventHub.$emit('tier2ProcessReset');
    },

    async validateForm(): Promise<boolean> {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('app');
      }

      return isValid;
    },

    async validateAndNext() {
      this.localSubmitLoading = false;
      const isValid = await this.validateForm();
      if (isValid) {
        if (this.currentTab.id === TabId.Tier2auth && !this.tier2ProcessStarted) {
          this.localSubmitLoading = true;
          // component will open the iframe to the next step in the authentication - it's still within the authentication process
          EventHub.$emit('tier2ProcessStart');
          // we give a second or 2 just so the iframe shows up before the button - it just looks better
          await helpers.timeout(1500);
          this.tier2ProcessStarted = true;
          this.localSubmitLoading = false;
          return;
        }
        await this.next();
      }
    },

    async validateAndNextPersonalInfo_prepareValidation() {
      EventHub.$emit('resetEmailValidation');
      await helpers.timeout(10);
      EventHub.$emit('checkEmailValidation', this.validateAndNextPersonalInfo);
    },

    async validateAndNextPersonalInfo() {
      const isValid = await this.validateForm();
      if (!isValid) {
        return;
      }

      if (this.$hasFeature(FeatureKeys.SelfRegistration)) {
        try {
          useRegistrationStore().duplicateResult = await this.$services.households
            .checkForPossibleDuplicatePublic(this.event.id, useRegistrationStore().householdCreate.primaryBeneficiary);
        } catch (error) {
          const e = (error as IServerError).response?.data?.errors || error;
          applicationInsights.trackTrace('checkForPossibleDuplicatePublic error', { error: e }, 'Individual.vue', 'checkForPossibleDuplicatePublic');
          this.showErrorDialog = true;
        }

        if (useRegistrationStore().duplicateResult?.duplicateFound) {
          this.tryDuplicateAssociation();
          return;
        }
        EventHub.$emit('checkEmailValidation', this.validateAndNext, false);
        return;
      }

      await this.next();
    },

    // depending on whether we have the possiblity to do self registration - depending on the return of the BE - we either start
    // 2 step verification or send the individual to an error screen (confirmation)
    tryDuplicateAssociation() {
      if (this.isDuplicateError) {
        this.jump(this.allTabs.findIndex((x) => x.id === TabId.Confirmation));
      } else {
        this.showDuplicateDialog = true;
      }
    },

    async recaptchaCallBack(token: string) {
      if (token) { // you're not a robot
        // we send the recaptcha to the BE to get the public token
        await this.$services.households.getPublicToken(token);
        this.tokenFetchedLast = new Date();
        if (this.functionAfterToken) {
          // if we wanted to do an action after getting the public token
          await this.functionAfterToken();
          this.functionAfterToken = null;
        }
      }
    },

    async loadHousehold(householdId: string) {
      await useRegistrationStore().loadHousehold(householdId);
      await this.jump(this.allTabs.findIndex((x) => x.id === 'review'));
      this.disableOtherTabs(this.currentTabIndex, false);
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

.tier2auth ::v-deep .pageContentCard__container {
  width: 100% !important;
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

@media only screen and (max-width: $breakpoint-sm-max) {
  .tier2auth.tier2ProcessStarted, .assessment {
    & .actions {
      justify-content: space-between;
    }
  }
  .tier2auth, .assessment {
    & .actions {
      height: initial;
    }

    & .tabtext {
      display: none;
    }
  }
}

.tier2auth, .assessment {
  & .actions {
    flex-wrap: wrap;
    gap: 6px;
    & > div:nth-child(1) {
      flex-wrap: wrap;
      &.half {
        width: initial;
        height: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
    }
    & > div:nth-child(2) {
      &.half {
        width: initial;
        height: 100%;
        flex-direction: column-reverse;
        align-items: flex-end;
      }
    }
  }
}

.printButton {
  position: absolute;
  left: 10px;
}
</style>
