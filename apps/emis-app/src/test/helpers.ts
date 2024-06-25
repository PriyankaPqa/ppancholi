import { ISearchParams } from '@libs/shared-lib/types';

export enum Contributor {
  'IM' = 1,
  'Finance' = 2,
  'Three' = 3,

}
export const mockSearchParams: ISearchParams = {
  filter: { Foo: 'foo' },
};

export const mockAppUsers = [{
  id: 'ced05d73-ca2b-4177-87a9-71164192d054',
  displayName: 'Mark De Verno',
  roles: [
    '00000000-0000-0000-0000-000000000000',
    '58ff083e-b3d2-55af-705a-5db5619806c3',
  ],
},
{
  id: '8ab3cf69-70dc-48fd-aed8-bce6e2ba9d12',
  displayName: 'Andrei Hatieganu',
  roles: [
    '58ff083e-b3d2-55af-705a-5db5619806c3',
  ],
},
];
