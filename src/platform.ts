import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';


import {PLATFORM_NAME, PLUGIN_NAME} from './settings';
import {DoorAccessory} from './doorAccessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ExampleHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // Used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', PLATFORM_NAME);
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // Add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    this.log.info('Start discovering devices');

    const doorDeviceTemplate = {
      uuid: 'garage-door-gizmo',
      displayName: 'Garage Door Gizmo',
    };

    const uuid = this.api.hap.uuid.generate(doorDeviceTemplate.uuid);
    const existingDoorAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingDoorAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingDoorAccessory.displayName);
      new DoorAccessory(this, existingDoorAccessory);
    } else {
      this.log.info('Adding new accessory:', doorDeviceTemplate.displayName);
      const createdAccessory = new this.api.platformAccessory(doorDeviceTemplate.displayName, uuid);
      createdAccessory.context.device = doorDeviceTemplate;
      new DoorAccessory(this, createdAccessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [createdAccessory]);
    }
  }
}
