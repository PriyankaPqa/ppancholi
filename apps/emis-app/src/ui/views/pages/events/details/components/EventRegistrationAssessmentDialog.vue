<template>
  <validation-observer ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.save') : $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="530"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="8" md="8" sm="12" class="pr-md-6 pr-xl-6 pr-lg-6 pb-0">
                <v-select-with-validation
                  v-model="selectedAssessment"
                  data-test="registrationAssessment-assessment"
                  :items="assessments"
                  :item-value="(item) => item"
                  :item-text="(item) => item.nameWithStatus"
                  :label="`${$t('eventSummary.registrationAssessment.assessment')}*`"
                  :rules="rules.assessment" />
              </v-col>

              <v-col v-if="selectedAssessment && selectedAssessment.status" cols="4" md="4" sm="12">
                <div>{{ $t('eventSummary.registrationAssessment.assessmentStatus') }}</div>
                <status-chip
                  class="mr-4"
                  status-name="Status"
                  :data-test="'event-assessment-section-status'"
                  :status="selectedAssessment.status" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pb-0">
                <v-text-field-with-validation
                  v-model="sectionTitle.translation[languageMode]"
                  :label="$t('eventSummary.registrationAssessment.sectionTitle') + '*'"
                  :rules="rules.sectionTitle" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pb-0">
                <v-text-area-with-validation
                  v-model="sectionDetails.translation[languageMode]"
                  rows="3"
                  clearable
                  :label="$t('eventSummary.registrationAssessment.description')"
                  :rules="rules.details"
                  @click:clear="clearDescription()" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { TranslateResult } from 'vue-i18n';

import { EEventSummarySections } from '@/types';
import { VForm, IMultilingual } from '@libs/shared-lib/types';
import {
  IRegistrationAssessment,
  IEventEntity,
} from '@libs/entities-lib/event';
import entityUtils from '@libs/entities-lib/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { Status } from '@libs/entities-lib/base';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import VTextFieldWithValidation from '@libs/component-lib/components/atoms/VTextFieldWithValidation.vue';
import { useEventStore } from '@/pinia/event/event';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { VSelectWithValidation, RcDialog, VTextAreaWithValidation } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { EFilterKeyType } from '@libs/component-lib/types';

export default Vue.extend({
  name: 'EventRegistrationAssessmentDialog',
  components: {
    VTextFieldWithValidation, RcDialog, LanguageTabs, VSelectWithValidation, VTextAreaWithValidation, StatusChip,
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
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      languageMode: 'en',
      assessments: [] as (IAssessmentFormEntity & { nameWithStatus?: string })[],
      selectedAssessment: null as IAssessmentFormEntity,
      sectionTitle: {
          translation: {
            en: this.$t('eventSummary.registrationAssessment.defaultTitle'),
            fr: this.$t('eventSummary.registrationAssessment.defaultTitle'),
          },
        } as IMultilingual,
      sectionDetails: {
          translation: {
            en: this.$t('eventSummary.registrationAssessment.defaultDescription'),
            fr: this.$t('eventSummary.registrationAssessment.defaultDescription'),
          },
        } as IMultilingual,
      loading: false,
      Status,
      registrationAssessment: null as IRegistrationAssessment,
    };
  },

  computed: {
    rules():Record<string, unknown> {
      return {
        assessment: {
          required: true,
        },
        sectionTitle: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        details: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    title(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('eventSummary.editRegistrationAssessment');
      }
      return this.$t('eventSummary.addRegistrationAssessment');
    },
  },

  async created() {
    this.loading = true;
    if (this.isEditMode) {
      this.registrationAssessment = this.event.registrationAssessments.find((r) => r.id === this.id);

      if (this.registrationAssessment) {
        this.selectedAssessment = useAssessmentFormStore().getById(this.registrationAssessment.assessmentId);
        this.sectionTitle = _cloneDeep(this.registrationAssessment.sectionTitle);
        this.sectionDetails = _cloneDeep(this.registrationAssessment.details);
      }
    }

    this.assessments = (await this.$services.assessmentForms.search({
      filter: { 'Entity/EventId': { value: this.event.id, type: EFilterKeyType.Guid } },
      orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
    })).value.map((x) => x.entity).filter((a) => (a.status === Status.Active)
      || a.id === this.selectedAssessment?.id);
    this.assessments.forEach((a) => {
      a.nameWithStatus = `${this.$m(a.name)} [${this.$t(`enums.assessmentPublishStatus.${PublishStatus[a.publishStatus]}`)}]`;
    });
    this.selectedAssessment = this.assessments.find((a) => a.id === this.selectedAssessment?.id);
    this.loading = false;
  },

  methods: {
    fillEmptyMultilingualFields() {
      this.sectionTitle = entityUtils.getFilledMultilingualField(this.sectionTitle);
      this.sectionDetails = entityUtils.getFilledMultilingualField(this.sectionDetails);
    },

    clearDescription() {
      this.sectionDetails = entityUtils.initMultilingualAttributes();
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.fillEmptyMultilingualFields();
        this.loading = true;
        await this.submitRegistrationAssessment();
        this.$emit('close');
        this.loading = false;
      }
    },

    async submitRegistrationAssessment() {
      const registrationAssessmentPayload = {
        ...this.registrationAssessment,
        assessmentId: this.selectedAssessment.id,
        sectionTitle: this.sectionTitle,
        details: this.sectionDetails,
       } as IRegistrationAssessment;
      await useEventStore().updateEventSection(
        {
          eventId: this.event.id,
          payload: registrationAssessmentPayload,
          section: EEventSummarySections.RegistrationAssessment,
          action: this.isEditMode ? 'edit' : 'add',
        },
      );
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },
  },
});

</script>
