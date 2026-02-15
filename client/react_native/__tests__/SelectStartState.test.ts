import SelectStartState from "../app/states/SelectStartState.ts";
import SelectDestinationState from "../app/states/SelectDestinationState.ts";


describe('SelectStartState', () => {
  let mockApp: any;
  let state: SelectStartState;

  beforeEach(() => {
    mockApp = {
      setState: jest.fn(),
      setPanelState: jest.fn()
    };
    state = new SelectStartState(mockApp);
    jest.clearAllMocks();
  });

  it('dovrebbe inizializzarsi con selezione nulla', () => {
    expect((state as any).currentSelection).toBeNull();
  });

  it('onMapPressed dovrebbe impostare il pin e passare a SelectDestinationState', () => {
    state.onMapPressed(45.4642, 9.1900);
    expect(mockApp.setState).toHaveBeenCalledWith({ pin: { latitude: 45.4642, longitude: 9.1900 } });
    expect(mockApp.setPanelState).toHaveBeenCalledWith(expect.any(SelectDestinationState));
  });
});
