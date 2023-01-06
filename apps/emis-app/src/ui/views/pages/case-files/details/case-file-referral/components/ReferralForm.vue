<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row class="mt-4">
            <v-col cols="12">
              <v-text-field-with-validation
                v-model="localReferral.name"
                :rules="rules.name"
                :label="$t('caseFile.referral.name') + ' *'"
                data-test="referral-name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select-with-validation
                v-model="localReferral.type.optionItemId"
                :items="referralTypes"
                :item-text="(item) => $m(item.name)"
                :item-value="(item) => item.id"
                :rules="rules.referralTypes"
                :label="$t('caseFile.referral.referralType') + ' *'"
                data-test="referral-type" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localReferral.note"
                :rules="rules.notes"
                :label="$t('caseFile.referral.notes')"
                data-test="referral-notes" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <validation-provider :rules="rules.method">
                <v-radio-group v-model="localReferral.method" class="mt-1" row>
                  <v-col cols="6">
                    <v-radio
                      :label="$t('referral.method.Referral')"
                      :value="methodsEnum.Referral"
                      data-test="refmethod_referral"
                      @click="confirmResetConsent" />
                    <div class="rc-body12 grey--text ml-8">
                      {{ $t('referral.method.referral.details') }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <v-radio
                      :label="$t('referral.method.Warm')"
                      :value="methodsEnum.Warm"
                      data-test="refmethod_warm"
                      @click="showConsent = true" />
                    <div class="rc-body12 grey--text ml-8">
                      {{ $t('referral.method.warm.details') }}
                    </div>
                  </v-col>
                </v-radio-group>
              </validation-provider>
            </v-col>
          </v-row>

          <v-row v-if="localReferral.id">
            <v-col cols="12" class="mb-4 grey-container">
              <v-select-with-validation
                v-model="localReferral.outcomeStatus.optionItemId"
                :items="outcomeStatuses"
                :item-text="(item) => $m(item.name)"
                :item-value="(item) => item.id"
                background-color="white"
                :label="$t('caseFile.referral.outcomeStatus')"
                data-test="referral-outcomestatus" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>
    <warm-referral-consent
      v-if="showConsent"
      :show.sync="showConsent"
      :referral-consent-information.sync="localReferral.referralConsentInformation"
      @updateMethod="updateMethod" />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD, MAX_LENGTH_XL } from '@libs/shared-lib/constants/validations';
import { CaseFileReferralEntity, ReferralMethod } from '@libs/entities-lib/case-file-referral';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IListOption } from '@libs/shared-lib/types';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import WarmReferralConsent from './WarmReferralConsent.vue';

export default Vue.extend({
  name: 'ReferralForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    WarmReferralConsent,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    referral: {
      type: CaseFileReferralEntity,
      required: true,
    },
  },

  data() {
    const localReferral = new CaseFileReferralEntity(this.referral);
    if (localReferral.id) {
      localReferral.outcomeStatus = localReferral.outcomeStatus || { optionItemId: null } as IListOption;
    }

    return {
      localReferral,
      methodsEnum: ReferralMethod,
      showConsent: false,
    };
  },

  computed: {
    referralTypes(): Array<IOptionItem> {
      return useCaseFileReferralStore().getAllTypes(true, this.localReferral.type?.optionItemId);
    },

    outcomeStatuses(): Array<IOptionItem> {
      return useCaseFileReferralStore().getAllOutcomeStatuses(true, this.localReferral.outcomeStatus?.optionItemId);
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        referralTypes: {
          required: true,
        },
        notes: {
          max: MAX_LENGTH_XL,
        },
        consent: {
          required: this.showConsent ? { allowFalse: false } : false,
        },
        method: {
          required: true,
        },
      };
    },
  },

  watch: {
    localReferral: {
      handler(newReferral) {
        this.$emit('update:referral', newReferral);
      },
      deep: true,
    },
    showConsent(isOpen: boolean) {
      this.$emit('update:isModalOpen', isOpen);
    },
  },

  async created() {
    await useCaseFileReferralStore().fetchTypes();
    await useCaseFileReferralStore().fetchOutcomeStatuses();
  },

  methods: {
    // After we click on the warm referral radio button to open the consent modal, and then we close the consent modal with Cancel, without checking the consent,
    // the radio button for warm referral stays however checked, so we need to set it to unchecked
    updateMethod() {
      if (this.localReferral.referralConsentInformation == null) {
        this.localReferral.method = null;
      }
    },

    async confirmResetConsent() {
      if (this.isEditMode && this.localReferral.referralConsentInformation.dateTimeConsent) {
        const confirmReset = await this.$confirm({
          title: this.$t('caseFile.referral.resetConsentConfirm.title'),
          messages: this.$t('caseFile.referral.resetConsentConfirm.message'),
        });

        if (confirmReset) {
          this.localReferral.referralConsentInformation = null;
        } else {
          this.localReferral.method = ReferralMethod.Warm;
        }
      } else {
        this.localReferral.referralConsentInformation = null;
      }
    },
  },
});
</script>
