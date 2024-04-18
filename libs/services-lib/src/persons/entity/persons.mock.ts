import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockDomainBaseService } from '../../base';
import { IPersonsServiceMock } from './persons.types';

export const mockPersonsService = (): IPersonsServiceMock => ({
  ...mockDomainBaseService([mockMember()]),
});
