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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as pbi from 'powerbi-client';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IPowerBiTokenDetails, IQuery, QueryType } from '@libs/entities-lib/reporting';
import { RcDataTableHeader } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { UserRoles } from '@libs/entities-lib/user';
import { ReportingPages } from './reportingPages';
import { AllPbiReports, GeographicEmailMapL6En } from './standard_queries/PowerBiEmbedded';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-loop-func */
export default Vue.extend({
  name: 'PowerBiEmbedded',

  components: {
    RcDataTableHeader,
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
  },

  watch: {
    async $route() {
      // to rebind language
      await helpers.timeout(200);
      await this.loadReport();
    },
  },

  mounted() {
    this.loadReport();
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

    async applyReportStateFromLink() {
      try {
        let tryNb = 0;
        const page = await this.report.getActivePage();
        const visual = (await page.getVisuals()).filter((x) => x.type === 'slicer');
        const states = JSON.parse(atob(this.slicerQry)) as pbi.models.ISlicerState[];

        for (let i = 0; i < visual.length; i += 1) {
          if (states[i]) {
            await visual[i].setSlicerState(states[i]).catch((e) => {
              // we allow for 10 retries... shouldnt happen but dont want to loop indefinitely
              if (e.message === 'slicerTargetDoesNotMatch' && tryNb < 10) {
                setTimeout(() => this.applyReportStateFromLink(), 1000);
                tryNb += 1;
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

    async embedPowerBIReport() {
      const permissions = pbi.models.Permissions.Read;
      const config: pbi.IEmbedConfiguration = {
        type: 'report',
        tokenType: pbi.models.TokenType.Embed,
        accessToken: this.token.embedToken.token,
        embedUrl: this.token.embedReport[0].embedUrl,
        id: this.token.embedReport[0].reportId,
        permissions,
        settings: {
          filterPaneEnabled: true,
          navContentPaneEnabled: false,
          localeSettings: {
            language: this.$i18n.locale === 'fr' ? 'fr-ca' : 'en-ca',
          },
        },
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
      });
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
