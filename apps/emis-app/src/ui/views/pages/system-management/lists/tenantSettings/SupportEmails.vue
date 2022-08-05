<template>
  <v-row no-gutters class="mt-12 px-12 mx-12">
    <v-col cols="12" class="rc-body18 fw-bold">
      <v-row class="pb-2">
        <v-col class="d-flex align-center">
          <span> {{ $t('system_management.tenantSettings.supportEmails.title') }} </span>
        </v-col>
        <v-col v-if="!isEditing" class="text-right">
          <v-btn data-test="supportEmails__editBtn" icon :disabled="disableEditBtn" @click="enterEditMode()">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-if="!isEditing" cols="12" data-test="view-supportEmails">
      <v-simple-table class="table rc-body14">
        <tbody>
          <tr>
            <td>
              <v-row>
                <v-col cols="4" class="fw-bold text-no-wrap">
                  {{ $t('system_management.tenantSettings.supportEmails.email_address') }}
                </v-col>
                <v-col cols="8">
                  <span v-if="emails.translation[languageMode]">
                    {{ $m(emails) }}
                  </span>
                  <span v-else class="grey--text">
                    {{ $t('system_management.tenantSettings.supportEmails.no_email_address') }}
                  </span>
                </v-col>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-col>

    <v-col v-else cols="12" data-test="edit-supportEmails">
      <validation-observer ref="form" v-slot="{ invalid }" slim>
        <language-tabs :language="languageMode" @click="setLanguageMode" />

        <v-col cols="12">
          <v-text-field-with-validation
            v-model="tempEmails.translation[languageMode]"
            dense
            clearable
            data-test="support_emails"
            :label="`${$t('system_management.tenantSettings.supportEmails.email_address')}`"
            :rules="rules"
            @click:clear="clearEmails" />
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
            @click.stop="submit">
            {{ $t('common.save') }}
          </v-btn>
        </v-col>
      </validation-observer>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VTextFieldWithValidation } from '@libs/component-lib/components';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import entityUtils from '@libs/entities-lib/utils';
import { IMultilingual } from '@libs/core-lib/types';
import { MAX_LENGTH_MD } from '@libs/core-lib/constants/validations';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';

export default Vue.extend({
  name: 'SupportEmails',

  components: {
    VTextFieldWithValidation,
    LanguageTabs,
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
      tempEmails: null as IMultilingual,
    };
  },

  computed: {
    emails(): IMultilingual {
      return this.$storage.tenantSettings.getters.currentTenantSettings()?.supportEmails;
    },

    rules(): Record<string, unknown> {
      return {
        max: MAX_LENGTH_MD,
        email: true,
      };
    },

    isDirty(): boolean {
      return !_isEqual(this.tempEmails, this.emails);
    },
  },

  methods: {
    enterEditMode() {
      this.isEditing = true;
      this.tempEmails = _cloneDeep(this.emails);
      this.$emit('update:is-editing', this.isEditing);
    },

    exitEditMode() {
      this.isEditing = false;
      this.tempEmails = null;
      this.$emit('update:is-editing', this.isEditing);
    },

    setLanguageMode(language: string) {
      this.languageMode = language;
      this.tempEmails = entityUtils.getFilledMultilingualField(this.tempEmails);
    },

    async submit() {
      this.loading = true;
      this.tempEmails = entityUtils.getFilledMultilingualField(this.tempEmails);

      const result = await this.$storage.tenantSettings.actions.updateSupportEmails(this.tempEmails);

      if (result) {
        this.exitEditMode();
      }

      this.loading = false;
    },

    async cancel() {
      let leavingConfirmed = true;
      if (this.isDirty) {
        leavingConfirmed = await this.$confirm({
          title: this.$t('confirmLeaveDialog.title'),
          messages: [
            this.$t('system_management.userAccounts.tenantSettings.warning.message.leave'),
            this.$t('confirmLeaveDialog.message_2'),
          ],
        });
      }
      if (leavingConfirmed) {
        this.exitEditMode();
      }
    },

    clearEmails() {
      this.tempEmails = entityUtils.initMultilingualAttributes();
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
