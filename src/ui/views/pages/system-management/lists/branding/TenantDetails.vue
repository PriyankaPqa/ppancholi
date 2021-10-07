<template>
  <v-row>
    <v-col cols="12" class="rc-body18 fw-bold">
      <v-row>
        <v-col class="py-4">
          {{ $t('system_management.branding.tenantDetails') }}
        </v-col>
        <v-col v-if="!isEditing" class="d-flex justify-end">
          <v-btn data-test="colours__editBtn" icon :disabled="disableEditBtn" @click="enterEditMode()">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-if="!isEditing" cols="12" data-test="view-tenant-details">
      <v-simple-table class="table rc-body14">
        <tbody>
          <tr>
            <td class="fw-bold text-no-wrap">
              {{ $t('common.name') }}
            </td>
            <td>
              {{ $m(tenantDetails.name) }}
              <br>
              <span
                v-if="tenantDetails.showName"
                class="rc-body12 grey--text">✔ {{ $t('system_management.branding.tenantDetails.showName.label') }}</span>
            </td>
          </tr>

          <tr>
            <td class="fw-bold text-no-wrap">
              {{ $t('common.description') }}
            </td>
            <td>
              {{ $m(tenantDetails.description) }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-col>

    <v-col v-else cols="12" data-test="edit-tenant-details">
      <validation-observer ref="form" v-slot="{ dirty, invalid }" slim>
        <language-tabs :language="languageMode" @click="setLanguageMode" />

        <v-col cols="12">
          <v-text-field-with-validation
            v-model="tempTenantDetails.name.translation[languageMode]"
            data-test="branding-name"
            :label="`${$t('common.name')} *`"
            :rules="rules.name" />
        </v-col>

        <v-col cols="12" class="mt-n10 py-0">
          <v-checkbox-with-validation
            v-model="tempTenantDetails.showName"
            data-test="branding-hide-name"
            :label="$t('system_management.branding.tenantDetails.showName.label')" />
        </v-col>

        <v-col cols="12">
          <v-text-area-with-validation
            v-model="tempTenantDetails.description.translation[languageMode]"
            :rules="rules.description"
            data-test="branding-description"
            :label="$t('common.description')" />
        </v-col>

        <v-col cols="12" class="d-flex justify-end">
          <v-btn data-test="cancel" :disabled="loading" @click.stop="exitEditMode()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" class="ml-4" :disabled="!dirty || invalid" :loading="loading" @click.stop="submit()">
            {{ $t('common.save') }}
          </v-btn>
        </v-col>
      </validation-observer>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VTextFieldWithValidation, VCheckboxWithValidation, VTextAreaWithValidation } from '@crctech/component-library';
import entityUtils from '@/entities/utils';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { IEditTenantDetailsRequest, ITenantDetailsEntity } from '@/entities/branding';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';

export default Vue.extend({
  name: 'TenantDetails',

  components: {
    LanguageTabs,
    VTextFieldWithValidation,
    VCheckboxWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    disableEditBtn: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      isEditing: false,
      loading: false,
      languageMode: 'en',
      tempTenantDetails: null as ITenantDetailsEntity,
    };
  },

  computed: {
    tenantDetails(): ITenantDetailsEntity {
      return this.$storage.branding.getters.branding() as ITenantDetailsEntity;
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };
    },
  },

  methods: {
    setLanguageMode(language: string) {
      this.languageMode = language;
      this.tempTenantDetails.name = entityUtils.getFilledMultilingualField(this.tempTenantDetails.name);
    },

    enterEditMode() {
      this.tempTenantDetails = _cloneDeep(this.tenantDetails);
      this.isEditing = true;
      this.$emit('update:is-editing-tenant-details', this.isEditing);
    },

    exitEditMode() {
      this.isEditing = false;
      this.$emit('update:is-editing-tenant-details', this.isEditing);
    },

    async submit() {
      this.tempTenantDetails.name = entityUtils.getFilledMultilingualField(this.tempTenantDetails.name);
      this.tempTenantDetails.description = entityUtils.getFilledMultilingualField(this.tempTenantDetails.description);

      this.loading = true;

      const editTenantDetailsRequest: IEditTenantDetailsRequest = {
        ...this.tempTenantDetails,
        hideName: !this.tempTenantDetails.showName,
      };

      const result = await this.$storage.branding.actions.updateTenantDetails(editTenantDetailsRequest);

      if (result) this.exitEditMode();

      this.loading = false;
    },
  },
});
</script>

<style scoped>
.table {
  border-style: solid;
  border-color: var(--v-grey-lighten5);
}
::v-deep .v-input--checkbox .v-label {
  font-size: 12px;
}
</style>
