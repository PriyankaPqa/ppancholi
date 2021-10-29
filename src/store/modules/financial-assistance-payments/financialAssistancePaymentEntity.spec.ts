/* eslint-disable */
import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { FinancialAssistancePaymentsService } from '@/services/financial-assistance-payments/entity';

import { mockCaseFinancialAssistanceEntity, IFinancialAssistancePaymentEntity, mockFinancialPaymentHistory } from '@/entities/financial-assistance-payment';
import { FinancialAssistancePaymentEntityModule } from './financialAssistancePaymentEntity';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';
import utils from '@crctech/registration-lib/src/entities/value-objects/versioned-entity/versionedEntityUtils';
import { mockVersionedEntityCombined } from '@crctech/registration-lib/src/entities/value-objects/versioned-entity';

const service = new FinancialAssistancePaymentsService(httpClient);
let module: FinancialAssistancePaymentEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IFinancialAssistancePaymentEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IFinancialAssistancePaymentEntityState, IFinancialAssistancePaymentEntityState>;

describe('Financial assistance payment entity module', () => {
  
  beforeEach(() => {
    module = new FinancialAssistancePaymentEntityModule(service);
  });
  
  describe('actions', () => {

    describe('addFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        const entity = mockCaseFinancialAssistanceEntity();
        module.service.addFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.addFinancialAssistancePayment(actionContext, entity);

        expect(module.service.addFinancialAssistancePayment).toBeCalledWith(entity);
        expect(res).toEqual(serviceRes);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', serviceRes);
        expect(actionContext.commit).toBeCalledWith('set', serviceRes);
      });
    });

    describe('editFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();

        module.service.editFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.editFinancialAssistancePayment(actionContext, entity);

        expect(module.service.editFinancialAssistancePayment).toBeCalledWith(entity);
        expect(res).toEqual(serviceRes);
      });
    });
    
    describe('updatePaymentStatus', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';

        module.service.updatePaymentStatus = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.updatePaymentStatus(actionContext, { paymentGroupId: 'group-id', entityId: id, status: 2, cancellationReason: 5 });

        expect(module.service.updatePaymentStatus).toBeCalledWith(id, 'group-id', 2, 5);
        expect(res).toEqual(serviceRes);
      });
    });
    
    describe('submitFinancialAssistancePayment', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const entity = mockCaseFinancialAssistanceEntity();

        module.service.submitFinancialAssistancePayment = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.submitFinancialAssistancePayment(actionContext, entity.id);

        expect(module.service.submitFinancialAssistancePayment).toBeCalledWith(entity.id);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('addFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        const entity = mockCaseFinancialAssistanceEntity();
        module.service.addFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.addFinancialAssistancePaymentLine(actionContext, { entity: entity.groups[0], financialAssistanceId: id });

        expect(module.service.addFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
        expect(res).toEqual(serviceRes);
      });
    });
    
    describe('editFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        const entity = mockCaseFinancialAssistanceEntity();
        module.service.editFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.editFinancialAssistancePaymentLine(actionContext, { entity: entity.groups[0], financialAssistanceId: id });

        expect(module.service.editFinancialAssistancePaymentLine).toBeCalledWith(id, entity.groups[0]);
        expect(res).toEqual(serviceRes);
      });
    });
    
    describe('deleteFinancialAssistancePaymentLine', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseFinancialAssistanceEntity();
        const id = 'mock-id';
        module.service.deleteFinancialAssistancePaymentLine = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.deleteFinancialAssistancePaymentLine(actionContext, { paymentId: 'myId', financialAssistanceId: id });

        expect(module.service.deleteFinancialAssistancePaymentLine).toBeCalledWith(id, 'myId');
        expect(res).toEqual(serviceRes);
      });
    });
    
    describe('fetchHistory', () => {
      it('calls the fetchHistory service for the financial assistance and metadata if true and calls mapResponses and combineEntities with the results', async () => {
        module.service.getHistory = jest.fn(() => Promise.resolve(mockFinancialPaymentHistory()));
        module.service.getMetadataHistory = jest.fn(() => Promise.resolve([]));
        utils.mapResponses = jest.fn();
        const combinedEntity = mockVersionedEntityCombined('financialAssistancePayment');
        utils.combineEntities = jest.fn(() => ([combinedEntity]));

        const expectedRes = await module.actions.fetchHistory(actionContext, { financialAssistanceId: 'id', includeMetadata: true });

        expect(module.service.getHistory).toHaveBeenCalledWith('id');
        expect(module.service.getMetadataHistory).toHaveBeenCalledWith('id');

        expect(utils.mapResponses).toHaveBeenCalledTimes(2);
        expect(utils.combineEntities).toHaveBeenCalled();
        expect(expectedRes).toEqual([combinedEntity]);
      });
    });
  });
});
