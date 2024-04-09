/* eslint-disable no-console */
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import Vue from 'vue';
import VueRouter from 'vue-router';

export interface ApplicationInsightsOptions {
  connectionString: string;
  appName: string;
  router: VueRouter;
  excludeRequestFromAutoTrackingPatterns?: string[] | RegExp[];
}

class AppInsights {
  private instance: ApplicationInsights;

  private basicContext: Record<string, unknown> = {};

  public getInstance(): ApplicationInsights | undefined {
    return this.instance;
  }

  public initialize(options: ApplicationInsightsOptions) {
    if (!options?.connectionString) {
      return;
    }
    try {
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

          excludeRequestFromAutoTrackingPatterns: options.excludeRequestFromAutoTrackingPatterns || [],
        },
      });
      this.instance.loadAppInsights();

      // This is needed to track the initial page load.
      this.instance.trackPageView({
        name: `${options.appName} - Initial Page Load`,
      });

      Vue.use(this, options);
    } catch (error) {
      console.error(error);
    }
  }

  public install(vue: typeof Vue, options: ApplicationInsightsOptions) {
    if (!this.instance) {
      return;
    }
    try {
      const { appName, router } = options;

      // We intercept the error from vue to send it to application insights; then rethrow normally.
      vue.config.errorHandler = (err) => {
        this.trackException(err);
        throw err;
      };

      // Register middleware to create new operation when changing page.
      // https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks
      router.afterEach((_to, from) => {
        try {
          this.instance.flush();
          this.instance.context.telemetryTrace.traceID = Util.generateW3CId();
          this.instance.context.telemetryTrace.name = window.location.href;
          this.instance.trackPageView({
            name: `${appName} - ${window.location.href}`,
            refUri: from.fullPath,
          });
        } catch (error) {
          console.error(error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  // eslint-disable-next-line
  public trackException(error: Error | any, properties: Record<string, unknown> = {}, filename = '', methodName = '') {
    console.error(error);
    try {
      if (!this.instance) {
        return;
      }
      this.instance.trackException({ exception: error }, { ...this.getContext(properties), filename, methodName });
    } catch (error) {
      console.error(error);
    }
  }

  public trackTrace(message: string, properties: Record<string, unknown> = {}, filename = '', methodName = '') {
    console.log(message);
    try {
      if (!this.instance) {
        return;
      }
      this.instance.trackTrace({ message }, { ...this.getContext(properties), filename, methodName });
    } catch (error) {
      console.error(error);
    }
  }

  setUserId(uid: string) {
    try {
      if (this.instance && uid && uid.replace(/[,;=| ]+/g, '_')) {
        const validatedId = uid.replace(/[,;=| ]+/g, '_');
        this.instance.setAuthenticatedUserContext(validatedId);
      }
    } catch (error) {
      this.trackException(error);
    }
  }

  setBasicContext(ctx: Record<string, unknown>, appendOnly = true) {
    try {
      this.basicContext = {
        ...(appendOnly ? this.basicContext : {}),
        ...(ctx || {}),
      };
    } catch (error) {
      this.trackException(error);
    }
  }

  getContext(properties: Record<string, unknown>): Record<string, unknown> {
    try {
      const context = {
        ...this.basicContext,
        host: window.location.hostname,
        url: window.location.href,
        ...properties,
      };
      return context;
    } catch (error) {
      console.error(error);
    }
    return {};
  }
}

export default new AppInsights();
