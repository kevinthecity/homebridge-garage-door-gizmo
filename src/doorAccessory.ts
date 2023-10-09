import { PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { ExampleHomebridgePlatform } from './platform';
import axios from 'axios';

export class DoorAccessory {
  private service: Service;
  private platformConfig: PlatformConfig;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.platformConfig = this.platform.config;

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'kevinthecity')
      .setCharacteristic(this.platform.Characteristic.Model, 'Garage-Door-Gizmo-Alpha')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '001');

    this.service = this.accessory.getService(this.platform.Service.Switch) ||
                   this.accessory.addService(this.platform.Service.Switch);
    // {
    //   "device":
    //     {
    //       "uuid":"garage-door-gizmo",
    //       "displayName":"Garage Door Gizmo"
    //     }
    // }
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleOnGet.bind(this))
      .onSet(this.handleOnSet.bind(this));
  }

  async handleOnGet() {
    return false;  // Always off when requested, as it turns itself off automatically
  }

  async handleOnSet(value) {
    if (value) {
      const requestIpAndPath = `http://${this.platform.config.request_ip}/${this.platform.config.path}`;
      this.platform.log.info(`Sending request to ${requestIpAndPath}...`);
      try {
        const response = await axios.get(requestIpAndPath);
        if (response.status === 200) {
          this.platform.log.info('Request was successful!');
        }else{
          this.platform.log.info('Wasn`t a 200 but also didn`t throw error');
        }
      } catch (e) {
        this.platform.log.info(`Error while trying to send GET request to ${requestIpAndPath}`, e);
      }

      // Automatically turn off the switch after a short delay
      setTimeout(() => {
        this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
        this.platform.log.info('Switch off timeout');
      }, 100);
    }
  }
}
