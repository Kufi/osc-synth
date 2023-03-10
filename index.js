let oscillators = []
let down = false;
let lastColor = "rgb(255,255,255)";
let targetColor = "rgb(255,255,255)";
let color = "rgb(255,255,255)";
let percent = 0;
let leftside;
let octave = 1;
let created = false
let selected = 0;
let playing = false;
let animation;


var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

const screen = document.querySelector('.screen')
const startText = document.querySelector('#start-text')


let isOn = [false, false, false, false];



//what should max freqencies be
//how important is typing in freq
//why do it scroll on the bottom / not center


//theoritical coding questions
//is it okay to have errors all up in my console
//should i have made an object with all these things
//am i properly using global variables or should more variables be passed through functions
//should there be more functions
//does it actually matter how clean the code looks should i just focus on moving forward
//how should code be lookin that goes off the side of the page
//is it horrible the lack of comments i have

const ac = new AudioContext();

const button = document.querySelector("button");
const body = document.querySelector("body");

const controlBox = [document.querySelector(`#osc1`), document.querySelector(`#osc2`), document.querySelector(`#osc3`), document.querySelector(`#osc4`)];

const noteDisplay = 
[document.querySelector('#osc1 .box h1'), document.querySelector('#osc2 .box h1'), 
document.querySelector('#osc3 .box h1'), document.querySelector('#osc4 .box h1'), ]

const switches = [document.getElementById('switch1'), document.getElementById('switch2'), document.getElementById('switch3'), document.getElementById('switch4'), ]

const oscTypes = 
  [document.querySelector("#osc1 #type"), document.querySelector("#osc2 #type"),
  document.querySelector("#osc3 #type"),document.querySelector("#osc4 #type")]

const freqSliders = 
  [document.querySelector("#osc1 #frequency"), document.querySelector("#osc2 #frequency"),
  document.querySelector("#osc3 #frequency"), document.querySelector("#osc4 #frequency")]

const gainSliders = 
  [document.querySelector("#osc1 #gain"), document.querySelector("#osc2 #gain"),
   document.querySelector("#osc3 #gain"), document.querySelector("#osc4 #gain")];

const gainNodes = [new GainNode(ac, {gain: 0.5}), new GainNode(ac, {gain: 0.5}), new GainNode(ac, {gain: 0.5}), new GainNode(ac, {gain: 0.5})];
const analysers = 
  [new AnalyserNode(ac, {smoothingTimeConstant: 1, fftSize: 2048}), new AnalyserNode(ac, {smoothingTimeConstant: 1, fftSize: 2048}), 
   new AnalyserNode(ac, {smoothingTimeConstant: 1, fftSize: 2048}), new AnalyserNode(ac, {smoothingTimeConstant: 1, fftSize: 2048}), ];

const dataArrays = 
  [new Uint8Array(analysers[0].frequencyBinCount), new Uint8Array(analysers[1].frequencyBinCount),
   new Uint8Array(analysers[2].frequencyBinCount), new Uint8Array(analysers[3].frequencyBinCount)];

const compressor = ac.createDynamicsCompressor()


let pixelRatio, sizeOnScreen, segmentWidth;

const canvas = document.getElementById("canvas"),

c = canvas.getContext("2d");

function getRgb(color) {
  let [r, g, b] = color.replace('rgb(', '')
    .replace(')', '')
    .split(',')
    .map(str => Number(str));;
  return {
    r,
    g,
    b
  }
}

function colorInterpolate(colorA, colorB, intval) {
  const rgbA = getRgb(colorA),
    rgbB = getRgb(colorB);

  const colorVal = (prop) =>
    Math.round(rgbA[prop] * (1 - intval) + rgbB[prop] * intval);
  return `rgb(${colorVal('r')},${colorVal('g')},${colorVal('b')})`;
  
}



const setValues = function(freq) {
    lastColor = color;
    percent = 0; 
    let min = 100;
    let max = 2000;
    let red = 0;
    let green = 255;
    let blue = 255;

    let sections = (max - min)/4;
    let multiplier = 255/sections;
    // console.log("freq:" + freq);
    if(freq < min + sections) {
      red = 0;
      green = (freq-min) * multiplier;
      blue = 255;
      
    }
    else if(freq < min + sections*2) {
      red = 0;
      green = 255;
      blue = Math.abs(((freq - (min + sections) ) * multiplier)-255) //0 = 0 and 150 = 255

    }
    else if(freq < min + sections*3) {
      red = (freq - (min + (sections * 2))) * multiplier //800 - 950
      green = 255
      blue = 0;
    }
    else if(freq < min + sections*4) {
      red = 255
      green = Math.abs( ( (freq - (min + sections * 3) ) * multiplier)-255)
      blue = 0
    }
    else{
      red = 255;
      green = 0;
      blue = 0;
    }



    
    targetColor = `rgb(${red}, ${green}, ${blue})`;

}

