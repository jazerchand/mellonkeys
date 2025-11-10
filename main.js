// console.log("hola");

let midiOutputControllerName;
const midiDropdown = document.getElementById('midi_dropdown');

let startbttn = document.getElementById('start');

let loaderscreen = document.getElementById('loader_window');
let instruments=[];
let keyVelocity=0.85;

let jThresh = 0.9;
let defaultOctave = 4;

let gamepadFlag = false;
let gamepad_i;

let gamepadPing = setInterval(() => {
  if (gamepadFlag) gamepadManager(gamepad_i);
}, 3);


startbttn.addEventListener('mousedown', function(){
  startbttn.style.display = 'none';
  document.getElementById('loading_icon').style.display="block";
  setupPiano().then(result => {
    instruments.push(result);
    console.dir("got "+instruments[0]+" back");
    playTheme(instruments[0],2,.5);
    document.getElementById('preloader').style.display="none";
    }).catch(err =>{
      console.log(err);
    });
});

function playTheme(instrument, duration, velocity){
    instrument.triggerAttackRelease("C3",duration,Tone.now(),velocity);
    instrument.triggerAttackRelease("G3",duration,Tone.now()+.1,velocity);
    instrument.triggerAttackRelease("B3",duration,Tone.now()+.2,velocity);
    instrument.triggerAttackRelease("C4",duration,Tone.now()+.4,velocity);
}

