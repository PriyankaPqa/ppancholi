---
to: src/services/<%= folderName %>/<%= name %>.ts
---
import { IHttpClient } from '@/services';
import ServicesUtil from '@/services/services-util';
import {
  IRestResponse,
} from '@/types';
import { I<%= Name %>Service } from './<%= name %>.types';

export class <%= Name %>Service implements I<%= Name %>Service {
  /* eslint-disable no-useless-constructor */
  constructor(private readonly http: IHttpClient) {}

  async example(payload: any): Promise<IRestResponse> {
    try {
      const res = await this.http.post('......', payload);

        return ServicesUtil.responseBuilder(res);
    } catch (error) {
      return ServicesUtil.createErrorObject(error);
    }
  }
}