const setColor = function() {
  color = colorInterpolate(lastColor, targetColor, percent);
  screen.style.boxShadow = `0px 0px 10px 10px ${color}`;
  c.strokeStyle = color;
}

const startAnimating = function(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animation = window.requestAnimationFrame(animate);
}

const stopAnimation = function(){
  window.cancelAnimationFrame(animation);
  screen.style.boxShadow = `none`;
  c.fillRect(0, 0, canvas.width, canvas.height);
}

const animate = function() {

  // request another frame

  animation = window.requestAnimationFrame(animate);

  // calc elapsed time since last loop

  now = Date.now();
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {

    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now - (elapsed % fpsInterval);

    // drawing code 
    for(let i = 0; i<4; i++)
      analysers[i].getByteTimeDomainData(dataArrays[i]);
      
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.beginPath();

    
    for (let i = 1; i < analysers[0].frequencyBinCount; i += 1) {
      let xv1 = dataArrays[0][i] / 128.0;
      let x1 = (xv1 * canvas.width) / 2;

      let yv1 = dataArrays[1][i] / 128.0;
      let y1 = (yv1 * canvas.height) / 2;

      let xv2 = dataArrays[2][i] / 128.0;
      let x2 = (xv2 * canvas.width) / 2;

      let yv2 = dataArrays[3][i] / 128.0;
      let y2 = (yv2 * canvas.height) / 2;
      
      x = (x1 + x2) - canvas.width/2;
      y = (y1 + y2) - canvas.height/2;
      
      c.lineTo(x, y);
      
    }
    
    if(percent<1) {
      percent += 0.02;
    }

    setColor();
    c.stroke();



  }
}


// const draw = function() {

  

//   requestAnimationFrame(draw);
  
//   for(let i = 0; i<4; i++)
//     analysers[i].getByteTimeDomainData(dataArrays[i]);

//   c.fillRect(0, 0, canvas.width, canvas.height);
//   c.beginPath();

  
//   for (let i = 1; i < analysers[0].frequencyBinCount; i += 1) {
//     let xv1 = dataArrays[0][i] / 128.0;
//     let x1 = (xv1 * canvas.width) / 2;

//     let yv1 = dataArrays[1][i] / 128.0;
//     let y1 = (yv1 * canvas.height) / 2;

//     let xv2 = dataArrays[2][i] / 128.0;
//     let x2 = (xv2 * canvas.width) / 2;

//     let yv2 = dataArrays[3][i] / 128.0;
//     let y2 = (yv2 * canvas.height) / 2;
    
//     x = (x1 + x2) - canvas.width/2;
//     y = (y1 + y2) - canvas.height/2;
    
//     c.lineTo(x, y);
    
//   }
  
//   if(percent<1)
//     percent += 0.01;
//   //interpolation rate changes, must be due to frame rate changes



//   setColor();

//   c.stroke();
// };

const createSynth = function(i){
  // console.log("creating synth: " + i);

  oscillators[i] = new OscillatorNode(ac, {
    type: oscTypes[i].value,
    frequency: freqSliders[i].value    
  });
  oscillators[i].connect(gainNodes[i]);
  gainNodes[i].connect(analysers[i]);
  analysers[i].connect(compressor);
  compressor.connect(ac.destination);
  oscillators[i].start();

  isOn[i] = true;

  setValues(freqSliders[i].value)
  
}



