import { BaseStoreComponents } from '@libs/stores-lib/base';
import {
  IApprovalActionPayload,
  IdParams,
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup,
} from '@libs/entities-lib/financial-assistance-payment';
import {
  IFinancialAssistancePaymentsService,
  IFinancialAssistancePaymentsServiceMock,
  IUpdatePaymentStatusParams,
} from '@libs/services-lib/financial-assistance-payments/entity';
import { IVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IFinancialAssistancePaymentEntity, IdParams>,
  entityService: IFinancialAssistancePaymentsService | IFinancialAssistancePaymentsServiceMock,
) {
  async function addFinancialAssistancePayment(payload: IFinancialAssistancePaymentEntity) {
    const result = await entityService.addFinancialAssistancePayment(payload);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function editFinancialAssistancePayment(payload: IFinancialAssistancePaymentEntity) {
    const result = await entityService.editFinancialAssistancePayment(payload);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function updatePaymentStatus({ paymentGroupId, entityId, status, cancellationReason }: IUpdatePaymentStatusParams) {
    const result = await entityService.updatePaymentStatus({ entityId, paymentGroupId, status, cancellationReason });
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function submitFinancialAssistancePayment(payload: uuid) {
    const result = await entityService.submitFinancialAssistancePayment(payload);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function submitApprovalRequest(paymentId: uuid, submitTo: uuid) {
    const result = await entityService.submitApprovalRequest(paymentId, submitTo);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function submitApprovalAction(paymentId: uuid, action: IApprovalActionPayload) {
    const result = await entityService.submitApprovalAction(paymentId, action);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup) {
    const result = await entityService.addFinancialAssistancePaymentLine(financialAssistanceId, entity);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup) {
    const result = await entityService.editFinancialAssistancePaymentLine(financialAssistanceId, entity);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function deleteFinancialAssistancePaymentLine(paymentId: uuid, financialAssistanceId: uuid) {
    const result = await entityService.deleteFinancialAssistancePaymentLine(financialAssistanceId, paymentId);
    if (result) {
     baseComponents.set(result);
    }
    return result;
  }

  async function fetchHistory(financialAssistanceId: uuid, includeMetadata: boolean) {
    const entityRequest = entityService.getHistory(financialAssistanceId);
    const metadataRequest = includeMetadata ? entityService.getMetadataHistory(financialAssistanceId) : null;

    // Fetch  history from the entity and metadata endpoints for financialAssistancePayment
    const [entityResponse, metadataResponse] = await Promise.all([entityRequest, metadataRequest]);

    // Add the type of change 'financialAssistancePayment' to the financialAssistancePayment history items
    const entityResponseWithType = entityResponse?.map((r) => {
      r.entityType = 'financialAssistancePayment';
      return r;
    });

    // add the previous entity to each history item and order them chronologically
    const mappedEntityResponses: IVersionedEntity[] = utils.mapResponses([entityResponseWithType]);
    const mappedMetadataResponses = utils.mapResponses([metadataResponse || []]);

    // Combine the entities and metadata history items into one object
    return utils.combineEntities(mappedEntityResponses, mappedMetadataResponses);
  }

  return {
    addFinancialAssistancePayment,
    editFinancialAssistancePayment,
    updatePaymentStatus,
    submitFinancialAssistancePayment,
    submitApprovalRequest,
    submitApprovalAction,
    addFinancialAssistancePaymentLine,
    editFinancialAssistancePaymentLine,
    deleteFinancialAssistancePaymentLine,
    fetchHistory,
  };
}
