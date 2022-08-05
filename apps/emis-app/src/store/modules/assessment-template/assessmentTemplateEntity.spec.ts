import { ActionContext } from 'vuex';
import { IAssessmentTemplateEntity } from '@libs/entities-lib/assessment-template';
import { AssessmentTemplatesService } from '@libs/core-lib/services/assessment-template/entity';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { httpClient } from '@/services/httpClient';
import { AssessmentTemplateEntityModule } from './assessmentTemplateEntity';
import { IAssessmentTemplateEntityState } from './assessmentTemplateEntity.types';

const service = new AssessmentTemplatesService(httpClient);
let myModule: AssessmentTemplateEntityModule;
const signalR = mockSignalR();

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IAssessmentTemplateEntityState,
  getters: {},
  rootState: {} as IAssessmentTemplateEntityState,
  rootGetters: {},
} as ActionContext<IAssessmentTemplateEntityState, IAssessmentTemplateEntityState>;

describe('AssessmentTemplate entity module', () => {
  beforeEach(() => {
    myModule = new AssessmentTemplateEntityModule(service, signalR);
  });

  describe('actions', () => {
    describe('create', () => {
      it('should call create service with proper params', async () => {
        const payload = {} as IAssessmentTemplateEntity;
        const res = {} as IAssessmentTemplateEntity;
        myModule.service.create = jest.fn(() => Promise.resolve(res));
        await myModule.actions.create(actionContext, payload);

        expect(myModule.service.create).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });
});
