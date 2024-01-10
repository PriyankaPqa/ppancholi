<template>
  <v-row class="mt-6">
    <v-col cols="12">
      <div>
        <span class="rc-body18 fw-bold mb-4">{{ $t('system_management.branding.logo') }}</span>
        <v-divider style="display: initial" class="mx-3" vertical />
        <span class="rc-caption12">{{ dimensionsRuleText }}</span>
        <v-divider style="display: initial" class="mx-3" vertical />
        <span class="rc-caption12">{{ typesRuleText }}</span>
      </div>

      <v-row no-gutters class="my-6">
        <v-col
          v-for="lang in supportedLanguages"
          :key="lang.key"
          :class="{ 'img-container d-flex flex-column': true, 'mr-2': lang.key === 'en', 'ml-2': lang.key === 'fr' }">
          <div class="logo-title rc-body14 ml-2">
            <span>{{ $t(`tab.${lang.key}`) }}</span>
            <v-btn :data-test="`logo-${lang}__editBtn`" icon :aria-label="$t('common.edit')" :disabled="disableEditBtn" @click="enterEditMode(lang.key)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
          <div class="d-flex justify-center">
            <v-img contain :max-width="maxWidth" height="120" :src="getLogoUrl(lang.key)" />
          </div>
        </v-col>
      </v-row>

      <rc-dialog
        v-if="isEditing"
        :title="$t('system_management.branding.logo.upload.title')"
        :cancel-action-label="$t('common.buttons.cancel')"
        :submit-action-label="$t('system_management.branding.logo.upload')"
        :submit-button-disabled="!isDirty"
        :show.sync="isEditing"
        content-padding="10"
        max-width="750"
        persistent
        show-close
        :loading="loading"
        @close="exitEditMode()"
        @cancel="exitEditMode()"
        @submit="upload()">
        <div class="mb-1">
          <span class="rc-caption12">{{ dimensionsRuleText }}</span>
          <v-divider style="display: initial" class="mx-3" vertical />
          <span class="rc-caption12">{{ typesRuleText }}</span>
        </div>

        <rc-file-upload
          :allowed-extensions="allowedExtensions"
          :sanitize-file-name="true"
          :errors="errors"
          :show-size="false"
          :show-rules="false"
          :counter="false"
          @update:file="updateFile" />

        <div class="img-container d-flex justify-center">
          <v-img contain :max-width="maxWidth" :height="120" :src="tempLogoUrl" />
        </div>
      </rc-dialog>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDialog } from '@libs/component-lib/components';
import fileUpload from '@/ui/mixins/fileUpload';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { LOGO_EXTENSIONS } from '@/constants/documentExtensions';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { ITenantSettingsEntity } from '@libs/entities-lib/tenantSettings';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

export default mixins(fileUpload).extend({
  name: 'Logo',

  components: {
    RcFileUpload,
    RcDialog,
  },

  props: {
    disableEditBtn: {
      type: Boolean,
      required: true,
    },

    maxWidth: {
      type: Number,
      default: 480,
    },

    maxHeight: {
      type: Number,
      default: 192,
    },
  },

  data() {
    return {
      isEditing: false,
      loading: false,
      allowedExtensions: LOGO_EXTENSIONS,
      tempLogoUrl: null,
      currentLogoLanguage: '',
      errors: [] as string[],
    };
  },

  computed: {
    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    dimensionsRuleText(): string {
      return `${this.$t('system_management.branding.logo.maxDimensions')}: ${this.maxWidth}px × ${this.maxHeight}px`;
    },

    typesRuleText(): string {
      return `${this.$t('system_management.branding.logo.typesAllowed')}: .${LOGO_EXTENSIONS.join(', .')}`;
    },

    isDirty(): boolean {
      return !!this.tempLogoUrl && this.tempLogoUrl !== this.getLogoUrl(this.currentLogoLanguage);
    },
  },

  methods: {
    enterEditMode(lang: string) {
      this.isEditing = true;
      this.currentLogoLanguage = lang;
      this.tempLogoUrl = this.getLogoUrl(this.currentLogoLanguage);
    },

    exitEditMode() {
      this.isEditing = false;
      this.errors = [];
      this.tempLogoUrl = null;
    },

    updateFile(file: File, isValid: boolean) {
      this.errors = [];

      if (!file.size || !isValid) {
        this.tempLogoUrl = this.getLogoUrl(this.currentLogoLanguage);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const component = this;
      const img = new Image();
      img.onload = function onload() {
        // eslint-disable-next-line
        if ((this as any).width > component.maxWidth || (this as any).height > component.maxHeight) {
          component.tempLogoUrl = component.getLogoUrl(component.currentLogoLanguage);
          component.errors.push(component.dimensionsRuleText);
        } else {
          component.tempLogoUrl = img.src;
          component.file = file;
        }
      };
      img.src = URL.createObjectURL(file);
    },

    getLogoUrl(key: string) {
      return `${this.$services.tenantSettings.getLogoUrl(key)}?d=${useTenantSettingsStore().currentTenantSettings.timestamp}`;
    },

    async upload() {
      const formData = new FormData();
      formData.set('languageCode', this.currentLogoLanguage);
      formData.set('file', this.file);

      this.loading = true;
      await this.uploadForm(formData, 'system-management/tenant-settings/logo') as ITenantSettingsEntity;

      if (this.uploadSuccess) {
        await useTenantSettingsStore().fetchCurrentTenantSettings();
        this.exitEditMode();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.errors = this.errors.map((error: any) => this.$t(error.code) as string);
      }

      this.loading = false;
    },
  },
});
</script>

<style scoped>
.img-container {
  background-color: var(--v-grey-lighten5);
  border-radius: 4px;
  border-style: dotted;
  border-color: var(--v-grey-lighten2);
}
.logo-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-style: dotted;
  border-color: var(--v-grey-lighten2);
  border-top: none;
  border-left: none;
  border-right: none;
}
</style>
