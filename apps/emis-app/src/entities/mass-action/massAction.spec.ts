import { MassActionEntity } from '@/entities/mass-action/massAction';
import { mockMassActionEntityData } from '@/entities/mass-action/massAction.mocks';
import { MassActionGroup, MassActionType } from '@/entities/mass-action/massActions.types';

describe('>> constructor', () => {
  describe('instantiate when data is passed', () => {
    it('should instantiate name', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.name).toEqual(mock.name);
    });

    it('should instantiate description', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.description).toEqual(mock.description);
    });

    it('should instantiate details', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.details).toEqual(mock.details);
    });

    it('should instantiate type', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.type).toEqual(mock.type);
    });

    it('should instantiate group', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.group).toEqual(mock.group);
    });

    it('should instantiate runs', () => {
      const mock = mockMassActionEntityData();
      const massAction = new MassActionEntity(mock);
      expect(massAction.runs).toEqual(mock.runs);
    });
  });

  describe('instantiate when data is not passed', () => {
    it('should instantiate name', () => {
      const massAction = new MassActionEntity();
      expect(massAction.name).toEqual('');
    });

    it('should instantiate description', () => {
      const massAction = new MassActionEntity();
      expect(massAction.description).toEqual('');
    });

    it('should instantiate details', () => {
      const massAction = new MassActionEntity();
      expect(massAction.details).toEqual({});
    });

    it('should instantiate type', () => {
      const massAction = new MassActionEntity();
      expect(massAction.type).toEqual(MassActionType.Unknown);
    });

    it('should instantiate group', () => {
      const massAction = new MassActionEntity();
      expect(massAction.group).toEqual(MassActionGroup.Unknown);
    });

    it('should instantiate runs', () => {
      const massAction = new MassActionEntity();
      expect(massAction.runs).toEqual([]);
    });
  });
});
