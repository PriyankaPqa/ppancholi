import { BaseStoreComponents } from '@libs/stores-lib/base/base.types';
import { AssessmentFormsService, IAssessmentFormsServiceMock } from '@libs/services-lib/assessment-form/entity';
import {
  IAssessmentFormEntity, IdParams,
} from '@libs/entities-lib/assessment-template';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAssessmentFormEntity, IdParams>,
  entityService: AssessmentFormsService | IAssessmentFormsServiceMock,
) {
  async function fetchByProgramId(programId: uuid) {
    return entityService.fetchByProgramId(programId);
  }

  async function create(payload:IAssessmentFormEntity) {
    const data = await entityService.create(payload);
    if (data) {
      baseComponents.addNewlyCreatedId(data);
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function update(payload: IAssessmentFormEntity) {
    const data = await entityService.update(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function updateAssessmentStructure(payload: IAssessmentFormEntity) {
    const data = await entityService.updateAssessmentStructure(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  return {
    fetchByProgramId,
    create,
    update,
    updateAssessmentStructure,
  };
}
