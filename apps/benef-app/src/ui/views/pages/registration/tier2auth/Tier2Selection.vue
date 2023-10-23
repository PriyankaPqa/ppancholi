<template>
  <div>
    <rc-page-loading v-if="interval" :text="$t('registration.tier2.Waiting')" />
    <template v-else>
      <template v-if="!iframeUrl">
        <v-row justify="center" class="mt-12 full-height pa-4" no-gutters>
          <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
            <p>{{ $t('registration.tier2.introduction') }}</p>
            <h2 class="mt-8">
              {{ $t('registration.tier2.selectIdHeader') }}
            </h2>
            <div class="font-italic">
              <div>
                <v-icon size="20">
                  mdi-information
                </v-icon>
                {{ $t('registration.tier2.help1') }}
              </div>
              <div>
                <v-icon size="20">
                  mdi-information
                </v-icon>
                {{ $t('registration.tier2.help2') }}
              </div>
              <div>
                <v-icon size="20">
                  mdi-information
                </v-icon>
                {{ $t('registration.tier2.help3') }}
              </div>
            </div>

            <div class="grey-container pa-4 mt-4 rc-body14">
              <v-row>
                <v-col>
                  <v-select-with-validation
                    v-model="selectedId"
                    outlined
                    background-color="white"
                    rules="required"
                    :items="validIdOptions"
                    :label="$t('registration.tier2.selectValidId')" />
                </v-col>
              </v-row>
              <div v-if="selectedId == 0">
                <v-row>
                  <v-col>
                    <v-select-with-validation
                      v-model="otherIdType"
                      outlined
                      background-color="white"
                      rules="required"
                      :items="otherIdTypeList"
                      :label="$t('registration.tier2.selectOtherId')" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select-with-validation
                      v-model="proofAddress"
                      outlined
                      background-color="white"
                      rules="required"
                      :items="proofAddressList"
                      :label="$t('registration.tier2.selectProofAddress')" />
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <iframe ref="iframeObj" :src="iframeUrl" title="auth" allow="camera;microphone" class="full-height full-width" @load="attachListener" />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { VSelectWithValidation, RcPageLoading } from '@libs/component-lib/components';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import helpers from '@libs/entities-lib/helpers';
import { Tier2GambitScreeningId } from '@libs/shared-lib/types';

