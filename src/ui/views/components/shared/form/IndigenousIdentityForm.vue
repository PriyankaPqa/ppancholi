<template>
  <v-row>
    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.personal_info.indigenous_identity') }}
      </div>
    </v-col>
    <v-col cols="12" sm="6">
      <v-autocomplete-with-validation
        v-model="formCopy.indigenousProvince"
        clearable
        :data-test="`${prefixDataTest}__indigenousProvince`"
        :label="$t('registration.personal_info.indigenousProvince.label')"
        :items="canadianProvincesItems"
        @change="onIndigenousProvinceChange" />
    </v-col>
    <v-col cols="12" sm="6">
      <v-autocomplete-with-validation
        v-model="formCopy.indigenousType"
        :loading="loadingIndigenousIdentities"
        clearable
        :disabled="loadingIndigenousIdentities || !form.indigenousProvince"
        :label="`${$t('registration.personal_info.indigenousType.select.label')}*`"
        :items="indigenousTypesItems"
        :rules="rules.indigenousType"
        :data-test="`${prefixDataTest}__indigenousType`"
        @change="onIndigenousTypeChange" />
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
        :loading="loadingIndigenousIdentities"
        :disabled="loadingIndigenousIdentities || !form.indigenousType"
        :label="`${$t('registration.personal_info.indigenousCommunity.label')}*`"
        :items="indigenousCommunitiesItems"
        :rules="rules.indigenousCommunityId"
        :data-test="`${prefixDataTest}__indigenousCommunityId`" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { MAX_LENGTH_MD } from '@/constants/validations';
import utils from '@/entities/utils';
import { ECanadaProvinces } from '@/types';
import { TranslateResult } from 'vue-i18n';
import { EIndigenousTypes } from '@/entities/beneficiary';
import { VAutocompleteWithValidation, VTextFieldWithValidation } from '@crctech/component-library';

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
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      formCopy: {
        birthDate: { year: null, month: null, day: null },
        gender: {},
        preferredLanguage: {},
        primarySpokenLanguage: {},
        indigenousProvince: null,
        indigenousType: null,
        indigenousCommunityId: null,
        indigenousCommunityOther: null,
      },
    };
  },

  computed: {
    rules() {
      return {
        indigenousType: {
          required: this.form.indigenousProvince !== null,
        },
        indigenousCommunityId: {
          required: this.form.indigenousType !== null,
        },
        indigenousCommunityOther: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems();
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.form.indigenousType);
    },

    otherIndigenousType(): boolean {
      return this.formCopy?.indigenousType?.toString() === EIndigenousTypes[EIndigenousTypes.Other];
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },
  },

  mounted() {
    this.formCopy = this.form;
  },

  methods: {
    async onIndigenousProvinceChange(provinceCode: number) {
      this.formCopy.indigenousType = null;
      this.formCopy.indigenousCommunityId = null;
      this.formCopy.indigenousCommunityOther = null;
      if (provinceCode) {
        await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
      }
    },

    onIndigenousTypeChange() {
      this.formCopy.indigenousCommunityId = null;
      this.formCopy.indigenousCommunityOther = null;
    },
  },
});
</script>
