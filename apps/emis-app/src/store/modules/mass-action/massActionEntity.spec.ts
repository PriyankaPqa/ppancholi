import { ActionContext } from 'vuex';
import { mockMassActionCreatePayload, mockMassActionService } from '@/services/mass-actions/entity';
import { IMassActionEntityState } from '@/store/modules/mass-action/massActionEntity.types';
import { MassActionEntityModule } from '@/store/modules/mass-action/massActionEntity';
import { MassActionRunType, MassActionType } from '@/entities/mass-action';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();
const service = mockMassActionService();
const module = new MassActionEntityModule(service as never, signalR);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IMassActionEntityState, IMassActionEntityState>;

describe('>>> Mass Action Entity Module', () => {
  describe('>> Actions', () => {
    describe('process', () => {
      it('should call the process service with proper parameters and commit the res', async () => {
        const id = '1';
        const runType = MassActionRunType.Process;

        const res = await module.actions.process(actionContext, { id, runType });

        expect(module.service.process).toHaveBeenCalledWith(id, runType);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('update', () => {
      it('should call the update service with proper parameters and commit the res', async () => {
        const id = '1';

        const payload = {
          name: 'name',
          description: 'description',
        };

        const res = await module.actions.update(actionContext, { id, payload });

        expect(module.service.update).toHaveBeenCalledWith(id, payload);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('create', () => {
      describe('Financial assistance', () => {
        it('should call the create service with proper parameters and commit the res', async () => {
          const urlSuffix = 'financial-assistance-from-list';
          const massActionType = MassActionType.FinancialAssistance;
          const payload = mockMassActionCreatePayload();

          const res = await module.actions.create(actionContext, { massActionType, payload });

          expect(module.service.create).toHaveBeenCalledWith(urlSuffix, payload);

          expect(actionContext.commit).toBeCalledWith('set', res);
          expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        });
      });

      describe('Generate funding request', () => {
        it('should call the create service with proper parameters and commit the res', async () => {
          const urlSuffix = 'generate-funding';
          const massActionType = MassActionType.GenerateFundingRequest;
          const payload = { name: 'test', description: '' };

          const res = await module.actions.create(actionContext, { massActionType, payload });

          expect(module.service.create).toHaveBeenCalledWith(urlSuffix, payload);

          expect(actionContext.commit).toBeCalledWith('set', res);
        });
      });
    });
  });
});
