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
            :label="`${$t('massActions.assessment.create.assessment.label')}*`"
            :rules="rules.assessment" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />
          <span>{{ $t('massActions.assessment.create.emailText.label') }}</span>
          <v-btn class="ma-2" small @click="clearEmailText">
            {{ $t('common.clear') }}
          </v-btn>
          <vue-editor id="editor1" v-model="formCopy.emailAdditionalDescription.translation[languageMode]" :editor-toolbar="toolbarSettings" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { IEventEntity } from '@libs/entities-lib/event';
import { Status } from '@libs/entities-lib/base';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import utils from '@libs/entities-lib/utils';
import { ui } from '@/constants/ui';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import {
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { AssessmentDetailsForm } from './AssessmentCreate.vue';

export default Vue.extend({
  name: 'AssessmentDetailsCreate',

  components: {
    EventsSelector,
    VueEditor,
    LanguageTabs,
    VSelectWithValidation,
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
        filter: { 'Entity/EventId': event.id, 'Entity/Status': Status.Active, 'Entity/PublishStatus': PublishStatus.Published },
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      })).value.map((x) => x.entity) : [];
    },

    fillEmptyMultilingualFields() {
      this.formCopy.emailAdditionalDescription = utils.getFilledMultilingualField(this.formCopy.emailAdditionalDescription);
    },

    clearEmailText() {
      this.formCopy.emailAdditionalDescription = utils.initMultilingualAttributes();
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },
  },
});
</script>
