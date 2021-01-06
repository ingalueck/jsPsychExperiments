// Flanker Task using the mouse
// Each individual trial is split into three phases:
// Phase 1: Trial Initiation
//      Participant is required to initiate the trial by moving the cursor into a
//      "Trial Initiation" region (start box).
//      Option 1: Just enter the start box region to initiate the trial.
//      Option 2: Enter the start box region AND press the left mouse button to initiate the trial.
// Phase 2: Fixation Cross (X ms)
// Phase 3: Stimulus presented --> Participant is required to move mouse cursor to one of two
//      response regions (reponse boxes) to execute the reponse.
//      Option 1: Just enter the response box to end the trial.
//      Option 2: Enter the response box and press the left mouse button.
//
// Whether the start box and both response boxes are drawn during each phase is controlled within
//  prms using an array (length = 3) of bools (see below).
//
//  The size of the response boxes is manipulated giving a 2*2 design:
//  Flanker compatibility (comp vs. incomp) X Response Box Size (small vs. large)

////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const canvas_colour = "rgba(200, 200, 200, 1)";
const canvas_size = [1280, 960];
const canvas_border = "5px solid black";

////////////////////////////////////////////////////////////////////////
//                             Experiment                             //
////////////////////////////////////////////////////////////////////////
const expName = getFileName();
const dirName = getDirName();
const vpNum = genVpNum();
const nFiles = getNumberOfFiles("/Common/num_files.php", dirName + "data/");

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const prms = {
  nTrlsP: 8, // number of trials in first block (practice)
  nTrlsE: 8, // number of trials in subsequent blocks
  nBlks: 4,
  fixDur: 500, // fixation cross duration
  fbDur: 500, // feedback duration
  waitDur: 1000,
  iti: 500, // inter-trial-interval
  stimPos: [canvas_size[0] / 2, canvas_size[1] / 2], // x,y position of stimulus
  startBox: [canvas_size[0] / 2, canvas_size[1] * 0.9, 50, 50], // xpos, ypos, xsize, ysize
  leftBox: [100, 100, 50, 50], // xpos, ypos, xsize, ysize
  rightBox: [1180, 100, 50, 50], // xpos, ypos, xsize, ysize
  responseBoxSizeAdjust: 25, // response boxes are +- X pixels different in height/width from start size
  drawStartBox: [true, true, true], // draw response boxes at trial initiation, fixation cross, and response execution stages
  drawResponseBoxes: [false, true, true], // draw response boxes at trial initiation, fixation cross, and response execution stages
  requireMousePressStart: true, // is mouse button press inside start box required to initiate trial?
  requireMousePressFinish: true, // is mouse button press inside response box required to end trial?
  fbTxt: ["Richtig", "Falsch"],
  cTrl: 1, // count trials
  cBlk: 1, // count blocks
};

const nVersion = getVersionNumber(nFiles, 2);
jsPsych.data.addProperties({ version: nVersion });
let respText;
if (nVersion === 1) {
  prms.resp_loc = ["left", "right"];
  respText =
    "<h3 style='text-align:center;'><b>H = Left &ensp;&ensp;&ensp; S = Right</b></h3><br>";
} else {
  prms.resp_loc = ["right", "left"];
  respText =
    "<h3 style='text-align:center;'><b>S = Left &ensp;&ensp;&ensp; H = Right</b></h3><br>";
}

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const task_instructions = {
  type: "html-keyboard-response",
  stimulus:
    "<H1 style='text-align: left;'>BITTE NUR TEILNEHMEN, FALLS EINE</H1>" +
    "<H1 style='text-align: left;'>COMPUTER-MAUS ZUR VERFÜGUNG STEHT!</H1><br>" +
    "<H2 style='text-align: left;'>Liebe/r Teilnehmer/in</H2><br>" +
    "<H3 style='text-align: left;'>im Experiment werden Sie in jedem Durchgang 3 Quadrate sehen. Zu Beginn</H3>" +
    "<H3 style='text-align: left;'>des Durchgangs bewegen Sie die Maus in das Quadrat am unteren Bildschirmrand</H3>" +
    "<H3 style='text-align: left;'>und klicken in das Quadrat. Dann erscheint eine der folgenden Aussagen:</H3><br>" +
    respText +
    "<h3 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren!</h3>",
  post_trial_gap: prms.waitDur,
};

