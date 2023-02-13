import { BaseStoreComponents } from '@libs/stores-lib/base';
import {
 IdParams, IMassActionEntity, MassActionRunType, MassActionType,
} from '@libs/entities-lib/mass-action';
import {
  IMassActionAssessmentCreatePayload,
  IMassActionFinancialAssistanceCreatePayload,
  IMassActionFundingRequestCreatePayload,
  IMassActionServiceMock,
  MassActionService,
} from '@libs/services-lib/mass-actions/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IMassActionEntity, IdParams>,
  entityService: MassActionService | IMassActionServiceMock,
) {
  async function process(id: string, runType: MassActionRunType): Promise<IMassActionEntity> {
    const data = await entityService.process(id, runType);

    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function update(id: string, payload: { name: string, description: string }): Promise<IMassActionEntity> {
    const data = await entityService.update(id, payload);

    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function create(massActionType: MassActionType, payload: unknown): Promise<IMassActionEntity> {
    let data: IMassActionEntity = null;

    if (massActionType === MassActionType.FinancialAssistance) {
      const urlSuffix = 'financial-assistance-from-list';
      data = await entityService.create(urlSuffix, payload as IMassActionFinancialAssistanceCreatePayload);
    }

    if (massActionType === MassActionType.Assessments) {
      const urlSuffix = 'assessment-from-list';
      data = await entityService.create(urlSuffix, payload as IMassActionAssessmentCreatePayload);
    }

    if (massActionType === MassActionType.GenerateFundingRequest) {
      const urlSuffix = 'generate-funding';
      data = await entityService.create(urlSuffix, payload as IMassActionFundingRequestCreatePayload);
    }

    /* Add future mass action call here */

    if (data) {
      baseComponents.addNewlyCreatedId(data);
      baseComponents.set(data);
      return data;
    }
    return null;
  }
  return {
    process,
    update,
    create,
  };
}
