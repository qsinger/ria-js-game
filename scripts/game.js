
var player = {
	speed: 256,
	x: 0,
	y: 0,
    width: 50,
    height: 50
};

var then = Date.now();
var keysDown = {};
var roomSize = 20;
//var currentLevel = "test";


var map =  getMap(7);

var coord = [1, 1];
var currentLevel = map[coord[0]][coord[1]];

//INITIALISE CANVAS
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;

//PLAYER IMAGE
var playerImage = new Image();
playerImage.src = "ressources/images/zombie.png";
var playerReady = true;

//CREATES COORDINATES ARRAY FOR ROOM GRID
var grid = [];
for(var x = 0; x <= roomSize; x++) {
    grid[x] = [];
    for(var y = 0; y <= roomSize; y++){
        grid[x][y] = [];
        grid[x][y] = [(canvas.width/roomSize)*x, (canvas.height/roomSize)*y, "@"];
    }
}

loadLevelData();

//KEY LISTENERS
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


//reset player position to middle
var reset = function () {
    player.x = canvas.width / 2;
	player.y = canvas.height / 2;
};

//CONTROLS
var update = function (modifier) {
    
    //print coordinates for testing :
    //console.log("X = "+player.x+"    Y = "+player.y);
    
    
    //LOOK AT LEFT RIGHT POINT POSITIONING
	if (38 in keysDown || 87 in keysDown) { // Player holding up
        if (canPassSquare(getNextSquareType(player.x, player.y - (player.speed * modifier))))
             player.y -= player.speed * modifier;
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down
        if (canPassSquare(getNextSquareType(player.x, player.y + (player.speed * modifier)+(canvas.width/roomSize))))
		      player.y += player.speed * modifier;
	}
	if (37 in keysDown || 65 in keysDown) { // Player holding left
        if (canPassSquare(getNextSquareType(player.x - (player.speed * modifier)-(player.width/2), player.y)))
		    player.x -= player.speed * modifier;
	}
	if (39 in keysDown || 68 in keysDown) { // Player holding right
        if (canPassSquare(getNextSquareType(player.x + (player.speed * modifier)+(player.width/2), player.y)))
            player.x += player.speed * modifier;
	}
    
    console.log("coords : " + player.x + ", " + player.y + " and next square = " + getNextSquareType(player.x, player.y));
    console.log("height : " + (canvas.height - player.height));
    var nextSquare = getNextSquareType(player.x, player.y);
    
    if(nextSquare == "W" || nextSquare == "A" || nextSquare == "S" || nextSquare == "D") {
        enterRoom(getEntrancePos(nextSquare), getNextRoom(nextSquare));
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
            startY = canvas.height/2-player.height;
            break;
            
        case 2: 
            startX = canvas.width/2;
            startY = canvas.height-(player.height);
            break;
            
        case 3:
            startX = player.width;
            startY = canvas.height/2-player.height;
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
    
    console.log("in this case Y = "+y)
    if(y >= canvas.height-(player.height)) row = roomSize-1;
    
    if(col < 0) col = 0;
    if(row < 0) row = 0;
    
    return grid[col][row][2];
}

function getImage(sym) {
    var img = new Image();
    switch(sym) {
        
        case "@":
            img.src = "ressources/images/tile_1.jpg";
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
            img.src = "ressources/images/wall_test.jpg";
            break;
            
        case "W" :
        case "A" :
        case "S" :
        case "D" :
            img.src = "ressources/images/door_test.jpg";
            break;
            
        default:
            img.src = "ressources/images/tile_1.jpg";
    }
    return img;
}

//Transforms txt to a room plan
function loadLevelData() {
    var path = "ressources/rooms2/" + currentLevel + ".txt";
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

//DRAW
function render() {
    drawRoom();
	if (playerReady) {
		ctx.drawImage(
            playerImage, 
            player.x, 
            player.y, 
            player.width, 
            player.height
        );
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

newMaze(5, 5)
//LAUNCH MAIN
reset();
main();


function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x*y;
    var map = [];
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
        }
    }
    
    // Set a random position to start from
    var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;
    
    // Loop through all available cell positions
    while (visited < totalCells) {
        // Determine neighboring cells
        var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1]+1, 1, 3],
                [currentCell[0]+1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1]-1, 3, 1]];
        var neighbors = new Array();
        
        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
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
    for (let i = 0; i < cells.length; i++) {
        map[i] = [];
        for(let j = 0; j < cells.length; j++) {
            map[i][j] = cells[i][j].join('')
            console.log(cells[i][j].join(''))
        }
        
    }
    console.log("mpa", map)
    console.log(cells)
    //return cells;
    return map;
}


