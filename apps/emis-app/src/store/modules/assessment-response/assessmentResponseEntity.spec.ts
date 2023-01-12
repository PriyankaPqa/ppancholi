import { ActionContext } from 'vuex';
import { IAssessmentResponseEntity, IQuestionResponse } from '@libs/entities-lib/assessment-template';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { mockSignalR } from '@libs/shared-lib/signal-r';
import { httpClient } from '@/services/httpClient';
import { AssessmentResponseEntityModule } from './assessmentResponseEntity';
import { IAssessmentResponseEntityState } from './assessmentResponseEntity.types';

const service = new AssessmentResponsesService(httpClient);
let myModule: AssessmentResponseEntityModule;
const signalR = mockSignalR();

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IAssessmentResponseEntityState,
  getters: {},
  rootState: {} as IAssessmentResponseEntityState,
  rootGetters: {},
} as ActionContext<IAssessmentResponseEntityState, IAssessmentResponseEntityState>;

describe('AssessmentResponse entity module', () => {
  beforeEach(() => {
    myModule = new AssessmentResponseEntityModule(service, signalR);
  });

  describe('actions', () => {
    describe('create', () => {
      it('should call create service with proper params', async () => {
        const payload = {} as IAssessmentResponseEntity;
        const res = {} as IAssessmentResponseEntity;
        myModule.service.create = jest.fn(() => Promise.resolve(res));
        await myModule.actions.create(actionContext, payload);

        expect(myModule.service.create).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('update', () => {
      it('should call update service with proper params', async () => {
        const payload = {} as IAssessmentResponseEntity;
        const res = {} as IAssessmentResponseEntity;
        myModule.service.update = jest.fn(() => Promise.resolve(res));
        await myModule.actions.update(actionContext, payload);

        expect(myModule.service.update).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('saveAssessmentAnsweredQuestions', () => {
      it('should call saveAssessmentAnsweredQuestions service with proper params', async () => {
        const payload = {} as IAssessmentResponseEntity;
        const res = {} as IAssessmentResponseEntity;
        myModule.service.saveAssessmentAnsweredQuestions = jest.fn(() => Promise.resolve(res));
        await myModule.actions.saveAssessmentAnsweredQuestions(actionContext, payload);

        expect(myModule.service.saveAssessmentAnsweredQuestions).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('editAssessmentAnsweredQuestion', () => {
      it('should call editAssessmentAnsweredQuestion service with proper params', async () => {
        const payload = {
          id: 'id', responses: [{} as IQuestionResponse], assessmentQuestionIdentifier: 'assessmentQuestionIdentifier', parentIndexPath: 'path',
        };
        const res = {} as IAssessmentResponseEntity;
        myModule.service.editAssessmentAnsweredQuestion = jest.fn(() => Promise.resolve(res));
        await myModule.actions.editAssessmentAnsweredQuestion(actionContext, payload);

        expect(myModule.service.editAssessmentAnsweredQuestion).toBeCalledWith(payload.id, payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });
});
