import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { mockCaseFinancialAssistanceEntity, mockFinancialPaymentHistory } from '@libs/entities-lib/financial-assistance-payment';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';
import { mockVersionedEntityCombined } from '@libs/entities-lib/value-objects/versioned-entity';
import { FinancialAssistancePaymentEntityModule } from './financialAssistancePaymentEntity';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const service = new FinancialAssistancePaymentsService(httpClient);
let myModule: FinancialAssistancePaymentEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IFinancialAssistancePaymentEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IFinancialAssistancePaymentEntityState, IFinancialAssistancePaymentEntityState>;

const signalR = mockSignalR();

describe('Financial assistance payment entity module', () => {
  beforeEach(() => {
    myModule = new FinancialAssistancePaymentEntityModule(service, signalR);
  });

  describe('actions', () => {
    describe('addFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();
        myModule.service.addFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.addFinancialAssistancePayment(actionContext, entity);

        expect(myModule.service.addFinancialAssistancePayment).toBeCalledWith(entity);
        expect(res).toEqual(serviceRes);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', serviceRes);
        expect(actionContext.commit).toBeCalledWith('set', serviceRes);
      });
    });

    describe('editFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();

        myModule.service.editFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.editFinancialAssistancePayment(actionContext, entity);

        expect(myModule.service.editFinancialAssistancePayment).toBeCalledWith(entity);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('updatePaymentStatus', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';

        myModule.service.updatePaymentStatus = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.updatePaymentStatus(actionContext, {
          paymentGroupId: 'group-id', entityId: id, status: 2, cancellationReason: 5,
        });

        expect(myModule.service.updatePaymentStatus).toBeCalledWith(id, 'group-id', 2, 5);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('submitFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();

        myModule.service.submitFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.submitFinancialAssistancePayment(actionContext, entity.id);

        expect(myModule.service.submitFinancialAssistancePayment).toBeCalledWith(entity.id);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('submitApprovalRequest', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();

        myModule.service.submitApprovalRequest = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.submitApprovalRequest(actionContext, { paymentId: '1', submitTo: '2' });

        expect(myModule.service.submitApprovalRequest).toBeCalledWith('1', '2');
        expect(res).toEqual(serviceRes);
      });
    });

    describe('addFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        const entity = mockCaseFinancialAssistanceEntity();
        myModule.service.addFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.addFinancialAssistancePaymentLine(actionContext, { entity: entity.groups[0], financialAssistanceId: id });

        expect(myModule.service.addFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('editFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        const entity = mockCaseFinancialAssistanceEntity();
        myModule.service.editFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.editFinancialAssistancePaymentLine(actionContext, { entity: entity.groups[0], financialAssistanceId: id });

        expect(myModule.service.editFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('deleteFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        myModule.service.deleteFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.deleteFinancialAssistancePaymentLine(actionContext, { paymentId: 'myId', financialAssistanceId: id });

        expect(myModule.service.deleteFinancialAssistancePaymentLine).toBeCalledWith(id, 'myId');
        expect(res).toEqual(serviceRes);
      });
    });

    describe('fetchHistory', () => {
      it('calls the fetchHistory service for the financial assistance and metadata if true and calls mapResponses and combineEntities with the results', async () => {
        myModule.service.getHistory = jest.fn(() => Promise.resolve(mockFinancialPaymentHistory()));
        myModule.service.getMetadataHistory = jest.fn(() => Promise.resolve([]));
        utils.mapResponses = jest.fn();
        const combinedEntity = mockVersionedEntityCombined('financialAssistancePayment');
        utils.combineEntities = jest.fn(() => ([combinedEntity]));

        const expectedRes = await myModule.actions.fetchHistory(actionContext, { financialAssistanceId: 'id', includeMetadata: true });

        expect(myModule.service.getHistory).toHaveBeenCalledWith('id');
        expect(myModule.service.getMetadataHistory).toHaveBeenCalledWith('id');

        expect(utils.mapResponses).toHaveBeenCalledTimes(2);
        expect(utils.combineEntities).toHaveBeenCalled();
        expect(expectedRes).toEqual([combinedEntity]);
      });
    });
  });
});
