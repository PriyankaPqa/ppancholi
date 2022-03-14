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
              <validation-provider>
                <v-radio-group v-model="localReferral.method" class="mt-1" row>
                  <v-col cols="6">
                    <v-radio :label="$t('referral.method.Referral')" :value="methodsEnum.Referral" data-test="refmethod_referral" />
                    <div class="rc-body12 grey--text ml-8">
                      {{ $t('referral.method.referral.details') }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <v-radio :label="$t('referral.method.Warm')" :value="methodsEnum.Warm" data-test="refmethod_warm" />
                    <div class="rc-body12 grey--text ml-8">
                      {{ $t('referral.method.warm.details') }}
                    </div>
                  </v-col>
                </v-radio-group>
              </validation-provider>
            </v-col>
          </v-row>

          <v-row v-if="showConsent">
            <v-col cols="12" class="mb-4 grey-container">
              <v-checkbox-with-validation
                v-model="consentChecked"
                data-test="checkbox-consent"
                :rules="rules.consent"
                class="rc-body12"
                :label="`${$t('referral.consent')} *`" />
              <div v-if="localReferral.referralConsentInformation" class="rc-body12 grey--text pl-8 mt-n4">
                {{ $t('referral.consent.CRC') }}: {{ localReferral.referralConsentInformation.crcUserName }}
              </div>
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
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VCheckboxWithValidation,
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD, MAX_LENGTH_XL } from '@/constants/validations';
import { CaseFileReferralEntity, ReferralMethod } from '@/entities/case-file-referral';
import { IOptionItem } from '@/entities/optionItem';
import { IListOption } from '@/types';

export default Vue.extend({
  name: 'ReferralForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VCheckboxWithValidation,
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
      consentChecked: localReferral.referralConsentInformation?.dateTimeConsent != null,
    };
  },

  computed: {

    referralTypes(): Array<IOptionItem> {
      return this.$storage.caseFileReferral.getters.types(true, this.localReferral.type?.optionItemId);
    },

    outcomeStatuses(): Array<IOptionItem> {
      return this.$storage.caseFileReferral.getters.outcomeStatuses(true, this.localReferral.outcomeStatus?.optionItemId);
    },

    showConsent(): boolean {
      return this.localReferral.method === this.methodsEnum.Warm;
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
    showConsent(show) {
      if (!show) {
        this.consentChecked = false;
      }
    },
    consentChecked(checked) {
      if (checked) {
        const user = this.$storage.user.getters.user();
        this.localReferral.referralConsentInformation = {
          crcUserId: user.id, crcUserName: user.getFullName(), dateTimeConsent: new Date(),
        };
      } else {
        this.localReferral.referralConsentInformation = null;
      }
    },
  },

  async created() {
    await this.$storage.caseFileReferral.actions.fetchTypes();
    await this.$storage.caseFileReferral.actions.fetchOutcomeStatuses();
  },

  methods: {
  },
});
</script>
