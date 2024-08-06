<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massActions.communication.details.title') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <span>{{ $t('massActions.communication.create.communicationMethod.label') }} *</span>
          <validation-provider v-slot="{ errors }" :rules="rules.method">
            <v-radio-group v-model="formCopy.method" :error-messages="errors" class="mt-0" row>
              <v-radio
                :label="$t('enums.communicationMethod.Email')"
                data-test="communication-form-method-email"
                :value="CommunicationMethod.Email" />
              <v-radio
                :label="$t('enums.communicationMethod.SMS')"
                data-test="communication-form-method-sms"
                :value="CommunicationMethod.SMS"
                :disabled="true" />
            </v-radio-group>
          </validation-provider>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <events-selector
            v-model="formCopy.event"
            async-mode
            :force-events="filteredEvents"
            return-object
            data-test="communication_event_name"
            fetch-all-events
            :label="`${$t('massActions.financialAssistance.create.event.label')} *`"
            :rules="rules.event"
            @click:clear="onClearEvent()"
            @change="onSetEvent($event)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />
          <v-text-field-with-validation
            v-model="formCopy.messageSubject.translation[languageMode]"
            data-test="communication-message-subject"
            background-color="white"
            :label="`${$t('massActions.communication.create.messageSubject.label')} *`"
            :rules="rules.messageSubject" />

          <span>{{ $t('massActions.communication.create.messageText.label') }}</span>

          <template v-if="formCopy.method === CommunicationMethod.SMS">
            <span>: {{ smsLength }}/{{ MAX_LENGTH_SMS }} {{ $t('massActions.communication.create.smsLength.label') }}</span>
            <v-text-area-with-validation
              v-model="formCopy.smsMessage.translation[languageMode]"
              data-test="communication-sms-description"
              background-color="white"
              persistent-hint
              :rules="rules.smsMessage" />
          </template>

          <template v-else>
            <v-btn class="ma-2" small @click="clearEmailText">
              {{ $t('common.clear') }}
            </v-btn>
            <div class="mb-4 white">
              <vue-editor
                id="communication-message-text-editor"
                v-model="formCopy.emailMessage.translation[languageMode]"
                data-test="communication-message-text"
                :editor-toolbar="toolbarSettings" />
            </div>

            <div class="mb-1">
              {{ $t('massActions.communication.create.attachments') }}
            </div>
            <validation-provider ref="fileUpload" :rules="rules.fileUpload" mode="aggressive">
              <rc-file-upload
                ref="fileUpload"
                input-id="mass-communication"
                multiple
                background-color="white"
                clear-icon=""
                :allowed-extensions="allowedExtensions"
                :sanitize-file-name="true"
                :max-size="10000000"
                data-test="attach-documents-upload-file"
                @update:files="fileAdded" />
            </validation-provider>
          </template>
        </v-col>
        <v-btn
          class="ma-2 preview"
          small
          data-test="communication-preview-button"
          @click="showPreview = true">
          <v-icon left>
            mdi-camera-metering-center
          </v-icon>
          {{ $t('massAction.communication.buttons.preview') }}
        </v-btn>
      </v-row>
      <email-template-preview
        email-template-key="MassCommunication"
        :show.sync="showPreview"
        :title="$t('massAction.communication.email.preview.title')"
        :language-mode="languageMode"
        :event="formCopy.event"
        :subject="formCopy.messageSubject.translation[languageMode]"
        :message="formCopy.emailMessage.translation[languageMode]"
        :files="files" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { CASE_FILE_DOC_EXTENSIONS } from '@/constants/documentExtensions';
import { MAX_LENGTH_MD, MAX_LENGTH_SMS } from '@libs/shared-lib/constants/validations';
import { IEventEntity } from '@libs/entities-lib/event';
import { MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import utils from '@libs/entities-lib/utils';
import { ui } from '@/constants/ui';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import {
VTextFieldWithValidation, VTextAreaWithValidation,
} from '@libs/component-lib/components';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import EmailTemplatePreview from '@/ui/views/pages/mass-actions/components/EmailTemplatePreview.vue';
import { CommunicationDetailsForm } from './CommunicationCreate.vue';

export default Vue.extend({
  name: 'CommunicationDetailsCreate',

  components: {
    EventsSelector,
    VueEditor,
    LanguageTabs,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    RcFileUpload,
    EmailTemplatePreview,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      languageMode: 'en',
      loadingEvent: false,
      filteredEvents: [],
      formCopy: null as CommunicationDetailsForm,
      isEmpty,
      MAX_LENGTH_SMS,
      CommunicationMethod: MassActionCommunicationMethod,
      allowedExtensions: CASE_FILE_DOC_EXTENSIONS,
      toolbarSettings: ui.vueEditorToolbarSettings,
      smsLength: 0,
      showPreview: false,
      files: [],
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        event: {
          required: true,
        },
        method: {
          required: true,
        },
        messageSubject: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        smsMessage: {
          max: MAX_LENGTH_SMS,
        },
      };
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update', newVal);
        this.smsLength = newVal.smsMessage.translation.en.length;
      },
    },

    'formCopy.event': {
      async handler(newEvent) {
        if (newEvent) {
          this.onSetEvent(newEvent);
        }
      },
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
  },

  methods: {
    onClearEvent() {
      this.onSetEvent(null);
    },

    async onSetEvent(event: IEventEntity) {
      this.formCopy.event = event;
    },

    fillEmptyMultilingualFields() {
      this.formCopy.messageSubject = utils.getFilledMultilingualField(this.formCopy.messageSubject);
      this.formCopy.emailMessage = utils.getFilledMultilingualField(this.formCopy.emailMessage);
      this.formCopy.smsMessage = utils.getFilledMultilingualField(this.formCopy.smsMessage);
    },

    clearEmailText() {
      this.formCopy.emailMessage = utils.initMultilingualAttributes();
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

    fileAdded(files: []) {
      this.files = files;
      this.$emit('addfile', files);
    },
  },
});
</script>

<style lang="scss" scoped>
::v-deep .ql-editor p{
  margin-bottom: 1.5em !important;
}

.optionsList__tabContainer {
  background:none;
}

.preview{
  text-transform:none;
  background-color: #E6F5FC !important;
  border: solid 1px #007DA3;
  margin-left: 12px !important;
}
</style>
