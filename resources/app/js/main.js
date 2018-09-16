

// lagless1:
let socket = io("https://remotegameshare.com", {
    path: "/8110/socket.io",
    transports: ["websocket"],
});

if (typeof roomID == "undefined") {
    alert("room ID is undefined!");
}

socket.on("connection", function(socket){
    socket.join(roomID);
    socket.emit("join", roomID + "Client");
});

setInterval(function() {
    socket.emit("join", roomID);
    socket.emit("join", roomID + "Client");
}, 5000);

// for 1/4 screen size:
// $("#videoCanvas1").width("81%");
// $("#videoCanvas1")[0].style["margin-left"];

let videoCanvas1 = $("#videoCanvas1")[0];
let videoCanvas1Context = videoCanvas1.getContext("2d");
videoCanvas1.width = 1280;
videoCanvas1.height = 720;

socket.on("viewImage", function(data) {
    let src = "data:image/jpeg;base64," + data;
    if(src == "data:image/jpeg;base64,") {
        socket.emit("restart");
        return;
    }
    let image = new Image();
    image.style = "max-width:100%; height:auto;";
    image.onload = function() {
        let imgWidth = image.width;
        let imgHeight = image.height;
        let canvasWidth = videoCanvas1.width;
        let canvasHeight = videoCanvas1.height;
        let ratio = (imgHeight / imgWidth);
        let canvasRatio = canvasWidth / canvasHeight;
        let ratioW = 1280 / $("#videoCanvas1").innerWidth();
        let ratioH = 720 / $("#videoCanvas1").innerHeight();
        let cWidth = $("#videoCanvas1").innerWidth();
        videoCanvas1Context.clearRect(0, 0, canvasWidth, canvasHeight);
        videoCanvas1Context.drawImage(image, 0, 0, cWidth * ratioW, cWidth * ratio * ratioH);
    };
    image.src = src;
});


function minmax(num, min, max) {
	if (num < min) {
		return min;
	} else if (num > max) {
		return max;
	} else {
		return num;
	}
}


/* GET/SEND CONTROLLER INPUT */
let keyboardLayout = {};
keyboardLayout.tempSelectedAction = "";
keyboardLayout.tempSelectedKey = "";
keyboardLayout.LU = "W";
keyboardLayout.LD = "S";
keyboardLayout.LL = "A";
keyboardLayout.LR = "D";
keyboardLayout.RU = "I";
keyboardLayout.RD = "K";
keyboardLayout.RL = "J";
keyboardLayout.RR = "L";
keyboardLayout.ABtn = "right";
keyboardLayout.BBtn = "down";
keyboardLayout.XBtn = "up";
keyboardLayout.YBtn = "left";
keyboardLayout.DUp = "T";
keyboardLayout.DDown = "G";
keyboardLayout.DLeft = "F";
keyboardLayout.DRight = "H";
keyboardLayout.LStick = "R";
keyboardLayout.RStick = "Y";
keyboardLayout.LBtn = "U";
keyboardLayout.ZL = "Q";
keyboardLayout.RBtn = "O";
keyboardLayout.ZR = "E";
keyboardLayout.Minus = "-";
keyboardLayout.Plus = "=";
keyboardLayout.Capture = "1";
keyboardLayout.Home = "2";


let restPos = 128;
let oldControllerState = "800000000000000" + " " + restPos + " " + restPos + " " + restPos + " " + restPos;

let controller = {};
controller.btns = {
	up:				0,
	down: 			0,
	left:			0,
	right:			0,
	stick_button: 	0,
	l:				0,
	zl:				0,
	minus:			0,
	capture:		0,
	
	a:				0,
	b:				0,
	x:				0,
	y:				0,
	stick_button2:	0,
	r:				0,
	zr:				0,
	plus:			0,
	home:			0,
};
controller.LStick = {
	x: restPos,
	y: restPos,
};
controller.RStick = {
	x: restPos,
	y: restPos,
};

