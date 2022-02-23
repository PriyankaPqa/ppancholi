export class UIStateStorageMock {
  protected getters = {
    getSearchTableState: jest.fn(),
  }

  protected mutations = {
    setSearchTableState: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    mutations: this.mutations,
  })
}
