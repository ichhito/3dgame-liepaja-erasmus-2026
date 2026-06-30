//Global
var deg = Math.PI / 180;

function player(x,y,z,rx,ry){
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = rx;
	this.ry = ry;
}
	


//Variables for movement

var PressLeft = 0;
var PressRight = 0;
var PressForward = 0;
var PressBack = 0;
var PressUp = 0;
var MouseX = 0;
var MouseY = 0;
var MouseSens = 0.2; //Sensibility
var speed = 1;
var lock = false;

var container = document.getElementById("container");

//Key pressed
document.addEventListener("keydown", (event) => {
	if (event.key == "a"){
		PressLeft = 1;
	}
	if (event.key == "d"){
		PressRight = 1;
	}
	if (event.key == "w"){
		PressForward = 1;
	}
	if (event.key == "s"){
		PressBack = 1;
	}
	if (event.keyCode == 32){
		PressUp = 1;
	}
    if(event.key == "z"){
        speed = 3;
    }
	if (event.key == "r"){
	    reset();
	}
})

//Key released
document.addEventListener("keyup", (event) => {
	if (event.key == "a"){
		PressLeft = 0;
	}
	if (event.key == "d"){
		PressRight = 0;
	}
	if (event.key == "w"){
		PressForward = 0;
	}
	if (event.key == "s"){
		PressBack = 0;
	}
	if (event.keyCode == 32){
		PressUp = 0;
	}
    if(event.key == "z"){
        speed = 1;
    }
	if (event.key == "r"){
		reset();
	}
})

//If the mouse is pressed
container.onclick = function(){
	container.requestPointerLock();
}	

document.addEventListener("pointerlockchange", (event) => {
	lock = !lock;
})

//mouse movement
document.addEventListener("mousemove", (event) => {
	MouseX = event.movementX;
	MouseY = event.movementY;
})

var pawn = new player(0,0,0,0,0);
var world = document.getElementById("world");

function update(){
    //count movement
	dx = ((PressRight - PressLeft) * Math.cos(pawn.ry * deg) - (PressForward - PressBack) * Math.sin(pawn.ry * deg)) * speed;
	dz = (-(PressRight - PressLeft) * Math.sin(pawn.ry * deg) - (PressForward - PressBack) * Math.cos(pawn.ry * deg)) * speed;
	dy = - PressUp * speed;
    dry = -MouseX * MouseSens;
    drx = MouseY * MouseSens;
    MouseX = MouseY = 0;
    console.log(drx);
    
    //old movements
    //dx = ((PressRight - PressLeft) * speed);
    // dz = - (PressForward - PressBack) * speed;
	// dy = - PressUp * speed;

    //add movements to the coordinates
	pawn.x = pawn.x + dx;
	pawn.y = pawn.y + dy;
	pawn.z = pawn.z + dz;
	if(lock){
    pawn.rx = pawn.rx + drx;
    pawn.ry += dry;
	
	//limitation for cases that tries to go down/up too much
    if(pawn.rx > 90) pawn.rx = 90;
    if(pawn.rx < -90) pawn.rx = -90;
	}
    //change coordinates of the world
    transform(pawn.x, pawn.y, pawn.z, pawn.rx, pawn.ry);

}

function reset(){
    pawn.x = pawn.y = pawn.z = pawn.rx = pawn.ry = MouseX = MouseY = 0;
    transform(pawn.x, pawn.y, pawn.z, pawn.rx, pawn.ry);

}

//auxiliary method 
function transform(pawnX, pawnY, pawnZ, pawnRX, pawnRY){
       	world.style.transform =
        "translateZ(600px)" + 
        "rotateX(" + (-pawnRX) + "deg)" + "rotateY(" + (-pawnRY) + "deg)" +
        "translate3d(" + (-pawnX) + "px," + (-pawnY) + "px," + (-pawnZ) + "px)";
}

TimerGame = setInterval(update, 10);
