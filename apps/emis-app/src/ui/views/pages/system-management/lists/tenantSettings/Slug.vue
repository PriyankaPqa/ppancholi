<template>
  <v-row no-gutters class="mt-8 px-12 mx-12">
    <v-col cols="12" class="rc-body18 fw-bold">
      <v-row class="pb-2">
        <v-col class="d-flex align-center">
          <span> {{ $t('system_management.userAccounts.tenantSettings.slug') }} </span>
        </v-col>
        <v-col v-if="!isEditing" class="text-right">
          <v-btn v-if="slug" data-test="slug__editBtn_locked" icon disabled>
            <v-icon>mdi-lock-outline</v-icon>
          </v-btn>
          <v-btn v-else data-test="slug__editBtn" icon :disabled="disableEditBtn" @click="enterEditMode()">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-if="!isEditing" cols="12" data-test="view-slug">
      <v-simple-table class="table rc-body14">
        <tbody>
          <tr>
            <td>
              <v-row>
                <v-col cols="4" class="fw-bold text-no-wrap">
                  {{ $t('system_management.userAccounts.tenantSettings.slug.name') }}
                </v-col>
                <v-col cols="8">
                  <span v-if="slug">
                    {{ slug }}
                  </span>
                  <span v-else class="grey--text">
                    {{ $t('system_management.userAccounts.tenantSettings.slug.name.not.defined') }}
                  </span>
                </v-col>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-col>

    <v-col v-else cols="12" data-test="edit-slug">
      <validation-observer ref="form" v-slot="{ invalid }" slim>
        <v-col cols="12">
          <v-text-field-with-validation v-model="tempSlug" dense data-test="slug" :label="`${$t('common.name')} *`" :rules="rules" />
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
import { RcConfirmationDialog, VTextFieldWithValidation } from '@libs/component-lib/components';

export default Vue.extend({
  name: 'Slug',

  components: {
    VTextFieldWithValidation,
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
      showConfirmationDialog: false,

      tempSlug: null,
    };
  },

  computed: {
    slug(): string {
      return this.$storage.tenantSettings.getters.currentTenantSettings()?.slug;
    },

    rules(): Record<string, unknown> {
      return {
        required: true,
        customValidator: {
          isValid: /^([a-z-]{3,10})$/.test(this.tempSlug), // This is the same regex in backend
          messageKey: 'system_management.userAccounts.tenantSettings.slug.errorMsg',
        },
      };
    },

    isDirty(): boolean {
      return this.tempSlug !== this.slug;
    },
  },

  methods: {
    enterEditMode() {
      this.isEditing = true;
      this.tempSlug = this.slug;
      this.$emit('update:is-editing-slug', this.isEditing);
    },

    exitEditMode() {
      this.isEditing = false;
      this.tempSlug = this.slug;
      this.$emit('update:is-editing-slug', this.isEditing);
    },

    async submit() {
      this.loading = true;

      const result = await this.$storage.tenantSettings.actions.createTenantSettings({
        slug: this.tempSlug,
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
  },
});
</script>

<style scoped>
.table {
  border-style: solid;
  border-color: var(--v-grey-lighten5);
}
</style>
