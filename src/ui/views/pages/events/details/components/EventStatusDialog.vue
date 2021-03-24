<template>
  <rc-dialog
    :title="title"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.apply')"
    :content-only-scrolling="true"
    :persistent="true"
    :show-help="true"
    help-link=""
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
      <ValidationObserver ref="form" slim>
        <v-form data-test="event-status-confirmation-dialog" class="full-width">
          <v-col cols="12" class="pa-0">
            <v-text-field-with-validation
              v-model="reason"
              :label="label"
              class="full-width"
              :rules="{ max: { length: 255 } }" />
          </v-col>
        </v-form>
      </ValidationObserver>
    </div>
  </rc-dialog>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextFieldWithValidation,
} from '@crctech/component-library';
import { VForm } from '@/types';
import { EEventStatus } from '@/entities/event';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import colors from '@/ui/plugins/vuetify/colors';

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
