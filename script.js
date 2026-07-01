//Global
var deg = Math.PI / 180;

function player(x,y,z,rx,ry){
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = rx;
	this.ry = ry;
}
	
var map = [
	[0,0,-1000,0,0,0,2000,200,"rgb(255, 151, 53)"], //Front wall
	[0,0,1000,0,0,0,2000,200,"rgb(255, 151, 53)"], //Behind wall
	[1000,0,0,0,90,0,2000,200,"rgb(255, 151, 53)"], //right wall
	[-1000,0,0,0,-90,0,2000,200,"rgb(255, 151, 53)"], //left wall
	[0,100,0,90,0,0,2000,2000,"#333333"], //ground

	[0,0,-500,0,0,0,1000,200,"rgb(116, 127, 255)"], //Front wall inf

	[0,0,500,0,0,0,1000,200,"rgb(116, 127, 255)"], //behind inf 1
	[0,0,500,0,0,0,1000,200,"rgb(116, 127, 255)"], //behind inf 1

	[500,0,0,0,90,0,1000,200,"rgb(116, 127, 255)"], //right inf
	[-500,0,0,0,-90,0,1000,200,"rgb(116, 127, 255)"] //left inf

]


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
	if (event.key == "a" || event.key == "ArrowLeft"){
		PressLeft = 1;
	}
	if (event.key == "d" || event.key == "ArrowRight"){
		PressRight = 1;
	}
	if (event.key == "w" || event.key == "ArrowUp" ){
		PressForward = 1;
	}
	if (event.key == "s" || event.key == "ArrowDown"){
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
	if (event.key == "a" || event.key == "ArrowLeft"){
		PressLeft = 0;
	}
	if (event.key == "d" || event.key == "ArrowRight"){
		PressRight = 0;
	}
	if (event.key == "w" || event.key == "ArrowUp" ){
		PressForward = 0;
	}
	if (event.key == "s" || event.key == "ArrowDown"){
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

function CreateNewWorld(){
	for(let i = 0; i < map.length; i++){
		//create rectangles and styles
		let newElement = document.createElement("div");
		newElement.className = "square";
		newElement.id = "square" + i;
		newElement.style.width = map[i][6] + "px";
		newElement.style.height = map[i][7] + "px";
		newElement.style.background = map[i][8];
		newElement.style.transform =
			"translate3d(" + (map[i][0] - map[i][6]/2) + "px, " +
			(map[i][1] - map[i][7]/2) + "px, " +
			map[i][2] + "px) " +
			"rotateX(" + map[i][3] + "deg) " +
			"rotateY(" + map[i][4] + "deg) " +
			"rotateZ(" + map[i][5] + "deg)";

			world.append(newElement);
	}
}
CreateNewWorld();
TimerGame = setInterval(update, 10);
