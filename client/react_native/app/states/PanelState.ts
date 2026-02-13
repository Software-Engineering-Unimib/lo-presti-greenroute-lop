import App from "../App.ts"

export default abstract class PanelState {
  protected readonly parentApp: App;

  constructor(parentApp: App) {
    this.parentApp = parentApp;
  }

  abstract get panelContents(): React.ReactNode[];

  public onMapPressed(latitude: number, longitude: number) {}
}
