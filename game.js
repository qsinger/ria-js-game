
var player = {
	speed: 256,
	x: 0,
	y: 0,
    width: 50,
    height: 50,
    state: "idle",
    direction: 1
};

let animations = {
    idle : {
        0 : {
            x : [0],
            y : 3
        },
        1 : {
            x : [0],
            y : 1
        },
        2 : {
            x : [0],
            y : 2
        },
        3 : {
            x : [0],
            y : 0
        }
    },
    walk : {
         0 : {
            x : [1, 2],
            y : 3
        },
        1 : {
            x : [1, 2, 3, 2],
            y : 1
        },
        2 : {
            x : [1, 2],
            y : 2
        },
        3 : {
            x : [1, 2, 3, 2],
            y : 0
        }
    }
}

const roomSize = 20;
const roomVarsCount = 3;
let cmd = "room";
let currentFloor = 1;
let floorSize = 4;

let then = Date.now();
let keysDown = {};
let coord = [0, 0];
let exit = [-1, -1];

//sprite vars
let frameCount = 0;
const spriteSize = 144;
let currentLoopIndex = 0;

//INITIALISE CANVAS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;


let mapCanvas = document.getElementById("map");
mapCanvas.width = 512;
mapCanvas.height = 480;

let ctxMap = mapCanvas.getContext("2d");
var soundFile = document.createElement("audio");
soundFile.preload = "auto";

//Load the sound file (using a source element for expandability)
var src = document.createElement("source");
src.src = "music.mp3";

//Plays the sound
function play() {
   //Set the current time for the audio file to the beginning
   soundFile.currentTime = 0.01;
   soundFile.volume = volume;

   //Due to a bug in Firefox, the audio needs to be played after a delay
   setTimeout(function(){soundFile.play();},1);
}


//CREATES COORDINATES ARRAY FOR ROOMS
let grid = [];
let mapGrid = [];
let roomTypes = [];

for(var x = 0; x <= roomSize; x++) {
    grid[x] = [];
    for(var y = 0; y <= roomSize; y++){
        grid[x][y] = [];
        grid[x][y] = [(canvas.width/roomSize)*x, (canvas.height/roomSize)*y, "@"];
    }
}

//CREATES COORDINATES ARRAY FOR MAP
for(var x = 0; x <= floorSize; x++) {
    mapGrid[x] = [];
    for(var y = 0; y <= floorSize; y++){
        mapGrid[x][y] = [];
        mapGrid[x][y] = [(mapCanvas.width/floorSize)*x, (mapCanvas.height/floorSize)*y];
    }
}

//CREATES types for each room
setRoomTypes();
function setRoomTypes() {
    let min = 0;
    let max = roomVarsCount;
    
    for(var x = 0; x <= floorSize; x++) {
        roomTypes[x] = [];
        for(var y = 0; y <= floorSize; y++){
            roomTypes[x][y] = Math.floor(Math.random() * (+max - +min)) + +min;
        }
    }
}


let map =  newMaze(floorSize);
let currentLevel = map[coord[0]][coord[1]];

//PLAYER IMAGE
let playerImage = new Image();
playerImage.src = "ressources/images/player.png";
let playerReady = true;

loadLevelData();

//KEY LISTENERS
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


//reset player position to middle
let reset = function () {
    player.x = canvas.width / 2;
	player.y = canvas.height / 2;
};

