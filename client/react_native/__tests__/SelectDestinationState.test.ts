import SelectDestinationState from "../app/states/SelectDestinationState.ts";
import SelectStartState from "../app/states/SelectStartState.ts";
import RoutesListState from "../app/states/RoutesListState.ts";


jest.mock("../app/constants", () => ({SERVER_URL: "http://mockhost:3000"}));
jest.mock('../app/states/SelectStartState.ts');
(global as any).fetch = jest.fn();

describe('SelectDestinationState', () => {
  let mockRoutes: any;
  let mockApp: any;
  let state: SelectDestinationState;
  const startPoint = { latitude: 45.4642, longitude: 9.1900 };

  beforeEach(() => {
    mockRoutes = [{ time: '10 min', distance: '2 km', geojson: {} }];
    ((global as any).fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRoutes
    });
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
