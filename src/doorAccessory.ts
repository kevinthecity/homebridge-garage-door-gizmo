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
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    this.service = this.accessory.getService(this.platform.Service.Doorbell) ||
                   this.accessory.addService(this.platform.Service.Doorbell);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    this.service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
      .onGet(this.handleButtonPress.bind(this));
  }

  async handleButtonPress() {
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

    return 0; // No event to return, as this acts like a stateless button
  }
}