//CONTROLS
var update = async function (modifier) {
    
    //print coordinates for testing :
    //console.log("X = "+player.x+"    Y = "+player.y);
    
    player.state = "idle";
    
    //LOOK AT LEFT RIGHT POINT POSITIONING
	if (38 in keysDown || 87 in keysDown) { // Player holding up
        player.direction = 0;
        player.state = "walk";
        if (canPassSquare(getNextSquareType(player.x, player.y - (player.speed * modifier))))
            player.y -= player.speed * modifier;
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down
        player.direction = 2;
        player.state = "walk";
        if (canPassSquare(getNextSquareType(player.x, player.y + (player.speed * modifier)+(canvas.width/roomSize))))
            player.y += player.speed * modifier;
	}
	if (37 in keysDown || 65 in keysDown) { // Player holding left
        player.direction = 3;
        player.state = "walk";
        if (canPassSquare(getNextSquareType(player.x - (player.speed * modifier)-(player.width/2), player.y)))
            player.x -= player.speed * modifier;
	}
	if (39 in keysDown || 68 in keysDown) { // Player holding right
        player.direction = 1;
        player.state = "walk";
        if (canPassSquare(getNextSquareType(player.x + (player.speed * modifier)+(player.width/2), player.y)))
            player.x += player.speed * modifier;
	}
    
    var nextSquare = getNextSquareType(player.x, player.y);
    
    //defines what to do if player touches a roomChange (WASD) or the exit (exit)
    switch(nextSquare) {
        case "W":
        case "A":
        case "S":
        case "D":
            enterRoom(getEntrancePos(nextSquare), getNextRoom(nextSquare));
            break;
            
        case "exit":
            cmd = "exit";
            break;
    }
    
    //main walls collision detection
    if(player.x > canvas.width-player.width) {
        player.x = canvas.width-player.width;
    }
    if(player.y > canvas.height-player.height) {
        player.y = canvas.height-player.height;
    }
    if(player.x < 0) {
        player.x = 0;
    }
    if(player.y < 0) {
        player.y = 0;
    }
};

function getEntrancePos(type) {
    switch(type) {
        case "W" :
            return 2;
        case "A" :
            return 1;
        case "S" :
            return 0;
        case "D" :
            return 3;
    }
}

function getNextRoom(type) {
    
    clearPlayerMarker(coord[0], coord[1]);
    
    switch(type) {
        case "W" :
            coord[0] -= 1;
            break;
            
        case "A" :
            coord[1] -= 1;
            break;
            
        case "S" :
            coord[0] += 1;
            break;
            
        case "D" :
            coord[1] += 1;
            break;
    }
    addRoomToMap();
    return map[coord[0]][coord[1]];
}

function canPassSquare(sym) {
    if(sym == "X")
        return false
    else 
        return true;
}

function enterRoom(entrance, roomId) {
    var startX = 0;
    var startY = 0;
    
    // 0 : top
    // 1 : right
    // 2 : bottom
    // 3 : left
    switch(entrance) {
        case 0:
            startX = canvas.width/2;
            startY = canvas.height/roomSize;
            break;
            
        case 1: 
            startX = canvas.width-(player.width);
            startY = canvas.height/2-(player.height/2);
            break;
            
        case 2: 
            startX = canvas.width/2;
            startY = canvas.height-(player.height);
            break;
            
        case 3:
            startX = player.width;
            startY = canvas.height/2-(player.height/2);
            break;
    }
    
    player.x = startX;
    player.y = startY;
    
    currentLevel = roomId;
    loadLevelData(roomId);
    drawRoom();
}

function getNextSquareType(x, y){
    
    var col = Math.floor(x/(canvas.width/roomSize))+1;
    var row = Math.floor(y/(canvas.width/roomSize))+1;
    
    //if the next tile is the exit
    if(isThisRoomTheExit() && isThisTheMiddleOfTheRoom(row, col))
        return "exit";
    
    if(y >= canvas.height-(player.height)) row = roomSize-1;
    
    if(col < 0) col = 0;
    if(row < 0) row = 0;
    
    return grid[col][row][2];
}

function getImage(sym) {
    var img = new Image();
    switch(sym) {
        
        case "@":
            img.src = "ressources/images/floor.jpg";
            break;
            
        case "#":
            img.src = "ressources/images/wall_1.jpg";
            break;
            
        case "[": 
            img.src = "ressources/images/wall_2.jpg";
            break;
            
        case "]":
            img.src = "ressources/images/wall_3.jpg";
            break;
            
        case "X" :
            img.src = "ressources/images/wall.jpg";
            break;
            
        case "W" :
        case "A" :
        case "S" :
        case "D" :
            img.src = "ressources/images/floor.jpg";
            break;
            
        default:
            img.src = "ressources/images/tile_1.jpg";
    }
    return img;
}

//Transforms txt to a room plan
function loadLevelData() {
    
    var path = "ressources/rooms/" + currentLevel + "/" + roomTypes[coord[0]][coord[1]] + ".txt";
    
    $.get(path, function(data) {
        
        //removes all line breaks
        data = data.replace(/(\r\n|\n|\r)/gm, "");
        
        var x = 0;
        var y = 0;
        
        //transforms character list into [][]
        //dont try and understand how this works unless you really want to go insane
        for(var i = 0; i < data.length; i++){
            if(i > (roomSize-1) && i%roomSize == 0) {
                x++;
            }
            y = i-(roomSize*x);
            grid[y][x][2] = data[i];
        }
    }, 'text');
}

