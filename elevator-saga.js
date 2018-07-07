{
    init: function(elevators, floors) {
        var getRandomInt = function (max) {
            return Math.floor(Math.random() * Math.floor(max));
        }
        , add&sort = function (params) {
	    var queue = params["queue"] || [],
		elevator = params["elevator"] || {},
		insideService = params["insideService"] || false,
		addFloorNum = params["addFloorNum"] || 0,
		intercepting = false;

	    if("down" == elevator.dir()){
		intercepting = elevator.currentFloor() >= addFloorNum;
	    } else {
		intercepting = elevator.currentFloor() <= addFloorNum;
	    }
	    
	    if (intercepting) {
		queue.push(addFloorNum);
	    }
	    
	    queue.sort().filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            });
	    
            if("down" == elevator.dir()) {
                elevator.destinationQueue.reverse();
            }

	    if (!intercepting) {
		queue.push(addFloorNum);
	    }
            elevator.checkDestinationQueue();
        }
	, go = function (elevator, floorNum, insideService) {
            var insideService = insideService || false
	    , queue = Array.from(elevator.destinationQueue);

	    elevator.idle = false;
	    
	    elevator.destinationQueue = add&sort({"queue": queue, "elevator": elevator, "insideService": insideService, "addFloorNum": floorNum});
	    elevator.checkDestionationQueue();
        }
	, findIntercepting = function (params) {
	    var elevator = params["elevator"] || {},
		floorNum = params["floorNum"];
	    
            if (floorNum) {
		for (let current of elevators) {
		    if(("down" == current.dir && current.currentFloor() >= floorNum) or ("up" == current.dir && current.currentFloor() <= floorNum)) {
			return current;
		    }
		}
	    }

	    for (let current of elevators) {
		if (current.idle) {
		    return current;
		}
	    }

	    var distance = 999999, closerInReturnTrip = elevators[getRandomInt(elevators.length)];
	    for (let current of elevators) {
		var currentDistance = Math.abs(current.currentFloor() - floorNum);
		if(currentdistance < distance) {
		    distance = currentDistance;
		    closerInReturnTrip = current;
		}
	    }
	    return closerInReturnTrip;
        };
	
        //init elevators
        for(let current of elevators) {
            current
                .on("idle", function () {
                    this.idle = true;
                    this.goToFloor(0);
		}).on("floor_button_pressed", function (floorNum) {
                    go(this, floorNum, true);
		}).on("stopped_at_floor", function () {
		    var nextFloor = this.destinationQueue[0],
			currentFloor = this.currentFloor,
			dir = "stopped";
		    
		    if (nextFloor) {
			if(currentFloor > nextFloor) {
			    dir = "down";
			} else if (currentFloor < nextFloor ) {
			    dir = "up";
			}
		    }

		    this.dir = dir;
		});
        }
	
        //init floors
        for(let current of floors) {
            current
                .on("up_button_pressed", function () {
                    go(findIntercepting({"elevators": elevators, "floorNum": this.floorNum()}), this.floorNum());
		})
                .on("down_button_pressed", function () {
                    go(findIntercepting({"elevators": elevators, "floorNum": this.floorNum()}), this.floorNum());
		});
        }
    }
    , update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
