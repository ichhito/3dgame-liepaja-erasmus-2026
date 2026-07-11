//Global
var deg = Math.PI / 180;


function player(x,y,z,rx,ry){
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = rx;
	this.ry = ry;
}

var wall = "./resources/texture/wall.jpg";
var floor = "./resources/texture/floor.jpeg";
var coinTexture = "./resources/texture/coin.png"
var keyTexture = "./resources/texture/key.png"

// --- Sounds ---
var coinSFX   = new Audio('./resources/sfx/coinSFX.mp3');
var keySFX    = new Audio('./resources/sfx/keySFX.mp3');
var unlockSFX = new Audio('./resources/sfx/unlockSFX.mp3');
var winSFX    = new Audio('./resources/sfx/winSFX.mp3');
var loseSFX   = new Audio('./resources/sfx/loseSFX.mp3');

function playSafe(a){
	if(a){
		a.currentTime = 0;
		a.play().catch(function(){});
	}
}


// ---------------------------------------------------------------------------
// LEVELS
// Wall box format: [cx, cz, sizeX, sizeZ, texture]
// Every level shares the same outer room, so the item spawn area and the
// collision limits stay valid without touching anything else.
// ---------------------------------------------------------------------------
var WALL_THICKNESS = 80;
var WALL_HEIGHT = 200;

// Floor stays a single flat plane (old 10-field format)
var floorPlane = [
	[0,100,0,90,0,0,2000,2000,"#333333",floor],
]

// Outer walls, reused by every level
var OUTER = [
	[0,   -1000, 2000, WALL_THICKNESS, wall],
	[0,    1000, 2000, WALL_THICKNESS, wall],
	[1000,    0, WALL_THICKNESS, 2000, wall],
	[-1000,   0, WALL_THICKNESS, 2000, wall],
]

// Each level: walls (outer + inner maze), exit position [x,z], item counts, time.
var levels = [
	{
		map: OUTER.concat([
			[-300, -600, 1400, WALL_THICKNESS, wall],
			[300,  -300, 1400, WALL_THICKNESS, wall],
			[-300,  300, 1400, WALL_THICKNESS, wall],
			[300,   600, 1400, WALL_THICKNESS, wall],
		]),
		exit: [-700, 900],
		coins: 3,
		keys: 3,
		time: 100,
	},
	{
		map: OUTER.concat([
			[-300, -750, 1400, WALL_THICKNESS, wall],
			[300,  -450, 1400, WALL_THICKNESS, wall],
			[-300, -150, 1400, WALL_THICKNESS, wall],
			[300,   150, 1400, WALL_THICKNESS, wall],
			[-300,  450, 1400, WALL_THICKNESS, wall],
			[300,   750, 1400, WALL_THICKNESS, wall],
		]),
		exit: [0, -880],
		coins: 4,
		keys: 3,
		time: 120,
	},
	{
		map: OUTER.concat([
			[300,  -750, 1400, WALL_THICKNESS, wall],
			[-300, -450, 1400, WALL_THICKNESS, wall],
			[300,  -150, 1400, WALL_THICKNESS, wall],
			[-300,  150, 1400, WALL_THICKNESS, wall],
			[300,   450, 1400, WALL_THICKNESS, wall],
			[-300,  750, 1400, WALL_THICKNESS, wall],
		]),
		exit: [0, 880],
		coins: 5,
		keys: 4,
		time: 140,
	},
]

var currentLevel = 0;
var nextLevelTarget = 0;
var levelTime = 100;

// Item + exit data, rebuilt per level
var coins = [];
var keys = [];
var EXIT_X = 0;
var EXIT_Z = 0;
var EXIT_RADIUS = 180;
var LOCKED_COLOR   = "rgb(200,40,40)";
var UNLOCKED_COLOR = "rgb(60,200,60)";
var exitDoor = [];


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
var canlock = false;

