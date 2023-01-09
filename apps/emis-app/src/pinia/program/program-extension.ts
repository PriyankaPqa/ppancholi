import { IProgramsServiceMock, ProgramsService } from '@libs/services-lib/programs/entity';
import { IProgramEntity } from '@libs/entities-lib/program';
import { BaseStoreComponents } from '@/pinia/base';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IProgramEntity, { id: string; eventId: string }>,
  entityService: ProgramsService | IProgramsServiceMock,
) {
  async function createProgram(payload: IProgramEntity): Promise<IProgramEntity> {
    const result = await entityService.createProgram(payload);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function updateProgram(payload: IProgramEntity): Promise<IProgramEntity> {
    const result = await entityService.updateProgram(payload);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    createProgram,
    updateProgram,
  };
}