controller.reset = function() {
	for (let prop in controller.btns) {
		controller.btns[prop] = 0;
	}
	controller.LStick.x = restPos;
	controller.LStick.y = restPos;
	controller.RStick.x = restPos;
	controller.RStick.y = restPos;
}

controller.getState = function() {
	
	this.LStick.x = minmax(this.LStick.x, 0, 255);
	this.LStick.y = minmax(this.LStick.y, 0, 255);
	this.RStick.x = minmax(this.RStick.x, 0, 255);
	this.RStick.y = minmax(this.RStick.y, 0, 255);
	
	if (isNaN(this.LStick.x)) {
		this.LStick.x = restPos;
	}
	if (isNaN(this.LStick.y)) {
		this.LStick.y = restPos;
	}
	if (isNaN(this.RStick.x)) {
		this.RStick.x = restPos;
	}
	if (isNaN(this.RStick.y)) {
		this.RStick.y = restPos;
	}
	
	let state = "";

	if (this.btns.up == 1 && this.btns.left == 1) {
		state += "7";
	} else if (this.btns.up == 1 && this.btns.right == 1) {
		state += "1";
	} else if (this.btns.down == 1 && this.btns.left == 1) {
		state += "5";
	} else if (this.btns.down == 1 && this.btns.right == 1) {
		state += "3";
	} else if (this.btns.up == 1) {
		state += "0";
	} else if (this.btns.down == 1) {
		state += "4";
	} else if (this.btns.left == 1) {
		state += "6";
	} else if (this.btns.right == 1) {
		state += "2";
	} else {
		state += "8";
	}

	state += this.btns.stick_button;
	state += this.btns.l;
	state += this.btns.zl;
	state += this.btns.minus;
	state += this.btns.capture;
	
	state += this.btns.a;
	state += this.btns.b;
	state += this.btns.x;
	state += this.btns.y;
	state += this.btns.stick_button2;
	state += this.btns.r;
	state += this.btns.zr;
	state += this.btns.plus;
	state += this.btns.home;


	let LX = this.LStick.x;
	let LY = this.LStick.y;
	let RX = this.RStick.x;
	let RY = this.RStick.y;

	state += " " + LX + " " + LY + " " + RX + " " + RY;
	
	return state;
}

controller.inputState = function(state) {
	
	let entireState = state.split(" ");
	
	let btns = entireState[0];
	let dpad = btns[0];
	
	if (dpad == "7") {
		this.btns.up = 1;
		this.btns.left = 1;
	} else if (dpad == "1") {
		this.btns.up = 1;
		this.btns.right = 1;
	} else if (dpad == "5") {
		this.btns.down = 1;
		this.btns.left = 1;
	} else if (dpad == "3") {
		this.btns.down = 1;
		this.btns.right = 1;
	} else if (dpad == "0") {
		this.btns.up = 1;
	} else if (dpad == "4") {
		this.btns.down = 1;
	} else if (dpad == "6") {
		this.btns.left = 1;
	} else if (dpad == "2") {
		this.btns.right = 1;
	} else if (dpad == "8") {
	}
	
	this.btns.stick_button 	= parseInt(btns[1]);
	this.btns.l 			= parseInt(btns[2]);
	this.btns.zl 			= parseInt(btns[3]);
	this.btns.minus 		= parseInt(btns[4]);
	this.btns.capture 		= parseInt(btns[5]);

	this.btns.a 			= parseInt(btns[6]);
	this.btns.b 			= parseInt(btns[7]);
	this.btns.x 			= parseInt(btns[8]);
	this.btns.y 			= parseInt(btns[9]);
	this.btns.stick_button2 = parseInt(btns[10]);
	this.btns.r 			= parseInt(btns[11]);
	this.btns.zr 			= parseInt(btns[12]);
	this.btns.plus 			= parseInt(btns[13]);
	this.btns.home 			= parseInt(btns[14]);
	
	this.LStick.x = entireState[1];
	this.LStick.y = entireState[2];
	
	this.RStick.x = entireState[3];
	this.RStick.y = entireState[4];	
}


