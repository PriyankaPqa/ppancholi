<template>
  <v-row no-gutters class="mt-12 px-12 mx-12">
    <v-col cols="12" class="rc-body18 fw-bold">
      <v-row class="pb-2">
        <v-col class="d-flex align-center">
          <span> {{ $t('system_management.userAccounts.tenantSettings.domains') }} </span>
        </v-col>
        <v-col v-if="!isEditing" class="text-right">
          <v-btn v-if="$m(emisDomain) && $m(registrationDomain)" data-test="domains__editBtn_locked" icon disabled>
            <v-icon>mdi-lock-outline</v-icon>
          </v-btn>
          <v-btn v-else data-test="domains__editBtn" icon :disabled="disableEditBtn || hasNoSlug" @click="enterEditMode()">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-if="!isEditing" cols="12" data-test="view-domains">
      <v-simple-table class="table rc-body14">
        <tbody>
          <tr>
            <td>
              <v-row>
                <v-col cols="4" class="fw-bold text-no-wrap">
                  {{ $t('system_management.userAccounts.tenantSettings.domains.emis') }}
                </v-col>
                <v-col cols="8">
                  <span v-if="$m(emisDomain)">
                    {{ $m(emisDomain) }}
                  </span>
                  <span v-else class="grey--text">
                    {{ $t('system_management.userAccounts.tenantSettings.domains.emis.not.defined') }}
                  </span>
                </v-col>
              </v-row>
            </td>
          </tr>
          <tr>
            <td>
              <v-row>
                <v-col cols="4" class="fw-bold">
                  {{ $t('system_management.userAccounts.tenantSettings.domains.registration') }}
                </v-col>
                <v-col cols="8">
                  <span v-if="$m(registrationDomain)">
                    {{ $m(registrationDomain) }}
                  </span>
                  <span v-else class="grey--text">
                    {{ $t('system_management.userAccounts.tenantSettings.domains.registration.not.defined') }}
                  </span>
                </v-col>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-col>

    <v-col v-else cols="12" data-test="edit-domains">
      <validation-observer ref="form" v-slot="{ invalid }" slim>
        <language-tabs :language="languageMode" @click="setLanguageMode" />

        <v-col cols="12">
          <v-text-field-with-validation
            v-model="tempEmisDomain.translation[languageMode]"
            dense
            data-test="emis-domain"
            prefix="https://"
            :hint="$t('system_management.userAccounts.tenantSettings.domains.emis.hint')"
            persistent-hint
            :label="`${$t('system_management.userAccounts.tenantSettings.domains.emis')} *`"
            :rules="rules" />
        </v-col>

        <v-col cols="12">
          <v-text-field-with-validation
            v-model="tempRegistrationDomain.translation[languageMode]"
            dense
            data-test="registration-domain"
            prefix="https://"
            :hint="$t('system_management.userAccounts.tenantSettings.domains.registration.hint')"
            persistent-hint
            :label="`${$t('system_management.userAccounts.tenantSettings.domains.registration')} *`"
            :rules="rules" />
        </v-col>

        <v-col cols="12" class="d-flex justify-end">
          <v-btn data-test="cancel" :disabled="loading" @click.stop="cancel()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            data-test="save"
            class="ml-4"
            :disabled="!isDirty || invalid"
            :loading="loading"
            @click.stop="showConfirmationDialog = true">
            {{ $t('common.save') }}
          </v-btn>
        </v-col>
      </validation-observer>
    </v-col>

    <rc-confirmation-dialog
      v-if="showConfirmationDialog"
      data-test="create-slug-dialog"
      :show.sync="showConfirmationDialog"
      :title="$t('common.confirm')"
      :messages="$t('system_management.userAccounts.tenantSettings.save.confirm')"
      :loading="loading"
      @submit="submit()"
      @cancel="showConfirmationDialog = false"
      @close="showConfirmationDialog = false" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcConfirmationDialog, VTextFieldWithValidation } from '@crctech/component-library';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { MAX_LENGTH_SM } from '@/constants/validations';
import { IMultilingual } from '@/types';
import entityUtils from '@/entities/utils';

export default Vue.extend({
  name: 'Domains',

  components: {
    VTextFieldWithValidation,
    LanguageTabs,
    RcConfirmationDialog,
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
      showConfirmationDialog: false,

      tempEmisDomain: null as IMultilingual,
      tempRegistrationDomain: null as IMultilingual,
    };
  },

  computed: {
    hasNoSlug(): boolean {
      const currentSettings = this.$storage.tenantSettings.getters.currentTenantSettings();
      return !currentSettings?.slug;
    },

    emisDomain(): IMultilingual {
      return this.$storage.tenantSettings.getters.currentTenantSettings()?.emisDomain;
    },

    registrationDomain(): IMultilingual {
      return this.$storage.tenantSettings.getters.currentTenantSettings()?.registrationDomain;
    },

    rules(): Record<string, unknown> {
      return {
        required: true,
        max: MAX_LENGTH_SM,
      };
    },

    isDirty(): boolean {
      return !_isEqual(this.tempEmisDomain, this.emisDomain) || !_isEqual(this.tempRegistrationDomain, this.registrationDomain);
    },
  },

  methods: {
    enterEditMode() {
      this.isEditing = true;
      this.resetDomains();
      this.$emit('update:is-editing-domains', this.isEditing);
    },

    exitEditMode() {
      this.isEditing = false;
      this.resetDomains();
      this.$emit('update:is-editing-domains', this.isEditing);
    },

    setLanguageMode(language: string) {
      this.languageMode = language;
      this.tempEmisDomain = entityUtils.getFilledMultilingualField(this.tempEmisDomain);
      this.tempRegistrationDomain = entityUtils.getFilledMultilingualField(this.tempRegistrationDomain);
    },

    resetDomains() {
      this.tempEmisDomain = _cloneDeep(this.emisDomain);
      this.tempRegistrationDomain = _cloneDeep(this.registrationDomain);
    },

    async submit() {
      this.tempEmisDomain = entityUtils.getFilledMultilingualField(this.tempEmisDomain);
      this.tempRegistrationDomain = entityUtils.getFilledMultilingualField(this.tempRegistrationDomain);

      this.loading = true;

      const result = await this.$storage.tenantSettings.actions.createTenantDomains({
        emis: this.tempEmisDomain,
        registration: this.tempRegistrationDomain,
      });

      if (result) {
        this.exitEditMode();
      }

      this.loading = false;
      this.showConfirmationDialog = false;
    },

    async cancel() {
      let leavingConfirmed = true;
      if (this.isDirty) {
        leavingConfirmed = await this.$confirm(this.$t('confirmLeaveDialog.title'), [
          this.$t('system_management.userAccounts.tenantSettings.warning.message.leave'),
          this.$t('confirmLeaveDialog.message_2'),
        ]);
      }
      if (leavingConfirmed) {
        this.exitEditMode();
      }
    },
  },
});
</script>

<style scoped>
.table {
  border-style: solid;
  border-color: var(--v-grey-lighten5);
}
</style>
