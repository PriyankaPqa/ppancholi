import { ActionContext } from 'vuex';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { httpClient } from '@/services/httpClient';
import { AssessmentFormEntityModule } from './assessmentFormEntity';
import { IAssessmentFormEntityState } from './assessmentFormEntity.types';

const service = new AssessmentFormsService(httpClient);
let myModule: AssessmentFormEntityModule;
const signalR = mockSignalR();

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IAssessmentFormEntityState,
  getters: {},
  rootState: {} as IAssessmentFormEntityState,
  rootGetters: {},
} as ActionContext<IAssessmentFormEntityState, IAssessmentFormEntityState>;

describe('AssessmentForm entity module', () => {
  beforeEach(() => {
    myModule = new AssessmentFormEntityModule(service, signalR);
  });

  describe('actions', () => {
    describe('create', () => {
      it('should call create service with proper params', async () => {
        const payload = {} as IAssessmentFormEntity;
        const res = {} as IAssessmentFormEntity;
        myModule.service.create = jest.fn(() => Promise.resolve(res));
        await myModule.actions.create(actionContext, payload);

        expect(myModule.service.create).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('update', () => {
      it('should call update service with proper params', async () => {
        const payload = {} as IAssessmentFormEntity;
        const res = {} as IAssessmentFormEntity;
        myModule.service.update = jest.fn(() => Promise.resolve(res));
        await myModule.actions.update(actionContext, payload);

        expect(myModule.service.update).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('updateAssessmentStructure', () => {
      it('should call updateAssessmentStructure service with proper params', async () => {
        const payload = {} as IAssessmentFormEntity;
        const res = {} as IAssessmentFormEntity;
        myModule.service.updateAssessmentStructure = jest.fn(() => Promise.resolve(res));
        await myModule.actions.updateAssessmentStructure(actionContext, payload);

        expect(myModule.service.updateAssessmentStructure).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('fetchByProgramId', () => {
      it('calls the service with proper parameters', async () => {
        myModule.service.fetchByProgramId = jest.fn();

        expect(myModule.service.fetchByProgramId).toHaveBeenCalledTimes(0);

        await myModule.actions.fetchByProgramId(actionContext, { programId: 'programId' });

        expect(myModule.service.fetchByProgramId).toHaveBeenCalledTimes(1);
        expect(myModule.service.fetchByProgramId).toHaveBeenCalledWith('programId');
      });
    });

  });
});
