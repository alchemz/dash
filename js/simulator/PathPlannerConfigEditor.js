import Car from "../physics/Car.js";

const LOCAL_STORAGE_KEY = 'dashPathPlannerConfig';

const internalConfig = {
  lattice: {
    numStations: 8,
    numLatitudes: 17,
    stationConnectivity: 3,
    latitudeConnectivity: 7
  },

  laneWidth: 3.7 * 2, // meters

  numDynamicFrames: 10,
  numDynamicSubframes: 4,

  dCurvatureMax: Car.MAX_STEER_SPEED / Car.WHEEL_BASE,
  rearAxleToCenter: -Car.REAR_AXLE_POS
};

const defaultConfig = {
  spatialHorizon: 125, // meters
  centerlineStationInterval: 0.5, // meters

  xyGridCellSize: 0.3, // meters
  slGridCellSize: 0.15, // meters
  gridMargin: 20, // meters
  pathSamplingStep: 1, // meters

  cubicPathPenalty: 0,

  collisionDilationS: Car.HALF_CAR_LENGTH + 8, // meters
  hazardDilationS: 12, // meters
  collisionDilationL: Car.HALF_CAR_WIDTH + 0.5, //meters
  hazardDilationL: 1, // meters

  dynamicHazardDilationS: 24,
  dynamicHazardDilationL: 1.5,

  obstacleHazardCost: 100,

  laneCenterLatitude: internalConfig.laneWidth / 4,
  laneShoulderLatitude: internalConfig.laneWidth / 2 - Car.HALF_CAR_WIDTH,
  lanePreference: +1,
  laneCostSlope: 15, // cost / meter
  lanePreferenceDiscount: 40,

  stationReachDiscount: 400,
  extraTimePenalty: 1000,

  hysteresisDiscount: 50,

  speedLimit: 20, // m/s
  speedLimitPenalty: 50,

  hardAccelerationPenalty: 70,
  hardDecelerationPenalty: 50,

  softLateralAccelerationLimit: 4, // m/s^2
  softLateralAccelerationPenalty: 100,
  linearLateralAccelerationPenalty: 10,

  accelerationChangePenalty: 10
};

export default class PathPlannerConfigEditor {
  constructor() {
    this._config = Object.assign({}, defaultConfig);

    this.showConfigBox = document.getElementById('show-config-box');
    this.configBox = document.getElementById('config-box-content');
    this.configForm = document.getElementById('config-form');

    this._setUpButtons();

    let storedConfig = {};
    try {
      storedConfig = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    } catch (e) {}

    for (const key of Object.keys(this._config).sort()) {
      if (storedConfig[key] !== undefined) this._config[key] = storedConfig[key];
      this.configForm.appendChild(this._createConfigField(key, this._config[key]));
    }
  }

  get config() {
    return Object.assign({}, this._config, internalConfig);
  }

  _setUpButtons() {
    document.getElementById('show-config-button').addEventListener('click', e => {
      this.showConfigBox.classList.add('is-hidden');
      this.configBox.classList.remove('is-hidden');
    });

    document.getElementById('hide-config-button').addEventListener('click', e => {
      this.showConfigBox.classList.remove('is-hidden');
      this.configBox.classList.add('is-hidden');
    });

    document.getElementById('save-config-button').addEventListener('click', this._saveConfigFields.bind(this));
    document.getElementById('restore-defaults-config-button').addEventListener('click', this._restoreDefaults.bind(this));
  }

  _createConfigField(key, value) {
    const html =
      `<div class="field is-horizontal">
          <div class="field-label is-small" style="flex-grow: 100;">
              <label class="label has-text-grey-light" for="config-field-${key}">${key}</label>
          </div>
          <div class="field-body">
              <div class="field">
                  <div class="control" style="margin-right: 16px;">
                      <input id="config-field-${key}" name="${key}" class="input is-small ${value !== defaultConfig[key] ? 'is-danger' : ''}" type="text" style="width: 60px; border-width: 2px;" value="${value}" />
                  </div>
              </div>
          </div>
      </div>`;

    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
  }

  _saveConfigFields() {
    const formData = new FormData(this.configForm);

    for (const [k, v] of formData.entries()) {
      const parsedValue = Number.parseFloat(v);
      this._config[k] = parsedValue

      const fieldDom = document.getElementById(`config-field-${k}`);
      if (parsedValue === defaultConfig[k])
        fieldDom.classList.remove('is-danger');
      else
        fieldDom.classList.add('is-danger');
    }

    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._config));
    } catch (e) {}
  }

  _restoreDefaults() {
    this._config = Object.assign({}, defaultConfig);

    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}

    while (this.configForm.firstChild)
      this.configForm.removeChild(this.configForm.firstChild);

    for (const key of Object.keys(this._config).sort())
      this.configForm.appendChild(this._createConfigField(key, this._config[key]));
  }
}
