import { BaseStoreComponents } from '@libs/stores-lib/base';
import { DuplicateReason, IHouseholdEntity, IdParams } from '@libs/entities-lib/household';
import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { ref } from 'vue';
import { IAddress } from '@libs/entities-lib/value-objects/address';
import { IVersionedEntity, IVersionedEntityCombined } from '@libs/entities-lib/value-objects/versioned-entity';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IHouseholdEntity, IdParams>,
  entityService: IHouseholdsService | IHouseholdsServiceMock,
) {
  const searchResultsShown = ref(false);

  async function updateNoFixedHomeAddress({ householdId, observation }: { householdId: string; observation: string }) {
    const res = await entityService.updateNoFixedHomeAddress(householdId, false, observation);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  async function updateHomeAddress({ householdId, address }: { householdId: string; address: IAddress }) {
    const res = await entityService.updateHomeAddress(householdId, false, address);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  async function flagNewDuplicate(id: uuid, payload:
    { duplicateHouseholdId: uuid, duplicateReasons: DuplicateReason[], memberFirstName: string, memberLastName: string, rationale: string }): Promise<IHouseholdEntity[]> {
    const res = await entityService.flagNewDuplicate(id, payload);
    if (res?.length) {
      res.forEach((i) => baseComponents.set(i));
    }
    return res;
  }

  async function flagDuplicate(id: uuid, payload: { potentialDuplicateId: uuid; duplicateHouseholdId: uuid; rationale: string, }): Promise<IHouseholdEntity[]> {
    const res = await entityService.flagDuplicate(id, payload);
    if (res?.length) {
      res.forEach((i) => baseComponents.set(i));
    }
    return res;
  }

  async function resolveDuplicate(id: uuid, payload: { potentialDuplicateId: uuid; duplicateHouseholdId: uuid; rationale: string }): Promise<IHouseholdEntity[]> {
    const res = await entityService.resolveDuplicate(id, payload);
    if (res?.length) {
      res.forEach((i) => baseComponents.set(i));
    }
    return res;
  }

  async function fetchHouseholdHistory(household: IHouseholdEntity): Promise<IVersionedEntityCombined[]> {
    const householdEntityRequest = entityService.getHouseholdHistory(household.id);
    const householdMetadataRequest = entityService.getHouseholdMetadataHistory(household.id);

    // Fetch  history from the entity and metadata endpoints for household
    const [householdEntityResponse, householdMetadataResponse] = await Promise.all([householdEntityRequest, householdMetadataRequest]);

    // Add the type of change 'household' to the household history items
    const hhEntityResponse = householdEntityResponse?.map((r) => {
      r.entityType = 'household';
      return r;
    });

    const allMemberIds = householdEntityResponse.reduce((acc, versionedEntity) => acc.concat((versionedEntity.entity as IHouseholdEntity).members), []);
    const uniqueMemberIds = [...new Set(allMemberIds)];

    const memberEntityRequests = [] as Promise<IVersionedEntity[]>[];
    const memberMetadataRequests = [] as Promise<IVersionedEntity[]>[];
    uniqueMemberIds.forEach((memberId) => {
      memberEntityRequests.push(entityService.getMemberHistory(memberId) as Promise<IVersionedEntity[]>);
      memberMetadataRequests.push(entityService.getMemberMetadataHistory(memberId) as Promise<IVersionedEntity[]>);
    });

    // Fetch all history from the entity and metadata endpoints for household and all members
    const [membersEntityResponses, membersMetadataResponses] = await Promise.all([
      Promise.all(memberEntityRequests),
      Promise.all(memberMetadataRequests),
    ]);

    // Add the type of change 'householdMember' to all the member history items
    const mEntityResponses = membersEntityResponses?.map((responses) => responses.map((r) => {
      r.entityType = 'householdMember';
      return r;
    }));

    // add the previous entity to each history item and order them chronologically
    const mappedEntityResponses: IVersionedEntity[] = utils.mapResponses([hhEntityResponse, ...mEntityResponses]);
    const mappedMetadataResponses = utils.mapResponses([householdMetadataResponse, ...membersMetadataResponses]);

    // Combine the entities and metadata history items into one object
    const combinedEntities: IVersionedEntityCombined[] = utils.combineEntities(mappedEntityResponses, mappedMetadataResponses);

    return combinedEntities;
  }

  return {
    searchResultsShown,
    updateNoFixedHomeAddress,
    updateHomeAddress,
    fetchHouseholdHistory,
    flagNewDuplicate,
    flagDuplicate,
    resolveDuplicate,
  };
}
