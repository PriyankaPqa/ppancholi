<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-page-content :title="title">
      <v-container>
        <v-row justify="center">
          <slot name="form" />
          <v-col cols="12" xl="8" lg="9" md="11" sm="12">
            <validation-provider v-slot="{ errors }" ref="file" :rules="rules.file" mode="aggressive">
              <rc-file-upload :allowed-extensions="['csv']" :file="file" :errors="errors" @update:file="onUpdateFile($event)" />
            </validation-provider>
          </v-col>
        </v-row>
      </v-container>
      <template slot="actions">
        <v-btn data-test="cancel" @click.stop="back()">
          {{ $t('common.buttons.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          data-test="next"
          :disabled="failed"
          @click="next()">
          {{ $t('common.buttons.next') }}
        </v-btn>
      </template>
    </rc-page-content>

    <rc-confirmation-dialog
      ref="confirmUpload"
      :show.sync="showConfirmation"
      :title="$t('massAction.confirm.preprocessing.title')"
      :messages="$t('massAction.confirm.preprocessing.message')" />

    <rc-dialog
      :title="$t(uploadDialogTitle)"
      :submit-action-label="$t('common.button.next')"
      :cancel-action-label="$t('common.buttons.cancel')"
      :show.sync="showUploadDialog"
      :show-close="false"
      :show-submit="false"
      :persistent="true"
      :max-width="750"
      @cancel="cancelUpload()">
      <div class="pa-0">
        <template v-if="uploadHasErrors">
          {{ $t(errors[0].code) }}
        </template>
        <template v-else>
          <div class="rc-body14 pb-6">
            {{ $t('common.file.uploading.message') }}
          </div>
          <v-progress-linear v-model="percentCompleted" height="25">
            <strong>{{ Math.ceil(percentCompleted) }}%</strong>
          </v-progress-linear>
        </template>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import {
  VTextFieldWithValidation, VTextAreaWithValidation, RcPageContent, RcConfirmationDialog, RcDialog,
} from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { ConfirmationDialog, VForm } from '@/types';
import fileUpload from '@/ui/mixins/fileUpload';
import { IMassActionEntity, MassActionEntity } from '@/entities/mass-action';

export default mixins(fileUpload).extend({
  name: 'MassActionBaseCreate',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    RcPageContent,
    RcFileUpload,
    RcConfirmationDialog,
    RcDialog,
  },

  props: {
    /**
     * The title of the page content
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * The form data to be uploaded. Don't need to include the file as it's done here
     */
    formData: {
      type: FormData,
      required: true,
    },
    /**
     * The endpoint
     */
    url: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      name: '',
      description: '',
      showConfirmation: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        file: {
          requiredFile: this.file.size,
        },
      };
    },
    uploadDialogTitle(): string {
      if (this.uploadHasErrors) {
        return 'common.file.uploading.error.title';
      }
      return 'common.file.uploading.title';
    },
  },

  methods: {
    async next() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.showConfirmation = true;
        const userChoice = await (this.$refs.confirmUpload as ConfirmationDialog).open() as boolean;
        if (userChoice) {
          this.showConfirmation = false;
          this.showUploadDialog = true;
          // So the parent update the formData props
          this.$emit('upload:start');
          await this.upload();
        }
      }
    },

    back() {
      this.$emit('back');
    },

    async upload() {
      this.formData.append('file', this.file);

      await this.uploadForm(this.formData, this.url);

      if (this.uploadSuccess) {
        // So the parent can redirect where needed
        this.$emit('upload:success', new MassActionEntity(this.response.data as IMassActionEntity));
      }
    },
  },
});
</script>
