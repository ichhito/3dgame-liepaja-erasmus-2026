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
var PressDown = 0;
//Key pressed
document.addEventListener("keydown",  (event) => {
    if(event.key == "a"){
        PressLeft = 1;
    }
    else if (event.key == "w"){
        PressForward = 1;
    }
    else if (event.key == "s"){
        PressBack = 1;
    }
    else if (event.key == "d"){
        PressRight = 1;
    }
    else if (event.keyCode == 32){ //Deprecated?
        PressUp = 1;
    }

});

//Key released
document.addEventListener("keyup",  (event) => {
    if(event.key != "a"){
        PressLeft = 0;
    }
    else if (event.key != "w"){
        PressForward = 0;
    }
    else if (event.key != "s"){
        PressBack = 0;
    }
    else if (event.key != "d"){
        PressRight = 0;
    }
    else if (event.key != 32){ //Deprecated?
        PressUp = 0;
    }

});

var pawn = new player(0,0,0,0,0);

function update(){
    //count movement
    dx = PressRight - PressLeft;
    dy = PressForward - PressBack;
    dz = PressUp;

    //add movements to the coordinates
    pawn.x = pawn.x + dx;
    pawn.y = pawn.y + dy;
    pawn.x = pawn.z + dz;

    //change coordinates of the world

    world.style.transform = "translate3d(" + pawn.x + "px," + pawn.y + "px," + pawn.z + "px)";
}