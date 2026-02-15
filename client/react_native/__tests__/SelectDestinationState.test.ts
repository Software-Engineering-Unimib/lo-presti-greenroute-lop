import SelectDestinationState from "../app/states/SelectDestinationState.ts";
import SelectStartState from "../app/states/SelectStartState.ts";
import RoutesListState from "../app/states/RoutesListState.ts";


jest.mock('../app/states/SelectStartState.ts');
jest.mock('../app/states/RoutesListState.ts');


describe('SelectDestinationState', () => {
  let mockApp: any;
  let state: SelectDestinationState;
  const startPoint = { latitude: 45.4642, longitude: 9.1900 };

  beforeEach(() => {
    mockApp = {
      setState: jest.fn(),
      setPanelState: jest.fn()
    };
    state = new SelectDestinationState(mockApp, startPoint);
    jest.clearAllMocks();
  });

  it('onMapPressed dovrebbe cancellare il pin e passare a RoutesListState', () => {
    state.onMapPressed(45.4773, 9.1815);
    expect(mockApp.setState).toHaveBeenCalledWith({ pin: null });
    expect(mockApp.setPanelState).toHaveBeenCalledWith(expect.any(RoutesListState));
  });

  it('il pulsante di annullamento dovrebbe cancellare il pin e tornare a SelectStartState', () => {
    const contents = state.panelContents;
    const view = contents[0] as any;
    
    const returnButton = view.props.children.find((c: any) => c && c.key === 'return-button');
    expect(returnButton).toBeDefined();

    returnButton.props.onPress();

    expect(mockApp.setState).toHaveBeenCalledWith({ pin: null });
    expect(mockApp.setPanelState).toHaveBeenCalledWith(expect.any(SelectStartState));
  });
});
