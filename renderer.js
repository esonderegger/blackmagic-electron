const serialport = require('serialport');
const Readline = require('@serialport/parser-readline');

let activePort = null;

const FUNC_CAMERA = 0;
const FUNC_MODE = 1;
const FUNC_GAIN = 2;
const FUNC_TEMP = 3;
const FUNC_SHUTTER = 4;
const FUNC_APERTURE = 5;
const FUNC_FOCUS = 6;
const FUNC_ZOOM = 7;

const portSelect = document.getElementById('port-select');

async function listPorts() {
  const allPorts = await serialport.list();
  const usablePorts = allPorts.filter((p) => p.manufacturer);
  if (usablePorts.length > 0) {
    activePort = new serialport(usablePorts[0].path, { baudRate: 9600 });
    const parser = activePort.pipe(new Readline({ delimiter: '\n' }));
    parser.on('data', data => {
      console.log('got word from arduino:', data);
    });
  }
  usablePorts.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.text = p.path;
    opt.value = p.path;
    portSelect.appendChild(opt);
  });
}

async function sendCommand(funcIndex, val) {
  if (activePort) {
    // await activePort.write(`${msg}\n`);
    await activePort.write([funcIndex, val, 255]);
  }
}

listPorts();

const videoModes = [
  "720p50    ",
  "720p59.94 ",
  "720p60    ",
  "1080i25   ",
  "1080i29.97",
  "1080i30   ",
  "1080p23.98",
  "1080p24   ",
  "1080p25   ",
  "1080p29.97",
  "1080p30   ",
  "1080p50   ",
  "1080p59.94",
  "1080p60   ",
  "2160p23.98",
  "2160p24   ",
  "2160p25   ",
  "2160p29.97",
  "2160p30   ",
];
const modeSelect = document.getElementById('mode-select');
videoModes.forEach((m, i) => {
  const opt = document.createElement('option');
  opt.text = m;
  opt.value = i;
  modeSelect.appendChild(opt);
});
modeSelect.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  sendCommand(FUNC_MODE, val);
};

const shutterVals = [50, 60, 75, 90, 100, 120, 150, 180, 250, 360, 500, 725, 1000, 1450, 2000];
const shutterRange = document.getElementById('shutter');
const shutterDisplay = document.getElementById('shutter-display');

shutterRange.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  shutterDisplay.innerText = `1/${shutterVals[val]}`;
  sendCommand(FUNC_SHUTTER, val);
};

const apertureVals = [1.0, 1.2, 1.4, 1.7, 2.0, 2.4, 2.8, 3.3, 4.0, 4.8, 5.6, 6.7, 8.0, 9.5, 11.0, 13.0, 16.0];
const apertureRange = document.getElementById('aperture');
const apertureDisplay = document.getElementById('aperture-display');

apertureRange.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  apertureDisplay.innerText = `f${apertureVals[val].toFixed(1)}`;
  sendCommand(FUNC_APERTURE, val);
};


const isoRange = document.getElementById('iso');
const isoDisplay = document.getElementById('iso-display');

isoRange.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  const newISO = 100 * 2**val;
  isoDisplay.innerText = newISO.toString();
  sendCommand(FUNC_GAIN, val);
};

const tempVals = [2500, 2800, 3000, 3200, 3400, 3600, 4000, 4500, 4800, 5000, 5200, 5400, 5600, 6000, 6500, 7000, 7500, 8000];
const tempRange = document.getElementById('temp');
const tempDisplay = document.getElementById('temp-display');

tempRange.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  tempDisplay.innerText = tempVals[val].toString();
  sendCommand(FUNC_TEMP, val);
};

const focusRange = document.getElementById('focus');
const focusDisplay = document.getElementById('focus-display');

focusRange.onchange = (evt) => {
  const val = parseFloat(evt.target.value);
  focusDisplay.innerText = val.toFixed(2);
  sendCommand(FUNC_FOCUS, Math.round(val * 100));
};

const zoomRange = document.getElementById('zoom');
const zoomDisplay = document.getElementById('zoom-display');

zoomRange.onchange = (evt) => {
  const val = parseInt(evt.target.value);
  zoomDisplay.innerText = val.toString();
  sendCommand(FUNC_ZOOM, val);
};
