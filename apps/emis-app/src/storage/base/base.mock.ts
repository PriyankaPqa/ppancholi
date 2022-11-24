export class BaseMock<T, S> {
  protected readonly combinedEntitiesAndMetaData;

  protected readonly entity;

  constructor(combined: T[], pEntity: S) {
    this.combinedEntitiesAndMetaData = combined;
    this.entity = pEntity;
  }

  protected baseGetters = {
    getAll: jest.fn(() => this.combinedEntitiesAndMetaData),
    get: jest.fn(() => this.combinedEntitiesAndMetaData[0]),
    getByCriteria: jest.fn(() => this.combinedEntitiesAndMetaData),
    getByIds: jest.fn(() => this.combinedEntitiesAndMetaData),
    getNewlyCreatedIds: jest.fn(() => []),
  };

  protected baseActions = {
    fetch: jest.fn(() => this.combinedEntitiesAndMetaData[0]),
    fetchFullResponse: jest.fn(() => ({ entity: { status: 200 }, metadata: { status: 200 } })),
    fetchAll: jest.fn(() => this.combinedEntitiesAndMetaData),
    fetchAllIncludingInactive: jest.fn(() => this.combinedEntitiesAndMetaData),
    deactivate: jest.fn(() => this.entity),
    activate: jest.fn(() => this.entity),
    search: jest.fn(() => ({ ids: ['1'], count: 1 })),
  };

  protected baseMutations = {
    addNewlyCreatedId: jest.fn(),
    setEntity: jest.fn(),
    setAllEntities: jest.fn(),
    setMetadata: jest.fn(),
    setAllMetadata: jest.fn(),
  };
}
