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
            <h5 class="rc-heading-5">
              {{ $m(program.name) }}
            </h5>

            <div>
              <status-chip status-name="Status" :status="program.status" />
              <v-btn class="ml-4" icon data-test="edit-button" :to="getEditRoute()">
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

                  <span>
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
                    small>
                    {{ getEligibilityIcon(program.eligibilityCriteria.authenticated) }}
                  </v-icon>
                  {{ $t('event.programManagement.needAuthenticated') }}
                </div>

                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.impacted)"
                    small>
                    {{ getEligibilityIcon(program.eligibilityCriteria.impacted) }}
                  </v-icon>
                  {{ $t('event.programManagement.needImpacted') }}
                </div>

                <div>
                  <v-icon
                    class="mr-1"
                    :color="getEligibilityIconColor(program.eligibilityCriteria.completedAssessments)"
                    small>
                    {{ getEligibilityIcon(program.eligibilityCriteria.completedAssessments) }}
                  </v-icon>
                  {{ $t('event.programManagement.hasCompletedAssessments') }}
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
                    small>
                    {{ getEligibilityIcon(program.approvalRequired) }}
                  </v-icon>
                  {{ $t('event.programManagement.approvalRequired') }}
                </div>
              </v-col>
            </v-row>

            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5">
                {{ $t('event.programManagement.programDescription.title') }}
              </v-col>

              <v-col class="rc-body14 pre-formatted" cols="12" md="7">
                {{ $m(program.description) }}
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col class="mt-4" cols="12" md="10">
          <h5 class="rc-heading-5">
            {{ $t('event.programManagement.financialAssistance') }} ({{ financialAssistanceTables.length }})
          </h5>
        </v-col>

        <v-col cols="12" md="10">
          <v-container>
            <v-row v-if="financialAssistanceTables.length === 0" class="list-row">
              <v-col data-test="no-financialAssistance" class="rc-body14 fw-bold disabled" cols="12">
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
          <h5 class="rc-heading-5">
            {{ $t('event.programManagement.assessments.title') }} (0)
          </h5>
        </v-col>

        <v-col class="disabled" cols="12" md="10">
          <v-container>
            <v-row class="list-row">
              <v-col class="rc-body14 fw-bold" cols="12" md="5">
                {{ $t('event.programManagement.noAssessments') }}
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
import { EPaymentModalities, IProgramEntity } from '@/entities/program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import routes from '@/constants/routes';
import { IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';

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
    };
  },

  computed: {
    program(): IProgramEntity {
      return this.$storage.program.getters.get(this.programId).entity;
    },
  },

  async created() {
    this.loading = true;

    try {
      const program = this.$storage.program.getters.get(this.programId);
      if (!program?.entity?.id) {
        await this.$storage.program.actions.fetch({ id: this.programId, eventId: this.id });
      }

      this.financialAssistanceTables = await this.$storage.financialAssistance.actions.fetchByProgramId(this.programId);
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

<style scoped lang="scss">
.disabled {
  opacity: 0.6;
}
</style>
