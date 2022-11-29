<template>
  <div class="full-height grey lighten-4">
    <left-menu @jump="jump" />

    <ValidationObserver ref="form" v-slot="{ failed }" slim>
      <rc-page-content
        :show-help="false && currentTab.helpLink !== '' "
        :help-link="$t(currentTab.helpLink)"
        :title="$t(currentTab.titleKey)"
        :subtitle="$t('registration.type.individual')"
        :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
        outer-scroll>
        <template slot="default">
          <v-row justify="center" class="mt-12 full-height" no-gutters>
            <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
              <component :is="currentTab.componentName" :disable-autocomplete="!$hasFeature(FeatureKeys.AddressAutoFill)" />
            </v-col>
          </v-row>
        </template>

        <template slot="actions">
          <div class="actions">
            <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
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
              <v-btn v-else :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" :disabled="submitLoading || retrying" @click="back()">
                {{ $t(currentTab.backButtonTextKey) }}
              </v-btn>

              <span class="ml-2 d-sm-inline d-md-none">{{ previousTabName }}</span>
            </div>

            <div :class="{ half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly }">
              <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
              <vue-programmatic-invisible-google-recaptcha
                v-if="$hasFeature(FeatureKeys.BotProtection) && !isCaptchaAllowedIpAddress"
                ref="recaptchaSubmit"
                data-test="google-recaptcha"
                :sitekey="recaptchaKey"
                element-id="recaptchaSubmit"
                badge-position="left"
                :show-badge-mobile="false"
                :show-badge-desktop="false"
                @recaptcha-callback="recaptchaCallBack" />
              <v-btn
                color="primary"
                data-test="nextButton"
                :aria-label="$t(currentTab.nextButtonTextKey)"
                :loading="submitLoading || retrying"
                :disabled="failed || inlineEdit"
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
import { VForm } from '@libs/shared-lib/types';
import helpers from '@libs/entities-lib/helpers';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import LeftMenu from '../../../components/layout/LeftMenu.vue';
import PrivacyStatement from '../privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '../personal-information/PersonalInformation.vue';
import Addresses from '../addresses/Addresses.vue';
import AdditionalMembers from '../additional-members/AdditionalMembers.vue';
import ReviewRegistration from '../review/ReviewRegistration.vue';
import ConfirmRegistration from '../confirmation/ConfirmRegistration.vue';

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
    ConfirmationPrintLib,
    SystemErrorDialog,
  },

  data: () => ({
    recaptchaToken: null,
    recaptchaKey: localStorage.getItem(localStorageKeys.recaptchaKey.name),
    FeatureKeys,
    showErrorDialog: false,
  }),

  computed: {
    isCaptchaAllowedIpAddress(): boolean {
      return this.$storage.tenantSettings.getters.validateCaptchaAllowedIpAddress().ipAddressIsAllowed;
    },
  },

  methods: {
    async back() {
      if (this.currentTabIndex === 0) {
        await this.$router.push({ name: routes.landingPage.name });
        return;
      }
      await this.jump(this.currentTabIndex - 1);
    },

    async goNext() {
      if (this.currentTab.id === 'review' && this.$hasFeature(FeatureKeys.BotProtection) && !this.isCaptchaAllowedIpAddress) {
        // eslint-disable-next-line
        (this.$refs.recaptchaSubmit as any).execute();
      } else if (this.currentTab.id === 'personalInfo') {
        EventHub.$emit('checkEmailValidation', this.validateAndNext);
      } else {
        await this.validateAndNext();
      }
    },

    async validateAndNext() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('app');
        return;
      }
      await this.next();
    },

    async recaptchaCallBack(token: string) {
      if (token) { // you're not a robot
        this.recaptchaToken = token;
        await this.next();
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
