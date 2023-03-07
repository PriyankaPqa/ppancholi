<template>
  <rc-dialog
    :title="title"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-only-scrolling
    fullscreen
    content-padding="10"
    persistent
    :show-submit="false"
    :show-cancel="false"
    @close="close"
    @cancel="close">
    <div class="pa-8 mx-auto rc-body14 text-body">
      <v-row>
        <v-col class="col" cols="12">
          <div class="fw-bold rc-body18">
            {{ salutations }}
          </div>
          <div class="fw-bold">
            {{ $t('duplicate.alreadyRegisteredOtherEvent') }}
          </div>
          <div v-if="!sentCode">
            <v-sheet rounded outlined class="pa-4 mt-4">
              <p class="fw-bold rc-body18">
                {{ $t('duplicate.continueWithRegistration', { event: $m(event.name) }) }}
              </p>
              <p>
                {{ $t('duplicate.toContinue') }}
              </p>
              <p>
                {{ $t('duplicate.pleaseSelect') }}
              </p>
              <v-radio-group
                v-model="selectedCommunication"
                row>
                <v-col v-for="(item) in communicationMethods" :key="item.type" class="col-6">
                  <v-sheet rounded outlined>
                    <v-radio :value="item.type" class="pa-4 ma-0">
                      <template #label>
                        <div>
                          <div class="fw-bold">
                            {{ item.text }}
                          </div>
                          <div>{{ item.maskedInfo }}</div>
                        </div>
                      </template>
                    </v-radio>
                  </v-sheet>
                </v-col>
              </v-radio-group>
              <v-row class="justify-end pa-4">
                <v-btn
                  class="mr-4"
                  @click="close">
                  {{ $t('common.button.back') }}
                </v-btn>
                <v-btn
                  :disabled="!selectedCommunication"
                  :loading="showLoader"
                  color="primary"
                  @click="sendCode">
                  {{ $t('common.button.continue') }}
                </v-btn>
              </v-row>
            </v-sheet>

            <v-sheet rounded outlined class="pa-4 mt-4">
              <p class="fw-bold rc-body18">
                {{ $t('duplicate.orContactUs') }}
              </p>
              <p>
                {{ $t('duplicate.ifNeitherOptions') }}
              </p>
              <div v-if="phone" class="fw-bold rc-body18" cols="6">
                <rc-phone-display :value="phone" />
              </div>
              <v-row class="justify-end pa-4">
                <v-btn
                  class="mr-4"
                  @click="goHome">
                  {{ $t('duplicate.cancelRegistration') }}
                </v-btn>
              </v-row>
            </v-sheet>
          </div>

          <div v-else>
            <v-sheet rounded outlined class="pa-4 mt-4">
              <p class="fw-bold rc-body18">
                {{ $t('duplicate.verifySecurityCode') }}
              </p>
              <p>
                {{ $t(`duplicate.verifySecurityCode.${selectedCommunication}`) }}
              </p>
              <div class="mt-12">
                <v-row class="justify-center">
                  <template v-for="(char, index) in chars">
                    <!-- eslint-disable-next-line vue/valid-v-for -->
                    <v-text-field
                      ref="charsinput"
                      v-model="chars[index]"
                      :disabled="codeValid"
                      class="code mx-4"
                      outlined
                      background-color="white"
                      @input="focusNextOncePopulated(index, 1)" />
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <div v-if="index == 2" style="line-height: 40px;">
                      _
                    </div>
                  </template>
                </v-row>
                <v-row class="justify-center">
                  <v-btn
                    v-if="codeValid == null"
                    :loading="showLoader"
                    text
                    color="primary"
                    @click="sendCode">
                    {{ $t('duplicate.resendCode') }}
                  </v-btn>
                  <v-alert v-else-if="codeValid" dense text type="success">
                    {{ $t('duplicate.codeValid') }}
                  </v-alert>
                  <v-alert v-else dense text type="error">
                    {{ $t('duplicate.codeInvalid') }}
                  </v-alert>
                </v-row>
                <v-row class="justify-end pa-4">
                  <v-btn
                    class="mr-4"
                    @click="resetScreen">
                    {{ $t('common.button.back') }}
                  </v-btn>
                  <v-btn
                    v-if="!codeValid"
                    ref="verifyCodeBtn"
                    :disabled="!codeFilled"
                    :loading="showLoader"
                    color="primary"
                    @click="verifyCode">
                    {{ $t('duplicate.verifyCode') }}
                  </v-btn>
                  <v-btn
                    v-if="codeValid"
                    color="primary"
                    @click="next">
                    {{ $t('common.button.next') }}
                  </v-btn>
                </v-row>
              </div>
            </v-sheet>
          </div>
        </v-col>
      </v-row>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { CommunicationMethod } from '@libs/entities-lib/value-objects/contact-information';
import { RcDialog, RcPhoneDisplay } from '@libs/component-lib/components';
import { ICheckForPossibleDuplicateResponse } from '@libs/entities-lib/household-create';
import helpers from '@libs/entities-lib/helpers';
import routes from '@/constants/routes';
import { IServerError } from '@libs/shared-lib/types';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { useRegistrationStore } from '@/pinia/registration/registration';

