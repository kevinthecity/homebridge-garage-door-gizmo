import {PlatformAccessory, PlatformConfig, Service} from 'homebridge';

import {ExampleHomebridgePlatform} from './platform';
import axios from 'axios';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DoorAccessory {
  private service: Service;
  private platformConfig: PlatformConfig;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.platformConfig = this.platform.config;
    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    this.service =
        this.accessory.getService(this.platform.Service.LockMechanism) ||
        this.accessory.addService(this.platform.Service.LockMechanism);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Lock Current State" characteristic
   */
  async handleLockCurrentStateGet() {
    return 1;
  }


  /**
   * Handle requests to get the current value of the "Lock Target State" characteristic
   */
  async handleLockTargetStateGet() {
    return 1;
  }

  /**
   * Handle requests to set the "Lock Target State" characteristic
   * UNSECURED = 0;
   * SECURED = 1;
   */
  async handleLockTargetStateSet(value) {
    if (value === 0) {
      // Open door
      this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(0);
      this.service.getCharacteristic(this.platform.Characteristic.LockTargetState).updateValue(1);

      // Call HTTP endpoint for opening door
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

      setTimeout(() => {
        // After door has opened successfully, wait 2 seconds to close it again
        this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(1);
        this.service.getCharacteristic(this.platform.Characteristic.LockTargetState).updateValue(1);
        this.platform.log.info('Door close timeout');
      }, 2000);
    } else {
      // Close door
      this.platform.log.info('Closing door');
      this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(1);
      this.service.getCharacteristic(this.platform.Characteristic.LockTargetState).updateValue(0);
    }
  }
}
