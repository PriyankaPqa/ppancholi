<template>
  <validation-observer ref="consent" v-slot="{ pristine, failed }">
    <rc-dialog
      :title="$t('referral.consent.title')"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.submit')"
      :show.sync="show"
      content-padding="8"
      content-only-scrolling
      max-width="1000"
      min-height="650"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :submit-button-disabled="pristine || failed"
      persistent
      @close="close"
      @cancel="close"
      @submit="submit">
      <i18n path="referral.consent.text" tag="div" class="rc-body14 consent" />
      <div class="grey-container mt-8 px-4 pt-1 pb-2">
        <v-checkbox-with-validation
          v-model="consentChecked"
          :rules="rules.consent"
          data-test="checkbox-consent">
          <template #label>
            <span :class="{ 'rc-body14': true, 'red-text': failed }">
              {{ $t('referral.consent.individual') }}
            </span>
          </template>
        </v-checkbox-with-validation>
        <div v-if="localConsentInfo" class="rc-body12 rc-grey-text pl-8 mt-n4">
          {{ $t('referral.consent.CRC') }}: {{ localConsentInfo.crcUserName }}
        </div>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VCheckboxWithValidation, RcDialog } from '@libs/component-lib/components';

import { IReferralConsentInformation } from '@libs/entities-lib/case-file-referral';
import { VForm } from '@libs/shared-lib/types';
import { useUserStore } from '@/pinia/user/user';

export default Vue.extend({
  name: 'WarmReferralConsent',

  components: {
    RcDialog,
    VCheckboxWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    referralConsentInformation: {
      type: Object as ()=> IReferralConsentInformation,
      default: null,
    },

  },

  data() {
    return {
      localConsentInfo: _cloneDeep(this.referralConsentInformation) as IReferralConsentInformation,
      consentChecked: this.referralConsentInformation?.dateTimeConsent != null,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        consent: {
          required: { allowFalse: false },
        },
      };
    },
  },

  watch: {
    consentChecked(checked) {
      if (checked) {
        const user = useUserStore().getUser();
        this.localConsentInfo = {
          crcUserId: user.id, crcUserName: user.getFullName(), dateTimeConsent: new Date(),
        };
      } else {
        this.localConsentInfo = null;
      }
    },
  },

  methods: {
    close() {
      (this.$refs.consent as VForm).reset();
      this.$emit('updateMethod');
      this.$emit('update:show', false);
    },

    async submit() {
      const isValid = await (this.$refs.consent as VForm).validate();
      if (isValid) {
        this.$emit('update:referralConsentInformation', this.localConsentInfo);
        this.$emit('update:show', false);
      }
    },
  },
});
</script>

<style lang="scss">
.consent {
  white-space: pre-line;
  text-align: justify
}

.red-text {
  color:  var(--v-status_error-base);
}
</style>
