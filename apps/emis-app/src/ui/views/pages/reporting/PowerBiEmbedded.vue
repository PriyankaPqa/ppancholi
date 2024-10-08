<template>
  <div class="pa-4 full-height full-width dataTable__container elevation-2">
    <v-card class="full-width">
      <rc-data-table-header
        v-bind="headerOptions"
        :labels="{ title }"
        :show-help="false"
        :hide-search="true">
        <template v-if="!slicerQry" #headerLeft>
          <div>
            <v-btn
              elevation="0"
              color="transparent"
              data-test="back-button"
              @click="$router.go(-1)">
              <v-icon color="primary">
                mdi-arrow-left
              </v-icon>
              {{ $t('common.buttons.back') }}
            </v-btn>
          </div>
          <v-divider vertical class="mx-4" />
        </template>
        <template v-if="canShare" #headerRight>
          <v-divider vertical class="mx-4" />
          <div>
            <v-btn class="primary" @click="extractReportStateToLink()">
              {{ $t('report.pbi.copyLink') }}
            </v-btn>
          </div>
        </template>
      </rc-data-table-header>
      <div class="full-height-minus-header full-width">
        <div :key="$route.fullPath" class="full-height full-width">
          <div id="powerBiContainer" class="full-height full-width" />
        </div>
      </div>
    </v-card>
    <rc-dialog
      v-if="showAssessmentFilter"
      :title="$t('report.pbi.pleaseFilterForAssessment')"
      :show.sync="showAssessmentFilter"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.buttons.ok')"
      :submit-button-disabled="!selectedAssessment"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :max-width="750"
      :min-height="300"
      content-padding="5"
      data-test="assessment-dialog"
      @cancel="$router.back()"
      @close="$router.back()"
      @submit="applyAssessmentFilter">
      <div class="px-16 mx-8">
        <v-row>
          <v-col cols="12">
            <events-selector
              v-model="selectedEvent"
              async-mode
              return-object
              data-test="event_name_select"
              fetch-all-events
              :attach="false"
              :label="`${$t('report.pbi.eventSelection')} *`"
              @change="loadAssessmentList($event)" />
            <v-select-with-validation
              v-model="selectedAssessment"
              data-test="assessment_name"
              :attach="false"
              :items="assessments"
              :item-value="(item) => item"
              :item-text="(item) => $m(item.name)"
              :label="`${$t('report.pbi.assessmentSelection')} *`" />
          </v-col>
        </v-row>
      </div>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as pbi from 'powerbi-client';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IPowerBiTokenDetails, IQuery, QueryType } from '@libs/entities-lib/reporting';
