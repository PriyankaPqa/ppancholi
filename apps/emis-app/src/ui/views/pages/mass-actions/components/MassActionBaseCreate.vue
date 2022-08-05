<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-page-content :title="title">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" xl="8" lg="9" md="11" sm="12">
            <slot name="top" />
            <v-text-field-with-validation
              v-if="!hideName"
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

          <v-col v-if="mode !== MassActionMode.NoAttachment" cols="12" xl="8" lg="9" md="11" sm="12">
            <div class="rc-body-16 fw-bold mb-4">
              {{ applyToLabel }}
            </div>
            <validation-provider v-if="mode === MassActionMode.File" v-slot="{ errors }" ref="file" :rules="rules.file" mode="aggressive">
              <rc-file-upload
                ref="fileUpload"
                :allowed-extensions="['csv']"
                :max-size="10000000"
                :errors="errors"
                @update:file="onUpdateFile" />
            </validation-provider>
            <div v-else-if="mode === MassActionMode.List" class="grey-container px-6 py-4">
              {{ $t('massAction.common.apply_to_x_caseFiles', {x: $route.query.total}) }}
            </div>
          </v-col>
        </v-row>
      </v-container>
      <template #actions>
        <v-btn data-test="cancel" :disabled="loading" @click.stop="back()">
          {{ $t('common.buttons.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          data-test="next"
          :disabled="failed || !isFileValid"
          :loading="loading"
          @click="next()">
          {{ $t('common.buttons.next') }}
        </v-btn>
      </template>
    </rc-page-content>

    <rc-dialog
      v-if="showUploadDialog"
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
  RcDialog, RcPageContent, VTextAreaWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { VForm } from '@libs/core-lib/types';
import fileUpload from '@/ui/mixins/fileUpload';
import {
  IMassActionEntity, MassActionEntity, MassActionMode, MassActionRunType,
} from '@libs/entities-lib/mass-action';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@libs/core-lib/constants/validations';
import helpers from '@/ui/helpers/helpers';

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
      default: '',
    },
    /**
     * The form data to be uploaded for file mode
     */
    formData: {
      type: FormData,
      default: () => new FormData(),
    },
    /**
     * The url where the form needs to be uploaded
     */
    uploadUrl: {
      type: String,
      default: '',
    },

    /**
     *  Whether the mass action is created from a file or from a list
     */
    mode: {
      type: String as () => MassActionMode,
      required: true,
    },

    /**
     *  Whether the mass action is being pre-processed or processed
     */
    runType: {
      type: Number as () => MassActionRunType,
      default: MassActionRunType.PreProcess,
    },

    loading: {
      type: Boolean,
      required: true,
    },

    hideName: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      name: '',
      description: '',
      MassActionMode,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      const fileModeRule = {
        file: {
          requiredFile: this.file.size,
        },
      };

      const regularRules = {
        name: {
          required: !this.hideName,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };

      if (this.mode === MassActionMode.File) {
        return { ...fileModeRule, ...regularRules };
      }
      return regularRules;
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
        let confirmTitle;
        let confirmMessages;
        if (this.runType === MassActionRunType.Process) {
          confirmTitle = 'massAction.confirm.processing.title';
          confirmMessages = 'massAction.confirm.processing.message';
        } else {
          confirmTitle = 'massAction.confirm.preprocessing.title';
          confirmMessages = 'massAction.confirm.preprocessing.message';
        }

        const userChoice = await this.$confirm({
          title: this.$t(confirmTitle),
          messages: this.$t(confirmMessages),
        });

        if (userChoice) {
          if (this.mode === MassActionMode.File) {
            this.showUploadDialog = true;
          }
          await this.create(this.mode);
        }
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },

    async back() {
      if ((this.$refs.form as VForm).flags.changed) {
        await this.confirmBeforeLeave();
      } else {
        this.$emit('back');
      }
    },

    async confirmBeforeLeave() {
      const userChoice = await this.$confirm({
        title: this.$t('massAction.cancel.title'),
        messages: this.$t('massAction.cancel.message'),
      });

      if (userChoice) {
        this.$emit('back');
      }
    },

    async create(mode: MassActionMode) {
      if (mode === MassActionMode.File) {
        this.$emit('upload:start');
      } else if (mode === MassActionMode.List || mode === MassActionMode.NoAttachment) {
        this.$emit('post', { name: this.name, description: this.description });
      }
    },

    async upload() {
      // A mass action always has a name, description and a file. If it's hidden the name will have to be set on the parent component
      !this.hideName && this.formData.set('name', this.name);
      this.formData.set('description', this.description);
      this.formData.set('file', this.file);

      await this.uploadForm(this.formData, this.uploadUrl);

      if (this.uploadSuccess) {
        const entity = new MassActionEntity(this.response.data as IMassActionEntity);

        this.$storage.massAction.mutations.addNewlyCreatedId(entity);
        this.$storage.massAction.mutations.setEntity(entity);

        // So the parent can redirect where needed
        this.$emit('upload:success', entity);
      } else {
        this.resetFileInput();
      }
    },

    resetFileInput() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileInput = (this.$refs.fileUpload as InstanceType<typeof RcFileUpload>).$refs.input as any;
      // eslint-disable-next-line no-unused-expressions
      fileInput && fileInput.focus();
      this.$nextTick(() => {
        fileInput.internalValue = null;
      });
    },
  },
});
</script>
