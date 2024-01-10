import helpers from '../../helpers';

describe('setElementA11yAttribute', () => {
  it('changes the attribute of elements that are found in the document with a certain selector', async () => {
    const element = {
      getAttribute: jest.fn(() => 'foo'),
      setAttribute: jest.fn(),
    };
    const spy = jest.spyOn(document, 'querySelectorAll').mockImplementation(() => ([element]));

    helpers.setElementA11yAttribute('selector', 'role', 'bar');
    expect(element.setAttribute).toHaveBeenCalledWith('role', 'bar');

    spy.mockRestore();
  });

  it('does not change the attribute of the elements if they already have that role', async () => {
    const element = {
      getAttribute: jest.fn(() => 'foo'),
      setAttribute: jest.fn(),
    };
    helpers.setElementA11yAttribute('selector', 'role', 'foo');
    expect(element.setAttribute).not.toHaveBeenCalled();
  });
});
