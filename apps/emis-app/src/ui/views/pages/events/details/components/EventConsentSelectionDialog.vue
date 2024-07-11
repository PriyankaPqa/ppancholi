<template>
  <validation-observer ref="form" slim>
    <rc-dialog
      :title="$t('eventSummary.selectEventConsent')"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :content-only-scrolling="true"
      :loading="loading"
      :persistent="true"
      fullscreen
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container fluid>
        <v-row justify="center">
          <v-col md="4" sm="12" class="pr-8">
            <v-row
              v-for="item in statements"
              :key="item.id"
              :class="{ selected: item.id === selectedStatement.id }"
              class="list-row">
              <v-col class="d-flex justify-space-between" :data-test="`consent-statement-select_${item.name.translation.en}`">
                {{ $m(item.name) }}
                <v-btn
                  class="btn"
                  :class="{ secondary: item.id === selectedStatement.id }"
                  :data-test="`consent-statement-select_btn_${item.name.translation.en}`"
                  @click="selectedStatement = item">
                  {{ item.id === selectedStatement.id ? $t('common.selected') : $t('common.select') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col md="8" sm="12">
            <language-tabs :language="languageMode" @click="setLanguageMode" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="selectedStatement" class="rc-body14 consent" data-test="selected-consent-statement" v-html="sanitizeHtml(selectedStatementText)" />
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';

import { EEventSummarySections } from '@/types';
import { VForm } from '@libs/shared-lib/types';
import sanitizeHtml from 'sanitize-html';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { RcDialog } from '@libs/component-lib/components';
import { IConsentStatementData } from '@libs/entities-lib/tenantSettings';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';

export default Vue.extend({
  name: 'EventConsentSelectionDialog',
  components: {
    RcDialog, LanguageTabs,
  },

  props: {
    event: {
      type: Object as () => IEventEntity,
      required: true,
    },
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      sanitizeHtml,
      languageMode: 'en',
      statements: [] as IConsentStatementData[],
      selectedStatement: null as IConsentStatementData,
      defaultStatement: {
        id: null,
        name: {
          translation: {
            en: this.$t('eventSummary.defaultConsentName', 'en'),
            fr: this.$t('eventSummary.defaultConsentName', 'fr'),
          },
        },
        statement: {
          translation: {
            en: this.$t('registration.privacy_consent_formatted', 'en'),
            fr: this.$t('registration.privacy_consent_formatted', 'fr'),
          },
        },
      } as IConsentStatementData,
      loading: false,
    };
  },

  computed: {
    selectedStatementText(): string {
      return this.selectedStatement.statement.translation[this.languageMode].replaceAll(
        '{website}',
        `<a href="${this.$t('registration.privacy_statement.website', this.languageMode)}" target="_blank" rel="noopener noreferrer">${
          this.$t('registration.privacy_statement.website', this.languageMode)}</a>`,
      )?.replaceAll(
        '{email}',
        `<a href="mailto:${this.$t('registration.privacy_statement.email', this.languageMode)}">${
          this.$t('registration.privacy_statement.email', this.languageMode)}</a>`,
      );
    },
  },

  async created() {
    this.statements = [this.defaultStatement, ...(useTenantSettingsStore().currentTenantSettings.consentStatements || [])];

    this.selectedStatement = this.statements.find((a) => a.id === this.event?.consentStatementId) || this.defaultStatement;
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.event.consentStatementId = this.selectedStatement.id;
        if (this.event.id) {
          try {
            this.loading = true;
            await useEventStore().updateEventConsent({
              eventId: this.event.id,
              consentStatementId: this.selectedStatement.id,
              section: EEventSummarySections.EventConsent,
            });
          } finally {
            this.loading = false;
          }
        }
        this.$emit('close');
      }
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
    },
  },
});

</script>

<style lang="scss">
.consent {
  white-space: pre-line;
  text-align: justify;

  ul > li {
    list-style-type: disc;
  }
}
</style>
