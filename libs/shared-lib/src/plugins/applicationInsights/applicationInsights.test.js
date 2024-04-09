/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import applicationInsights from './applicationInsights';

jest.mock('@microsoft/applicationinsights-web');

// eslint-disable-next-line no-console
console.error = jest.fn();
// eslint-disable-next-line no-console
console.log = jest.fn();

describe('ApplicationInsights', () => {
  const connectionString = 'some connection string';
  const appName = 'TestEMIS';
  const oldWindowLoc = window.location;
  const excludeRequestFromAutoTrackingPatterns = [
    'https://maps.googleapis.com/*',
  ];

  let appInsights;
  let router;
  let vue;
  let navigationGuard;

  beforeEach(() => {
    delete window.location;
    window.location = { href: 'my_current_url', hostname: 'my_host' };
    vue = { config: {} };
    router = {
      afterEach: jest.fn((guard) => {
        navigationGuard = guard;
      }),
    };
    appInsights = {
      loadAppInsights: jest.fn(),
      trackPageView: jest.fn(),
      flush: jest.fn(),
      trackException: jest.fn(),
      trackTrace: jest.fn(),
      context: { telemetryTrace: { traceId: 'some initial trace ID' } },
    };

    jest.spyOn(Util, 'generateW3CId').mockReturnValue('some new trace ID');
    (ApplicationInsights).mockImplementation(jest.fn(() => appInsights));
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.location = oldWindowLoc;
  });

  const navigateTo = (to, from, next) => {
    const toRoute = { fullPath: `/${to}`, name: to };
    const fromRoute = { fullPath: `/${from}`, name: from };
    navigationGuard(toRoute, fromRoute, next);
  };

  describe('Initializing', () => {
    it('should instantiate Application Insight SDK', () => {
      applicationInsights.initialize({ connectionString, router, appName, excludeRequestFromAutoTrackingPatterns });

      expect((ApplicationInsights).mock.calls).toEqual([[{
        config:
        {
          connectionString: 'some connection string',
          disableFetchTracking: false,
          enableCorsCorrelation: true,
          enableRequestHeaderTracking: true,
          enableResponseHeaderTracking: true,
          excludeRequestFromAutoTrackingPatterns,
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
      const failingRouter = { afterEach: jest.fn() };
      failingRouter.afterEach.mockImplementation(() => {
        throw new Error('Failed to install');
      });
      const options = { connectionString: '', router: failingRouter, appName };
      applicationInsights.initialize(options);

      expect(() => applicationInsights.install(vue, options)).not.toThrow();
    });
  });

  describe('Once properly initialized', () => {
    beforeEach(() => {
      const options = { connectionString, router, appName };
      applicationInsights.initialize(options);
      applicationInsights.install(vue, options);
    });

    it('should generate new traceID when routing to new page', () => {
      const traceIDBeforeRouting = appInsights.context.telemetryTrace.traceID;

      navigateTo('new.route', 'old.route', jest.fn());

      const traceIDAfterRouting = appInsights.context.telemetryTrace.traceID;
      expect(Util.generateW3CId).toHaveBeenCalled();
      expect(traceIDAfterRouting).toEqual('some new trace ID');
      expect(traceIDBeforeRouting).not.toEqual(traceIDAfterRouting);
    });

    it('should track new page view when routing to new page', () => {
      window.location.href = 'new address';
      navigateTo('new.route', 'old.route', jest.fn());

      expect(appInsights.trackPageView).toHaveBeenCalledWith({
        name: 'TestEMIS - new address',
        refUri: '/old.route',
      });
    });

    it('should intercept error and send them to application insights, with current url and hostname, then rethrow', () => {
      const error = new Error('Whoopsie!');

      expect(() => vue.config.errorHandler(error)).toThrow('Whoopsie!');

      expect(appInsights.trackException).toHaveBeenCalledWith({ exception: error }, {
        host: 'my_host', url: 'my_current_url', filename: '', methodName: '',
      });
    });

    it('uses basic context and appends it to errors and traces', () => {
      applicationInsights.setBasicContext({ hello: 'me' });
      applicationInsights.setBasicContext({ one: 'more', yep: 2 });
      applicationInsights.setBasicContext({ hello: 'hello' });
      const error = new Error('Whoopsie!');

      expect(() => vue.config.errorHandler(error)).toThrow('Whoopsie!');

      expect(appInsights.trackException).toHaveBeenCalledWith(
        { exception: error },
        {
          host: 'my_host', url: 'my_current_url', one: 'more', yep: 2, hello: 'hello', filename: '', methodName: '',
        },
      );

      applicationInsights.trackTrace('my_trace', { additional: 'data' }, 'file', 'method');
      expect(appInsights.trackTrace).toHaveBeenCalledWith(
        { message: 'my_trace' },
        {
          host: 'my_host',
          url: 'my_current_url',
          one: 'more',
          yep: 2,
          hello: 'hello',
          additional: 'data',
          filename: 'file',
          methodName: 'method',
        },
      );
    });
  });
});
