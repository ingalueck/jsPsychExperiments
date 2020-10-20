// Modified version of a Prioritized Processing task with lateralized stimuli.
// VPs respond to a laterally presented stimulus (e.g., H,S,K) with left and
// right key-presses ("Q" and "P"). Two of the three letters are assigned to
// left and right keys (primary task), whilst the third letter indicates that
// the background task is to be performed (respond according to stimulus
// location). The proportion of required primary vs. background responses is
// manipulated blockwise, with HighPri vs. LowPri at 90/10 and 50/50,
// respectively.

////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const cc = 'rgba(200, 200, 200, 1)';
const cs = [960, 720];
const cb = '5px solid black';

////////////////////////////////////////////////////////////////////////
//                             Experiment                             //
////////////////////////////////////////////////////////////////////////
const expName = getFileName();
const dirName = getDirName();
const vpNum = genVpNum();
const nFiles = getNumberOfFiles('/Common/num_files.php', dirName + 'data/');

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const prms = {
    nTrlsBase: 4,  // number of trials in Simon baseline blocks
    nBlksBase: 2,  // number of blocks of Simon baseline 
    nTrlsPP: 6,    // number of trials in subsequent blocks
    nBlksPP: 4,
    nBlks: 6,
    fixDur: 500,
    fbDur: [1000, 2500, 2500, 2500],
    iti: 500,
    tooFast: 100,
    tooSlow: 1000,
    respLetters: shuffle(["H", "S", "K"]),
    cTrl: 1, // count trials
    cBlk: 1, // count blocks
    fixWidth: 2,
    fixSize: 10,
    stimSize: '40px monospace',
    fbSize: '30px monospace',
    simonEccentricity: 100,
    respKeys: ["Q", "P", 27],
};

const nVersion = getVersionNumber(nFiles, 2);
jsPsych.data.addProperties({ version: nVersion });

// response keys for baseline simon
let respText_base = "<h3 style='text-align:center;'><b>" + prms.respLetters[0] + " = 'Q'</b> (linker Zeigefinger).</h3>" + 
                    "<h3 style='text-align:center;'><b>" + prms.respLetters[1] + " = 'P'</b> (rechter Zeigefinger).</h3><br>";

let respText_pp = "<h3 style='text-align:center;'><b>" + prms.respLetters[2] + " erscheint links = 'Q'</b> (linker Zeigefinger).</h3>" + 
                  "<h3 style='text-align:center;'><b>" + prms.respLetters[2] + " erscheint rechts = 'P'</b> (rechter Zeigefinger).</h3><br>";

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const task_instructions1 = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    stimulus:
    "<h2 style='text-align: center;'>Willkommen bei unserem Experiment:</h2><br>" +
    "<h3 style='text-align: center;'>Die Teilnahme ist freiwillig und du darfst das Experiment jederzeit abbrechen.</h3><br>" +
    "<h3 style='text-align: center;'>Bitte stelle sicher, dass du dich in einer ruhigen Umgebung befindest und </h3>" +
    "<h3 style='text-align: center;'>genügend Zeit hast, um das Experiment durchzuführen.</h3><br>" +
    "<h3 style='text-align: center;'>Wir bitten dich die ca. 40 Minuten konzentriert zu arbeiten.</h3><br>" +
    "<h2 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren!</h2>",
};

const task_instructions_base = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: cc,
  canvas_size: cs,
  canvas_border: cb,
  stimulus:
    "<h2 style='text-align: center;'>Aufgabe:</h2>" +
    "<h3 style='text-align: left;'>In diesem Experiment musst du auf verschiedene Buchstaben</h3>" +
    "<h3 style='text-align: left;'>reagieren, die rechts oder links auf dem Bildschirm erscheinen.</h3>" +
    "<h3 style='text-align: left;'>Ignoriere die Position des Buchstaben und reagiere immer wie folgt:</h3><br>" +
    respText_base +
    "<h3 style='text-align: center;'>Bitte reagiere immer so schnell und so genau wie möglich!</h3><br>" +
    "<h2 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren.</h2>",
};

const task_instructions_base_reminder = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    stimulus: '',
    on_start: function (trial) {
        trial.stimulus =
            "<h2 style='text-align: center;'>Block " +
            prms.cBlk +
            ' von 6:</h2><br>' +
            "<h3 style='text-align: left;'>Wenn du bereit für den Block bist dann positioniere deine Hände auf die Tastatur.</h3><br>" +
            respText_base +
            "<h2 style='text-align: center;'>Bitte reagiere immer so schnell und so genau wie möglich!</h2>" +
            "<h2 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren!</h2>";
    },
};