function drawRoom() {
    
    for(var x = 0; x <= roomSize; x++) {
        for(var y = 0; y <= roomSize; y++){
            
            if(!isThisRoomTheExit()) {
                ctx.drawImage(
                    getImage(grid[x][y][2]),    //image
                    grid[x][y][0],              //coord x
                    grid[x][y][1],              //coord y
                    canvas.width/roomSize,      //width 
                    canvas.height/roomSize      //height
               );
            } else if(!isThisTheMiddleOfTheRoom(x, y) ) {
               ctx.drawImage(
                    getImage(grid[x][y][2]),    //image
                    grid[x][y][0],              //coord x
                    grid[x][y][1],              //coord y
                    canvas.width/roomSize,      //width 
                    canvas.height/roomSize      //height
               );
            }
        }
    }

    //draws stairs in the middle of the room
    if(isThisRoomTheExit()) {
        let stairs = new Image();
        stairs.src = "ressources/images/stairs.jpg";
        stairs.onload=function() {
            for(var x = roomSize/2-1; x < roomSize/2; x++) {
                for(var y = roomSize/2-1; y < roomSize/2; y++) {
                    ctx.drawImage(
                        stairs,                         //image
                        grid[x][y][0],                //coord x
                        grid[x][y][1],                //coord y
                        (canvas.width/roomSize)*2,      //width 
                        (canvas.height/roomSize)*2      //height
                   );
                }
            }
            
        }
    }
}

function isThisRoomTheExit() {
    if(coord[0] == exit[0] && coord[1] == exit[1])
        return true;
    return false;
}

function isThisTheMiddleOfTheRoom(x, y) {
    let min = roomSize/2-1;
    let max = roomSize/2;
    if(x < min || x > max || y < min || y > max)
        return false;
    return true;
}

function nextFloor() {
    cmd = "room";
    currentFloor++;

    floorSize++;
    then = Date.now();
    keysDown = {};
    coord = [0, 0];
    exit = [-1, -1];

    //variables for sprite stuff
    frameCount = 0;
    currentLoopIndex = 0;

    clearMap();

    //CREATES COORDINATES ARRAY FOR ROOMS
    grid = [];
    mapGrid = [];
    for(var x = 0; x <= roomSize; x++) {
        grid[x] = [];
        for(var y = 0; y <= roomSize; y++){
            grid[x][y] = [];
            grid[x][y] = [(canvas.width/roomSize)*x, (canvas.height/roomSize)*y, "@"];
        }
    }

    //CREATES COORDINATES ARRAY FOR MAP
    for(var x = 0; x <= floorSize; x++) {
        mapGrid[x] = [];
        for(var y = 0; y <= floorSize; y++){
            mapGrid[x][y] = [];
            mapGrid[x][y] = [(mapCanvas.width/floorSize)*x, (mapCanvas.height/floorSize)*y];
        }
    }

    map =  newMaze(floorSize);
    currentLevel = map[coord[0]][coord[1]];
    setRoomTypes();

    playerReady = true;

    loadLevelData();

    reset();
    addRoomToMap();
}


