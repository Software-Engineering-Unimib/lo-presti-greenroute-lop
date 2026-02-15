import RouteState from "../app/states/RouteState.ts";
import { EMPTY_ROUTE } from "../app/constants.ts";


jest.mock("../app/constants", () => ({SERVER_URL: "http://mockhost:3000"}));
describe('RouteState', () => {
  let mockApp: any;
  let mockLastPanel: any;
  const mockRoute = {
    geojson: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } },
    instructions: [{ text: 'Turn left' }, { text: 'Go straight' }]
  };

  beforeEach(() => {
    mockApp = {
      setState: jest.fn(),
      setPanelState: jest.fn()
    };
    mockLastPanel = { name: 'MockLastPanel' };
    jest.clearAllMocks();
  });

  it('dovrebbe impostare il percorso dell\'app all\'inizializzazione', () => {
    new RouteState(mockApp, mockRoute, mockLastPanel);
    expect(mockApp.setState).toHaveBeenCalledWith({ route: mockRoute.geojson });
  });

  it('il pulsante di ritorno dovrebbe reimpostare il percorso e tornare all\'ultimo pannello', () => {
    const state = new RouteState(mockApp, mockRoute, mockLastPanel);
    const contents = state.panelContents;
    const view = contents[0] as any;
    
    // Structure: View -> [Button, ScrollView]
    const returnButton = view.props.children[0];
    expect(returnButton.key).toBe('return-button');
    
    returnButton.props.onPress();

    expect(mockApp.setState).toHaveBeenCalledWith({ route: EMPTY_ROUTE });
    expect(mockApp.setPanelState).toHaveBeenCalledWith(mockLastPanel);
  });

  it('dovrebbe visualizzare le istruzioni in ScrollView', () => {
    const state = new RouteState(mockApp, mockRoute, mockLastPanel);
    const contents = state.panelContents;
    const view = contents[0] as any;
    
    const scrollView = view.props.children[1];
    expect(scrollView.key).toBe('instructions-container');
    
    // ScrollView children (the logic uses ...elements)
    const instructions = scrollView.props.children;
    expect(instructions).toHaveLength(2);
    expect(instructions[0].props.children).toBe('Turn left');
    expect(instructions[1].props.children).toBe('Go straight');
  });
});