////////////////////////////////////////////////////////////////////////
//                        Experiment Functions                        //
////////////////////////////////////////////////////////////////////////

const trial_stimulus = {
  type: "mouse-response",
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  fixation_duration: prms.fixDur,
  stimulus: jsPsych.timelineVariable("stim"),
  stimulus_position: prms.stimPos,
  stimulus_colour: "black",
  start_box: prms.startBox,
  resp_size: jsPsych.timelineVariable("resp_size"),
  left_box: prms.leftBox,
  right_box: prms.rightBox,
  draw_start_box: prms.drawStartBox,
  draw_response_boxes: prms.drawResponseBoxes,
  require_mouse_press_start: prms.requireMousePressStart,
  require_mouse_press_finish: prms.requireMousePressFinish,
  scale_factor: null,
  data: {
    stim_type: "mouse_flanker",
    stim: jsPsych.timelineVariable("stim"),
    comp: jsPsych.timelineVariable("comp"),
    resp_size: jsPsych.timelineVariable("resp_size"),
    resp_loc: jsPsych.timelineVariable("resp_loc"),
  },
  on_start: function (trial) {
    let dat = jsPsych.data.get().last(1).values()[0];
    trial.scale_factor = dat.scale_factor;
    if (trial.data.resp_size === "large") {
      trial.left_box[2] += prms.responseBoxSizeAdjust;
      trial.left_box[3] += prms.responseBoxSizeAdjust;
      trial.right_box[2] += prms.responseBoxSizeAdjust;
      trial.right_box[3] += prms.responseBoxSizeAdjust;
    } else if (trial.data.resp_size === "small") {
      trial.left_box[2] -= prms.responseBoxSizeAdjust;
      trial.left_box[3] -= prms.responseBoxSizeAdjust;
      trial.right_box[2] -= prms.responseBoxSizeAdjust;
      trial.right_box[3] -= prms.responseBoxSizeAdjust;
    }
  },
  on_finish: function () {
    codeTrial();
  },
};

// Trials coded as Correct 0, Error 1
function codeTrial() {
  "use strict";
  let dat = jsPsych.data.get().last(1).values()[0];
  let corrCode = dat.resp_loc == dat.end_loc ? 0 : 1;
  jsPsych.data.addDataToLastTrial({
    date: Date(),
    corrCode: corrCode,
    blockNum: prms.cBlk,
    trialNum: prms.cTrl,
  });
  prms.cTrl += 1;
}

// Feedback is draw at response location
function drawFeedback() {
  "use strict";
  let ctx = document.getElementById("canvas").getContext("2d");
  let dat = jsPsych.data.get().last(1).values()[0];
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(prms.fbTxt[dat.corrCode], dat.end_x, dat.end_y);
}

const trial_feedback = {
  type: "static-canvas-keyboard-response",
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  trial_duration: 500,
  translate_origin: false,
  func: drawFeedback,
};

const iti = {
  type: "static-canvas-keyboard-response",
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  trial_duration: prms.iti,
  response_ends_trial: false,
  func: function () {},
};

// prettier-ignore
stimuli = [
  { stim: 'HHHHH', comp: 'comp',   resp_size: 'large', resp_loc: prms.resp_loc[0] },
  { stim: 'SSSSS', comp: 'comp',   resp_size: 'large', resp_loc: prms.resp_loc[1] },
  { stim: 'HHSHH', comp: 'incomp', resp_size: 'large', resp_loc: prms.resp_loc[1] },
  { stim: 'SSHSS', comp: 'incomp', resp_size: 'large', resp_loc: prms.resp_loc[0] },
  { stim: 'HHHHH', comp: 'comp',   resp_size: 'small', resp_loc: prms.resp_loc[0] },
  { stim: 'SSSSS', comp: 'comp',   resp_size: 'small', resp_loc: prms.resp_loc[1] },
  { stim: 'HHSHH', comp: 'incomp', resp_size: 'small', resp_loc: prms.resp_loc[1] },
  { stim: 'SSHSS', comp: 'incomp', resp_size: 'small', resp_loc: prms.resp_loc[0] },
];