//DRAW
function render() {
    
    switch(cmd) {
        case "room":
            drawRoom();
            ctx.font = "15px Russo One";
            ctx.fillStyle = "white";
            ctx.fillText("Level " + currentFloor, 10, 25);
            break;
            
        case "exit":
            
            //if have finished 3 floors
            if(currentFloor === 3){

                cmd = "rien";

                localStorage.setItem('endTime', seconds);
                localStorage.setItem('currentPage', 'score-saving');
                location.reload();

            } else {
                Swal.fire(
                    'LEVEL COMPLETE!',
                    'Next up is level ' + (currentFloor+1) + "!",
                    'success'
                );

                nextFloor();
            }
            break;
    }
	if (playerReady) {
        Animate();
		/*ctx.drawImage(
            playerImage, 
            player.x, 
            player.y, 
            player.width, 
            player.height
        );*/
	}
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

// The main game loop
function main() {

	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

    //recursive
	requestAnimationFrame(main);
}

reset();
addRoomToMap();   //just for debugging, uncomment this and comment showAllMap for playing
//showAllMap();
Animate();
main();

var seconds = 0;
var el = document.getElementById('time');

function incrementSeconds() {
    seconds += 1;
    el.innerText = seconds;
}

var cancel = setInterval(incrementSeconds, 1000);

function newMaze(floorSize) {
    
    // Establish variables and starting grid
    let x = floorSize;
    let y = floorSize;
    let totalCells = x*y;
    let map = [];
    let cells = new Array();
    let unvis = new Array();
    
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        //hasVisited[i] = [];
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
            //hasVisited[i][j] = false;
        }
    }
    
    // Set a random position to start from
    let currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    let path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    let visited = 1;
    
    // Loop through all available cell positions
    while (visited < totalCells) {
        
        // Determine neighboring cells
        var pot =   [
                        [currentCell[0]-1, currentCell[1], 0, 2],
                        [currentCell[0], currentCell[1]+1, 1, 3],
                        [currentCell[0]+1, currentCell[1], 2, 0],
                        [currentCell[0], currentCell[1]-1, 3, 1]
                    ];
        
        var neighbors = new Array();
        
        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { 
                neighbors.push(pot[l]); 
            }
        }
        
        // If at least one active neighboring cell has been found
        if (neighbors.length) {
            // Choose one of the neighbors at random
            next = neighbors[Math.floor(Math.random()*neighbors.length)];
            
            // Remove the wall between the current cell and the chosen neighboring cell
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;
            
            // Mark the neighbor as visited, and set it as the current cell
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        // Otherwise go back up a step and keep going
        else {

            currentCell = path.pop();
        }
    }
    let countExits = 0;
    for (let i = 0; i < cells.length; i++) {
        map[i] = [];
        
        //EXIT PLACEMENT :
        //for each room counts the number of exits
        for(let j = 0; j < cells.length; j++) {
            cells[i][j].forEach(function(element) {
                if (element == 1)
                    countExits++;
        });
        //if the room is a deadend
        if(countExits == 1) {
            
            //if exit doesn't exist & position is > half of x OR y then make exit
            if(exit[0] == -1 && (i > Math.floor(floorSize/2) || j > Math.floor(floorSize/2))) {
                exit[0] = i;
                exit[1] = j;
            }

        }
        map[i][j] = cells[i][j].join('');
        countExits = 0;
        }
    }
    
    //if exit is not set by the end of creation
    if(exit[0] == -1 || exit[1] == -1)
        console.log("ERROR WITH EXIT GENERATION");
    
    return map;
}

//adds current room to map
function addRoomToMap() {
    
    let tileWidth = mapCanvas.width/floorSize;
    let tileHeight = mapCanvas.height/floorSize;
    let roomString = "0000";
    
    let playerPos = new Image();
    let exitPos = new Image();
    let roomImage = new Image();
    
    roomString = setCharAt(roomString, 0, map[coord[0]][coord[1]].charAt(0));
    roomString = setCharAt(roomString, 1, map[coord[0]][coord[1]].charAt(1));
    roomString = setCharAt(roomString, 2, map[coord[0]][coord[1]].charAt(2));
    roomString = setCharAt(roomString, 3, map[coord[0]][coord[1]].charAt(3));
    
    roomImage.src = "ressources/images/map_tiles/" + roomString + ".jpg";
    
    roomImage.onload=function(){
        ctxMap.drawImage(
                            roomImage,                        //image
                            mapGrid[coord[1]][coord[0]][0],   //coord x
                            mapGrid[coord[1]][coord[0]][1],   //coord y
                            tileWidth,                        //width 
                            tileHeight                        //height
                        );
        
        if(isThisRoomTheExit()) 
        {
            exitPos.src = "ressources/images/exit.png";
            exitPos.onload=function()
            {
                ctxMap.drawImage    (
                                        exitPos,                          //image
                                        mapGrid[coord[1]][coord[0]][0],   //coord x
                                        mapGrid[coord[1]][coord[0]][1],   //coord y
                                        tileWidth,                        //width 
                                        tileHeight                        //height
                                    );
            } 
        }
        
        playerPos.src = "ressources/images/youAreHere.png";
        playerPos.onload=function()
        {
            ctxMap.drawImage(
                                playerPos,                          //image
                                (tileWidth*coord[1])+tileWidth/4,   //coord x
                                (tileHeight*coord[0])+tileHeight/4, //coord y
                                tileWidth/2,                        //width 
                                tileHeight/2                        //height
                            );
        
        } 
       
    }
}

