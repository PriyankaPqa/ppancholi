import { BaseStoreComponents } from '@libs/stores-lib/base/base.types';
import { AssessmentTemplatesService, IAssessmentTemplatesServiceMock } from '@libs/services-lib/assessment-template/entity';
import {
  IAssessmentTemplateEntity, IdParams,
} from '@libs/entities-lib/assessment-template';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAssessmentTemplateEntity, IdParams>,
  entityService: AssessmentTemplatesService | IAssessmentTemplatesServiceMock,
) {
  async function create(payload:IAssessmentTemplateEntity) {
    const data = await entityService.create(payload);
    if (data) {
      baseComponents.addNewlyCreatedId(data);
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function update(payload: IAssessmentTemplateEntity) {
    const data = await entityService.update(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function updateAssessmentStructure(payload: IAssessmentTemplateEntity) {
    const data = await entityService.updateAssessmentStructure(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  return {
    create,
    update,
    updateAssessmentStructure,
  };
}
