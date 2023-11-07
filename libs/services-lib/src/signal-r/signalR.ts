import { GlobalHandler, IHttpClient } from '../http-client';
import { ISignalRService } from './signalR.types';

export class SignalRService implements ISignalRService {
  constructor(protected http: IHttpClient) {}

  async subscribe(connectionId: string, ids: uuid[]) {
    await this.http.post('/hub/subscribe', {
      entityIds: ids,
      connectionId,
    }, { globalHandler: GlobalHandler.Partial });
  }

  async unsubscribe(connectionId: string, ids: uuid[]) {
    await this.http.post('/hub/unsubscribe', {
      entityIds: ids,
      connectionId,
    }, { globalHandler: GlobalHandler.Partial });
  }

  async unsubscribeAll(connectionId: string) {
    await this.http.post('/hub/unsubscribe-all', {
      connectionId,
    }, { globalHandler: GlobalHandler.Partial });
  }
}