export default Vue.extend({
  name: 'Tier2Selection',
  components: {
    VSelectWithValidation,
    RcPageLoading,
  },
  data() {
    return {
      selectedId: 82,
      otherIdType: null as number,
      proofAddress: null as number,
      iframeUrl: '',
      interval: null as any,
    };
  },

  computed: {
    requiredInformation(): { caseFileId: string, tier1transactionId: string, canCompleteTier2: boolean } {
      if (useRegistrationStore().basicInformationWhenTier2FromEmail?.caseFileId) {
        return {
          caseFileId: useRegistrationStore().basicInformationWhenTier2FromEmail.caseFileId,
          tier1transactionId: useRegistrationStore().basicInformationWhenTier2FromEmail.tier2response.transactionUniqueId,
          canCompleteTier2: useRegistrationStore().basicInformationWhenTier2FromEmail.canCompleteTier2,
         };
      }

      return {
        caseFileId: useRegistrationStore().registrationResponse.caseFile.id,
        tier1transactionId: useRegistrationStore().registrationResponse.tier1transactionId,
        canCompleteTier2: useRegistrationStore().registrationResponse.mustDoTier2authentication,
        };
    },

    tier2Ids(): { value: number, text: string }[] {
      return helpers.enumToTranslatedCollection(Tier2GambitScreeningId, 'enums.Tier2GambitScreeningId', this.$i18n) as { value: number, text: string }[];
    },

    validIdOptions(): { text: string, value: number }[] {
      return [Tier2GambitScreeningId.CanadianDriverLicense, Tier2GambitScreeningId.ProvincialPhotoId].map((x) => this.tier2Ids.find((y) => y.value === x)).concat(
        [{ text: this.$t('registration.tier2.NoBasicId') as string, value: 0 }],
      );
    },

    otherIdTypeList(): { text: string, value: number }[] {
      return [Tier2GambitScreeningId.CanadianPassport, Tier2GambitScreeningId.NonCanadianPassport,
          Tier2GambitScreeningId.CanadianCitizenshipCard, Tier2GambitScreeningId.CanadianPermanentResidentCard,
          Tier2GambitScreeningId.IndianStatusCard, Tier2GambitScreeningId.CanadianFirearmsLicense, Tier2GambitScreeningId.NexusCard,
          Tier2GambitScreeningId.OntarioHealthCard, Tier2GambitScreeningId.QuebecHealthCard].map((x) => this.tier2Ids.find((y) => y.value === x));
    },

    proofAddressList(): { text: string, value: number }[] {
      return [Tier2GambitScreeningId.UtilityBill, Tier2GambitScreeningId.MortgageStatement, Tier2GambitScreeningId.PropertyTaxAssessment,
          Tier2GambitScreeningId.ProvincialGovernmentMail, Tier2GambitScreeningId.FederalGovernmentMail, Tier2GambitScreeningId.BankStatement,
          Tier2GambitScreeningId.InsuranceStatement].map((x) => this.tier2Ids.find((y) => y.value === x));
    },
  },

  created() {
    EventHub.$on('tier2ProcessStart', this.tier2ProcessStart);
    EventHub.$on('tier2ProcessReset', this.tier2ProcessReset);
  },

  destroyed() {
    this.tier2ProcessReset();
    if (EventHub) {
      EventHub.$off('tier2ProcessStart', this.tier2ProcessStart);
      EventHub.$off('tier2ProcessReset', this.tier2ProcessReset);
    }
  },

  methods: {
    attachListener() {
      const requestObject = {
        requestName: 'status',
      };
      window.removeEventListener('message', this.onMessage);
      window.addEventListener('message', this.onMessage);
      (this.$refs.iframeObj as any).contentWindow.postMessage(requestObject, '*');
    },

    async onMessage(event: { data: { status: string } }) {
      if (event.data.status === 'completed') {
        this.waitForFinalResult();
      }
    },

    async waitForFinalResult() {
      useRegistrationStore().submitLoading = true;
      const startTime = new Date().getTime();
      await helpers.timeout(2000);
      this.interval = setInterval(async () => {
          try {
            const result = await this.$services.caseFiles.getTier2Result(this.requiredInformation.caseFileId);
            // if 1 minute elapsed since we started too bad - gambit didnt tell us the final status we move with unverified on confirmation
            if (new Date().getTime() - startTime > 60000 || result.processCompleted) {
              useRegistrationStore().tier2State.completed = true;
              if (result.processCompleted) {
                useRegistrationStore().tier2State.status = result.identityAuthenticationStatus;
              }
              this.tier2ProcessReset();
              useRegistrationStore().submitLoading = false;
              EventHub.$emit('next');
            }
          } catch (error) {
            this.$appInsights.trackException(error, {}, 'Tier2Selection', 'waitForFinalResult');
            this.tier2ProcessReset();
            useRegistrationStore().submitLoading = false;
            EventHub.$emit('next');
          }
        }, 1000);
    },

    async tier2ProcessReset() {
      this.iframeUrl = '';

      window.removeEventListener('message', this.onMessage);
      window.clearInterval(this.interval);
      this.interval = null;
    },

    async tier2ProcessStart() {
      this.iframeUrl = null;
      useRegistrationStore().tier2State.basicDocumentsOnly = !!this.selectedId;
      const result = await this.$services.caseFiles.tier2ProcessStart({
        id: this.requiredInformation.caseFileId,
        identityVerificationTier1transactionId: this.requiredInformation.tier1transactionId,
        mainDocumentTypeId: this.selectedId || this.otherIdType,
        subDocumentTypeId: this.proofAddress,
        locale: this.$i18n.locale,
      });

      this.iframeUrl = result.identityVerificationInfoSubmissionUrl;
    },
  },
});
</script>
