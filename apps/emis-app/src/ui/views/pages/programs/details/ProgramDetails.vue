<template>
  <rc-page-content
    :outer-scroll="true"
    :title="$t('event.programManagement.ProgramDetails')"
    :show-help="false"
    :help-link="$t('zendesk.help_link.view_programs_list')">
    <rc-page-loading v-if="loading" />
    <v-container v-else>
      <v-row justify="center">
        <v-col class="mt-10" cols="12" md="10">
          <div class="flex-row justify-space-between">
            <div class="rc-heading-5" data-test="program-details-name">
              {{ $m(program.name) }}
            </div>

            <div>
              <status-chip status-name="Status" :status="program.status" data-test="program-details-status" />
              <v-btn class="ml-4" icon data-test="edit-button" :aria-label="$t('common.edit')" :to="getEditRoute()">
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="10">
          <v-container>
            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5">
                {{ $t('event.programManagement.paymentModalities.title') }}
              </v-col>

              <v-col class="rc-body14" cols="12" md="7">
                <span
                  v-for="modality in program.paymentModalities"
                  :key="modality"
                  class="mr-4">
                  <v-icon class="mr-1" color="status_success" small>
                    mdi-check-circle
                  </v-icon>

                  <span data-test="program-details-payment-modality">
                    {{ getTranslatedPaymentModality(modality) }}
                  </span>
                </span>
              </v-col>
            </v-row>

            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5">
                {{ $t('event.programManagement.eligibilityCriteria') }}
              </v-col>

              <v-col class="rc-body14" cols="12" md="7">
                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.authenticated)"
                    small
                    data-test="program-details-icon-eligibilityCriteria-authenticated">
                    {{ getEligibilityIcon(program.eligibilityCriteria.authenticated) }}
                  </v-icon>
                  {{ $t('event.programManagement.needAuthenticated') }}
                </div>

                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.impacted)"
                    small
                    data-test="program-details-icon-eligibilityCriteria-impacted">
                    {{ getEligibilityIcon(program.eligibilityCriteria.impacted) }}
                  </v-icon>
                  {{ $t('event.programManagement.needImpacted') }}
                </div>

                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.completedAssessments)"
                    small
                    data-test="program-details-icon-eligibilityCriteria-completedAssessments">
                    {{ getEligibilityIcon(program.eligibilityCriteria.completedAssessments) }}
                  </v-icon>
                  {{ $t('event.programManagement.hasCompletedAssessments') }}
                </div>

                <div
                  v-for="requiredAssessmentForm in requiredAssessmentForms"
                  :key="requiredAssessmentForm.id"
                  class="ml-6 mr-4"
                  data-test="program-details-eligibilityCriteria-assessment-name">
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.completedAssessments)"
                    x-small>
                    mdi-circle
                  </v-icon>
                  {{ getRequiredAssessmentFormName(requiredAssessmentForm) }}
                </div>
              </v-col>
            </v-row>

            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5" />

              <v-col class="rc-body14" cols="12" md="7">
                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.approvalRequired)"
                    small
                    data-test="program-details-icon-approvalRequired">
                    {{ getEligibilityIcon(program.approvalRequired) }}
                  </v-icon>
                  {{ $t('event.programManagement.approvalRequired') }}
                </div>

                <div v-if="$hasFeature($featureKeys.Lodging)" data-test="program-details-div-useForLodging">
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.useForLodging)"
                    small
                    data-test="program-details-icon-useForLodging">
                    {{ getEligibilityIcon(program.useForLodging) }}
                  </v-icon>
                  {{ $t('event.programManagement.setAsLodging') }}
                </div>
              </v-col>
            </v-row>

            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5">
                {{ $t('event.programManagement.programDescription.title') }}
              </v-col>

              <v-col class="rc-body14 pre-formatted" cols="12" md="7" data-test="program-details-description">
                {{ $m(program.description) }}
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col class="mt-4" cols="12" md="10">
          <div class="rc-heading-5" data-test="program-details-financialAssistanceTables-title">
            {{ $t('event.programManagement.financialAssistance') }} ({{ financialAssistanceTables.length }})
          </div>
        </v-col>

        <v-col cols="12" md="10">
          <v-container>
            <v-row v-if="financialAssistanceTables.length === 0" class="list-row">
              <v-col data-test="no-financialAssistance" class="rc-body14 fw-bold rc-grey-text" cols="12">
                {{ $t('event.programManagement.noFinancialAssistance') }}
              </v-col>
            </v-row>
            <v-row v-for="(fa, index) in financialAssistanceTables" :key="fa.id" class="list-row">
              <v-col :data-test="`financialAssistance-${index}`" class="rc-body14 fw-bold" cols="12">
                {{ $m(fa.name) }}
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col class="mt-4" cols="12" md="10">
          <div class="rc-heading-5">
            {{ $t('event.programManagement.assessments.title') }} ({{ assessmentIds.length }})
          </div>
        </v-col>

        <v-col cols="12" md="10">
          <v-container>
            <v-row v-if="assessmentIds.length === 0" class="list-row">
              <v-col data-test="no-Assessments" class="rc-body14 fw-bold rc-grey-text" cols="12">
                {{ $t('event.programManagement.noAssessments') }}
              </v-col>
            </v-row>
            <v-row v-for="(assessment, index) in assessments" :key="assessment.id" class="list-row">
              <v-col :data-test="`assessment-${index}`" class="rc-body14 fw-bold" cols="12">
                {{ $m(assessment.name) }}
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <template slot="actions">
      <v-btn color="primary" data-test="cancel" @click.stop="back()">
        {{ $t('event.programManagement.backToPrograms') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcPageContent,
  RcPageLoading,
} from '@libs/component-lib/components';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import routes from '@/constants/routes';

import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/shared-lib/types';
import _sortBy from 'lodash/sortBy';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { useProgramStore } from '@/pinia/program/program';
import { EFilterKeyType } from '@libs/component-lib/types';

export default Vue.extend({
  name: 'ProgramDetails',

  components: {
    RcPageContent,
    RcPageLoading,
    StatusChip,
  },

  props: {
    id: {
      type: String,
      required: true,
    },

    programId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      financialAssistanceTables: [] as IFinancialAssistanceTableEntity[],
      assessmentIds: [] as string[],
    };
  },

  computed: {
    program(): IProgramEntity {
      return useProgramStore().getById(this.programId);
    },

    assessments(): IAssessmentFormEntity[] {
      return useAssessmentFormStore().getByIds(this.assessmentIds);
    },

    requiredAssessmentForms(): IAssessmentFormEntity[] {
      if (this.program.eligibilityCriteria.completedAssessmentIds == null) {
        return [] as IAssessmentFormEntity[];
      }

      return _sortBy(
        useAssessmentFormStore().getByIds(this.program.eligibilityCriteria.completedAssessmentIds),
        (assessmentForm) => this.$m(assessmentForm.name),
      );
    },
  },

  async created() {
    this.loading = true;

    try {
      const program = useProgramStore().getById(this.programId);
      if (!program?.id) {
        await useProgramStore().fetch({ id: this.programId, eventId: this.id });
      }

      this.financialAssistanceTables = await useFinancialAssistanceStore().fetchByProgramId({ programId: this.programId });
      this.assessmentIds = (await useAssessmentFormStore().search({ params: {
        filter: { 'Entity/ProgramId': { value: this.programId, type: EFilterKeyType.Guid } },
        top: 999,
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      },
      includeInactiveItems: true })).ids;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    getTranslatedPaymentModality(modality: EPaymentModalities) {
      return this.$t(`enums.PaymentModality.${EPaymentModalities[modality]}`);
    },

    getEligibilityIcon(checked: boolean) {
      return checked ? 'mdi-check-circle' : 'mdi-minus-circle';
    },

    getEligibilityIconColor(checked: boolean) {
      return checked ? 'status_success' : 'grey-darken-2';
    },

    getRequiredAssessmentFormName(assessmentForm: IAssessmentFormEntity) {
      let name = this.$m(assessmentForm.name);
      if (assessmentForm.status === Status.Inactive) {
        name += ` (${this.$t('enums.Status.Inactive')})`;
      }

      return name;
    },

    getEditRoute() {
      return {
        name: routes.programs.edit.name,
        params: {
          programId: this.programId,
        },
      };
    },

    back() {
      this.$router.replace({
        name: routes.programs.home.name,
      });
    },
  },
});
</script>
