<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massActions.assessment.details.title') }}
    </div>
    <div class="pa-6">
      <v-row>
        <v-col cols="12">
          <events-selector
            v-model="formCopy.event"
            async-mode
            :force-events="filteredEvents"
            return-object
            data-test="payment_event_name"
            fetch-all-events
            :label="`${$t('massActions.financialAssistance.create.event.label')} *`"
            :rules="rules.event"
            @click:clear="onClearEvent()"
            @change="onSetEvent($event)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-select-with-validation
            v-model="formCopy.assessment"
            data-test="assessment_name"
            :items="assessments"
            :item-value="(item) => item"
            :item-text="(item) => $m(item.name)"
            :label="`${$t('massActions.assessment.create.assessment.label')} *`"
            :rules="rules.assessment" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />
          <v-text-field-with-validation
            v-model="formCopy.emailSubject.translation[languageMode]"
            data-test="assessment-email-subject"
            :label="`${$t('massActions.assessment.create.emailSubject.label')} *`"
            :rules="rules.emailSubject" />

          <span>{{ $t('massActions.assessment.create.emailTopCustomContent.label') }}</span>
          <v-btn class="ma-2" small @click="clearEmailText(true)">
            {{ $t('common.clear') }}
          </v-btn>
          <vue-editor v-model="formCopy.emailTopCustomContent.translation[languageMode]" :editor-toolbar="toolbarSettings" />

          <span>{{ $t('massActions.assessment.create.emailBottomCustomContent.label') }}</span>
          <v-btn class="ma-2" small @click="clearEmailText(false)">
            {{ $t('common.clear') }}
          </v-btn>
          <vue-editor v-model="formCopy.emailAdditionalDescription.translation[languageMode]" :editor-toolbar="toolbarSettings" />
        </v-col>
        <v-btn
          class="ma-2 preview"
          small
          data-test="assessment-preview-button"
          @click="showPreview = true">
          <v-icon left>
            mdi-camera-metering-center
          </v-icon>
          {{ $t('massAction.communication.buttons.preview') }}
        </v-btn>
      </v-row>
      <email-template-preview
        email-template-key="AssessmentAssigned"
        :show.sync="showPreview"
        :title="$t('massAction.assessment.email.preview.title')"
        :language-mode="languageMode"
        :event="formCopy.event"
        :assessment="formCopy.assessment"
        :subject="formCopy.emailSubject.translation[languageMode]"
        :message="formCopy.emailTopCustomContent.translation[languageMode]"
        :second-message="formCopy.emailAdditionalDescription.translation[languageMode]" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IEventEntity } from '@libs/entities-lib/event';
import { Status } from '@libs/shared-lib/types';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import utils from '@libs/entities-lib/utils';
import { ui } from '@/constants/ui';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import {
  VSelectWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import EmailTemplatePreview from '@/ui/views/pages/mass-actions/components/EmailTemplatePreview.vue';
import { EFilterKeyType } from '@libs/component-lib/types';
import helper from '@libs/shared-lib/helpers/helpers';
import { AssessmentDetailsForm } from './AssessmentCreate.vue';

export default Vue.extend({
  name: 'AssessmentDetailsCreate',

  components: {
    EventsSelector,
    VueEditor,
    LanguageTabs,
    VSelectWithValidation,
    VTextFieldWithValidation,
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
      formCopy: null as AssessmentDetailsForm,
      isEmpty,
      assessments: [] as IAssessmentFormEntity[],
      toolbarSettings: ui.vueEditorToolbarSettings,
      showPreview: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        event: {
          required: true,
        },
        assessment: {
          required: true,
        },
        emailSubject: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update', newVal);
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
      this.formCopy.assessment = null;

      this.assessments = event ? (await this.$services.assessmentForms.search({
        filter: {
          'Entity/EventId': { value: event.id, type: EFilterKeyType.Guid },
          'Entity/Status': helper.getEnumKeyText(Status, Status.Active),
          'Entity/PublishStatus': helper.getEnumKeyText(PublishStatus, PublishStatus.Published),
        },
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      })).value.map((x) => x.entity) : [];
    },

    fillEmptyMultilingualFields() {
      this.formCopy.emailSubject = utils.getFilledMultilingualField(this.formCopy.emailSubject);
      this.formCopy.emailTopCustomContent = utils.getFilledMultilingualField(this.formCopy.emailTopCustomContent);
      this.formCopy.emailAdditionalDescription = utils.getFilledMultilingualField(this.formCopy.emailAdditionalDescription);
    },

    clearEmailText(topSection: boolean) {
      if (topSection) {
        this.formCopy.emailTopCustomContent = utils.initMultilingualAttributes();
      } else {
        this.formCopy.emailAdditionalDescription = utils.initMultilingualAttributes();
      }
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },
  },
});
</script>

<style lang="scss" scoped>
::v-deep .ql-editor p{
  margin-bottom: 1.5em !important;
}
.preview{
  text-transform:none;
  background-color: #E6F5FC !important;
  border: solid 1px #007DA3;
  margin-left: 12px !important;
}
</style>
