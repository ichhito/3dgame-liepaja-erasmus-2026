function player(x,z,y,rx,ry){
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
var speed = 1;

//Key pressed
document.addEventListener("keydown", (event) => {
	if (event.key == "ArrowLeft"){
		PressLeft = 1;
	}
	if (event.key == "ArrowRight"){
		PressRight = 1;
	}
	if (event.key == "ArrowUp"){
		PressForward = 1;
	}
	if (event.key == "ArrowDown"){
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
	if (event.key == "ArrowLeft"){
		PressLeft = 0;
	}
	if (event.key == "ArrowRight"){
		PressRight = 0;
	}
	if (event.key == "ArrowUp"){
		PressForward = 0;
	}
	if (event.key == "ArrowDown"){
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

document.addEventListener("mousemove", (event) =>{
    MouseX = event.movementX;
    MouseY = event.movementY;
})

var pawn = new player(0,0,0,0,0);
var world = document.getElementById("world");

function update(){
    //count movement
	dx = (PressRight - PressLeft) * speed;
	dz = - (PressForward - PressBack) * speed;
	dy = - PressUp * speed;
    drx = MouseX;
    dry = MouseY;
    //console.log(PressRight);
    //console.log(PressBack);
    //console.log(PressUp);
    //console.log(PressRight);
    //console.log(PressLeft);
    //console.log(PressForward);
    //console.log(Interval);
    

    //add movements to the coordinates
	pawn.x = pawn.x + dx;
	pawn.y = pawn.y + dy;
	pawn.z = pawn.z + dz;
    pawn.rx = pawn.rx + drx;
    pawn.ry = pawn.ry + dry;

    //change coordinates of the world
    transform(pawn.x, pawn.y, pawn.z, pawn.rx, pawn.ry);
}

function reset(){
    pawn.x = 0;
	pawn.y = 0;
	pawn.z = 0;
    pawn.rx = 0;
    pawn.ry = 0;
    transform(pawn.x, pawn.y, pawn.z, pawn.rx, pawn.ry);
}

function transform(pawnX, pawnY, pawnZ, pawnRX, pawnRY){
       	world.style.transform = "rotateX(" + pawnRX + "deg)" 
        + "rotateY(" + pawnRY + "deg)" + "translate3d(" 
        + (-pawnX) + "px," + (-pawnY) + "px," + (-pawnZ) + "px)";
}

TimerGame = setInterval(update, 10);
//TimerSpeedUp = setInterval(update, 20);
