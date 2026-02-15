import App from "../App.ts"
import PanelState from "./PanelState.ts"
import {
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import Geolocation from 'react-native-geolocation-service';


export default abstract class PositionSelectionState extends PanelState {
  protected currentSelection: GeoPoint | null;

  constructor(parentApp: App) {
    super(parentApp);
    this.currentSelection = null;

    // bind dei metodi per preservare 'this'
    this.handleGetGPSLocation = this.handleGetGPSLocation.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
  }

  protected abstract goToNextPanel(): void;

  protected setSelectionAndContinue(latitude: number, longitude: number): void {
    this.currentSelection = { latitude: latitude, longitude: longitude };
    this.goToNextPanel();
  }

  public onMapPressed(latitude: number, longitude: number): void {
    this.setSelectionAndContinue(latitude, longitude);
  }

  protected getCurrentLocation =  async (): Promise<void> => {
    try {
      const position: GeolocationResponse = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      this.setSelectionAndContinue(latitude, longitude);
    } catch (err: any) {
      console.warn('Geolocation error:', err);

      const geolocationError: GeolocationError = err;
      switch (geolocationError?.code) {
        case 1:
          Alert.alert(
            'Permesso negato',
            "L'accesso alla posizione è stato negato.",
          );
          break;
        case 2:
          Alert.alert(
            "Non è stato possibile ottenere la posizione GPS.",
            "Attivare l'impostazione sul telefono."
          );
          break;
        case 3:
          Alert.alert('Timeout posizione', 'Non è stato possibile ottenere la posizione (timeout). Riprova.');
          break;
        default:
          Alert.alert('Errore posizione', geolocationError?.message || "Errore sconosciuto durante l'ottenimento della posizione.");
      }
    }
  }

  protected handleGetGPSLocation =  async (): Promise<void> => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permesso posizione',
          message: 'Questa app ha bisogno del permesso di accesso alla posizione.',
          buttonPositive: 'OK'
        }
      );

      await this.getCurrentLocation();
    } else {
      // TODO (per ios)
    }
  }
}