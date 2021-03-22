<template>
  <div>
    <p class="rc-body14">
      {{ $t('registration.privacy_statement.p1') }}
    </p>
    <i18n path="registration.privacy_statement.p2" tag="p" class="rc-body14">
      <template #website>
        <a href="https://redcross.ca/privacy-policy" target="_blank">{{ $t('registration.privacy_statement.website') }}</a>
      </template>
      <template #email>
        <a href="mailto:privacy@redcross.ca">{{ $t('registration.privacy_statement.email') }}</a>
      </template>
    </i18n>
    <div class="full-width grey-container py-1 px-5">
      <v-checkbox-with-validation
        v-model="form.isPrivacyAgreed"
        :rules="rules.isPrivacyAgreed"
        data-test="isPrivacyAgreed"
        :label="$t('registration.privacy_statement.agreeSelf')"
        @input="setTimeDateConsent($event)" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@crctech/component-library';
import { Beneficiary, IPrivacyStatement } from '@/entities/beneficiary';
import _cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';

export default Vue.extend({
  name: 'PrivacyStatement',

  components: {
    VCheckboxWithValidation,
  },

  props: {
    beneficiary: {
      type: Beneficiary,
      required: true,
    },
  },

  data() {
    return {
      form: null as IPrivacyStatement,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        isPrivacyAgreed: {
          required: {
            allowFalse: false,
          },
        },
      };
    },
  },

  watch: {
    form: {
      deep: true,
      handler(newValue: IPrivacyStatement) {
        this.$emit('update-entity', 'privacyStatement', newValue);
      },
    },
  },

  created() {
    this.form = _cloneDeep(this.beneficiary.privacyStatement);
  },

  methods: {
    setTimeDateConsent(checked: boolean): void {
      const value = checked ? moment().format() : null;
      this.form.privacyDateTimeConsent = value;
    },
  },
});
</script>
