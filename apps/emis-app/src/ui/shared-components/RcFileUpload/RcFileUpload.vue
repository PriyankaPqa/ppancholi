<template>
  <div>
    <validation-provider ref="fileUpload" :rules="rules.fileUpload" mode="aggressive">
      <v-file-input
        id="inputUpload"
        ref="input"
        v-model="localFiles"
        data-test="upload-file"
        :counter="counter"
        :multiple="multiple"
        :show-size="showSize"
        :accept="acceptedTypes"
        :error-messages="[...errors, ...errorMessages]"
        :error-count="2"
        :label="$t(labelFileInput)"
        :placeholder="$t(placeHolderFileInput)"
        prepend-icon=""
        outlined
        @change="onChange($event)"
        @focus="checkRules()">
        <template #append>
          <v-btn color="primary" class="uploadButton" @click="openSelection()">
            {{ $t('common.button.browse') }}
          </v-btn>
        </template>
      </v-file-input>
    </validation-provider>
    <div v-if="errors.length === 0 && errorMessages.length === 0 && showRules" class="rc-caption12 mt-n6">
      {{ $t('common.upload.max_file.size', { x: helpers.formatBytes(maxSize) }) }} {{ extensions }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { VForm } from '@libs/shared-lib/types';

export default Vue.extend({
  name: 'RcFileUpload',
  props: {
    /**
     * Label of file input
     */
    labelFileInput: {
      type: String,
      default: 'common.upload.input.label',
    },
    /**
     * Placeholder of file input
     */
    placeHolderFileInput: {
      type: String,
      default: 'common.upload.input.placeholder',
    },
    /**
     * Array of allowed extension to be uploaded
     */
    allowedExtensions: {
      type: Array,
      default: () => [] as Array<string>,
    },
    /**
     * Upload size limit
     */
    maxSize: {
      type: [Number, String],
      default: 50000000, // 50Mb
    },
    counter: {
      type: Boolean,
      default: true,
    },
    showSize: {
      type: Boolean,
      default: true,
    },
    showRules: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether or not the user can select multiple files to upload
     */
    multiple: {
      type: Boolean,
      default: false,
    },

    /**
     * Error message regarding size of file
     */
    errorSize: {
      type: String,
      default: '',
    },
    /**
     * Error message regarding size of file
     */
    errorExtensions: {
      type: String,
      default: 'files only are authorized',
    },
    /**
     * Request headers
     */
    headers: {
      type: Object,
      default: () => ({}),
    },

    required: {
      type: Boolean,
      default: false,
    },

    errors: {
      type: Array,
      default: () => [] as Array<string>,
    },

    sanitizeFileName: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      errorMessages: [] as Array<string>,
      localFiles: [],
      helpers,
    };
  },
  computed: {
    currentFile(): File {
      return Array.isArray(this.localFiles) ? this.localFiles[0] : this.localFiles;
    },
    /**
     * Filter the selection of files based on extensions
     * Example '.csv, .jpg'
     */
    acceptedTypes(): string {
      if (this.allowedExtensions.length === 0) {
        return `.${this.allowedExtensions[0]}`;
      }
      return this.allowedExtensions.map((ext) => `.${ext}`).join(', ');
    },

    extensions(): string {
      return `(${this.allowedExtensions.map((ext) => `.${(ext as string).toUpperCase()}`).join(' ')})`;
    },

    rules(): Record<string, unknown> {
      return {
        fileUpload: {
          customValidator: { isValid: !this.errorMessages.length },
        },
      };
    },
  },
  methods: {
    checkRules() {
      const file = this.currentFile;
      this.errorMessages = [];

      // File names should not have special characters, because the file name is part of the blob index tag:
      // https://docs.microsoft.com/en-us/azure/storage/blobs/storage-manage-find-blobs?tabs=azure-portal#setting-blob-index-tags

      const allowedFileNameRegex = /^[a-zA-Z0-9+._\-\s]*$/;

      if (file?.name && !allowedFileNameRegex.test(file.name)) {
        this.errorMessages.push(this.$t('error.file.upload.fileName') as string);
      }

      if (!file?.size) {
        this.errorMessages = [];
      } else {
        // We check if the size of the file does not exceed the limit
        if (!this.isFileSizeOK(file.size)) {
          const formatBytes = helpers.formatBytes(this.maxSize as number, 2);
          this.errorMessages.push(this.errorSize ? `${this.errorSize} ${formatBytes}` : this.$t('common.upload.max_file.size', { x: formatBytes }) as string);
        }
        // We check if extension of the file is authorized
        if (!this.isFileExtensionAuthorized(this.getFileExtension(file))) {
          this.errorMessages.push(`${this.allowedExtensions.join(', ')} ${this.$t('common.upload.file.extension')}`);
        }
      }
    },
    /**
     * Get the extension of a file
     */
    getFileExtension(file: File): string {
      if (file.name && file.name.split('.').length > 0) {
        return file.name.toLowerCase().split('.').pop() as string;
      } return '';
    },
    /**
     * Check if the file does not exceed the max size
     */
    isFileSizeOK(size: number) {
      return size <= this.maxSize;
    },
    /**
     * Check if the file extension is authorized
     */
    isFileExtensionAuthorized(ext: string) {
      return this.allowedExtensions.includes(ext);
    },

    // Will remove accents characters from a file and apostrophe
    sanitizeFile(file: File): File {
      const sanitizedName = file.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/'/g, '');

      return new File([file], sanitizedName, { type: file.type });
    },

    addMissingTypeMsg(file: File): File {
      return new File([file], file.name, { type: 'application/vnd.ms-outlook' });
    },

    async onChange(files: File[]) {
      let file = Array.isArray(files) ? files[0] : files;

      if (file && file.name.endsWith('.msg')) {
        file = this.addMissingTypeMsg(file);
      }

      if (file && this.sanitizeFileName) {
        file = this.sanitizeFile(file);
      }
     this.localFiles = file ? [file] : null;
      this.checkRules();

      const isValid = await (this.$refs.fileUpload as VForm).validate();

      this.$emit('update:file', file || {}, isValid);
    },

    openSelection() {
      document.getElementById('inputUpload').click();
    },
  },
});
</script>

<style>
.uploadButton {
  margin-top: -7px
}
</style>
