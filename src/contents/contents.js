import DATA from "./data.js";
import { $ } from "./data.js";

import THREE10 from "./three10/main";
import THREE11 from "./three11/main.js";
import THREE8 from "./three8/main";

const $canvas = $(".contents");

// const three8 = new THREE8($canvas);
const three10 = new THREE10($canvas, DATA.three10.html);
// const three11 = new THREE11($canvas);

// three8.isPlaying = false;
// three10.isPlaying = false;
// three11.isPlaying = false;
