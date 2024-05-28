import _chunk from 'lodash/chunk';
import { GlobalHandler, IHttpClient } from '../http-client';
import { ISignalRService } from './signalR.types';

export class SignalRService implements ISignalRService {
  constructor(protected http: IHttpClient) {}

  async subscribe(connectionId: string, ids: uuid[]) {
      const chunkCalls = _chunk(ids, 250).map((chunkIds) => (
        this.http.post('/hub/subscribe', {
          entityIds: chunkIds,
          connectionId,
        }, { globalHandler: GlobalHandler.Disabled })
      ));
      await Promise.all(chunkCalls);
  }

  async unsubscribe(connectionId: string, ids: uuid[]) {
    const chunkCalls = _chunk(ids, 250).map((chunkIds) => (
      this.http.post('/hub/unsubscribe', {
        entityIds: chunkIds,
        connectionId,
      }, { globalHandler: GlobalHandler.Disabled })
    ));
    await Promise.all(chunkCalls);
  }

  async unsubscribeAll(connectionId: string) {
    await this.http.post('/hub/unsubscribe-all', {
      connectionId,
    }, { globalHandler: GlobalHandler.Partial });
  }
}
