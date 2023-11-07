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
      expect(http.post).toHaveBeenCalledWith('/hub/subscribe', { entityIds, connectionId }, { globalHandler: GlobalHandler.Partial });
    });
  });

  describe('unsubscribe', () => {
    it('is linked to the correct url', async () => {
      const entityIds = ['1', '2'];
      const connectionId = 'connection_id';
      await service.unsubscribe(connectionId, entityIds);
      expect(http.post).toHaveBeenCalledWith('/hub/unsubscribe', { entityIds, connectionId }, { globalHandler: GlobalHandler.Partial });
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