const task_instructions_pause = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: cc,
  canvas_size: cs,
  canvas_border: cb,
  stimulus:
    "<h3 style='text-align: left;'>Kurze Pause. Bitte nutze die Pause um dich zu erholen. Wenn du wieder bereit</h3>" +
    "<h3 style='text-align: left;'>für den nächsten Block bist dann drücke eine beliebige Taste.</h3>",
};

const task_instructions_pp = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    stimulus:
    "<h2 style='text-align: center;'>ACHTUNG: Neu Instructionen:</h2>" +
    "<h3 style='text-align: center;'>Buchstaben erscheinen weiterhin rechts oder links auf dem Bildschirm erscheinen.</h3>" +
    "<h3 style='text-align: center;'>Die erste Priorität ist weiterhin auf die Buchstaben wie folgt zu reagieren:</h3><br>" +
    respText_base +
    "<h3 style='text-align: center;'>Wenn der Buchstabe aber K ist, reagiere basierend auf der Position des Buchstabens:</h3><br>" +
    respText_pp +
    "<h2 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren!</h2>",
};

const task_instructions_pp_reminder = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    stimulus: '',
    on_start: function (trial) {
        trial.stimulus =
            "<h2 style='text-align: center;'>Block " +
            prms.cBlk +
            ' von 6:</h2><br>' +
            "<h3 style='text-align: left;'>Wenn du bereit für den Block bist dann positioniere deine Hände auf die Tastatur. </h3>" +
            respText_base +
            "<h3 style='text-align: center;'>Wenn der Buchstabe " + prms.respLetters[2] + " ist, dann reagiere auf Position des Buchstaben:</h3>" +
            respText_pp + 
            "<h2 style='text-align: center;'>Bitte reagiere immer so schnell und so genau wie möglich!</h2>" +
            "<h2 style='text-align: center;'>Drücke eine beliebige Taste, um fortzufahren!</h2>";
    },
};


////////////////////////////////////////////////////////////////////////
//                              Stimuli                               //
////////////////////////////////////////////////////////////////////////
function drawFixation() {
    'use strict';
    let ctx = document.getElementById('canvas').getContext('2d');
    ctx.lineWidth = prms.fixWidth;
    ctx.moveTo(-prms.fixSize, 0);
    ctx.lineTo(prms.fixSize, 0);
    ctx.stroke();
    ctx.moveTo(0, -prms.fixSize);
    ctx.lineTo(0, prms.fixSize);
    ctx.stroke();
}

const fixation_cross = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    trial_duration: prms.fixDur,
    translate_origin: true,
    response_ends_trial: false,
    func: drawFixation,
};

function drawFeedback() {
    'use strict';
    let ctx = document.getElementById('canvas').getContext('2d');
    let dat = jsPsych.data.get().last(1).values()[0];
    ctx.font = prms.fbSize;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    if (dat.blk_type === "simon_base") {
        switch (dat.corrCode) {
            case 1:  // correct
                ctx.fillText("Richtig", 0, 0);
                break;
            case 2: // Falsch
                ctx.fillText("Falsch!", 0, -75);
                ctx.fillText("Zu Erinnerung:", 0, -25);
                ctx.fillText(prms.respLetters[0] + " = 'Q'", 0, 25);
                ctx.fillText(prms.respLetters[1] + " = 'P'", 0, 75);
                break;
            case 3: // Too Slow
                ctx.fillText("Zu langsam!", 0, -75);
                ctx.fillText("Zu Erinnerung:", 0, -25);
                ctx.fillText(prms.respLetters[0] + " = 'Q'", 0, 25);
                ctx.fillText(prms.respLetters[1] + " = 'P'", 0, 75);
                break;
        }
    } else {
        switch (dat.corrCode) {
            case 1:  // correct
                ctx.fillText("Richtig", 0, 0);
                break;
            case 2: // Falsch
                ctx.fillText("Falsch!", 0, -150);
                ctx.fillText("Zu Erinnerung:", 0, -100);
                ctx.fillText(prms.respLetters[0] + " = 'Q'", 0, -50);
                ctx.fillText(prms.respLetters[1] + " = 'P'", 0, 0);
                ctx.fillText(prms.respLetters[2] + " = Position des Buchstaben", 0, 50);
                ctx.fillText("Links = Taste 'Q' (linker Zeigefinger)", 0, 100);
                ctx.fillText("Rechts = Taste 'P' (rechter Zeigefinger", 0, 150);
                break;
            case 3: // Too Slow
                ctx.fillText("Zu langsam!", 0, -150);
                ctx.fillText("Zu Erinnerung:", 0, -100);
                ctx.fillText(prms.respLetters[0] + " = 'Q'", 0, -50);
                ctx.fillText(prms.respLetters[1] + " = 'P'", 0, 0);
                ctx.fillText(prms.respLetters[2] + " = Position des Buchstaben", 0, 50);
                ctx.fillText("Links = Taste 'Q' (linker Zeigefinger)", 0, 100);
                ctx.fillText("Rechts = Taste 'P' (rechter Zeigefinger", 0, 150);
                break;
        }
    }

}