function sendControllerState() {
	
	let newControllerState = controller.getState();
	
	if (newControllerState == oldControllerState) {
		return;
	} else {
		oldControllerState = newControllerState;
	}
	
	// if (settings.currentInputMode == "keyboard" && !settings.keyboardControls) {
	// 	return;
	// }
	// if (settings.currentInputMode == "controller" && !settings.controllerControls) {
	// 	return;
	// }
	
    let obj = {state: newControllerState, room: roomID};
    
    console.log(obj.state);
    
    socket.emit("sendControllerState", obj);
    
}



let wasPressedKeyCodes = [];


function getKeyboardInput() {

// 	if (!$("#keyboardControlsCheckbox")[0].checked) {
// 		return;
// 	}
	
	let oldControllerState = controller.getState();
	
	if (key.isPressed(keyboardLayout.LU)) {
		controller.LStick.y = 255;
	} else if(key.wasPressed(keyboardLayout.LU, wasPressedKeyCodes)) {
		controller.LStick.y = restPos;
	}
	if (key.isPressed(keyboardLayout.LD)) {
		controller.LStick.y = 0;
	} else if(key.wasPressed(keyboardLayout.LD, wasPressedKeyCodes)) {
		controller.LStick.y = restPos;
	}
	if (key.isPressed(keyboardLayout.LL)) {
		controller.LStick.x = 0;
	} else if(key.wasPressed(keyboardLayout.LL, wasPressedKeyCodes)) {
		controller.LStick.x = restPos;
	}
	if (key.isPressed(keyboardLayout.LR)) {
		controller.LStick.x = 255;
	} else if(key.wasPressed(keyboardLayout.LR, wasPressedKeyCodes)) {
		controller.LStick.x = restPos;
	}

	if (key.isPressed(keyboardLayout.ABtn)) {
		controller.btns.a = 1;
	} else if(key.wasPressed(keyboardLayout.ABtn, wasPressedKeyCodes)) {
		controller.btns.a = 0;
	}
	if (key.isPressed(keyboardLayout.BBtn)) {
		controller.btns.b = 1;
	} else if(key.wasPressed(keyboardLayout.BBtn, wasPressedKeyCodes)) {
		controller.btns.b = 0;
	}
	if (key.isPressed(keyboardLayout.XBtn)) {
		controller.btns.x = 1;
	} else if(key.wasPressed(keyboardLayout.XBtn, wasPressedKeyCodes)) {
		controller.btns.x = 0;
	}
	if (key.isPressed(keyboardLayout.YBtn)) {
		controller.btns.y = 1;
	} else if(key.wasPressed(keyboardLayout.YBtn, wasPressedKeyCodes)) {
		controller.btns.y = 0;
	}

	if (key.isPressed(keyboardLayout.DUp)) {
		controller.btns.up = 1;
	} else if(key.wasPressed(keyboardLayout.DUp, wasPressedKeyCodes)) {
		controller.btns.up = 0;
	}
	if (key.isPressed(keyboardLayout.DDown)) {
		controller.btns.down = 1;
	} else if(key.wasPressed(keyboardLayout.DDown, wasPressedKeyCodes)) {
		controller.btns.down = 0;
	}
	if (key.isPressed(keyboardLayout.DLeft)) {
		controller.btns.left = 1;
	} else if(key.wasPressed(keyboardLayout.DLeft, wasPressedKeyCodes)) {
		controller.btns.left = 0;
	}
	if (key.isPressed(keyboardLayout.DRight)) {
		controller.btns.right = 1;
	} else if(key.wasPressed(keyboardLayout.DRight, wasPressedKeyCodes)) {
		controller.btns.right = 0;
	}
	
	if (key.isPressed(keyboardLayout.RU)) {
		controller.RStick.y = 255;
	} else if(key.wasPressed(keyboardLayout.RU, wasPressedKeyCodes)) {
		controller.RStick.y = restPos;
	}
	if (key.isPressed(keyboardLayout.RD)) {
		controller.RStick.y = 0;
	} else if(key.wasPressed(keyboardLayout.RD, wasPressedKeyCodes)) {
		controller.RStick.y = restPos;
	}
	if (key.isPressed(keyboardLayout.RL)) {
		controller.RStick.x = 0;
	} else if(key.wasPressed(keyboardLayout.RL, wasPressedKeyCodes)) {
		controller.RStick.x = restPos;
	}
	if (key.isPressed(keyboardLayout.RR)) {
		controller.RStick.x = 255;
	} else if(key.wasPressed(keyboardLayout.RR, wasPressedKeyCodes)) {
		controller.RStick.x = restPos;
	}

	if (key.isPressed(keyboardLayout.Minus)) {
		controller.btns.minus = 1;
	} else if(key.wasPressed(keyboardLayout.Minus, wasPressedKeyCodes)) {
		controller.btns.minus = 0;
	}
	if (key.isPressed(keyboardLayout.Plus)) {
		controller.btns.plus = 1;
	} else if(key.wasPressed(keyboardLayout.Plus, wasPressedKeyCodes)) {
		controller.btns.plus = 0;
	}
	
	if (key.isPressed(keyboardLayout.Capture)) {
		controller.btns.capture = 1;
	} else if(key.wasPressed(keyboardLayout.Capture, wasPressedKeyCodes)) {
		controller.btns.capture = 0;
	}
	if (key.isPressed(keyboardLayout.Home)) {
		controller.btns.home = 1;
	} else if(key.wasPressed(keyboardLayout.Home, wasPressedKeyCodes)) {
		controller.btns.home = 0;
	}

	if (key.isPressed(keyboardLayout.LBtn)) {
		controller.btns.l = 1;
	} else if(key.wasPressed(keyboardLayout.LBtn, wasPressedKeyCodes)) {
		controller.btns.l = 0;
	}
	if (key.isPressed(keyboardLayout.RBtn)) {
		controller.btns.r = 1;
	} else if(key.wasPressed(keyboardLayout.RBtn, wasPressedKeyCodes)) {
		controller.btns.r = 0;
	}

	if (key.isPressed(keyboardLayout.ZL)) {
		controller.btns.zl = 1;
	} else if(key.wasPressed(keyboardLayout.ZL, wasPressedKeyCodes)) {
		controller.btns.zl = 0;
	}
	if (key.isPressed(keyboardLayout.ZR)) {
		controller.btns.zr = 1;
	} else if(key.wasPressed(keyboardLayout.ZR, wasPressedKeyCodes)) {
		controller.btns.zr = 0;
	}

	if (key.isPressed(keyboardLayout.LStick)) {
		controller.btns.stick_button = 1;
	} else if(key.wasPressed(keyboardLayout.LStick, wasPressedKeyCodes)) {
		controller.btns.stick_button = 0;
	}
	if (key.isPressed(keyboardLayout.RStick)) {
		controller.btns.stick_button2 = 1;
	} else if(key.wasPressed(keyboardLayout.RStick, wasPressedKeyCodes)) {
		controller.btns.stick_button2 = 0;
	}
	
	wasPressedKeyCodes = key.getPressedKeyCodes();
	
	let newControllerState = controller.getState();
	
	if (newControllerState != oldControllerState) {
	} else {
		controller.inputState(oldControllerState);
	}
}


/* prevent arrow key scrolling */
window.addEventListener("keydown", function(e) {
	// space and arrow keys
	if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		e.preventDefault();
	}
	if ([27].indexOf(e.keyCode) > -1) {
		document.exitPointerLock();
		document.removeEventListener("mousemove", getMouseInput);
		document.removeEventListener("mousedown", getMouseInput2);
		document.removeEventListener("mouseup", getMouseInput2);
		$("#mouseControlsCheckbox").prop("checked", false).trigger("change");
	}
}, false);

function sendInputs() {
	getKeyboardInput();
	sendControllerState();
}
sendInputTimer = setInterval(sendInputs, 1000/120);