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

var map =   [
                [1,2,3],
                [4,5,6],
                [7,8,9]
            ];

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
    var path = "ressources/rooms/" + currentLevel + ".txt";
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


//LAUNCH MAIN
reset();
main();

