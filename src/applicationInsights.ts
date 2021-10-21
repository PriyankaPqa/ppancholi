import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import Vue from 'vue';
import VueRouter from 'vue-router';

export interface ApplicationInsightsOptions {
  router: VueRouter,
  connectionString: string,
  appName: string,
}

const install = (vue: typeof Vue, options: ApplicationInsightsOptions) => {
  const { connectionString, router, appName } = options;

  // Config options: https://docs.microsoft.com/en-us/azure/azure-monitor/app/javascript#configuration
  const appInsights = new ApplicationInsights({
    config: {
      connectionString,
      // If true, Fetch requests are not autocollected. This is verbose yet very useful in debugging issues.
      disableFetchTracking: false,
      // Enable Request-ID and Request-Context headers needed to correlate API calls
      enableCorsCorrelation: true,
      // If true, AJAX & Fetch request headers is tracked. Required for proper correlation.
      enableRequestHeaderTracking: true,
      // If true, AJAX & Fetch request's response headers is tracked. Required for proper correlation.
      enableResponseHeaderTracking: true,
    },
  });
  appInsights.loadAppInsights();

  // We intercept the error from vue to send it to application insights; then rethrow normally.
  vue.config.errorHandler = (err) => {
    appInsights.trackException({ exception: err, properties: {} });
    throw err;
  };

  // This is needed to track the initial page load.
  appInsights.trackPageView({
    name: `${appName} - Initial Page Load`,
  });

  // Register middleware to create new operation when changing page.
  // https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach((to, _from, next) => {
    appInsights.flush();
    appInsights.context.telemetryTrace.traceID = Util.generateW3CId();
    appInsights.trackPageView({
      name: `${appName} - ${to.name}`,
    });
    next();
  });
};

export default install;