var coinCount = 0;
var keyCount = 0;
var timeLeft = 100;
var gameOver = false;

// --- Collision ---
var colliders = [];
var PLAYER_RADIUS = 60;

// --- Random item placement ---
var PLAY_MIN = -900, PLAY_MAX = 900;  // sampling range for item centers
var ITEM_MARGIN = 90;      // keep items this far from any wall (> player radius, so reachable)
var MIN_START_DIST = 250;  // don't spawn on top of the player start
var MIN_ITEM_DIST = 200;   // keep items apart from each other and the exit
var placedThisRound = [];


var container = document.getElementById("container");

//Key pressed
document.addEventListener("keydown", (event) => {
	if(canlock){
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
	if(canlock){
	container.requestPointerLock();
	}
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

// True if a point (x,z), grown by `margin`, overlaps any wall box.
function pointBlocked(x, z, margin){
	for(let i = 0; i < colliders.length; i++){
		let c = colliders[i];
		if(x > c.minX - margin && x < c.maxX + margin &&
		   z > c.minZ - margin && z < c.maxZ + margin){
			return true;
		}
	}
	return false;
}

// Player collision uses the player radius.
function blocked(x, z){
	return pointBlocked(x, z, PLAYER_RADIUS);
}

// Rejection sampling: try random points until one is valid, or give up.
function findSpot(){
	for(let attempt = 0; attempt < 300; attempt++){
		let x = PLAY_MIN + Math.random() * (PLAY_MAX - PLAY_MIN);
		let z = PLAY_MIN + Math.random() * (PLAY_MAX - PLAY_MIN);

		if(pointBlocked(x, z, ITEM_MARGIN)) continue;
		if(x*x + z*z < MIN_START_DIST*MIN_START_DIST) continue;

		let clash = false;
		for(let p = 0; p < placedThisRound.length; p++){
			let ddx = placedThisRound[p].x - x;
			let ddz = placedThisRound[p].z - z;
			if(ddx*ddx + ddz*ddz < MIN_ITEM_DIST*MIN_ITEM_DIST){ clash = true; break; }
		}
		if(clash) continue;

		placedThisRound.push({x:x, z:z});
		return {x:x, z:z};
	}
	return null;
}

// Give every item in the array a fresh random (x,z) and reset it to floor height.
function scatter(items){
	for(let i = 0; i < items.length; i++){
		let spot = findSpot();
		if(spot){
			items[i][0] = spot.x;
			items[i][2] = spot.z;
		}
		items[i][1] = 30;
	}
}

// Reset the occupied list (reserving the exit) and scatter all item types.
function placeAllItems(){
	placedThisRound = [{x: EXIT_X, z: EXIT_Z}];
	scatter(coins);
	scatter(keys);
}

// Builds an array of n item entries (positions filled later by placeAllItems).
function makeItems(n, texture){
	let arr = [];
	for(let i = 0; i < n; i++){
		arr.push([0, 30, 0, 0, 0, 0, 50, 50, "", texture]);
	}
	return arr;
}

function update(){
    //count movement
	dx = ((PressRight - PressLeft) * Math.cos(pawn.ry * deg) - (PressForward - PressBack) * Math.sin(pawn.ry * deg)) * speed;
	dz = (-(PressRight - PressLeft) * Math.sin(pawn.ry * deg) - (PressForward - PressBack) * Math.cos(pawn.ry * deg)) * speed;
	dy = 0;
    dry = -MouseX * MouseSens;
    drx = MouseY * MouseSens;
    MouseX = MouseY = 0;

    //move X and Z separately so we slide along walls instead of sticking
	let tryX = pawn.x + dx;
	if(!blocked(tryX, pawn.z)){
		pawn.x = tryX;
	}
	let tryZ = pawn.z + dz;
	if(!blocked(pawn.x, tryZ)){
		pawn.z = tryZ;
	}
	pawn.y = pawn.y + dy;

	if(lock){
    pawn.rx = pawn.rx + drx;
    pawn.ry += dry;
    if(pawn.rx > 90) pawn.rx = 90;
    if(pawn.rx < -90) pawn.rx = -90;
	}
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

// Builds a solid box (5 visible faces) per wall entry + records its AABB.
function CreateWalls(boxes, name){
	let shade = [1.0, 0.82, 0.9, 0.9, 1.18]; // front, back, left, right, top

	for(let i = 0; i < boxes.length; i++){
		let cx  = boxes[i][0];
		let cz  = boxes[i][1];
		let sx  = boxes[i][2];
		let sz  = boxes[i][3];
		let tex = boxes[i][4];
		let cy  = 0;
		let sy  = WALL_HEIGHT;

		let faces = [
			[cx,        cy,        cz - sz/2, sx, sy, 0,  0],
			[cx,        cy,        cz + sz/2, sx, sy, 0,  0],
			[cx - sx/2, cy,        cz,        sz, sy, 0, 90],
			[cx + sx/2, cy,        cz,        sz, sy, 0, 90],
			[cx,        cy - sy/2, cz,        sx, sz, 90, 0],
		];

		for(let f = 0; f < faces.length; f++){
			let fx = faces[f][0], fy = faces[f][1], fz = faces[f][2];
			let fw = faces[f][3], fh = faces[f][4];
			let rx = faces[f][5], ry = faces[f][6];

			let el = document.createElement("div");
			el.className = name + "Face square";
			el.id = name + i + "_" + f;
			el.style.width  = fw + "px";
			el.style.height = fh + "px";
			el.style.backgroundColor = "#8a5a2b";
			if(typeof tex === "string"){
				el.style.backgroundImage = "url('" + tex + "')";
				el.style.backgroundSize  = "cover";
			}
			el.style.filter = "brightness(" + shade[f] + ")";
			el.style.transform =
				"translate3d(" + (600 - fw/2 + fx) + "px," +
				                 (400 - fh/2 + fy) + "px," +
				                 fz + "px)" +
				"rotateX(" + rx + "deg)" +
				"rotateY(" + ry + "deg)";
			world.append(el);
		}

		colliders.push({
			minX: cx - sx/2, maxX: cx + sx/2,
			minZ: cz - sz/2, maxZ: cz + sz/2
		});
	}
}

function CreateSquares(squares,string){
	for(let i = 0; i < squares.length; i++){
		
		let newElement = document.createElement("div");
		newElement.className = string + " square";
		newElement.id = string + i;
		newElement.style.width = squares[i][6] + "px";
		newElement.style.height = squares[i][7] + "px";
		newElement.style.background = squares[i][8];
		if(typeof squares[i][9] === "string" && squares[i][9] !== ""){
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
				updateHUD();
				playSafe(coinSFX);
			}
			if(string == "key"){
				keyCount += 1;
				updateHUD();
				playSafe(keySFX);
				if(keyCount >= keys.length){
					document.getElementById("exit0").style.background = UNLOCKED_COLOR;
					playSafe(unlockSFX);
				}
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

function updateHUD(){
	document.getElementById("coinCounter").innerHTML = coinCount;
	document.getElementById("keyCounter").innerHTML = keyCount;
}

// ------------------- Level building -------------------

// Remove every 3D element and forget the old collision boxes.
function clearWorld(){
	world.innerHTML = "";
	colliders = [];
}

// Tear down the current world and build level n from scratch.
function loadLevel(n){
	currentLevel = n;
	let lv = levels[n];

	clearWorld();

	// Rebuild item arrays for this level's counts
	coins = makeItems(lv.coins, coinTexture);
	keys  = makeItems(lv.keys,  keyTexture);

	// This level's exit
	EXIT_X = lv.exit[0];
	EXIT_Z = lv.exit[1];
	exitDoor = [[EXIT_X, 0, EXIT_Z, 0, 0, 0, 160, 200, LOCKED_COLOR, ""]];

	levelTime = lv.time;

	// Build the world (walls first, so colliders exist before scattering items)
	CreateSquares(floorPlane, "floor");
	CreateWalls(lv.map, "wall");
	placeAllItems();
	CreateSquares(coins, "coin");
	CreateSquares(keys, "key");
	CreateSquares(exitDoor, "exit");

	document.getElementById("keyTotal").innerHTML = keys.length;
}

// ------------------- Game flow: win / lose -------------------

function stopPlaying(){
	gameOver = true;
	canlock = false;
	PressLeft = PressRight = PressForward = PressBack = PressUp = 0;
	speed = 1;
	if(document.pointerLockElement){
		document.exitPointerLock();
	}
}

// Reset counters/timer and drop the player into the freshly loaded level.
function beginPlay(){
	coinCount = 0;
	keyCount = 0;
	timeLeft = levelTime;
	gameOver = false;
	updateHUD();

	let timerEl = document.getElementById("timer");
	timerEl.max = levelTime;
	timerEl.value = timeLeft;

	reset();

	document.getElementById("menu1").style.display = "none";
	document.getElementById("menu3").style.display = "none";
	document.getElementById("menu4").style.display = "none";
	document.getElementById("hud").style.display = "block";
	canlock = true;
	container.requestPointerLock();
}

// Load a level and start playing it.
function playLevel(n){
	loadLevel(n);
	beginPlay();
}

function win(){
	if(gameOver) return;
	stopPlaying();
	document.getElementById("hud").style.display = "none";

	if(currentLevel + 1 < levels.length){
		document.getElementById("winText").innerHTML =
			"<span>Level " + (currentLevel + 1) + " completed!</span>";
		document.querySelector("#button4 p").innerHTML = "Next level";
		nextLevelTarget = currentLevel + 1;
	} else {
		document.getElementById("winText").innerHTML =
			"<span>You beat the game!</span>";
		document.querySelector("#button4 p").innerHTML = "Play again";
		nextLevelTarget = 0;
	}

	document.getElementById("winStats").innerHTML =
		"<span>Coins: " + coinCount + " / " + coins.length + "</span>";
	document.getElementById("menu3").style.display = "block";
	playSafe(winSFX);
}

function lose(){
	if(gameOver) return;
	stopPlaying();
	document.getElementById("hud").style.display = "none";
	document.getElementById("menu4").style.display = "block";
	playSafe(loseSFX);
}

// ---------------------------------------------------------------------------

loadLevel(0); // build the first level so the world exists behind the menu


function Repeat(){
	update();
	interact(coins, "coin");
	interact(keys, "key");
	rotate(coins, "coin", 0.5);
	rotate(keys, "key", 0.5);

	if(canlock && !gameOver){
		// Timer
		timeLeft -= 0.02;
		document.getElementById("timer").value = timeLeft;
		if(timeLeft <= 0){
			timeLeft = 0;
			lose();
			return;
		}

		// Exit with all keys
		let ex = EXIT_X - pawn.x;
		let ez = EXIT_Z - pawn.z;
		if(keyCount >= keys.length && (ex*ex + ez*ez) < EXIT_RADIUS*EXIT_RADIUS){
			win();
		}
	}
}

TimerGame = setInterval(Repeat, 10);

document.getElementById("button1").onclick = function(){
    playLevel(0);
}

document.getElementById("button2").onclick = function(){
    document.getElementById("menu1").style.display = "none";
    document.getElementById("menu2").style.display = "block";
}

document.getElementById("button3").onclick = function(){
    document.getElementById("menu2").style.display = "none";
    document.getElementById("menu1").style.display = "block";
}

// Win screen: go to the level chosen in win()
document.getElementById("button4").onclick = function(){
    playLevel(nextLevelTarget);
}

// Lose screen: retry the same level
document.getElementById("button5").onclick = function(){
    playLevel(currentLevel);
}