import RoutesListState from "../app/states/RoutesListState.ts";
import RouteState from "../app/states/RouteState.ts";
import SelectDestinationState from "../app/states/SelectDestinationState.ts";


(global as any).fetch = jest.fn();


describe('RoutesListState', () => {
  let mockRoutes: any;
  let mockApp: any;
  let capturedState: any = null;
  const start = { latitude: 45.4642, longitude: 9.1900 };
  const end = { latitude: 45.8566, longitude: 9.3977 };

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
    mockApp.setPanelState.mockImplementation((state: any) => {
      capturedState = state;
    });
    jest.clearAllMocks();
  });

  it('dovrebbe recuperare i percorsi all\'inizializzazione e aggiornare lo stato dell\'app', async () => {
    const state = new RoutesListState(mockApp, start, end);

    await new Promise(resolve => setTimeout(() => resolve(null), 0));

    expect((global as any).fetch).toHaveBeenCalled();
    expect(mockApp.setState).toHaveBeenCalledWith({ arePathsFetched: true });
    expect((state as any).pathsList).toEqual(mockRoutes);
  });

  it('la selezione di un percorso dovrebbe passare a RouteState correttamente', async () => {
    const state = new RoutesListState(mockApp, start, end);
    await new Promise(resolve => setTimeout(() => resolve(null), 0));

    const contents = state.panelContents;
    const view = contents[0] as any;
    const routeButton = view.props.children.find((c: any) => c && c.key === 'path-0');
    
    routeButton.props.onPress();

    expect(mockApp.setPanelState).toHaveBeenCalledWith(expect.any(RouteState));
    expect(capturedState.route).toBe(mockRoutes[0]);
  });

  it('il pulsante di ritorno dovrebbe tornare a SelectDestinationState correttamente', async () => {
    const state = new RoutesListState(mockApp, start, end);
    await new Promise(resolve => setTimeout(() => resolve(null), 0));

    const contents = state.panelContents;
    const view = contents[0] as any;
    const returnButton = view.props.children.find((c: any) => c && c.key === 'return-button');

    returnButton.props.onPress();

    expect(mockApp.setState).toHaveBeenCalledWith({ pin: start, arePathsFetched: false });
    expect(mockApp.setPanelState).toHaveBeenCalledWith(expect.any(SelectDestinationState));
    expect(capturedState.parentApp).toBe(mockApp);
    expect(capturedState.start).toBe(start);
  });
});
