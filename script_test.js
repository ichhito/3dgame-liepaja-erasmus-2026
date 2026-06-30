function player(x, y, z, rx, ry) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = rx;
	this.ry = ry;
}

//move variables
var PressLeft = 0;
var PressRight = 0;
var PressUp = 0;
var PressForward = 0;
var PressBack = 0;
var PressReset = 0;
var MoveSpeed = 10;
//Mouse vars
var MouseX = 0;
var MouseY = 0;
var MouseSens = 0.4;


var pawn = new player(0, 0, 0, 0, 0);
var world = document.getElementById("world")
var container = document.getElementById("container")
var lock = false;
// convert angle
var angle = Math.PI / 180;


document.addEventListener("keydown", (event) => {
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
		PressLeft = 1;
	}

	if (event.code === 'ArrowRight' || event.code === 'KeyD') {
		PressRight = 1;
	}

	if (event.code === 'ArrowUp' || event.code === 'KeyW') {
		PressForward = 1;
	}

	if (event.code === 'ArrowDown' || event.code === 'KeyS') {
		PressBack = 1;
	}

	if (event.code == 'Space') {
		PressUp = 1;
	}

	if (event.code === 'KeyR') {
		PressReset = 1;
	}
})


document.addEventListener("keyup", (event) => {
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
		PressLeft = 0;
	}

	if (event.code === 'ArrowRight' || event.code === 'KeyD') {
		PressRight = 0;
	}

	if (event.code === 'ArrowUp' || event.code === 'KeyW') {
		PressForward = 0;
	}

	if (event.code === 'ArrowDown' || event.code === 'KeyS') {
		PressBack = 0;
	}

	if (event.code == 'Space') {
		PressUp = 0;
	}

	if (event.code === 'KeyR') {
		PressReset = 0;
	}
})
//If mouse is pressed
container.onclick = function() {
	container.requestPointerLock();
}
document.addEventListener("pointerlockchange", (event) => {
	lock = !lock;
})
//Mouse movement
document.addEventListener("mousemove", (event) => {
	MouseX = event.movementX;
	MouseY = event.movementY;

})



function update() {

	if (PressReset == 1) {
		pawn.x = 0;
		pawn.y = 0;
		pawn.z = 0;
		pawn.rx = 0;
		pawn.ry = 0;
	}
	//count movement
	//dx = (PressRight - PressLeft) * MoveSpeed;
	//dz = - (PressForward - PressBack) * MoveSpeed;
	dx = ((PressRight - PressLeft) * Math.cos(pawn.ry * angle) - (PressForward - PressBack) * Math.sin(pawn.ry * angle)) * MoveSpeed;
	dz = (-(PressRight - PressLeft) * Math.sin(pawn.ry * angle) - (PressForward - PressBack) * Math.cos(pawn.ry * angle)) * MoveSpeed;
	dy = PressUp;
	drx = MouseY * MouseSens;
	dry = -MouseX * MouseSens;
	MouseX = MouseY = 0;


	//add movements
	pawn.x = pawn.x + dx;
	pawn.y = pawn.y + dy;
	pawn.z = pawn.z + dz;

	if (lock) {
		pawn.rx = pawn.rx + drx;
		pawn.ry = pawn.ry + dry;

	}
	world.style.transform =
		"translateZ(600px)" +
		"rotateX(" + (-pawn.rx) + "deg)" +
		"rotateY(" + (-pawn.ry) + "deg)" +
		"translate3d(" + (-pawn.x) + "px," + (-pawn.y) + "px," + (-pawn.z) + "px)";


}

TimerGame = setInterval(update, 20);