// Block feedback shows:
// Block Number, Mean RT + ER from previous block
function blockFeedbackTxt(filter_options) {
  "use strict";
  let dat = jsPsych.data
    .get()
    .filter({ ...filter_options, blockNum: prms.cBlk });
  let nTotal = dat.count();
  let nError = dat.select("corrCode").values.filter(function (x) {
    return x !== 0;
  }).length;
  dat = jsPsych.data
    .get()
    .filter({ ...filter_options, blockNum: prms.cBlk, corrCode: 0 });
  let blockFbTxt =
    "<H1>Block: " +
    prms.cBlk +
    " of " +
    prms.nBlks +
    "</H1>" +
    "<H1>Mean RT: " +
    Math.round(dat.select("end_rt").mean()) +
    " ms </H1>" +
    "<H1>Error Rate: " +
    Math.round((nError / nTotal) * 100) +
    " %</H1>" +
    "<H2>Drücke eine beliebige Taste, um fortzufahren!</H2>";
  prms.cBlk += 1;
  return blockFbTxt;
}

const block_feedback = {
  type: "html-keyboard-response",
  stimulus: "",
  response_ends_trial: true,
  post_trial_gap: prms.waitDur,
  on_start: function (trial) {
    trial.stimulus = blockFeedbackTxt({ stim_type: "mouse_flanker" });
  },
};

const trial_timeline = {
  timeline: [trial_stimulus, trial_feedback, iti],
  randomize_order: true,
  timeline_variables: stimuli,
};

////////////////////////////////////////////////////////////////////////
//                              De-brief                              //
////////////////////////////////////////////////////////////////////////

// For VP Stunden
const randomString = generateRandomStringWithExpName("mc1", 16);

const alphaNum = {
  type: "html-keyboard-response-canvas",
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  response_ends_trial: true,
  choices: [32],
  stimulus: generate_formatted_html({
    text:
      `Vielen Dank für Ihre Teilnahme.<br><br>
        Wenn Sie Versuchspersonenstunden benötigen, kopieren Sie den folgenden
        zufällig generierten Code und senden Sie diesen zusammen mit Ihrer
        Matrikelnummer per Email mit dem Betreff 'Versuchpersonenstunde'
        an:<br><br>sprachstudien@psycho.uni-tuebingen.de<br> Code: ` +
      randomString +
      `<br><br>Drücken Sie die Leertaste, um fortzufahren!`,
    fontsize: 28,
    lineheight: 1.0,
    align: "left",
  }),
};

////////////////////////////////////////////////////////////////////////
//                                Save                                //
////////////////////////////////////////////////////////////////////////
const save_data = {
  type: "call-function",
  func: function () {
    let data_filename = dirName + "data/" + expName + "_" + vpNum;
    saveData(
      "/Common/write_data_json.php",
      data_filename,
      { stim: "mouse_flanker" },
      "json"
    );
  },
  timing_post_trial: 200,
};

const save_code = {
  type: "call-function",
  func: function () {
    let code_filename = dirName + "code/" + expName;
    saveRandomCode("/Common/write_code.php", code_filename, randomString);
  },
  timing_post_trial: 200,
};

////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////
function genExpSeq() {
  "use strict";

  let exp = [];
  exp.push(fullscreen_on);
  exp.push(welcome_de);
  exp.push(resize_de);
  // exp.push(vpInfoForm_de);
  exp.push(task_instructions);

  for (let blk = 0; blk < prms.nBlks; blk += 1) {
    let blk_timeline = { ...trial_timeline };
    blk_timeline.sample = {
      type: "fixed-repetitions",
      size: blk === 0 ? prms.nTrlsP / 8 : prms.nTrlsE / 8,
    };
    exp.push(blk_timeline); // trials within a block
    exp.push(block_feedback); // show previous block performance
  }

  // save data
  exp.push(save_data);
  exp.push(save_code);

  // debrief
  exp.push(debrief_de);
  exp.push(alphaNum);
  exp.push(fullscreen_off);

  return exp;
}
const EXP = genExpSeq();

jsPsych.init({
  timeline: EXP,
  show_progress_bar: false,
});