body.addEventListener("keydown", function(event){
  // if(event.key == " " && !created) {
  //   created = true;
  //   console.log("starting...")
  //   createSynth();
  //   return;
  // }

  
  

  if(event.key == 'z' && octave >= 0.5){
    octave = octave/2;
    return;
  }
  if(event.key == 'x' && octave <= 4){
    octave = octave*2;
    return;
  }

  let freq = -1;


  if(event.key == 'a'){
    freq = 261.63 * octave;
    noteDisplay[selected].textContent = 'C'
  }
  if(event.key == 'w'){
    freq = 277.18 * octave;
    noteDisplay[selected].textContent = 'C#/Db'
  }
  if(event.key == 's'){
    freq = 293.66 * octave;
    noteDisplay[selected].textContent = 'D'
  }
  if(event.key == 'e'){
    freq = 311.13 * octave;
    noteDisplay[selected].textContent = 'D#/Eb'
  }
  if(event.key == 'd'){
    freq = 329.63 * octave;
    noteDisplay[selected].textContent = 'E'
  }
  if(event.key == 'f'){
    freq = 349.23 * octave;
    noteDisplay[selected].textContent = 'F'
  }
  if(event.key == 't'){
    freq = 369.99 * octave;
    noteDisplay[selected].textContent = 'F#/Gb'
  }
  if(event.key == 'g'){
    freq = 392.00 * octave;
    noteDisplay[selected].textContent = 'G'
  }
  if(event.key == 'y'){
    freq = 415.30 * octave;
    noteDisplay[selected].textContent = 'G#/Ab'
  }
  if(event.key == 'h'){
    freq = 440.00 * octave;
    noteDisplay[selected].textContent = 'A'
  }
  if(event.key == 'u'){
    freq = 466.16 * octave;
    noteDisplay[selected].textContent = 'A#/Bb'
  }
  if(event.key == 'j'){
    freq = 493.88 * octave;
    noteDisplay[selected].textContent = 'B'
  }
  if(event.key == 'k'){
    freq = 523.25 * octave;
    noteDisplay[selected].textContent = 'C'
  }
  if(event.key == 'o'){
    freq = 554.37 * octave;
    noteDisplay[selected].textContent = 'C#/Db'
  }
  if(event.key == 'l'){
    freq = 587.33 * octave;
    noteDisplay[selected].textContent = 'D'
  }

  if(freq < 0)
    return  

  

  if(isOn[selected]) {
    oscillators[selected].frequency.value = freq;
  }
  freqSliders[selected].value = freq;
  document.querySelector(`#osc${selected+1} #frequencyValue`).innerHTML = freq;
  setValues(freq)
  
});

body.addEventListener("keyup", function(event){



})



//add event listeners to controls
for(let i = 0; i < 4; i++) {

  switches[i].addEventListener('change', function(){
    // console.log("switching")
    if(this.checked){
      if(!playing) {
        startAnimating(60);
        startText.classList.remove("visible");
        startText.classList.add("hidden");
        playing = true;
      }
      createSynth(i);
    }
    else{

      // console.log("stopping synth " + i);
      oscillators[i].stop()
      noteDisplay[i].textContent = '_'
      isOn[i] = false

    }
    if(!switches[0].checked && !switches[1].checked && !switches[2].checked && !switches[3].checked){
      // console.log('ato')
      stopAnimation();
      playing = false;
      startText.classList.remove("hidden");
      startText.classList.add("visible");
        
      
      //need to stop animation for it to work
    }
  });

  controlBox[i].addEventListener('click', function(){
    controlBox[selected].classList.remove('selected');
    selected = i;
    console.log("beep")
    controlBox[i].classList.add('selected');
    if(isOn[i]){
      setValues(oscillators[i].frequency.value);
    }
    
  });

  freqSliders[i].addEventListener("input", (event) => {
    let freq = event.target.value;
    document.querySelector(`#osc${i+1} #frequencyValue`).innerHTML = freq;

    if(isOn[i]) {
      oscillators[i].frequency.value = freq;
    }
    noteDisplay[i].textContent = "_"
    
    setValues(freq)
  });
  
  oscTypes[i].addEventListener("change", (event) => {
    {
      if(isOn[i]) {
        oscillators[i].type = event.target.value;
      }
    }
  });
  
  gainSliders[i].addEventListener("input", (event) => {
    let gain = event.target.value;
    document.querySelector(`#osc${i+1} #gainValue`).innerHTML = gain;
    gainNodes[i].gain.value = gain;
  });
}



//body.style.height = window.offsetHeight + "px";

canvas.style.width = screen.offsetWidth + "px";
canvas.style.height = screen.offsetHeight + "px";
pixelRatio = window.devicePixelRatio;
sizeOnScreen = canvas.getBoundingClientRect();
canvas.width = sizeOnScreen.width * pixelRatio;
canvas.height = sizeOnScreen.height * pixelRatio;
canvas.style.width = canvas.width / pixelRatio + "px";
canvas.style.height = canvas.height / pixelRatio + "px";



c.fillStyle = "#181818";
c.fillRect(0, 0, canvas.width, canvas.height);



