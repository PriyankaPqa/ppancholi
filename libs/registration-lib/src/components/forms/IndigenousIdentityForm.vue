<template>
  <v-row>
    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.personal_info.indigenous_identity') }}
      </div>
    </v-col>
    <v-col cols="12">
      <v-autocomplete-with-validation
        v-model="formCopy.indigenousType"
        :loading="loading"
        clearable
        :disabled="loading"
        :label="`${$t('registration.personal_info.indigenousType.select.label')}`"
        :items="indigenousTypesItems"
        :rules="rules.indigenousType"
        :data-test="`${prefixDataTest}__indigenousType`"
        @change="onIndigenousTypeChange($event)" />
    </v-col>
    <v-col cols="12">
      <v-text-field-with-validation
        v-if="otherIndigenousType"
        v-model="formCopy.indigenousCommunityOther"
        :rules="rules.indigenousCommunityOther"
        :data-test="`${prefixDataTest}__indigenousCommunityOther`"
        :label="`${$t('registration.personal_info.indigenousCommunityOther.label')}*`" />
      <v-autocomplete-with-validation
        v-else
        v-model="formCopy.indigenousCommunityId"
        clearable
        :loading="loading"
        :disabled="loading || !formCopy.indigenousType"
        :label="`${$t('registration.personal_info.indigenousCommunity.label')}*`"
        :items="indigenousCommunitiesItems"
        :rules="rules.indigenousCommunityId"
        :data-test="`${prefixDataTest}__indigenousCommunityId`" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

import { TranslateResult } from 'vue-i18n';

import _cloneDeep from 'lodash/cloneDeep';

import { VAutocompleteWithValidation, VTextFieldWithValidation } from '@crctech/component-library';
import { EIndigenousTypes, IIdentitySet } from '../../entities/household-create';
import { MAX_LENGTH_MD } from '../../constants/validations';

export default Vue.extend({
  name: 'IndigenousIdentityForm',
  components: {
    VAutocompleteWithValidation,
    VTextFieldWithValidation,
  },

  props: {
    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },

    form: {
      type: Object as () => IIdentitySet,
      required: true,
    },

    canadianProvincesItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    indigenousTypesItems: {
      type: Array as () => Record<string, TranslateResult>[],
      required: true,
    },

    indigenousCommunitiesItems: {
      type: Array as () => Record<string, string>[],
      required: true,
    },

    loading: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      formCopy: null as IIdentitySet,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        indigenousType: {
          required: false,
        },
        indigenousCommunityId: {
          required: this.formCopy.indigenousType != null,
        },
        indigenousCommunityOther: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    otherIndigenousType(): boolean {
      return this.formCopy?.indigenousType === EIndigenousTypes.Other;
    },

  },

  watch: {
    formCopy: {
      deep: true,
      handler(form: IIdentitySet) {
        this.$emit('change', form);
      },
    },
  },

  async created() {
    this.formCopy = _cloneDeep(this.form);
  },

  methods: {
    async onIndigenousTypeChange(indigenousType: EIndigenousTypes) {
      this.formCopy.indigenousCommunityId = null;
      this.formCopy.indigenousCommunityOther = null;

      if (indigenousType === EIndigenousTypes.Other) {
        // Need to wait for indigenousCommunitiesItems to be updated
        await this.$nextTick();
        // There is only one community for other
        const otherCommunity = this.indigenousCommunitiesItems[0];
        this.formCopy.indigenousCommunityId = otherCommunity.value;
      }
    },
  },
});
</script>
