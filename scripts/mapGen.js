
rooms = [
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
];


map = [];



mapSize = 7;

buildMap(mapSize);

function buildMap(mapSize){

    for(var i = 0; i < mapSize; i++) {
        map[i] = [];
        for(var j = 0; j < mapSize; j++) {
            map[i][j] = rooms[0]
        }
    }

    // define start room
    var middle = (mapSize-1)/2;
    map[middle][middle] = rooms[rooms.length - 1];

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


/*    var upRoom = "0000";

    upLeft = map[x-1][y-1];
    console.log(Number(upLeft.charAt(1)));

     var upLeftRoomrightDoor = Number(upLeft.charAt(1));

    if (upLeftRoomrightDoor === 0){
       var randDoor = String(Math.round(Math.random())) ;

        upRoom =  upRoom.replaceAt(3, randDoor);
    }
    else if (upLeftRoomrightDoor === 1) {
        upRoom =  upRoom.replaceAt(3, 1);
    }


    upRight = map[x+1][y-1];
    console.log(Number(upLeft.charAt(3)));

    var upRightRoomLeftDoor = Number(upRight.charAt(3));

    if (upRightRoomLeftDoor === 0){
        var randDoor2 = String(Math.round(Math.random())) ;

        upRoom =  upRoom.replaceAt(1, randDoor2);

        console.log(upRoom)
    }
    else if (upLeftRoomrightDoor === 1) {
        upRoom =  upRoom.replaceAt(3, 1);
    }*/