function drawSimon(args) {
    'use strict';
    let ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = prms.stimSize;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // draw Simon
    ctx.fillStyle = "black";
    switch (args.position) {
        case 'left':
            ctx.fillText(args.stimulus, -prms.simonEccentricity, 0);
            break;
        case 'right':
            ctx.fillText(args.stimulus, prms.simonEccentricity, 0);
            break;
    }
}

function codeTrial() {
    'use strict';

    let dat = jsPsych.data.get().last(1).values()[0];

    let corrCode = 0;
    let corrKeyNum = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(dat.corrResp);
    let rt = dat.rt !== null ? dat.rt : prms.tooSlow;
    if (dat.key_press === corrKeyNum && rt < prms.tooSlow) {
        corrCode = 1; // correct
    } else if (dat.key_press !== corrKeyNum && rt < prms.tooSlow) {
        corrCode = 2; // choice error
    } else if (rt >= prms.tooSlow) {
        corrCode = 3; // too slow
    }
  
    // block type: always 4 Simon base blocks first
    let blk_type;
    if (prms.cBlk <= prms.nBlksBase) {
        blk_type = "simon_base";
    } else if (nVersion == 1 & (prms.cBlk <= (prms.nBlksBase + (prms.nBlksPP/2)))) {
        blk_type = "simon_low";
    } else if (nVersion == 1 & (prms.cBlk > (prms.nBlksBase + (prms.nBlksPP/2)))) {
        blk_type = "simon_high";
    } else if (nVersion == 2 & (prms.cBlk <= (prms.nBlksBase + (prms.nBlksPP/2)))) {
        blk_type = "simon_high";
    } else if (nVersion == 2 & (prms.cBlk > (prms.nBlksBase + (prms.nBlksPP/2)))) {
        blk_type = "simon_low";
    }

    jsPsych.data.addDataToLastTrial({
        date: Date(),
        blk_type: blk_type,
        keyPress: dat.key_press,
        rt: rt,
        corrCode: corrCode,
        blockNum: prms.cBlk,
        trialNum: prms.cTrl,
    });
    prms.cTrl += 1;
    if (dat.key_press === 27) {
        jsPsych.endExperiment();
    }

}

const trial_feedback = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    translate_origin: true,
    response_ends_trial: false,
    func: drawFeedback,
    on_start: function (trial) {
        let dat = jsPsych.data.get().last(1).values()[0];
        trial.trial_duration = prms.fbDur[dat.corrCode - 1];
    },
};

const iti = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    trial_duration: prms.iti,
    response_ends_trial: false,
    func: function () {},
};

const block_feedback = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    stimulus: '',
    response_ends_trial: true,
    on_start: function (trial) {
        trial.stimulus = blockFeedbackTxt_de_du({ stim: 'pp_simon' });
    },
};

const simon_stimulus = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    translate_origin: true,
    response_ends_trial: true,
    choices: prms.respKeys,
    trial_duration: prms.tooSlow,
    func: drawSimon,
    func_args: [ 
        { stimulus: jsPsych.timelineVariable('stimulus'), position: jsPsych.timelineVariable('position') },
    ],
    data: {
        stim: 'pp_simon',
        simon: jsPsych.timelineVariable('stimulus'),
        comp: jsPsych.timelineVariable('comp'),
        position: jsPsych.timelineVariable('position'),
        corrResp: jsPsych.timelineVariable('corrResp'),
    },
    on_finish: function () {
        codeTrial();
    },
};

const simon_t1 = [
    { stimulus: prms.respLetters[0], position: 'left',  comp: 'comp',   corrResp: prms.respKeys[0]},
    { stimulus: prms.respLetters[1], position: 'right', comp: 'comp',   corrResp: prms.respKeys[1]},
    { stimulus: prms.respLetters[0], position: 'right', comp: 'incomp', corrResp: prms.respKeys[0]},
    { stimulus: prms.respLetters[1], position: 'left',  comp: 'incomp', corrResp: prms.respKeys[1]} 
];

