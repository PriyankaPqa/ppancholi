import { mockDomainBaseService } from '@/services/base/base.mock';
import { IMassActionServiceMock } from '@/services/mass-actions/entity/massAction.types';
import { mockMassActionEntities } from '@/entities/mass-action';

export const mockMassActionService = (): IMassActionServiceMock => ({
  ...mockDomainBaseService(mockMassActionEntities()),
});
