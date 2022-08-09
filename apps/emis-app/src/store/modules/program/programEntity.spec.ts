import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { ProgramEntityModule } from './programEntity';
import { IProgramEntityState } from './programEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();
const service = new ProgramsService(httpClient);
let myModule: ProgramEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IProgramEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IProgramEntityState, IProgramEntityState>;

describe('>>> Program entity module', () => {
  beforeEach(() => {
    myModule = new ProgramEntityModule(service, signalR);
  });

  describe('>> Actions', () => {
    describe('createProgram', () => {
      it('calls the createProgram service', async () => {
        const program = mockProgramEntity();

        myModule.service.createProgram = jest.fn();

        await myModule.actions.createProgram(actionContext, program);

        expect(myModule.service.createProgram).toHaveBeenCalledWith(program);
      });

      it('calls sets the result', async () => {
        const program = mockProgramEntity();

        myModule.service.createProgram = jest.fn(() => new Promise((resolve) => resolve(program)));

        await myModule.actions.createProgram(actionContext, program);

        expect(actionContext.commit).toHaveBeenCalledWith('set', program);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', program);
      });
    });

    describe('updateProgram', () => {
      it('calls the updateProgram service', async () => {
        const program = mockProgramEntity();

        myModule.service.updateProgram = jest.fn();

        await myModule.actions.updateProgram(actionContext, program);

        expect(myModule.service.updateProgram).toHaveBeenCalledWith(program);
      });

      it('calls sets the result', async () => {
        const program = mockProgramEntity();

        myModule.service.updateProgram = jest.fn(() => new Promise((resolve) => resolve(program)));

        await myModule.actions.updateProgram(actionContext, program);

        expect(actionContext.commit).toHaveBeenCalledWith('set', program);
      });
    });
  });
});