const trial_timeline_simon_base = {
    timeline: [fixation_cross, simon_stimulus, trial_feedback],
    timeline_variables: simon_t1
};

const simon_t2 = [
    { stimulus: prms.respLetters[2], position: 'left',  comp: 'comp', corrResp: prms.respKeys[0]},
    { stimulus: prms.respLetters[2], position: 'right', comp: 'comp', corrResp: prms.respKeys[1]},
];

const trial_timeline_simon_low = {
    timeline: [fixation_cross, simon_stimulus, trial_feedback],
    timeline_variables: simon_t1.concat(simon_t2)  
};

const trial_timeline_simon_high = {
    timeline: [fixation_cross, simon_stimulus, trial_feedback],
    timeline_variables: simon_t1.concat(simon_t2)  
};

const randomString = generateRandomString(16);

const alphaNum = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: cc,
    canvas_size: cs,
    canvas_border: cb,
    response_ends_trial: true,
    choices: [32],
    stimulus:
    "<h3 style='text-align:left;'>Wenn du eine Versuchspersonenstunde benötigst, </h3>" +
    "<h3 style='text-align:left;'>kopiere den folgenden zufällig generierten Code</h3>" +
    "<h3 style='text-align:left;'>und sende diesen zusammen mit deiner Matrikelnummer per Email an:</h3><br>" +
    '<h2>xxx@xxx</h2>' +
    '<h1>Code: ' +
    randomString +
    '</h1><br>' +
    "<h2 align='left'>Drücke die Leertaste, um fortzufahren!</h2>",
};

////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////
function genExpSeq() {
    'use strict';

    let exp = [];

    exp.push(fullscreen_on);
    exp.push(welcome_de_du);
    exp.push(resize_de_du);
    // exp.push(vpInfoForm_de);
    exp.push(hideMouseCursor);
    exp.push(screenInfo);
    exp.push(task_instructions1);

    // baseline Simon block    
    exp.push(task_instructions_base);
    for (let blk = 0; blk < prms.nBlksBase; blk += 1) {
        exp.push(task_instructions_base_reminder);
        let blk_timeline_simon_base = { ...trial_timeline_simon_base };
        blk_timeline_simon_base.sample = { type: 'fixed-repetitions', size: prms.nTrlsBase / 4 };
        exp.push(blk_timeline_simon_base);   // trials within a block
        exp.push(block_feedback);            // show previous block performance
        exp.push(task_instructions_pause);
    }

    
    // PP Simon block    
    exp.push(task_instructions_pp);
    let blk_prob;
    if (nVersion % 2 == 0) {
        blk_prob = repeatArray(["L"], prms.nBlksPP/2).concat(repeatArray(["H"], prms.nBlksPP/2));
    } else {
        blk_prob = repeatArray(["H"], prms.nBlksPP/2).concat(repeatArray(["L"], prms.nBlksPP/2));
    }

    let blk_timeline_pp;
    for (let blk = 0; blk < prms.nBlksPP; blk += 1) {
        exp.push(task_instructions_pp_reminder);
        if (blk_prob[blk] === "L") {
            blk_timeline_pp = { ...trial_timeline_simon_low };
        } else if (blk_prob[blk] === "H") {
            blk_timeline_pp = { ...trial_timeline_simon_high };
        }
        blk_timeline_pp.sample = { type: 'fixed-repetitions', size: prms.nTrlsBase / 40 };
        exp.push(blk_timeline_pp);   // trials within a block
        exp.push(block_feedback);    // show previous block performance
        exp.push(task_instructions_pause);
    }

    exp.push(debrief_de);
    exp.push(showMouseCursor);
    exp.push(alphaNum);
    exp.push(fullscreen_off);

    return exp;
}
const EXP = genExpSeq();

const data_filename = dirName + 'data/' + expName + '_' + vpNum;
const code_filename = dirName + 'code/' + expName;

jsPsych.init({
    timeline: EXP,
    fullscreen: true,
    show_progress_bar: false,
    exclusions: {
        min_width: cs[0],
        min_height: cs[1],
    },
    on_finish: function () {
        saveData('/Common/write_data.php', data_filename, { stim: 'pp_simon' });
        saveRandomCode('/Common/write_code.php', code_filename, randomString);
    },
});
