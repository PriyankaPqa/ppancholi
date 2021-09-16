import { mockBaseData } from '@/entities/base';
import {
  IMassActionCombined,
  IMassActionEntity,
  IMassActionEntityData,
  IMassActionMetadata,
  IMassActionRun,
  IMassActionRunMetadataModel,
  MassActionGroup,
  MassActionRunStatus,
  MassActionRunType,
  MassActionType,
} from '@/entities/mass-action/massActions.types';
import { MassActionEntity } from '@/entities/mass-action/massAction';
import { EPaymentModalities } from '@/entities/program';

export const mockMassActionRun = (force?: Partial<IMassActionRun>): IMassActionRun => ({
  ...mockBaseData(),
  started: '2021-08-05T14:37:53.425Z',
  completed: '2021-08-05T14:37:53.425Z',
  runType: MassActionRunType.Process,
  runStatus: MassActionRunStatus.Processed,
  ...force,
});

export const mockMassActionEntityData = (force?: Partial<IMassActionEntityData>): IMassActionEntityData => ({
  ...mockBaseData(),
  name: 'mass action name',
  description: 'mass action description',
  details: {
    paymentModality: EPaymentModalities.DirectDeposit,
    amount: 100,
    eventId: '1',
    mainCategoryId: '1',
    programId: '1',
    subCategoryId: '2',
    tableId: '1',
  },
  type: MassActionType.FinancialAssistance,
  group: MassActionGroup.Group1,
  runs: [mockMassActionRun(), mockMassActionRun({ timestamp: '2021-08-06 06:39:04' })],
  ...force,
});

export const mockMassActionRunMetadata = (force?: Partial<IMassActionRunMetadataModel>): IMassActionRunMetadataModel => ({
  runId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  results: {
    total: 100,
    successes: 50,
    failures: 50,
  },
  errors: [
    {
      error: 'error.x',
      total: 50,
    },
  ],
  started: '2021-08-05T14:37:53.425Z',
  completed: '2021-08-05T14:37:53.425Z',
  runType: MassActionRunType.Process,
  runStatus: MassActionRunStatus.Processed,
  ...force,
});

export const mockMassActionMetadata = (force?: Partial<IMassActionMetadata>): IMassActionMetadata => ({
  ...mockBaseData(),
  runs: [mockMassActionRunMetadata()],
  lastRun: mockMassActionRunMetadata(),
  ...force,
});

export const mockMassActionEntity = (force?: Partial<IMassActionEntity>): IMassActionEntity => new MassActionEntity(mockMassActionEntityData(force));

export const mockCombinedMassAction = (force?: Partial<IMassActionEntity>): IMassActionCombined => ({
  entity: mockMassActionEntity(force),
  metadata: mockMassActionMetadata(),
});

export const mockMassActionEntities = (): IMassActionEntity[] => [mockMassActionEntity({ id: '1' }), mockMassActionEntity({ id: '2' })];

export const mockCombinedMassActions = (): IMassActionCombined[] => [mockCombinedMassAction({ id: '1' }), mockCombinedMassAction({ id: '2' })];
