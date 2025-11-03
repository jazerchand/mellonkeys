// console.log("hola");

let midiOutputControllerName;
const midiDropdown = document.getElementById('midi_dropdown');

let jThresh = 0.2;
let defaultOctave = 4;

let gamepadFlag = false;
let gamepad_i;

let gamepadPing = setInterval(() => {
  if (gamepadFlag) gamepadManager(gamepad_i);
  
}, 10);


midiDropdown.addEventListener("change", (e)=>{
  updateMidiOutputController();
});

window.addEventListener("gamepadconnected", (e) => {
  gamepadFlag = true;
  hidePrompter();
  navigator.getGamepads().forEach((gamepad,i) => {
    if(gamepad!=null){
        // console.log(gamepad);
        gamepad_i = i;
        gamepadManager(gamepad_i);
    }
  });
});

window.addEventListener("gamepaddisconnected", (e) => {
  alert("disconnected");
  gamepadFlag = false;
});

function hidePrompter(){
  document.getElementById('prompter').style.display="none";
  document.getElementById('gamepad_loader').style.display="flex";
  document.querySelectorAll('#gamepad_svg path').forEach((path) => {
    path.style.animation = 'draw_svg 1s ease-out forwards';
  });
};


WebMidi.enable().then(onMIDIEnabled).catch(err => alert(err));

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
  'tr_butt': false
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
  'tr_butt': false
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
  7:'tr_butt'
}

let noteMapper = {
  'l_butt': "C",
  'r_butt': "F",
  't_butt': "D",
  'b_butt': "E",
  'dl_butt': "C#",
  'dr_butt': "F#",
  'dt_butt': "D#",
  'dd_butt': "B",
  'sl_butt': "G",
  'sr_butt': "A",
  'tl_butt': "G#",
  'tr_butt': "A#"
}


function gamepadManager(i){
  // console.log("runningggg!");
  const player1 = navigator.getGamepads()[i];
  let leftJoyY = player1.axes[1];
  let rightJoyY = player1.axes[3];
  let octave;
  // JOYSTICKS
  let leftJoyState = getJoyState(leftJoyY);
  let rightJoyState = getJoyState(rightJoyY);

  // Check if left is up & right is down
  if (leftJoyState == "up" && rightJoyState == "up") {
    octave = defaultOctave;
    octave+=2;
  } 
  // Check if left is down & right is up
  else if (leftJoyState == "down" && rightJoyState == "down") {
    octave = defaultOctave;
    octave-=2;
  } 
  // Check if either is up
  else if (leftJoyState == "up" || rightJoyState == "up") {
    octave = defaultOctave;
    octave+=1;
  } 
  // Check if either is down
  else if (leftJoyState == "down" || rightJoyState == "down") {
    octave = defaultOctave;
    octave-=1;
  } 
  // Check if both are neutral
  else if (leftJoyState == "neutral" && rightJoyState == "neutral") {
    octave = defaultOctave;
  }

  // BUTTONS
  player1.buttons.forEach((button,i) => {
    let j = buttonMapper[i];
    if(button.pressed==true){
      if(p1Started[j]==false){
        p1Flag[j] = true;
        // console.log(j+' started');
        p1Started[j]=true;
        let noteID=noteMapper[j]+octave;
        midiManager(noteID,true,midiOutputControllerName);
      }
    }else{
      if(p1Flag[j]==true){
      // console.log(j+' completed');   
        p1Flag[j] = false;
        p1Started[j]=false;
        let noteID=noteMapper[j]+octave;
        midiManager(noteID,false,midiOutputControllerName);
      } 
    }
  });
  // console.dir(player1);
  // gamepadFlag = false;
}

function getJoyState(x){
  if (x < -jThresh) {
    return "up";
  } else if (x > jThresh) {
    return "down";
  } else {
    return "neutral";
  }
}

function midiManager(noteID,state,deviceName){
  let midiDevice = WebMidi.getOutputByName(deviceName);
  // midiDevice.setChannel(1);
  if(state){
    // console.log("played "+noteID);
    midiDevice.playNote(noteID,{attack:0.64, channels:[1]}); 
    // midiDevice.playNote(noteID, { 
    //   attack: 0.5, 
    //   duration: 10 
    // });
    
  }else{
    // console.log("stopped "+noteID);
    midiDevice.stopNote(noteID,{channels:[1]});
  }
}

