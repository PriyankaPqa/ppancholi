<template>
  <rc-dialog
    :title="title"
    :cancel-action-label="$t('common.buttons.close.preview')"
    data-test="email-template-preview-dialog"
    :show.sync="show"
    content-padding="16"
    content-only-scrolling
    :persistent="true"
    :tooltip-label="$t('common.tooltip_label')"
    :show-submit="false"
    fullscreen
    content-style="background-color:var(--v-grey-lighten4)"
    @cancel="close"
    @close="close">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <v-row justify="center">
        <v-col cols="12" lg="8" class="my-0 px-4 subject">
          <span class="fw-bold"> {{ $t('common.subject') }}: </span> {{ subject }}
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" lg="8" class="px-4 py-8 my-1 content">
          <div v-if="files.length > 0" class="rc-body16 mb-6 " data-test="email_template_attachments">
            <strong>{{ $t('common.attached_documents') }}:</strong>
            <span v-for="file in files" :key="file.name">
              {{ file.name }} ({{ helpers.formatBytes(file.size) }})
            </span>
          </div>
          <!-- eslint is disabled because we purposefully decided to inject html in this -->
          <!-- eslint-disable -->
            <div v-on:click="getTarget" v-html="messageBody" />
            <!-- eslint-enable -->
        </v-col>
      </v-row>
    </template>
    <assessment-template-preview
      v-if="showAssessmentPreview"
      :show.sync="showAssessmentPreview"
      :title="$t('massAction.assessment.template.preview.title')"
      :event-id="eventId"
      :assessment="assessment"
      :language-mode="languageMode" />
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, RcPageLoading } from '@libs/component-lib/components';
import { IMultilingual } from '@libs/shared-lib/types';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import helpers from '@/ui/helpers/helpers';
import AssessmentTemplatePreview from './AssessmentTemplatePreview.vue';

export default Vue.extend({
  name: 'EmailTemplatePreview',

  components: {
    RcDialog,
    RcPageLoading,
    AssessmentTemplatePreview,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    emailTemplateKey: {
      type: String,
      required: true,
    },
    languageMode: {
      type: String,
      default: '',
    },
    eventId: {
      type: String,
      default: '',
    },
    assessment: {
      type: Object as () => IAssessmentFormEntity,
      default: null as IAssessmentFormEntity,
    },
    subject: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    secondMessage: {
      type: String,
      default: '',
    },
    files: {
      type: Array as () => File[],
      default: () => [] as Array<File>,
    },
  },

  data() {
    return {
      emailTemplate: null as IMultilingual,
      loading: false,
      helpers,
      showAssessmentPreview: false,
    };
  },

  computed: {
    messageBody(): any {
      switch (this.emailTemplateKey) {
        case 'MassCommunication':
          return this.emailTemplate?.translation[this.languageMode]
          .replaceAll('href', 'name')
          .replace('-firstname-', this.$t('massAction.common.name') as string)
          .replace('[message]', this.message)
          .replaceAll(' #ee0000', '#cc3300')
          .replaceAll(' #e00', '#cc3300')
          .replaceAll('x-size-14', 'en')
          .replaceAll('x-size-12', 'en');
        case 'AssessmentAssigned':
          return this.emailTemplate?.translation[this.languageMode]
          .replaceAll('href', 'name')
          .replace('[firstname]', this.$t('massAction.common.name') as string)
          .replace('[topCustom]', this.message)
          .replace('[custom]', this.secondMessage);
        case 'AppointmentProgramEmail':
          return this.emailTemplate?.translation[this.languageMode]
          .replace('[message]', this.message);
        default:
          return '';
      }
    },
  },

  watch: {
    eventId: {
      async handler(newEvent) {
        if (newEvent) {
          this.setEmailTemplate();
        }
      },
    },
  },

  async created() {
    this.setEmailTemplate();
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    getTarget(e: any) {
      switch (e.target.getAttribute('name')) {
        case '[assessmentlink]':
          if (this.eventId && this.assessment) {
            this.showAssessmentPreview = true;
          } else {
            this.$toasted.global.info(this.$t('massAction.assessment.template.info.needAssessment'));
          }
        break;
        default:
      }
    },

    async setEmailTemplate() {
      try {
      this.loading = true;
      switch (this.emailTemplateKey) {
        case 'MassCommunication':
        case 'AssessmentAssigned':
          this.emailTemplate = await this.$services.massActions.getEmailTemplate(this.emailTemplateKey, this.eventId);
          break;
        case 'AppointmentProgramEmail':
          this.emailTemplate = await this.$services.appointmentPrograms.getEmailTemplate(this.eventId);
          break;
        default:
      }
      } finally {
        this.loading = false;
      }
    },
  },
});

</script>
<style lang="scss" scoped>
  .content {
    background-color: white;
  }
  .subject{
    background-color: var(--v-grey-lighten5);
  }

</style>
