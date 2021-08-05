import { mockBaseData } from '@/entities/base';
import {
  IMassActionCombined,
  IMassActionEntity,
  IMassActionEntityData,
  IMassActionRun,
  MassActionGroup,
  MassActionRunStatus,
  MassActionRunType,
  MassActionType,
} from '@/entities/mass-action/massActions.types';
import { MassActionEntity } from '@/entities/mass-action/massAction';

export const massActionRun = (force? : Partial<IMassActionRun>): IMassActionRun => ({
  ...mockBaseData(),
  started: '2021-08-05T14:37:53.425Z',
  completed: '2021-08-05T14:37:53.425Z',
  runType: MassActionRunType.Process,
  runStatus: MassActionRunStatus.Processed,
  ...force,
});

export const mockMassActionEntityData = (force? : Partial<IMassActionEntityData>): IMassActionEntityData => ({
  ...mockBaseData(),
  name: 'mass action name',
  description: 'mass action description',
  details: {},
  type: MassActionType.FinancialAssistance,
  group: MassActionGroup.Group1,
  runs: [
    massActionRun(),
    massActionRun({ runType: MassActionRunType.PreProcess, runStatus: MassActionRunStatus.Processing }),
  ],
  ...force,
});

export const mockMassActionEntity = (force? : Partial<IMassActionEntity>): IMassActionEntity => new MassActionEntity(mockMassActionEntityData(force));

export const mockCombinedMassAction = (force?: Partial<IMassActionEntity>): IMassActionCombined => ({
  entity: mockMassActionEntity(force),
  metadata: null,
});

export const mockMassActionEntities = (): IMassActionEntity[] => [
  mockMassActionEntity({ id: '1' }),
  mockMassActionEntity({ id: '2' }),
];

export const mockCombinedMassActions = (): IMassActionCombined[] => [
  mockCombinedMassAction({ id: '1' }),
  mockCombinedMassAction({ id: '2' }),
];
