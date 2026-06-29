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
var Interval = 10;


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
        Interval = 300;
        setInterval(Interval);
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
        Interval = 10;
        setInterval(Interval);
    }
})

var pawn = new player(0,0,0,0,0);
var world = document.getElementById("world");

function update(){
    //count movement
	dx = PressRight - PressLeft;
	dz = - (PressForward - PressBack);
	dy = - PressUp;
    //console.log(PressRight);
    //console.log(PressBack);
    //console.log(PressUp);
    //console.log(PressRight);
    //console.log(PressLeft);
    //console.log(PressForward);
    console.log(Interval);
    

    //add movements to the coordinates
	pawn.x = pawn.x + dx;
	pawn.y = pawn.y + dy;
	pawn.z = pawn.z + dz;

    //change coordinates of the world

   	world.style.transform = "translate3d(" + (-pawn.x) + "px," + (-pawn.y) + "px," + (-pawn.z) + "px)";
}

TimerGame = setInterval(update, 500);
//TimerSpeedUp = setInterval(update, 20);
