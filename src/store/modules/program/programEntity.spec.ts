/**
 * @group store
 */

import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { mockProgramEntity } from '@/entities/program';
import { ProgramsService } from '@/services/programs/entity';
import { ProgramEntityModule } from './programEntity';
import { IProgramEntityState } from './programEntity.types';

const service = new ProgramsService(httpClient);
let module: ProgramEntityModule;

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
    module = new ProgramEntityModule(service);
  });

  describe('>> Actions', () => {
    describe('createProgram', () => {
      it('calls the createProgram service', async () => {
        const program = mockProgramEntity();

        module.service.createProgram = jest.fn();

        await module.actions.createProgram(actionContext, program);

        expect(module.service.createProgram).toHaveBeenCalledWith(program);
      });

      it('calls sets the result', async () => {
        const program = mockProgramEntity();

        module.service.createProgram = jest.fn(() => new Promise((resolve) => resolve(program)));

        await module.actions.createProgram(actionContext, program);

        expect(actionContext.commit).toHaveBeenCalledWith('set', program);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', program);
      });
    });

    describe('updateProgram', () => {
      it('calls the updateProgram service', async () => {
        const program = mockProgramEntity();

        module.service.updateProgram = jest.fn();

        await module.actions.updateProgram(actionContext, program);

        expect(module.service.updateProgram).toHaveBeenCalledWith(program);
      });

      it('calls sets the result', async () => {
        const program = mockProgramEntity();

        module.service.updateProgram = jest.fn(() => new Promise((resolve) => resolve(program)));

        await module.actions.updateProgram(actionContext, program);

        expect(actionContext.commit).toHaveBeenCalledWith('set', program);
      });
    });
  });
});
