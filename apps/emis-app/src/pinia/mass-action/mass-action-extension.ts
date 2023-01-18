import { BaseStoreComponents } from '@libs/stores-lib/base';
import {
 IdsParams, IMassActionEntity, MassActionRunType, MassActionType,
} from '@libs/entities-lib/mass-action';
import {
  IMassActionFinancialAssistanceCreatePayload,
  IMassActionFundingRequestCreatePayload,
  IMassActionServiceMock,
  MassActionService,
} from '@libs/services-lib/mass-actions/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IMassActionEntity, IdsParams>,
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
    let data = null;

    if (massActionType === MassActionType.FinancialAssistance) {
      const urlSuffix = 'financial-assistance-from-list';
      data = await entityService.create(urlSuffix, payload as IMassActionFinancialAssistanceCreatePayload);
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
