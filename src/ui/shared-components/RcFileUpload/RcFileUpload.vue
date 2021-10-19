<template>
  <div>
    <v-file-input
      id="inputUpload"
      v-model="localFiles"
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
      @focus="checkRules($event)">
      <template #append class="pa-0">
        <v-btn color="primary" class="uploadButton" @click="openSelection()">
          {{ $t('common.button.browse') }}
        </v-btn>
      </template>
    </v-file-input>
    <div v-if="errors.length === 0 && errorMessages.length === 0 && showRules" class="rc-caption12 mt-n6">
      {{ $t('common.upload.max_file.size', {x: helpers.formatBytes(maxSize)}) }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';

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
      localFiles: [],
      helpers,
    };
  },
  computed: {
    currentFile(): File {
      return this.localFiles[0];
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

    onChange(files: File[]) {
      this.checkRules(files);
      const file = Array.isArray(files) ? files[0] : files;

      const isValid = !this.errorMessages.length;
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