import { RcDataTableHeader, RcDialog } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import componentHelpers from '@libs/component-lib/helpers';
import { UserRoles } from '@libs/entities-lib/user';
import { IEventSummary } from '@libs/entities-lib/event';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { EFilterKeyType } from '@libs/component-lib/types';
import { ReportingPages } from './reportingPages';
import { AllPbiReports, AssessmentPbiL6En, GeographicEmailMapL6En } from './standard_queries/PowerBiEmbedded';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-loop-func */
export default Vue.extend({
  name: 'PowerBiEmbedded',

  components: {
    RcDataTableHeader,
    RcDialog,
  },

  props: {
    queryId: {
      type: String,
      required: true,
    },
    queryTypeName: {
      type: String,
      required: true,
    },
    slicerQry: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      token: null as IPowerBiTokenDetails,
      report: null as pbi.Report,
      headerOptions: {
        color: 'primary darken-1',
        dark: true,
        height: 56,
      },
      showAssessmentFilter: false,
      selectedEvent: null as IEventSummary,
      assessments: [] as IAssessmentFormEntity[],
      selectedAssessment: null as IAssessmentFormEntity,
      loadTry: 0,
    };
  },

  computed: {
    queryType(): QueryType {
      return ReportingPages.queryTypeByName(this.queryTypeName, this.$i18n.locale);
    },

    query(): IQuery {
      return AllPbiReports.find((r) => r.id === this.queryId && r.queryType === this.queryType);
    },

    title(): string {
      return ReportingPages.titleForQuery(this.query, this);
    },

    canShare(): boolean {
      return this.$hasLevel(UserRoles.level6) && [GeographicEmailMapL6En.id].indexOf(this.query?.id) > -1;
    },

    isAssessmentReport(): boolean {
      return [AssessmentPbiL6En.id].indexOf(this.query?.id) > -1;
    },
  },

  watch: {
    async $route() {
      // to rebind language
      await helpers.timeout(200);
      await this.loadReport();
    },
  },

  async mounted() {
    await this.loadReport();
    await this.addA11yAttribute();
  },

  methods: {
    async loadReport() {
      this.token = await this.$services.queries.getPowerBiTokenForReport(this.queryId + this.$i18n.locale);
      this.embedPowerBIReport();
    },

    async extractReportStateToLink() {
      const page = this.report as pbi.Visual;
      const visual = (await (await page.getActivePage()).getVisuals()).filter((x) => x.type === 'slicer');
      const slicers = [];
      let hasError = false;
      for (let i = 0; i < visual.length; i += 1) {
        slicers.push(await visual[i].getSlicerState());
        // tests that the slicer state is usable
        await visual[i].setSlicerState(slicers[i]).catch((e) => {
          hasError = true;
          console.log(e);
          this.$toasted.global.error(this.$t('report.pbi.filterInvalid'));
        });
        if (hasError) {
          return;
        }
      }

      const link = `${window.location.href.replace('/reporting/', '/link/')}/${btoa(JSON.stringify(slicers))}`;

      navigator.clipboard.writeText(link)
        .then(() => this.$toasted.global.info(this.$t('report.pbi.copied')))
        .catch(() => this.$toasted.global.error(this.$t('report.pbi.copyError')));
    },

    async applyReportStateFromLink(resetLoadTry = true) {
      if (resetLoadTry) {
        this.loadTry = 0;
      }
      try {
        this.loadTry += 1;
        const page = await this.report.getActivePage();
        const visual = (await page.getVisuals()).filter((x) => x.type === 'slicer');
        const states = JSON.parse(atob(this.slicerQry)) as pbi.models.ISlicerState[];

        for (let i = 0; i < visual.length; i += 1) {
          if (states[i]) {
            await visual[i].setSlicerState(states[i]).catch((e) => {
              // we allow for 10 retries... shouldnt happen but dont want to loop indefinitely
              if (e.message === 'slicerTargetDoesNotMatch' && this.loadTry < 10) {
                setTimeout(() => this.applyReportStateFromLink(false), 1000);
                console.log('Loaded too quickly.  Waiting 1s');
              } else {
                applicationInsights.trackException(e, { states, current: states[i] }, 'PowerBiEmbedded.vue', 'applySlicer');
                throw e;
              }
            });
          }
        }
      } catch (e) {
        this.$toasted.global.error(this.$t('report.pbi.linkInvalid'));
        console.error('applySlicer error', e);
        applicationInsights.trackException(e, {}, 'PowerBiEmbedded.vue', 'applySlicer');
      }
    },

    embedPowerBIReport() {
      const permissions = pbi.models.Permissions.Read;
      const settings = {
          filterPaneEnabled: true,
          navContentPaneEnabled: false,
          localeSettings: {
            language: this.$i18n.locale === 'fr' ? 'fr-ca' : 'en-ca',
          },
        } as pbi.models.ISettings;
      if (this.isAssessmentReport) {
        settings.customLayout = { displayOption: pbi.models.DisplayOption.FitToWidth };
        settings.layoutType = pbi.models.LayoutType.Custom;
      }
      const config: pbi.IEmbedConfiguration = {
        type: 'report',
        tokenType: pbi.models.TokenType.Embed,
        accessToken: this.token.embedToken.token,
        embedUrl: this.token.embedReport[0].embedUrl,
        id: this.token.embedReport[0].reportId,
        permissions,
        settings,
        pageName: this.token.embedReport[0].reportPageId,
      };

      const powerbi = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory,
      );
      const reportContainer = document.getElementById('powerBiContainer');

      this.report = powerbi.embed(reportContainer, config) as pbi.Report;
      this.report.on('error', (e) => {
        this.$toasted.global.error(this.$t('report.pbi.generalError'));
        console.error('error', e);
        applicationInsights.trackException(e, { token: this.embedPowerBIReport, queryId: this.queryId }, 'PowerBiEmbedded.vue', 'embedPowerBIReport');
      });
      this.report.on('loaded', () => {
        if (this.slicerQry) {
          setTimeout(() => this.applyReportStateFromLink(), 1000);
        }
        this.showAssessmentFilterDialog();
      });
    },

    showAssessmentFilterDialog() {
      if (this.isAssessmentReport) {
        this.selectedAssessment = null;
        this.selectedEvent = null;
        this.showAssessmentFilter = true;
      }
    },

    async loadAssessmentList(event: IEventSummary) {
      this.assessments = event ? (await this.$services.assessmentForms.search({
        filter: {
          'Entity/EventId': { value: event.id, type: EFilterKeyType.Guid },
        },
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      })).value.map((x) => x.entity) : [];
      this.selectedAssessment = null;
    },

    async applyAssessmentFilter(resetLoadTry = true) {
      if (this.selectedEvent && this.selectedAssessment) {
        if (resetLoadTry) {
          this.loadTry = 0;
        }
        try {
          this.loadTry += 1;
          const page = await this.report.getActivePage();
          const visual = (await page.getVisuals()).filter((x) => x.type !== 'slicer')[0];
          const filters = (await visual.getFilters()).filter((x) => ['EventNameEn', 'EventNameFr', 'AssessmentNameEn', 'AssessmentNameFr']
            .indexOf((x.target as pbi.models.IFilterColumnTarget)?.column) === -1);
          filters.push(
            {
              $schema: 'http://powerbi.com/product/schema#advanced',
              target: { table: 'AssessmentResponseHorizontal', column: `EventName${this.$i18n.locale === 'fr' ? 'Fr' : 'En'}` },
              filterType: pbi.models.FilterType.Advanced,
              displaySettings: { isHiddenInViewMode: false },
              logicalOperator: 'And',
              conditions: [{ operator: 'Is', value: this.$m(this.selectedEvent.name) }],
            } as pbi.models.IFilter,
            {
              $schema: 'http://powerbi.com/product/schema#advanced',
              target: { table: 'AssessmentResponseHorizontal', column: `AssessmentName${this.$i18n.locale === 'fr' ? 'Fr' : 'En'}` },
              filterType: pbi.models.FilterType.Advanced,
              displaySettings: { isHiddenInViewMode: false },
              logicalOperator: 'And',
              conditions: [{ operator: 'Is', value: this.$m(this.selectedAssessment.name) }],
            } as pbi.models.IFilter,
          );
          await visual.setFilters(filters).catch((e) => {
              // we allow for 10 retries... shouldnt happen but dont want to loop indefinitely
              if (this.loadTry < 10) {
                setTimeout(() => this.applyAssessmentFilter(false), 1000);
                console.log('Loaded too quickly.  Waiting 1s');
              } else {
                applicationInsights.trackException(e, { filters }, 'PowerBiEmbedded.vue', 'applyAssessmentFilter');
                throw e;
              }
            });
          this.showAssessmentFilter = false;
        } catch (e) {
          this.$toasted.global.error(this.$t('report.pbi.generalError'));
          console.error('applyAssessmentFilter error', e);
          applicationInsights.trackException(e, {}, 'PowerBiEmbedded.vue', 'applyAssessmentFilter');
        }
      }
    },

    addA11yAttribute() {
      setTimeout(() => {
        componentHelpers.setElementA11yAttribute('iframe', 'aria-label', 'iframe');
      }, 1000);
    },
  },
});
</script>

<style scoped lang="scss">
.full-height-minus-header {
  height: calc(100% - 56px) !important;
  min-height: calc(100% - 56px) !important;
  display: flex !important;
}
</style>
