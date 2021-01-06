// Mouse start box and end boxes whilst recording x,y mouse posiiton
//   RBL                   RBR
//
//              +
//
//              SB

jsPsych.plugins['mouse-response'] = (function () {
  let plugin = {};

  plugin.info = {
    name: 'mouse-response',
    description: '',
    parameters: {
      func_args: {
        type: jsPsych.plugins.parameterType.DICT,
        array: true,
        pretty_name: 'Args',
        default: {},
        description: 'Function arguments',
      },
      canvas_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'Canvas Colour',
        default: 'white',
        description: 'Canvas Colour.',
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Canvas Size',
        default: [1280, 960],
        description: 'Canvas Size.',
      },
      canvas_border: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Border Style',
        default: '0px solid black',
        description: 'Border Style',
      },
      scale_factor: {
        type: jsPsych.plugins.parameterType.FLOAT,
        array: false,
        pretty_name: 'Scale Factor',
        default: 1,
        description: 'Scale Factor',
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'Fixation Duration',
        default: 500,
        description: 'Fixation Duration',
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus',
        default: 'Hello, world!',
        description: 'Stimulus',
      },
      stimulus_position: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Position',
        default: [0, 0],
        description: 'Stimulus Position',
      },
      stimulus_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Colour',
        default: 'black',
        description: 'Stimulus Colour',
      },
      stimulus_font: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Font',
        default: '50px arial',
        description: 'Stimulus Font',
      },
      start_box: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Start Box',
        default: [0, 0, 100, 100],
        description: 'Start Box',
      },
      left_box: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Left Box',
        default: [0, 0, 100, 100],
        description: 'Left Box',
      },
      right_box: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Right Box',
        default: [0, 0, 100, 100],
        description: 'Right Box',
      },
      draw_start_box: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        pretty_name: 'Args',
        default: [true, true, true],
        description: 'Draw Response Boxes',
      },
      draw_response_boxes: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        pretty_name: 'Draw Response Boxes',
        default: [false, false, true],
        description: 'Draw Response Boxes',
      },
      require_mouse_press_start: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: false,
        pretty_name: 'Require Mouse Press Start',
        default: false,
        description: 'Require Mouse Press Start',
      },
      require_mouse_press_finish: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: false,
        pretty_name: 'Require Mouse Press Response',
        default: false,
        description: 'Require Mouse Press Response',
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial Duration',
        default: null,
        description: 'How long to show trial before it ends.',
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    // setup canvas
    var new_html =
      '<div>' +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      '</div>';

    display_element.innerHTML = new_html;
    let canvas = document.getElementById('canvas');
    let ctx = document.getElementById('canvas').getContext('2d');

    // canvas mouse events
    $('#canvas').mousedown(function (e) {
      handleMouseDown(e);
    });
    $('#canvas').mousemove(function (e) {
      handleMouseMove(e);
    });

    // canvas property
    let canvasOffset = $(canvas).offset();
    let offsetX = canvasOffset.left;
    let offsetY = canvasOffset.top;

    // stimulus font properties
    ctx.font = trial.stimulus_font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // data
    let x_coords = [];
    let y_coords = [];
    let time = [];
    let start_X = null;
    let start_Y = null;
    let end_X = null;
    let end_Y = null;
    let start_time = null;
    let start_rt = null;
    let end_rt = null;
    let end_loc = null;

    // flags for drawing
    let trial_initiated = false;
    let movement_initiated = false;
    let draw_start_box = trial.draw_start_box;
    let draw_fixation = false;
    let draw_response_boxes = trial.draw_response_boxes[0];
    let draw_stimulus = false;

    // start/response boxes
    let start_box = {
      x: trial.start_box[0] - trial.start_box[2] / 2,
      y: trial.start_box[1] - trial.start_box[3] / 2,
      h: trial.start_box[2],
      w: trial.start_box[3],
    };

    let left_responsebox = {
      x: trial.left_box[0] - trial.left_box[2] / 2,
      y: trial.left_box[1] - trial.left_box[3] / 2,
      h: trial.left_box[2],
      w: trial.left_box[3],
    };

    let right_responsebox = {
      x: trial.right_box[0] - trial.right_box[2] / 2,
      y: trial.right_box[1] - trial.right_box[3] / 2,
      h: trial.right_box[2],
      w: trial.right_box[3],
    };

    // initial draw
    draw();

    // trial is initiated by pressing the mouse button inside the start box
    function handleMouseDown(e) {
      e.preventDefault();
      let X = (parseInt(e.clientX) - offsetX) / trial.scale_factor;
      let Y = (parseInt(e.clientY) - offsetY) / trial.scale_factor;
      if (!trial_initiated) {
        if (in_box(X, Y, start_box)) {
          start_trial(X, Y);
        }
      } else {
        if (in_box(X, Y, left_responsebox) || in_box(X, Y, right_responsebox)) {
          end_trial();
        }
      }
    }

    function handleMouseMove(e) {
      e.preventDefault();
      let X = (parseInt(e.clientX) - offsetX) / trial.scale_factor;
      let Y = (parseInt(e.clientY) - offsetY) / trial.scale_factor;

      if (!trial_initiated && !trial.require_mouse_press_start) {
        if (in_box(X, Y, start_box)) {
          start_trial(X, Y);
        }
      }

      if (trial_initiated === false) {
        return;
      }

      // response movement started?
      if (!movement_initiated && !in_box(X, Y, start_box)) {
        start_rt = performance.now() - start_time;
        movement_initiated = true;
      }

      // store coordinates and time array
      x_coords.push(X);
      y_coords.push(Y);
      time.push(performance.now() - start_time);

      // response movement finished just by entering response box
      if (!trial.require_mouse_press_finish) {
        if (in_box(X, Y, left_responsebox) || in_box(X, Y, right_responsebox)) {
          end_trial();
        }
      }
    }

    // clear the canvas and draw text
    function draw() {
      // canvas
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // start box
      if (draw_start_box) {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.rect(start_box.x, start_box.y, start_box.w, start_box.h);
        ctx.stroke();
      }

      // fixation cross
      if (draw_fixation) {
        ctx.fillStyle = trial.stimulus_colour;
        ctx.fillText('+', trial.stimulus_position[0], trial.stimulus_position[1]);
        jsPsych.pluginAPI.setTimeout(function () {
          draw_fixation = false;
          draw_stimulus = true;
          draw_start_box = trial.draw_start_box[2];
          draw_response_boxes = trial.draw_response_boxes[2];
          draw();
        }, trial.fixation_duration);
      }

      if (draw_response_boxes) {
        // response box left
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.rect(left_responsebox.x, left_responsebox.y, left_responsebox.w, left_responsebox.h);
        ctx.stroke();
        // response box right
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.rect(right_responsebox.x, right_responsebox.y, right_responsebox.w, right_responsebox.h);
        ctx.stroke();
      }

      // draw stimulus
      if (draw_stimulus) {
        ctx.fillStyle = trial.stimulus_colour;
        ctx.fillText(trial.stimulus, trial.stimulus_position[0], trial.stimulus_position[1]);
      }
    }

    // test if x, y is inside the bounding box
    function in_box(x, y, box) {
      return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
    }

    // function to start trial when it is time
    let start_trial = function (X, Y) {
      start_X = X;
      start_Y = Y;
      trial_initiated = true;
      start_time = performance.now();
      draw_fixation = true;
      draw_start_box = trial.draw_start_box[1];
      draw_response_boxes = trial.draw_response_boxes[1];
      draw();
    };

    // function to end trial when it is time
    let end_trial = function () {
      end_rt = performance.now() - start_time;
      end_loc = x_coords[x_coords.length - 1] < canvas.width / 2 ? 'left' : 'right';

      // gather the data to store for the trial
      let trial_data = {
        start_rt: start_rt,
        start_x: Math.round(x_coords[0]),
        start_y: Math.round(y_coords[0]),
        end_rt: end_rt,
        end_x: Math.round(x_coords[x_coords.length - 1]),
        end_y: Math.round(y_coords[y_coords.length - 1]),
        end_loc: end_loc,
        x_coords: roundArray(x_coords),
        y_coords: roundArray(y_coords),
        time: time,
      };

      // move on to the next trial
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    };

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();