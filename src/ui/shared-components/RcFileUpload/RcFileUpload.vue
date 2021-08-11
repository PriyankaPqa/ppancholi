<template>
  <v-file-input
    id="inputUpload"
    v-model="localFiles"
    counter
    :multiple="multiple"
    show-size
    :accept="acceptedTypes"
    :error-messages="[...errors, ...errorMessages]"
    :error-count="2"
    :label="$t(labelFileInput)"
    :placeholder="$t(placeHolderFileInput)"
    prepend-icon=""
    outlined
    @change="onChange($event)"
    @focus="checkRules($event)">
    <template #append class="pa-0">
      <v-btn color="primary" class="uploadButton" @click="openSelection()">
        {{ $t('common.button.browse') }}
      </v-btn>
    </template>
  </v-file-input>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/ui/helpers';
import mimeTypes from '@/constants/mimeTypes';

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
      default: 5000000, // 5Mb
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
      default: 'The size should not exceed',
    },
    /**
     * Error message regarding size of file
     */
    errorExtensions: {
      type: String,
      default: 'files only are authorized',
    },
    /**
     * Error message regarding mime type
     */
    errorMimeType: {
      type: String,
      default: 'The MIME type is not authorized',
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

    file: {
      type: [File, Object],
      required: true,
    },

    errors: {
      type: Array,
      default: () => [] as Array<string>,
    },
  },
  data() {
    return {
      errorMessages: [] as Array<string>,
      mimeTypes: mimeTypes as { [key: string]: Array<string> },
      localFiles: [],
    };
  },
  computed: {
    currentFile(): File {
      return this.localFiles[0];
    },
    /**
     * Computes an array containing all authorized extensions based on props
     */
    mergedAuthorizedTypes(): Array<string> {
      let mergedAuthorizedTypes = [] as Array<string>;
      (this.allowedExtensions as Array<string>).forEach((ext: string) => {
        mergedAuthorizedTypes = [...this.mimeTypes[ext], ...mergedAuthorizedTypes];
      });
      return mergedAuthorizedTypes;
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
  },
  methods: {
    checkRules(files: File[] | File) {
      const file = Array.isArray(files) ? files[0] : files;
      if (!file?.size) {
        this.errorMessages = [];
      } else {
        // We check if the size of the file does not exceed the limit
        if (!this.isFileSizeOK(file.size)) this.errorMessages.push(`${this.errorSize} ${helpers.formatBytes(this.maxSize as number, 2)}`);
        // We check if extension of the file is authorized
        if (!this.isFileExtensionAuthorized(this.getFileExtension(file))) {
          this.errorMessages.push(`${this.allowedExtensions.join(', ')} ${this.errorExtensions}`);
        }
        // We check if the MIME type of the file is authorized
        if (!this.isFileTypeAuthorized(file.type)) this.errorMessages.push(`${this.errorMimeType} - ${file.type}`);
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
     * Check if the file type is authorized
     */
    isFileTypeAuthorized(type: string) {
      return this.mergedAuthorizedTypes.includes(type);
    },
    /**
     * Check if the file extension is authorized
     */
    isFileExtensionAuthorized(ext: string) {
      return this.allowedExtensions.includes(ext);
    },

    onChange(files: File[]) {
      this.checkRules(files);
      const file = Array.isArray(files) ? files[0] : files;
      this.$emit('update:file', file || {});
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