async function setupPiano() {
    await Tone.start();
    let piano =  new Tone.Sampler({
	urls: {
    "C3":"C3.mp3",
    "D#3":"Ds3.mp3",
    "F#3":"Fs3.mp3",
    "A3":"A3.mp3",
    "C4":"C4.mp3",
    "D#4":"Ds4.mp3",
    "F#4":"Fs4.mp3",
    "A4":"A4.mp3",
    "C5":"C5.mp3",
    "D#5":"Ds5.mp3",
    "F#5":"Fs5.mp3",
    "A5":"A5.mp3",
    "C6":"C6.mp3",
    "D#6":"Ds6.mp3",
    "F#6":"Fs6.mp3",
    "A6":"A6.mp3"
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    await Tone.loaded();

    return piano;
};

midiDropdown.addEventListener("change", (e)=>{
  updateMidiOutputController();
});

window.addEventListener("gamepadconnected", (e) => {
  gamepadFlag = true;
  hidePrompter();
  navigator.getGamepads().forEach((gamepad,i) => {
    if(gamepad!=null){
        console.log(gamepad);
        gamepad_i = i;
        gamepadManager(gamepad_i);
    }
  });
});

window.addEventListener("gamepaddisconnected", (e) => {
  alert("Controller disconnected");
  gamepadFlag = false;
});



function hidePrompter(){
  document.getElementById('prompter').style.display="none";
  document.getElementById('gamepad_loader').style.display="flex";
  document.querySelectorAll('#gamepad_svg path').forEach((path) => {
    path.style.animation = 'draw_svg 1s ease-out forwards';
  });
};


// DISABLED MIDI
function turnOnMidi(){
  WebMidi.enable().then(onMIDIEnabled).catch(err => alert(err));
}

function onMIDIEnabled(){
     WebMidi.addListener("connected", (e) => {
      // console.log(`MIDI connected: ${e.port.name}`);
      refreshMidiDevices();
    });
    WebMidi.addListener("disconnected", (e) => {
        // console.log(`MIDI disconnected: ${e.port.name}`);
        refreshMidiDevices();
    });
    updateDropdown();
    updateMidiOutputController();
}


function refreshMidiDevices(){
  clearDropdown();
  updateDropdown();
  updateMidiOutputController();
}

function updateDropdown(){
  const dropdown = document.getElementById('midi_dropdown');
  // console.log(WebMidi.outputs);
  let first_device = true;
  if(WebMidi.outputs.length>0){
    WebMidi.outputs.forEach(midi_device => {
      const option = document.createElement('option');
      option.value = midi_device.name;
      if (first_device) option.selected = true;
      option.textContent = midi_device.name;
      dropdown.appendChild(option);
      first_device = false;
    });
  }
  else{
    const option = document.createElement('option');
      option.value = null;
      option.selected = true;
      option.disabled = true;
      option.hidden = true;
      option.textContent = 'No MIDI Devices found :/';

    dropdown.appendChild(option);
  }
};

function clearDropdown() {
  const dropdown = document.getElementById('midi_dropdown');
  dropdown.innerHTML = '';
}

function updateMidiOutputController(){
  midiOutputControllerName =  midiDropdown.value;
  // console.log("MIDI Controller set to: "+midiOutputControllerName);
}


let p1Flag = {
  'l_butt': false,
  'r_butt': false,
  't_butt': false,
  'b_butt': false,
  'dl_butt': false,
  'dr_butt': false,
  'dt_butt': false,
  'dd_butt': false,
  'sl_butt': false,
  'sr_butt': false,
  'tl_butt': false,
  'tr_butt': false,
  'mr_butt': false,
  'ml_butt': false,
  'jr_butt': false
}

let p1Started = {
  'l_butt': false,
  'r_butt': false,
  't_butt': false,
  'b_butt': false,
  'dl_butt': false,
  'dr_butt': false,
  'dt_butt': false,
  'dd_butt': false,
  'sl_butt': false,
  'sr_butt': false,
  'tl_butt': false,
  'tr_butt': false,
  'mr_butt': false,
  'ml_butt': false,
  'jr_butt': false
}

let buttonMapper = {
  2: 'l_butt',
  1: 'r_butt',
  3: 't_butt',
  0: 'b_butt',
  14:'dl_butt',
  15:'dr_butt',
  12:'dt_butt',
  13:'dd_butt',
  4:'sl_butt',
  5:'sr_butt',
  6:'tl_butt',
  7:'tr_butt',
  9:'mr_butt',
  8:'ml_butt',
  11: 'jr_butt'
}

let noteMapper = {
  'l_butt': "C",
  'r_butt': "F",
  't_butt': "D",
  'b_butt': "E",
  'dl_butt': "C#",
  'dr_butt': "F#",
  'dt_butt': "D#",
  'dd_butt': "F#",
  'sl_butt': "G",
  'sr_butt': "A",
  'tl_butt': "G#",
  'tr_butt': "A#",
  'mr_butt': "B"
}

let pianoMapper = {
  "C": "svg_c",
  "F": "svg_f",
  "D": "svg_d",
  "E": "svg_e",
  "C#": "svg_csharp",
  "F#": "svg_fsharp",
  "D#": "svg_dsharp",
  "F#": "svg_fsharp",
  "G": "svg_g",
  "A": "svg_a",
  "G#": "svg_gsharp",
  "A#": "svg_asharp",
  "B": "svg_b"
}

let noteOnList = [];

function gamepadManager(i){
  // console.log("runningggg!");
  const player1 = navigator.getGamepads()[i];
  let leftJoyY = player1.axes[1];
  let rightJoyY = player1.axes[3];
  let leftJoyX = player1.axes[0];
  let rightJoyX = player1.axes[2];
  let activeJoyCount = 0;
  let octave;

  // JOYSTICKS
  let leftJoyState = getJoyState(leftJoyY, leftJoyX);
  let rightJoyState = getJoyState(rightJoyY, rightJoyX);

  if (leftJoyState != "neutral"){
    activeJoyCount++;
  };
  if (rightJoyState != "neutral"){
    activeJoyCount++;
  };


  // Check if both are active
  if (activeJoyCount > 1){
    octave = defaultOctave;
    octaveTrackManager(octave);
  }
  // Check if either is right
  else if (leftJoyState == "right" || rightJoyState == "right"){
    octave = defaultOctave;
    octave+=1;
    octaveTrackManager(octave);
  }
  // Check if either is left
  else if(leftJoyState == "left" || rightJoyState == "left"){
    octave = defaultOctave;
    octave-=1;
    octaveTrackManager(octave);
  }
  // Check if either is up
  else if (leftJoyState == "up" || rightJoyState == "up") {
    octave = defaultOctave;
    octave+=2;
    octaveTrackManager(octave);
  } 
  // Check if either is down
  else if (leftJoyState == "down" || rightJoyState == "down") {
    octave = defaultOctave;
    octave-=2;
    octaveTrackManager(octave);
  } 
  // Check if both are neutral
  else if (leftJoyState == "neutral" && rightJoyState == "neutral") {
    octave = defaultOctave;
    octaveTrackManager(octave);
  }

  // BUTTONS
  player1.buttons.forEach((button,i) => {
    let j = buttonMapper[i];
    if(button.pressed==true){
      if(p1Started[j]==false){
        p1Flag[j] = true;
        // console.log(j+' started');
        p1Started[j]=true;
        if(noteMapper[j]){
          let noteID=noteMapper[j]+octave;
            samplerManager(noteID,true, instruments[0]);
          // midiManager(noteID,true,midiOutputControllerName);
        }else{
          // console.log("paused cache: " +noteOnList);
          noteOnListToggle(false);
          if(j=='jr_butt'){
            // console.log("cleared cache");
            noteOnList.length = 0;
          }
        }
      }
    }
    else{
      if(p1Flag[j]==true){
      // console.log(j+' completed');   
        p1Flag[j] = false;
        p1Started[j]=false;
        if(noteMapper[j]){
          let noteID=noteMapper[j]+octave;
            samplerManager(noteID,false, instruments[0]);
          // midiManager(noteID,false,midiOutputControllerName);
        }else{
          if(j=='ml_butt'){
          // console.log("unpaused cache");
          noteOnListToggle(true);
          }
        }
      } 
    }
  });
  // console.dir(player1);
  // gamepadFlag = false;
}

function getJoyState(y,x){
  if (y < -jThresh) {
    return "up";
  } else if (y > jThresh) {
    return "down";
  } else if (x<-jThresh){
    return "left";
  }else if(x>jThresh){
    return "right";
  }
  else {
    return "neutral";
  }
}

function midiManager(noteID,state,deviceName, ignorePop=false){
  let midiDevice = WebMidi.getOutputByName(deviceName);
  if(state){
    midiDevice.playNote(noteID,{attack:0.64, channels:[1]}); 
    highlightPiano(true,noteID,"svg-highlight");
    if(!ignorePop){
      noteOnList.push(noteID);
    }
    // console.log(noteOnList);
  }else{
    midiDevice.stopNote(noteID,{channels:[1]});
    highlightPiano(false,noteID,"svg-highlight");
    if(!ignorePop){
      noteOnListPopper(noteID);
    }
    // console.log(noteOnList);
  }
}


function samplerManager(noteID,state,instrument, ignorePop=false){
  if(state){
    instrument.triggerAttack(noteID,Tone.now(),keyVelocity); 
    highlightPiano(true,noteID,"svg-highlight");
    if(!ignorePop){
      noteOnList.push(noteID);
    }
    console.log(noteOnList);
  }else{
    instrument.triggerRelease(noteID);
    highlightPiano(false,noteID,"svg-highlight");
    if(!ignorePop){
      noteOnListPopper(noteID);
    }
    console.log(noteOnList);
  }
}

function noteOnListPopper(noteID){
  let tempList = noteOnList.filter(item => item != noteID);
  noteOnList = tempList;
}

function noteOnListToggle(state, deviceName){
  if(noteOnList.length>0){
    if(!state){
      noteOnList.forEach(note => {
        samplerManager(note,false, instruments[0],true);
        // midiManager(note,false,midiOutputControllerName,true);
      });
    }else{
      noteOnList.forEach(note => {
        samplerManager(note,true, instruments[0],true);
        // midiManager(note,true,midiOutputControllerName,true);
      });
    };
  }
}

function highlightPiano(state,noteID,className){
  let note = noteID.slice(0, -1); 
  let key = document.getElementById(pianoMapper[note]);
  if(state){
    key.classList.add(className);
  }else{
    key.classList.remove(className);
  }
}

// initalise with value that matches no other octave value (default[0], +-1, +-2)
let octaveGapChecker=8;

function octaveTrackManager(octave){
  let gap = octave-defaultOctave;
  if(octaveGapChecker!=gap){
    // console.log("octave update called");
    octaveGapChecker = gap;
    // console.log(octaveGapChecker);
    let highGroup = document.getElementById("oct_"+gap);
    let octaveGroups = document.getElementsByClassName("octave_svg");
    for (let x of octaveGroups) {
      x.classList.remove("svg-active");
    }
    highGroup.classList.add("svg-active");
  }
}