export default Vue.extend({
  name: 'DuplicateDialog',

  components: {
    RcDialog,
    RcPhoneDisplay,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    duplicateResults: {
      type: Object as () => ICheckForPossibleDuplicateResponse,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    recaptchaToken: {
      type: String,
      default: null,
    },
  },

  data: () => ({
    selectedCommunication: null as CommunicationMethod,
    sentCode: false,
    showLoader: false,
    chars: ['', '', '', '', '', ''],
    codeValid: null as boolean,
    event: useRegistrationStore().event,
  }),

  computed: {
    title(): string {
      return (this.duplicateResults?.registeredToEvent ? this.$t('duplicate.alreadyRegistered.title') : this.$t('duplicate.confirmBeneficiary.title')) as string;
    },
    salutations(): string {
      return this.$t('duplicate.salutations', {
          name: `${useRegistrationStore().householdCreate.primaryBeneficiary.identitySet.firstName} ${
            useRegistrationStore().householdCreate.primaryBeneficiary.identitySet.lastName}`,
      }) as string;
    },
    communicationMethods(): { text: string, maskedInfo: string, type: CommunicationMethod }[] {
      const items: { text: string, maskedInfo: string, type: CommunicationMethod }[] = [];
      items.push({ type: CommunicationMethod.Email, text: this.$t('duplicate.CommunicationMethod.Email') as string, maskedInfo: this.duplicateResults?.maskedEmail });
      items.push({ type: CommunicationMethod.HomePhone, text: this.$t('duplicate.CommunicationMethod.HomePhone') as string, maskedInfo: this.duplicateResults?.maskedHomePhone });
      items.push({ type: CommunicationMethod.MobilePhone,
        text: this.$t('duplicate.CommunicationMethod.MobilePhone') as string,
        maskedInfo: this.duplicateResults?.maskedMobilePhone });
      items.push({ type: CommunicationMethod.AlternatePhone,
        text: this.$t('duplicate.CommunicationMethod.AlternatePhone') as string,
        maskedInfo: this.duplicateResults?.maskedAlternatePhoneNumber });
      return items.filter((x) => x.maskedInfo);
    },
    codeFilled(): boolean {
      return this.chars.filter((x) => x !== '').length === 6;
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },
    goHome() {
      useRegistrationStore().resetHouseholdCreate();
      this.$router.push({ name: routes.landingPage.name });
    },
    next() {

    },
    resetScreen() {
      this.selectedCommunication = null;
      this.sentCode = false;
      this.codeValid = null;
    },
    async sendCode() {
      this.chars = ['', '', '', '', '', ''];
      this.sentCode = true;
      this.showLoader = true;
      try {
        await Promise.all([this.$services.households.sendOneTimeCodeRegistrationPublic({
          eventId: this.event.id,
          duplicateHouseholdId: this.duplicateResults.duplicateHouseholdId,
          communicationMethod: this.selectedCommunication,
          language: this.$i18n.locale,
          recaptchaToken: this.recaptchaToken,
        }),
        // adding a timeout else it may not look like we've sent something... especially on retry
        helpers.timeout(5000)]);
      } catch (error) {
        const e = (error as IServerError).response?.data?.errors || error;
        applicationInsights.trackTrace('sendOneTimeCodeRegistrationPublic error', { error: e }, 'DuplicateDialog.vue', 'sendOneTimeCodeRegistrationPublic');
      }

      this.showLoader = false;
    },

    // used to change the focus between the boxes for the 6 digit code
    async focusNextOncePopulated(index: number, max: number) {
      if (this.chars[index].length >= max) {
        this.chars[index] = this.chars[index].substring(0, max);
        const nextElement = (this.$refs.charsinput as any)[index + 1];

        if (nextElement) {
          setTimeout(() => {
            nextElement.focus();
          });
        } else {
          setTimeout(() => {
            (this.$refs.verifyCodeBtn as any).$el.focus();
          });
        }
      }
    },

    async verifyCode() {
      this.showLoader = true;
      // eslint-disable-next-line
      this.codeValid = confirm('code ok?');

      try {
        this.codeValid = await this.$services.households.verifyOneTimeCodeRegistrationPublic({
          eventId: this.event.id,
          duplicateHouseholdId: this.duplicateResults.duplicateHouseholdId,
          code: this.chars.join(''),
          recaptchaToken: this.recaptchaToken,
        });
      } catch (error) {
        const e = (error as IServerError).response?.data?.errors || error;
        applicationInsights.trackTrace('verifyOneTimeCodeRegistrationPublic error', { error: e }, 'DuplicateDialog.vue', 'verifyCode');
      }

      this.showLoader = false;
    },
  },
});

</script>
<style scoped>
  ::v-deep .v-radio {
    background-color: var(--v-grey-lighten5) !important;
  }
  ::v-deep .v-radio.v-item--active {
    background-color: var(--v-primary-lighten2) !important;
  }

  .text-body {
    max-width: 1000px;
  }

  .code {
    max-width: 35px;
  }
</style>
