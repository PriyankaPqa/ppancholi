<template>
  <rc-dialog
    :title="$t('error.system.dialog.title')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    max-width="800"
    min-height="450"
    persistent
    :show-submit="false"
    @close="close"
    @cancel="close">
    <div class="pa-8">
      <v-row class="flex-row full-width ma-0 pa-0">
        <v-row class="row full-width rc-body14 pt-2" no-gutters>
          <v-row>
            <div>
              <v-icon size="48" color="secondary" class="pr-4 align-self-start">
                mdi-alert-outline
              </v-icon>
            </div>
            <v-col cols="8" class="rc-body18 fw-bold" data-test="confirmation-errorRegistration-errorTitle">
              {{ $t('error.system.dialog.title') }}
            </v-col>
          </v-row>
          <v-col class="col pl-16" cols="12">
            <div class="mt-2" data-test="confirmation-errorRegistration-errorMessage">
              <span style="white-space: pre-line" class="rc-body14">
                {{ $t('error.system.dialog.content') }}
              </span>
              <ul class="mt-2">
                <li v-for="index in 3" :key="index">
                  {{ $t(`error.system.dialog.example.${index}`) }}
                </li>
              </ul>
            </div>

            <div class="mt-7">
              {{ $t('error.system.dialog.pleaseClose') }} {{ isCRCRegistration? $t('error.system.dialog.contactManager'):$t('error.system.dialog.contactRedCross') }}
            </div>

            <div v-if="!isCRCRegistration && phone" class="fw-bold rc-body18">
              <rc-phone-display :value="phone" />
            </div>
          </v-col>
        </v-row>
      </v-row>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, RcPhoneDisplay } from '@libs/component-lib/components';

export default Vue.extend({
  name: 'ApprovalHistoryDialog',

  components: {
    RcDialog,
    RcPhoneDisplay,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },

  },

  computed: {
    isCRCRegistration(): boolean {
      return this.$storage.registration.getters.isCRCRegistration();
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },
  },
});

</script>
