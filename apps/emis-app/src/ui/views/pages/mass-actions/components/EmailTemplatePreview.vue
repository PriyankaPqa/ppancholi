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
    cancel-button-class="preview-cancel-button"
    fullscreen
    content-style="background-color:#F5F5F5"
    @cancel="close"
    @close="close">
    <div class="content">
      <rc-page-loading v-if="loading" />
      <v-row v-else>
        <v-col cols="12" class="px-6 py-0 my-4">
          <div class="rc-body16 fw-bold mb-6 subject">
            {{ $t('common.subject') }}: {{ subject }}
          </div>
          <!-- eslint is disabled because we purposefully decided to inject html in this -->
          <!-- eslint-disable -->
          <div v-html="messageBody" />
          <!-- eslint-enable -->
        </v-col>
      </v-row>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, RcPageLoading } from '@libs/component-lib/components';
import { IMultilingual } from '@libs/shared-lib/types';
import { IEventEntity } from '@libs/entities-lib/event';

export default Vue.extend({
  name: 'EmailTemplatePreview',

  components: {
    RcDialog,
    RcPageLoading,
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
    event: {
      type: Object as () => IEventEntity,
      required: true,
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
  },

  data() {
    return {
      emailTemplate: null as IMultilingual,
      loading: false,
      cname: '',
    };
  },

  computed: {
    messageBody(): any {
      switch (this.emailTemplateKey) {
        case 'MassCommunication':
          return this.emailTemplate.translation[this.languageMode]
          .replace('-firstname-', this.$t('massAction.common.name') as string)
          .replace('[message]', this.message);
        case 'AssessmentAssigned':
          return this.emailTemplate.translation[this.languageMode]
          .replace('[firstname]', this.$t('massAction.common.name') as string)
          .replace('[topCustom]', this.message)
          .replace('[custom]', this.secondMessage);
        default:
          return '';
      }
    },
  },

  watch: {
    event: {
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

    async setEmailTemplate() {
      try {
      this.loading = true;
      this.emailTemplate = await this.$services.massActions.getEmailTemplate(this.emailTemplateKey, this.event?.id);
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
    padding: 20px 0;
    margin: 0px 15%;
  }
  .subject{
    padding: 0 0 15px 0;
    text-align: center;
  }
</style>
