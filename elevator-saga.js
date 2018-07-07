{
    init: function(elevators, floors) {
        var getRandomInt = function (max) {
            return Math.floor(Math.random() * Math.floor(max));
        },
            sort = function (elevator) {
                elevator.destinationQueue = elevator.destinationQueue.sort().filter(function(item, pos, ary) {
                    return !pos || item != ary[pos - 1];
                });
                if(elevator.goingDownIndicator()) {
                    elevator.destinationQueue.reverse();
                }
                elevator.checkDestinationQueue();
            },
            go = function (elevator, floorNum, insideService) {
                var jump = insideService || false;

                elevator.goToFloor(floorNum, jump);
                elevator.idle = false;

                if(insideService) {
                    sort(elevator);
                }
            },
            findIdle = function (elevators) {
                for(let current of elevators) {
                    if (current.idle) {
                        return current;
                    }
                }
                return elevators[getRandomInt(elevators.length)];
            };

        //init elevators
        for(let current of elevators) {
            current
                .on("idle", function () {
                this.idle = true;
                this.goToFloor(0);
            }).on("floor_button_pressed", function(floorNum) {
                go(this, floorNum, true);
            });
        }

        //init floors
        for(let current of floors) {
            current
                .on("up_button_pressed", function () {
                go(findIdle(elevators), this.floorNum());
            })
                .on("down_button_pressed", function () {
                go(findIdle(elevators), this.floorNum());
            });
        }
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}
