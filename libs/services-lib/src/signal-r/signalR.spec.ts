import _chunk from 'lodash/chunk';
import { IHttpMock, mockHttp, GlobalHandler } from '../http-client';
import { SignalRService } from './signalR';

describe('>>> SignalR service', () => {
  let http: IHttpMock;
  let service: SignalRService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new SignalRService(http as never);
  });

  describe('subscribe', () => {
    it('is linked to the correct url', async () => {
      const entityIds = ['1', '2'];
      const connectionId = 'connection_id';

      await service.subscribe(connectionId, entityIds);
      expect(http.post).toHaveBeenCalledWith('/hub/subscribe', { entityIds, connectionId }, { globalHandler: GlobalHandler.Disabled });
    });

    it('is link to the correct url with the params of different chunk of ids', async () => {
      const entityIds = Array.from(Array(260).keys()).map((val) => `mock-id-${val}`);
      const chunkIds = _chunk(entityIds, 250);
      const connectionId = 'connection_id';

      await service.subscribe(connectionId, entityIds);
      expect(http.post).toHaveBeenCalledWith('/hub/subscribe', { entityIds: chunkIds[0], connectionId }, { globalHandler: GlobalHandler.Disabled });
      expect(http.post).toHaveBeenCalledWith('/hub/subscribe', { entityIds: chunkIds[1], connectionId }, { globalHandler: GlobalHandler.Disabled });
    });
  });

  describe('unsubscribe', () => {
    it('is linked to the correct url', async () => {
      const entityIds = ['1', '2'];
      const connectionId = 'connection_id';
      await service.unsubscribe(connectionId, entityIds);
      expect(http.post).toHaveBeenCalledWith('/hub/unsubscribe', { entityIds, connectionId }, { globalHandler: GlobalHandler.Disabled });
    });

    it('is link to the correct url with the params of different chunk of ids', async () => {
      const entityIds = Array.from(Array(260).keys()).map((val) => `mock-id-${val}`);
      const chunkIds = _chunk(entityIds, 250);
      const connectionId = 'connection_id';

      await service.unsubscribe(connectionId, entityIds);
      expect(http.post).toHaveBeenCalledWith('/hub/unsubscribe', { entityIds: chunkIds[0], connectionId }, { globalHandler: GlobalHandler.Disabled });
      expect(http.post).toHaveBeenCalledWith('/hub/unsubscribe', { entityIds: chunkIds[1], connectionId }, { globalHandler: GlobalHandler.Disabled });
    });
  });

  describe('unsubscribeAll', () => {
    it('is linked to the correct url', async () => {
      const connectionId = 'connection_id';
      await service.unsubscribeAll(connectionId);
      expect(http.post).toHaveBeenCalledWith('/hub/unsubscribe-all', { connectionId }, { globalHandler: GlobalHandler.Partial });
    });
  });
});
