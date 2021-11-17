/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import { NavigationGuard, NavigationGuardNext } from 'vue-router';
import applicationInsights from './applicationInsights';

jest.mock('@microsoft/applicationinsights-web');

describe('ApplicationInsights', () => {
  const connectionString = 'some connection string';
  const appName = 'TestEMIS';

  let appInsights: any;
  let router: any;
  let vue: any;
  let navigationGuard: NavigationGuard;

  beforeEach(() => {
    vue = { config: { } };
    router = { beforeEach: jest.fn((guard: NavigationGuard) => { navigationGuard = guard; }) };
    appInsights = {
      loadAppInsights: jest.fn(),
      trackPageView: jest.fn(),
      flush: jest.fn(),
      trackException: jest.fn(),
      context: { telemetryTrace: { traceId: 'some initial trace ID' } },
    };

    jest.spyOn(Util, 'generateW3CId').mockReturnValue('some new trace ID');
    (ApplicationInsights as any).mockImplementation(jest.fn(() => appInsights));
  });

  const navigateTo = (to: string, from: string, next: NavigationGuardNext<Vue>) => {
    const toRoute: any = { path: `/${to}`, name: to };
    const fromRoute: any = { path: `/${from}`, name: from };
    navigationGuard(toRoute, fromRoute, next);
  };

  it('should instantiate Application Insight SDK', () => {
    applicationInsights.initialize({ connectionString, router, appName });

    expect((ApplicationInsights as any).mock.calls).toEqual([[{
      config:
      {
        connectionString: 'some connection string',
        disableFetchTracking: false,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      },
    }]]);
    expect(appInsights.loadAppInsights).toHaveBeenCalled();
    expect(appInsights.trackPageView).toHaveBeenCalledWith({
      name: `${appName} - Initial Page Load`,
    });
  });

  it('should not throw load app insights fails during prepare', () => {
    appInsights.loadAppInsights.mockImplementation(() => {
      throw new Error('Failed to load');
    });

    expect(() => applicationInsights.initialize({ connectionString: '', router, appName })).not.toThrow();
  });

  it('should not throw load app insights fails during vue install', () => {
    const failingRouter:any = { beforeEach: jest.fn() };
    failingRouter.beforeEach.mockImplementation(() => {
      throw new Error('Failed to install');
    });
    const options = { connectionString: '', router: failingRouter, appName };
    applicationInsights.initialize(options);

    expect(() => applicationInsights.install(vue, options)).not.toThrow();
  });

  describe('Once properly initialized', () => {
    beforeEach(() => {
      const options = { connectionString, router, appName };
      applicationInsights.initialize(options);
      applicationInsights.install(vue, options);
    });

    it('should generate new traceID when routing to new page', () => {
      const traceIDBeforeRouting = appInsights.context.telemetryTrace.traceID;

      navigateTo('new.route', 'current.route', jest.fn());

      const traceIDAfterRouting = appInsights.context.telemetryTrace.traceID;
      expect(Util.generateW3CId).toHaveBeenCalled();
      expect(traceIDAfterRouting).toEqual('some new trace ID');
      expect(traceIDBeforeRouting).not.toEqual(traceIDAfterRouting);
    });

    it('should track new page view when routing to new page', () => {
      navigateTo('new.route', 'current.route', jest.fn());

      expect(appInsights.trackPageView).toHaveBeenCalledWith({
        name: 'TestEMIS - new.route',
      });
    });

    it('should continue the middleware chain on the beforeEach navigation guard', () => {
      const next = jest.fn();

      navigateTo('new.route', 'current.route', next);

      expect(next).toHaveBeenCalled();
    });

    it('should intercept error and send them to application insights, then rethrow', () => {
      const error = new Error('Whoopsie!');

      expect(() => vue.config.errorHandler(error)).toThrow('Whoopsie!');

      expect(appInsights.trackException).toHaveBeenCalledWith({ exception: error, properties: {} });
    });
  });
});