function getMap(mapSize){
    /*rooms = [
        "0000",
        "0001",
        "0010",
        "0011",
        "0100",
        "0101",
        "0110",
        "0111",
        "1000",
        "1001",
        "1010",
        "1011",
        "1100",
        "1101",
        "1110",
        "1111",
    ];*/


    map = [];


    


    buildMap(mapSize);

    function buildMap(mapSize){

        for(var i = 0; i < mapSize; i++) {
            map[i] = [];
            for(var j = 0; j < mapSize; j++) {
                map[i][j] = "0000"
            }
        }

        // define start room
        var middle = (mapSize-1)/2;
        //map[middle][middle] = rooms[rooms.length - 1];

        // placeRooms(middle ,middle)
        placeRooms(0 ,0)

    }


    function placeRooms(x,y) {

        // up

        for(var i = 0; i < mapSize; i++) {
            map[i] = [];
            for(var j = 0; j < mapSize; j++) {

                let thisRoom = "0000";

                if( i === 0){
                    thisRoom = setUpDoor(thisRoom, "0");
                    thisRoom = setDownDoor(thisRoom, String(Math.round(Math.random())));
                    if (j !== 0){
                        if (Number(map[i][j-1].charAt(1)) === 1){
                            thisRoom = setLeftDoor(thisRoom, "1");
                        }
                        else {
                            thisRoom = setLeftDoor(thisRoom, "0");
                        }
                    }
                    else{

                    }
                    thisRoom = setRightDoor(thisRoom, String(Math.round(Math.random())));
                }
                if ( i === mapSize - 1){
                    thisRoom = setDownDoor(thisRoom, "0");
                    thisRoom = setUpDoor(thisRoom, String(Math.round(Math.random())));
                    if (j !== 0){
                        if (Number(map[i][j-1].charAt(1)) === 1){
                            thisRoom = setLeftDoor(thisRoom, "1");
                        }
                        else {
                            thisRoom = setLeftDoor(thisRoom, "0");
                        }
                    }
                    thisRoom = setRightDoor(thisRoom, String(Math.round(Math.random())));
                }
                if ( j === 0){
                    thisRoom = setLeftDoor(thisRoom, "0");
                    thisRoom = setRightDoor(thisRoom, String(Math.round(Math.random())));
                    if (i !== 0){
                        if (Number(map[i-1][j].charAt(2)) === 1){
                            thisRoom = setUpDoor(thisRoom, "1");
                        }
                        else {
                            thisRoom = setUpDoor(thisRoom, "0");
                        }
                    }
                    thisRoom = setDownDoor(thisRoom, String(Math.round(Math.random())));
                }
                if ( j ===  mapSize - 1){
                    thisRoom = setRightDoor(thisRoom, "0");
                    if (i !== 0){
                        if (Number(map[i-1][j].charAt(2)) === 1){
                            thisRoom = setUpDoor(thisRoom, "1");
                        }
                        else {
                            thisRoom = setUpDoor(thisRoom, "0");
                        }
                    }
                    thisRoom = setDownDoor(thisRoom, String(Math.round(Math.random())));
                }
                if(i !== 0 && j !== 0 ){
                    if (j ===  mapSize - 1){
                        thisRoom = setRightDoor(thisRoom, "0");
                    }
                    else {
                        thisRoom = setRightDoor(thisRoom, String(Math.round(Math.random())));
                    }
                    if (i ===  mapSize - 1){
                        thisRoom = setDownDoor(thisRoom, "0");
                    }
                    else {
                        thisRoom = setDownDoor(thisRoom, String(Math.round(Math.random())));
                    }
                    if (Number(map[i][j-1].charAt(1)) === 1){
                        thisRoom = setLeftDoor(thisRoom, "1");
                    }
                    else {
                        thisRoom = setLeftDoor(thisRoom, "0");
                    }
                    if (Number(map[i-1][j].charAt(2)) === 1){
                        thisRoom = setUpDoor(thisRoom, "1");
                    }
                    else {
                        thisRoom = setUpDoor(thisRoom, "0");
                    }
                }



                map[i][j] = thisRoom

            }
        }



    }

    function setUpDoor(room, door){
        // find a way to déclare gloabally
        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        };

        room =  room.replaceAt(0, door);
        return room
    }

    function setDownDoor(room, door){
        // find a way to déclare gloabally
        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        };

        room =  room.replaceAt(2, door);
        return room
    }

    function setLeftDoor(room, door){
        // find a way to déclare gloabally
        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        };

        room =  room.replaceAt(3, door);
        return room
    }
    function setRightDoor(room, door){
        // find a way to déclare gloabally
        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        };

        room =  room.replaceAt(1, door);
        return room
    }


    map.forEach(function (element) {
        console.log(element);
    });

    return map

}

