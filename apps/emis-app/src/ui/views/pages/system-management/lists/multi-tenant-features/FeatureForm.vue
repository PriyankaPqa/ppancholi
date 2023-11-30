<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row class="mt-4">
            <v-col cols="12" class="pt-0">
              <v-text-field-with-validation
                v-model="localFeature.name.translation[languageMode]"
                :rules="rules.name"
                :label="$t('common.name')"
                data-test="feature-name" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="pt-0">
              <v-text-area-with-validation
                v-model="localFeature.description.translation[languageMode]"
                :rules="rules.description"
                :label="$t('common.description')"
                data-test="feature-description"
                rows="3" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" class="pt-0">
              <v-text-field-with-validation
                v-model="localFeature.key"
                :color="isEditMode ? 'status_warning' : ''"
                :rules="rules.key"
                :label="$t('system_management.features.key')"
                :hint="$t('system_management.features.key.help')"
                :readonly="isEditMode"
                data-test="feature-key" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" class="pt-0">
              <v-select-with-validation
                v-model="localFeature.type"
                :color="isEditMode ? 'status_warning' : ''"
                :items="featureTypes"
                :label="$t('system_management.features.type')"
                :hint="$t('system_management.features.type.help')"
                :readonly="isEditMode"
                data-test="feature-types" />
            </v-col>
            <v-col cols="6" class="pt-0">
              <v-select-with-validation
                v-model="localFeature.visibility"
                :items="featureVisibilities"
                :label="$t('system_management.features.visibility')"
                :hint="$t('system_management.features.visibility.help')"
                data-test="feature-visibilities" />
            </v-col>
          </v-row>

          <v-row v-if="isEditMode">
            <v-col cols="6">
              <v-checkbox-with-validation
                v-model="localFeature.canEnable"
                data-test="feature-can-enable"
                :label="$t('system_management.features.canEnable')" />
            </v-col>
            <v-col cols="6">
              <v-checkbox-with-validation
                v-model="localFeature.canDisable"
                data-test="feature-can-disable"
                :label="$t('system_management.features.canDisable')" />
            </v-col>
          </v-row>
          <div v-else class="mt-4">
            <v-icon>mdi-information-outline</v-icon>
            {{ $t('system_management.features.defaultValues') }}
          </div>
        </v-col>
      </v-row>
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VCheckboxWithValidation,
} from '@libs/component-lib/components';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import helpers from '@/ui/helpers/helpers';
import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { FeatureType, FeatureVisibility, IFeatureEntity } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'FeatureForm',

  components: {
    LanguageTabs,
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

    feature: {
      type: Object as () => IFeatureEntity,
      required: true,
    },

    isDirty: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    const localFeature = _cloneDeep(this.feature);

    return {
      localFeature,
      languageMode: 'en',
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        key: {
          required: true,
          max: MAX_LENGTH_SM,
        },
      };
    },
    featureTypes() {
      return helpers.enumToTranslatedCollection(FeatureType, 'enums.FeatureType');
    },
    featureVisibilities() {
      return helpers.enumToTranslatedCollection(FeatureVisibility, 'enums.FeatureVisibility');
    },
  },

  watch: {
    localFeature: {
      handler(newFeature) {
        this.$emit('update:feature', newFeature);
        this.$emit('update:is-dirty', true);
      },
      deep: true,
    },
  },

  methods: {
    setLanguageMode(lang: string) {
      this.languageMode = lang;
    },
  },
});
</script>
