export class UIStateStorageMock {
  protected getters = {
    getSearchTableState: jest.fn(),
    getAllSearchIds: jest.fn(),
  }

  protected mutations = {
    setSearchTableState: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    mutations: this.mutations,
  })
}
