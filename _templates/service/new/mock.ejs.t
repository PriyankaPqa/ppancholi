---
to: src/services/<%= folderName %>/<%= name %>.mock.ts
---
import { I<%= Name %>ServiceMock } from './<%= name %>.types';

export const mock<%= Name %>Service = (): I<%= Name %>ServiceMock => ({
  exampleMock: jest.fn(async () => ({
    success: true,
    status: 200,
    statusText: 'OK',
    data: {},
  })),
});
