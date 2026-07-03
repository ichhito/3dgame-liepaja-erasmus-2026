//Global
var deg = Math.PI / 180;


function player(x,y,z,rx,ry){
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = rx;
	this.ry = ry;
}

var wall = "./resources/wall.jpg";
var floor = "./resources/floor.jpeg";
var coinTexture = "./resources/coin.png"
var keyTexture = "./resources/key.png"
var coinSFX = new Audio('./resources/coinSFX.mp3');

var coinCount = 0;
var keyCount = 0;

// Map entry format: [x, y, z, rx, ry, rz, width, height, color]
//
//  x, y, z   — center position in world space
//                x: left(-) / right(+)   center = 0
//                y: up(-)   / down(+)    eye level = 0
//                z: front(-) / back(+)   player start = 0
//
//  rx, ry, rz — rotation in degrees
//                rx: tilt up/down  — use 90 for floor or ceiling
//                ry: turn left/right — use 90 (right wall) or -90 (left wall)
//                rz: roll           — usually 0
//
//  width, height — size of the rectangle in pixels
//
//  color         — any CSS color string (used as fallback if no texture)
//  texture       — (optional) path to an image, e.g. "./resources/wall.jpg"
//
// Quick recipes:
//   Front/back wall : ry=0,  place at z=-N (front) or z=+N (back)
//   Right wall      : ry=90, place at x=+N
//   Left wall       : ry=-90,place at x=-N
//   Floor           : rx=90, place at y=+N  (positive y = below eye)
//   Ceiling         : rx=90, place at y=-N
//   Wall with gap   : two entries side by side, e.g. x=-300,w=400 and x=+300,w=400
var map = [
	// Outer room
	[0,0,-1000,0,0,0,2000,200,"rgb(255, 151, 53)",wall], //Front wall
	[0,0,1000,0,0,0,2000,200,"rgb(255, 151, 53)",wall],  //Behind wall
	[1000,0,0,0,90,0,2000,200,"rgb(255, 151, 53)",wall], //Right wall
	[-1000,0,0,0,-90,0,2000,200,"rgb(255, 151, 53)",wall],//Left wall
	[0,100,0,90,0,0,2000,2000,"#333333",floor],           //Ground

	// --- Maze inner walls ---
	// Zigzag path: go left → north → right → north to reach front wall
	//              go right → south → left → south to reach back wall
	//
	//   x: -1000  -400   0  +400  +1000
	//
	// z=-600  [==========]  GAP  [========]   outer front wall further north
	// z=-300  [====]  GAP  [================]
	//   z=0   ★ player start
	// z=+300  [==========]  GAP  [========]
	// z=+600  [====]  GAP  [================]   outer back wall further south

	// z=-600: gap on right (x=+400 to +1000)
	[-300,0,-600, 0,0,0, 1400,200,"#888",wall], // x=-1000 to x=+400

	// z=-300: gap on left (x=-1000 to x=-400)
	[300,0,-300,  0,0,0, 1400,200,"#888",wall], // x=-400 to x=+1000

	// z=+300: gap on right (x=+400 to +1000)
	[-300,0,300,  0,0,0, 1400,200,"#888",wall], // x=-1000 to x=+400

	// z=+600: gap on left (x= -1000 to x=-400)
	[300,0,600,   0,0,0, 1400,200,"#888",wall], // x=-400 to x=+1000
]

var coins = [
	[800,30,-800,0,0,0,50,50,"", coinTexture],
	[-600,30,-100,0,0,0,50,50,"", coinTexture],
	[200,30,200,0,0,0,50,50,"", coinTexture]
]

var keys = [
	[500,30,-500,0,0,0,50,50,"", keyTexture],
	[-200,30,200,0,0,0,50,50,"", keyTexture],
	[400,30,-100,0,0,0,50,50,"", keyTexture]
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
var hud = document.getElementById("hud");

function update(){
    //count movement
	dx = ((PressRight - PressLeft) * Math.cos(pawn.ry * deg) - (PressForward - PressBack) * Math.sin(pawn.ry * deg)) * speed;
	dz = (-(PressRight - PressLeft) * Math.sin(pawn.ry * deg) - (PressForward - PressBack) * Math.cos(pawn.ry * deg)) * speed;
	//debug
	//dy = - PressUp * speed;
	dy = 0;
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
	CreateSquares(map,"map");
}
function CreateSquares(squares,string){
	for(let i = 0; i < squares.length; i++){
		
		//create rectangles and styleS
		let newElement = document.createElement("div");
		newElement.className = string + " square";
		newElement.id = string + i;
		newElement.style.width = squares[i][6] + "px";
		newElement.style.height = squares[i][7] + "px";
		newElement.style.background = squares[i][8];
		if(typeof squares[i][9] === "string"){
			newElement.style.backgroundImage = "url('" + squares[i][9] + "')";
			newElement.style.backgroundSize = "cover";
		} else if(typeof squares[i][9] === "number"){
			newElement.style.opacity = squares[i][9];
		}
		newElement.style.transform =
			"translate3d(" + (600 - squares[i][6]/2 + squares[i][0]) + "px," +
			(400 - squares[i][7]/2 + squares[i][1]) + "px," + 
			squares[i][2] + "px)" + 
			"rotateX(" + squares[i][3] + "deg)" + 
			"rotateY(" + squares[i][4] + "deg)" + 
			"rotateZ(" + squares[i][5] + "deg)";
			
		//insert rectangles into the world
		world.append(newElement);
	}
}

function interact(squares, string){
	for(i = 0; i < squares.length; i++){
		let dis = (squares[i][0] - pawn.x) ** 2 + (squares[i][1] - pawn.y)**2 + (squares[i][2] - pawn.z)**2;
		let is = (squares[i][6]) **2;
		if(dis < is){
			document.getElementById(string + i).style.display = "none";
			squares[i][1] = 1000000;
			if(string == "coin"){
				coinCount += 1;
				document.getElementById("coinCounter").innerHTML = coinCount;
				coinSFX.play();
			}
			if(string == "key"){
				keyCount += 1;
			}
		}
	}
}

function rotate(squares,string,ra){
	for(i = 0; i < squares.length; i++){
		squares[i][4] = squares[i][4] + ra;
		document.getElementById(string + i).style.transform =
			"translate3d(" + (600 - squares[i][6]/2 + squares[i][0]) + "px, " +
			(400 - squares[i][7]/2 + squares[i][1]) + "px, " +
			squares[i][2] + "px)" +
			"rotateX(" + squares[i][3] + "deg)" +
			"rotateY(" + squares[i][4] + "deg)" +
			"rotateZ(" + squares[i][5] + "deg)";
	}
}

CreateNewWorld();
CreateSquares(coins, "coin");
CreateSquares(keys, "key");
document.getElementById("coinCounter").innerHTML = coinCount;


function Repeat(){
	update();
	interact(coins, "coin");
	interact(keys, "key");
	rotate(coins, "coin",0.5);
	rotate(keys, "key",0.5);
}

TimerGame = setInterval(Repeat, 10);