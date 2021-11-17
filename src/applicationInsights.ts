import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import Vue from 'vue';
import VueRouter from 'vue-router';

export interface ApplicationInsightsOptions {
  connectionString: string,
  appName: string,
  router: VueRouter,
}

class AppInsights {
  private instance: ApplicationInsights;

  public getInstance(): ApplicationInsights | undefined {
    return this.instance;
  }

  public initialize(options: ApplicationInsightsOptions) {
    this.instance = new ApplicationInsights({
      config: {
        connectionString: options.connectionString,
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
    this.instance.loadAppInsights();

    // This is needed to track the initial page load.
    this.instance.trackPageView({
      name: `${options.appName} - Initial Page Load`,
    });

    Vue.use(this, options);
  }

  public install(vue: typeof Vue, options: ApplicationInsightsOptions) {
    try {
      this.performInstall(vue, options);
    } catch (error) {
      /* eslint-disable no-console */
      console.error(error);
    }
  }

  private performInstall(vue: typeof Vue, options: ApplicationInsightsOptions) {
    const { appName, router } = options;

    // We intercept the error from vue to send it to application insights; then rethrow normally.
    vue.config.errorHandler = (err) => {
      this.instance.trackException({ exception: err, properties: {} });
      throw err;
    };

    // Register middleware to create new operation when changing page.
    // https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
    router.beforeEach((to, _from, next) => {
      this.instance.flush();
      this.instance.context.telemetryTrace.traceID = Util.generateW3CId();
      this.instance.trackPageView({
        name: `${appName} - ${to.name}`,
      });
      next();
    });
  }

  public trackException(error: Error, properties: Record<string, unknown> = {}) {
    this.getInstance()?.trackException({ exception: error, properties });
  }
}

export default new AppInsights();
