<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :help-link="$t('zendesk.help_link.change_event_status')"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      @cancel="$emit('cancelChange')"
      @close="$emit('cancelChange')"
      @submit="onSubmit">
      <div class="pa-0">
        <v-col
          cols="12"
          class=" mb-8 pa-3 border-radius-all"
          :style="{backgroundColor: toStatus=== EEventStatus.Open? colors.chips.green_pale : colors.chips.red_pale}">
          <status-chip status-name="EEventStatus" :status="toStatus" data-test="event-summary-status-chip" />
        </v-col>

        <v-text-field-with-validation
          v-model="reason"
          :label="label"
          class="full-width"
          :rules="rules.reason" />
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextFieldWithValidation,
} from '@libs/component-lib/components';
import { VForm } from '@libs/core-lib/types';
import { EEventStatus } from '@libs/entities-lib/event';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import colors from '@/ui/plugins/vuetify/colors';
import { MAX_LENGTH_MD } from '@libs/core-lib/constants/validations';

export default Vue.extend({
  name: 'EventStatusDialog',

  components: {
    RcDialog,
    StatusChip,
    VTextFieldWithValidation,
  },

  props: {
    toStatus: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      reason: null,
      EEventStatus,
      colors,
      texts: {
        [EEventStatus.Open]: {
          title: this.$t('event.status.confirmation.title.re-open'),
          label: `${this.$t('event.status.confirmation.label.re-open')}*`,

        },
        [EEventStatus.Closed]: {
          title: this.$t('event.status.confirmation.title.close'),
          label: `${this.$t('event.status.confirmation.label.close')}*`,
        },
      } as Record<string, {title: string, label: string}>,
    };
  },

  computed: {
    title() : string {
      return this.texts[this.toStatus].title;
    },

    label(): string {
      return this.texts[this.toStatus].label;
    },

    rules(): Record<string, unknown> {
      return {
        reason: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit', { status: this.toStatus, reason: this.reason });
      }
    },
  },

});

</script>
