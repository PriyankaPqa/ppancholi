import { MASS_ACTION_ENTITIES, MASS_ACTION_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { MassActionRunType, MassActionType } from '@libs/entities-lib/mass-action';
import { mockMassActionCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { MassActionStorage } from './storage';

const entityModuleName = MASS_ACTION_ENTITIES;
const metadataModuleName = MASS_ACTION_METADATA;

const store = mockStore({}, { commit: true, dispatch: true });

const storage = new MassActionStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Mass Action Storage', () => {
  describe('>> Actions', () => {
    it('should proxy process', () => {
      const id = '1';
      const runType = MassActionRunType.Process;

      storage.actions.process(id, runType);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/process`, { id, runType });
    });

    it('should proxy update', () => {
      const id = '1';

      const payload = {
        name: 'name',
        description: 'description',
      };

      storage.actions.update(id, payload);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/update`, { id, payload });
    });

    it('should proxy create', () => {
      const massActionType = MassActionType.FinancialAssistance;
      const payload = mockMassActionCreatePayload();

      storage.actions.create(massActionType, payload);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/create`, { massActionType, payload });
    });
  });
});
