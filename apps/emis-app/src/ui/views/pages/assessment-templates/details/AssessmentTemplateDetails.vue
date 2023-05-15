<template>
  <rc-page-content :title="$t('assessmentTemplateDetails.title')">
    <div v-if="assessmentTemplate">
      <v-row class="justify-center mt-10">
        <v-col cols="12" lg="7">
          <div class="pb-4 d-flex justify-space-between">
            <h3>
              {{ $m(assessmentTemplate.name) }}
            </h3>
            <div>
              <status-chip data-test="assessmentTemplate_details_status" status-name="Status" :status="assessmentTemplate.status" class="mr-4" />
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    icon
                    :to="assessmentTemplateEditRoute"
                    bottom
                    data-test="editAssessmentTemplate-link"
                    v-on="on">
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('assessmentTemplate.edit.title') }}</span>
              </v-tooltip>
            </div>
          </div>
          <div class="grey-container mb-6">
            <v-simple-table class="grey-container">
              <tbody>
                <tr>
                  <td class="label fw-bold">
                    {{ $t('assessmentTemplate.published') }}
                  </td>
                  <td class="data fw-bold text-right">
                    {{ $t(`enums.assessmentPublishStatus.${PublishStatus[assessmentTemplate.publishStatus]}`) }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
          <v-sheet rounded outlined class="mb-6">
            <v-simple-table>
              <tbody>
                <tr
                  v-for="item in assessmentTemplateData"
                  :key="item.test"
                  :data-test="`assessmentTemplate_details_${item.test}`">
                  <td class="label fw-bold">
                    {{ $t(item.label) }}
                  </td>
                  <td class="data">
                    {{ item.data }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-sheet>

          <v-sheet rounded outlined>
            <v-simple-table class="scoring-table" data-test="scoring-table">
              <thead>
                <tr>
                  <th width="150px">
                    {{ $t('assessmentTemplate.minValue') }}
                  </th>
                  <th width="150px">
                    {{ $t('assessmentTemplate.maxValue') }}
                  </th>
                  <th>
                    {{ $t('assessmentTemplate.stepLabel') }}
                  </th>
                  <th>
                    {{ $t('assessmentTemplate.restrictFinancial') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(scoringRange, $index) in assessmentTemplate.scoringRanges"
                  :key="$index"
                  :data-test="`scoringRange${$index}`">
                  <td>
                    {{ scoringRange.minValue }}
                  </td>
                  <td>
                    {{ scoringRange.maxValue }}
                  </td>
                  <td>
                    {{ $m(scoringRange.label) }}
                  </td>
                  <td>
                    {{ scoringRange.restrictFinancial ? $t('common.yes') : '' }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-sheet>
        </v-col>
      </v-row>
    </div>
    <template slot="actions">
      <v-btn data-test="assessmentTemplate_details_back_btn" @click="goToAssessmentTemplates()">
        {{ $t('assessmentTemplateDetails.back_to_assessmentTemplates') }}
      </v-btn>
      <v-btn color="primary" data-test="assessmentTemplate_details_editor_btn" @click="goToEditor()">
        {{ $t('assessmentTemplate.gotoEditor') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAssessmentTotalSubmissions } from '@libs/entities-lib/src/assessment-template/assessment-template.types';
import assessmentDetail from './assessmentDetail';

export default mixins(assessmentDetail).extend({
  name: 'AssessmentTemplateDetails',

  components: {
    RcPageContent,
    StatusChip,
  },

  data() {
    return {
      assessmentTotalSubmissions: null as IAssessmentTotalSubmissions,
    };
  },

  computed: {
    assessmentTemplateData(): Record<string, any>[] {
      const data = [
        {
          label: 'common.description',
          data: this.$m(this.assessmentTemplate.description),
          test: 'description',
        },
        {
          label: 'assessmentTemplate.savePartialSurveyResults',
          // eslint-disable-next-line no-nested-ternary
          data: this.assessmentTemplate.savePartialSurveyResults != null
            ? (this.assessmentTemplate.savePartialSurveyResults ? this.$t('common.yes') : this.$t('common.no')) : null,
          test: 'savePartialSurveyResults',
        },
        {
          label: 'assessmentTemplate.frequency',
          data: this.assessmentTemplate.frequency != null ? this.$t(`enums.assessmentFrequencyType.${this.Frequency[this.assessmentTemplate.frequency]}`) : null,
          test: 'frequency',
        },
        {
          label: 'assessmentTemplate.messageIfUnavailable',
          data: this.$m(this.assessmentTemplate.messageIfUnavailable),
          test: 'messageIfUnavailable',
        },
      ] as Record<string, any>[];

      if (this.assessmentForm) {
        data.splice(3, 0, {
          label: 'assessmentTemplate.totalAssigned',
          data: this.assessmentTotalSubmissions?.totalAssigned,
          test: 'totalAssigned',
        }, {
          label: 'assessmentTemplate.totalSubmissionsCompleted',
          data: this.assessmentTotalSubmissions?.totalCompleted,
          test: 'totalSubmissionsCompleted',
        }, {
          label: 'assessmentTemplate.totalSubmissionsPartialCompleted',
          data: this.assessmentTotalSubmissions?.totalPartialCompleted,
          test: 'totalSubmissionsPartialCompleted',
        });
      }

      if (this.program) {
        data.unshift({
          label: 'assessmentTemplate.program',
          data: this.$m(this.program.name),
          test: 'program',
        });
      }
      return data;
    },

    assessmentTemplateEditRoute(): { name: string, params: Record<string, string> } {
      return {
        name: this.baseRoute.edit.name,
        params: {
          assessmentTemplateId: this.assessmentTemplateId,
        },
      };
    },

  },

  async created() {
    await this.loadDetails();
    if (this.assessmentForm) {
      await this.getAssessmentTotalSubmissions();
    }
  },

  methods: {
    goToAssessmentTemplates() {
      this.$router.push({
        name: this.baseRoute.home.name,
      });
    },

    goToEditor() {
      const routeData = this.$router.resolve({
        name: this.baseRoute.builder.name,
        params: {
          assessmentTemplateId: this.assessmentTemplateId,
          id: this.eventId,
        },
      });
      window.open(routeData.href, '_blank');
    },

    async getAssessmentTotalSubmissions() {
      const response = await this.$services.assessmentForms.assessmentTotalSubmissions(this.assessmentTemplateId);
      this.assessmentTotalSubmissions = response;
    },
  },
});
</script>