//redraws a room to remove the player marker 
//called in enterRoom and just before main
function clearPlayerMarker(x, y) {
    
    let tileWidth = mapCanvas.width/floorSize;
    let tileHeight = mapCanvas.height/floorSize;
    let roomString = "0000";
    let roomImage = new Image();
    
    roomString = setCharAt(roomString, 0, map[coord[0]][coord[1]].charAt(0));
    roomString = setCharAt(roomString, 1, map[coord[0]][coord[1]].charAt(1));
    roomString = setCharAt(roomString, 2, map[coord[0]][coord[1]].charAt(2));
    roomString = setCharAt(roomString, 3, map[coord[0]][coord[1]].charAt(3));
    
    roomImage.src = "ressources/images/map_tiles/" + roomString + ".jpg";
    
    roomImage.onload=function(){
        
        ctxMap.drawImage(
                            roomImage,                        //image
                            mapGrid[y][x][0],   //coord x
                            mapGrid[y][x][1],   //coord y
                            tileWidth,                        //width 
                            tileHeight                        //height
                        );
    }
    
    if(x == exit[0] && y == exit[1]) {
        let exitImage = new Image();
        exitImage.src = "ressources/images/exit.png";
        exitImage.onload=function() {
            ctxMap.drawImage(
                            exitImage,                        //image
                            mapGrid[y][x][0],               //coord x
                            mapGrid[y][x][1],               //coord y
                            tileWidth,                        //width 
                            tileHeight                        //height
                        );
        }
    }
}

function showAllMap() {
    let tileWidth = mapCanvas.width/floorSize;
    let tileHeight = mapCanvas.height/floorSize;
    let roomString = "0000";
    let roomImage;
    let exitImage = new Image();
    exitImage.src = "ressources/images/exit.png";
    
    for(var x = 0; x < floorSize; x++) {
        for(var y = 0; y < floorSize; y++){
            
            roomString = setCharAt(roomString, 0, map[x][y].charAt(0));
            roomString = setCharAt(roomString, 1, map[x][y].charAt(1));
            roomString = setCharAt(roomString, 2, map[x][y].charAt(2));
            roomString = setCharAt(roomString, 3, map[x][y].charAt(3));

            roomImage = new Image();
            roomImage.src = "ressources/images/map_tiles/" + roomString + ".jpg";
            roomImage.coords = {x: x, y: y};
            
            roomImage.onload=function(){
                ctxMap.drawImage(
                                    this,                                       //image
                                    mapGrid[this.coords.y][this.coords.x][0],   //coord x       why are the y and x reversed here?!!?!?
                                    mapGrid[this.coords.y][this.coords.x][1],   //coord y
                                    tileWidth,                                  //width 
                                    tileHeight                                  //height
                                );
            }
            
            if(x == exit[1] && y == exit[0]){
                exitImage.onload=function() {
                     ctxMap.drawImage(
                                    exitImage,                                              //image
                                    mapGrid[roomImage.coords.y][roomImage.coords.x][0],     //coord x       why are the y and x reversed here?!!?!?
                                    mapGrid[roomImage.coords.y][roomImage.coords.x][1],     //coord y
                                    tileWidth,                                              //width 
                                    tileHeight                                              //height
                                ); 
                }
            }
        }
    }
}

function setCharAt(str,index,chr) {
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
}

function Animate() {
    
    let cycleLoop =  animations[player.state][player.direction].x;
    let sheetY = animations[player.state][player.direction].y;
    
    frameCount++;
    
    frameCount = 0;
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(cycleLoop[currentLoopIndex], sheetY);
    currentLoopIndex++;
    
    if (currentLoopIndex >= cycleLoop.length) {
        currentLoopIndex = 0;
    }
}

function drawFrame(frameX, frameY) {
    ctx.drawImage(playerImage,
        frameX * spriteSize, frameY * spriteSize, spriteSize, spriteSize,
        player.x, player.y, player.width, player.height);
}

function clearMap() {
    ctxMap.fillStyle = "#ffffff";
    ctxMap.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
    ctxMap.stroke();
}
