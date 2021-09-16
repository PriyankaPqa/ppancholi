<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-page-content :title="title">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" xl="8" lg="9" md="11" sm="12">
            <v-text-field-with-validation
              v-model="name"
              data-test="name"
              :label="`${$t('massActions.importValidationStatus.create.name.label')} *`"
              persistent-hint
              :rules="rules.name" />
            <v-text-area-with-validation
              v-model="description"
              data-test="description"
              :label="`${$t('massActions.importValidationStatus.create.description.label')}`"
              persistent-hint
              :rules="rules.description" />
          </v-col>
          <!-- Use this slot to add the needed form -->
          <v-col cols="12" xl="8" lg="9" md="11" sm="12">
            <slot name="form" />
          </v-col>

          <v-col cols="12" xl="8" lg="9" md="11" sm="12">
            <div class="rc-body-16 fw-bold mb-4">
              {{ applyToLabel }}
            </div>
            <validation-provider v-slot="{ errors }" ref="file" :rules="rules.file" mode="aggressive">
              <rc-file-upload
                :allowed-extensions="['csv']"
                :file="file"
                :errors="errors"
                @update:file="onUpdateFile($event)" />
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
  VTextFieldWithValidation, VTextAreaWithValidation, RcPageContent, RcDialog,
} from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { VForm } from '@/types';
import fileUpload from '@/ui/mixins/fileUpload';
import { IMassActionEntity, MassActionEntity } from '@/entities/mass-action';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';

export default mixins(fileUpload).extend({
  name: 'MassActionBaseCreate',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    RcPageContent,
    RcFileUpload,
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
     * The title of the page content
     */
    applyToLabel: {
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
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        file: {
          requiredFile: this.file.size,
        },
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_LG,
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
        const userChoice = await this.$confirm(this.$t('massAction.confirm.preprocessing.title'),
          this.$t('massAction.confirm.preprocessing.message'));
        if (userChoice) {
          this.showUploadDialog = true;
          // So the parent update the formData props ex:  this.formData.set('extra', this.extra);
          this.$emit('upload:start');
          await this.upload();
        }
      }
    },

    back() {
      this.$emit('back');
    },

    async upload() {
      // A mass action always has a name, description and a file
      this.formData.set('name', this.name);
      this.formData.set('description', this.description);
      this.formData.set('file', this.file);

      await this.uploadForm(this.formData, this.url);

      if (this.uploadSuccess) {
        // So the parent can redirect where needed
        this.$emit('upload:success', new MassActionEntity(this.response.data as IMassActionEntity));
      }
    },
  },
});
</script>
