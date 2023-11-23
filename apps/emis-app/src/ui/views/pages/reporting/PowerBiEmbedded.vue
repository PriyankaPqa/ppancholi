<template>
  <div class="pa-4 full-height full-width dataTable__container elevation-2">
    <v-card class="full-width">
      <rc-data-table-header
        v-bind="headerOptions"
        :labels="{ title }"
        :show-help="false"
        :hide-search="true">
        <template #headerLeft>
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
import { ReportingPages } from './reportingPages';
import { AllPbiReports } from './standard_queries/PowerBiEmbedded';

export default Vue.extend({
  name: 'ReportingHome',

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
  },

  data() {
    return {
      token: null as IPowerBiTokenDetails,
      report: null as pbi.Embed,
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

      this.report = powerbi.embed(reportContainer, config);
      this.report.on('error', (e) => {
        // eslint-disable-next-line no-console
        console.error('error', e);
        applicationInsights.trackException(e, { token: this.embedPowerBIReport, queryId: this.queryId }, 'PowerBiEmbedded.vue', 'embedPowerBIReport');
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
