---
to: src/services/<%= folderName %>/<%= name %>.types.ts
---
import {
  IRestResponse,
} from '@/types';

export interface I<%= Name %>Service {
  example(payload: any): Promise<IRestResponse>;
}

export interface I<%= Name %>ServiceMock {
  exampleMock: jest.Mock <Promise<IRestResponse>>;
}
