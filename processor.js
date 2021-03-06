//main functions
var helper = require('./lib/shared');
var Wall = require('./lib/wall');
var settings = require('./settings.json');

//libs
var ioc = require('socket.io-client');
var socket = ioc.connect(`http://${settings.SOCKET_IP}:${settings.SOCKET_PORT}`);

//animations
var ScrollText = require('./animations/scroll-text');
var ScoreBoard = require('./animations/score-board');
var Ola = require('./animations/ola');
var Music = require('./animations/music');
var Idle = require('./animations/idle');
var RandomPosition = require('./animations/random-position');
var AutoPilot = require('./animations/auto-pilot');
var VerticalOla = require('./animations/vertical-ola');
var Lidar = require('./animations/lidar');
var LidarHelper = require('./lib/lidar');

//games
var Snake = require('./games/snake');
var Game;

//walls with motors
var roof = new Wall(374, 11, 'top', 0, socket),
    leftWall = new Wall(170, 34, 'left', 4, socket),
    frontWall = new Wall(55, 11, 'front', 0, socket),
    rightWall = new Wall(170, 34, 'right', 0, socket);

var walls = {
    roof: roof,
    leftWall: leftWall,
    frontWall: frontWall,
    rightWall: rightWall
}

roof.init();
leftWall.init();
frontWall.init();
rightWall.init();

AutoPilot = new AutoPilot([rightWall, frontWall, leftWall, roof], socket);
AutoPilot.init();
AutoPilot.informCurrentAnimation = (animation) => {
    currentAnimations.push(animation);
}

lidarHelper = new LidarHelper([rightWall, frontWall, leftWall, roof]);

var refreshRate = roof.motors[0].getFPS();

var globalMusic = null;
var now = new Date().getTime();

var AUTO_PILOT_STATUS = false;

var Redis = require('./lib/redis'),
    r = new Redis(),
    lastAck = Date.now(),
    healthStatus = {
        healthy: true,
        lastAck: 0
    };
var emitHealthStatus = function(healthy) {
    if (healthy !== undefined) {
        healthStatus = {
            healthy,
            lastAck
        };
    }
    socket.emit('ackHealth', healthStatus);
}
r.ackCallback = function() {
    lastAck = Date.now();
}
var enginesWatchDog = function() {
    var diff = Date.now() - lastAck;
    if (diff >= 2000 && healthStatus.healthy) {
        emitHealthStatus(false);
    } else if (diff <= 2000 && !healthStatus.healthy) {
        emitHealthStatus(true);
    }
}
var emitLidarStatus = function() {
    if (lidarHelper) {
        socket.emit('lidarStatus', lidarHelper.enabled);
    }
}

setInterval(enginesWatchDog, 1000);

//all animations
var currentAnimations = [];

//mapped motors to send to Redis
var FACE_BITMAP = {
    dimensionX: 45,
    dimensionY: 5,
    map: [
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,0  -> 44,0
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,1  -> 44,1
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,2  -> 44,2
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,3  -> 44,3
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,4  -> 44,4
    ]
};
var TOP_BITMAP = {
    dimensionX: 11,
    dimensionY: 17,
    map: [
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,0  -> 10,0
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,1  -> 10,1
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,2  -> 10,2
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,3  -> 10,3
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,4  -> 10,4
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,5  -> 10,5
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,6  -> 10,6
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,7  -> 10,7
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,8  -> 10,8
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,9  -> 10,9
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,10 -> 10,10
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,11 -> 10,11
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,12 -> 10,12
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,13 -> 10,13
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,14 -> 10,14
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14], //line 0,15 -> 10,15
        [0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14] //line 0,16 -> 10,16
    ]
};

(function UpdateBackend() {
    roof.motors.forEach((motor) => {
        TOP_BITMAP.map[motor.y][motor.x] = motor.command;
    });
    rightWall.motors.forEach((motor) => {
        FACE_BITMAP.map[motor.y][motor.x + 28] = motor.command;
    });
    frontWall.motors.forEach((motor) => {
        FACE_BITMAP.map[motor.y][motor.x + 17] = motor.command;
    });
    leftWall.motors.forEach((motor) => {
        FACE_BITMAP.map[motor.y][motor.x] = motor.command;
    });
    r.send('FACE_BITMAP', FACE_BITMAP);
    r.send('TOP_BITMAP', TOP_BITMAP);
    setTimeout(UpdateBackend, refreshRate);
}).call(this);

//init socket
socket.on('connect', () => {
        helper.logger.debug(`[Processor] Connected to port ${settings.SOCKET_PORT}`);
        socket.emit('pilotstatus', `[Processor] RESTARTED`);
        emitHealthStatus();
    })
    .on('exec', (command) => {
        refreshRate = roof.motors[0].getFPS();
        if (command.animation !== 'lidar') {
            socket.emit('pilotstatus', `[Processor] Received Command ${command.animation}`);
        }
        helper.logger.debug(`[Processor] Received Command ${command.animation}`);
        var animation = '';
        globalMusic = null;
        if (command.animation == 'enable_lidar') {
            console.log('lidar', command.enabled);
            lidarHelper.setEnabled(command.enabled);
            emitLidarStatus();
            return;
        } else if (command.animation == 'increase_lidar_level') {
            lidarHelper.forceLevelUp();
            return;
        } else if (command.animation == 'drop_lidar') {
            lidarHelper.forceDrop();
            return;
        } else if (command.animation == 'ScrollText') {
            animation = new ScrollText(command.message, 13, [rightWall, frontWall, leftWall, roof], command.continuous, command.loop);
            animation.init();
        } else if (command.animation == 'ScoreBoard') {
            animation = new ScoreBoard({
                country1: command.country1,
                score1: command.score1,
                country2: command.country2,
                score2: command.score2
            }, [rightWall, frontWall, leftWall, roof], command.loop);
            animation.init();
        } else if (command.animation == 'Ola') {
            if (command.type === 'vertical') {
                animation = new VerticalOla(command.loop, [rightWall, frontWall, leftWall, roof]);
            } else {
                animation = new Ola(command.type, 13, [rightWall, frontWall, leftWall, roof], command.loop);
            }
            animation.init();
        } else if (command.animation == 'Music') {
            animation = new Music(command.type, 13, [rightWall, frontWall, leftWall, roof], null);
            if (command.type == 'equalizer') {
                globalMusic = animation;
            } else {
                animation.init();
            }
        } else if (command.animation == 'Idle') {
            animation = new Idle(command.type, 18, [rightWall, frontWall, leftWall, roof], command.loop);
            animation.init();
        } else if (command.animation == 'lidar') {
            lidarHelper.receiveValues(parseFloat(command.upward), parseFloat(command.downward));
            animation = lidarHelper.animation;
        } else if (command.animation == 'RandomPosition') {
            animation = new RandomPosition([rightWall, frontWall, leftWall, roof]);
            animation.init();
        } else if (command.animation == 'BasicAngle') {
            [rightWall, frontWall, leftWall, roof].forEach((wall) => {
                wall.motors.forEach((motor) => {
                    motor.sendCommand(command.angle);
                });
            });
        } else {
            if (command >= 0xFB && command <= 0xFF) {
                refreshRate = 4000;
                [rightWall, frontWall, leftWall, roof].forEach((wall) => {
                    wall.motors.forEach((motor) => {
                        motor.sendCommand(command);
                    })
                    wall.locked = false;
                });
            }
        }
        if (animation && animation.name) {
            currentAnimations.push(animation);
        }
    })
    .on('fft', (data) => {
        if (globalMusic) {
            globalMusic.process(data);
        }
        AutoPilot.getBeatFromHell(data);
    })
    .on('single', (data) => {
        helper.logger.debug(`[Processor] Received UNICAST X:${data.x} Y:${data.y} W:${data.wall} C:0x${data.command.toString(16).toUpperCase()}`);
        socket.emit('pilotstatus', `[Processor] Received UNICAST \nX:${data.x} Y:${data.y} W:${data.wall} C:0x${data.command.toString(16).toUpperCase()}`);
        walls[data.wall].motors.forEach((motor) => {
            if (motor.x == data.x && motor.y == data.y) {
                motor.sendCommand(data.command);
            }
        });
    })
    .on('the_beast', () => {
        refreshRate = roof.motors[0].getFPS();
        AutoPilot.status = true;
    })
    .on('magic', (action) => {
        //helper.logger.debug('[Processor] Myo Command ');
        [roof, leftWall, frontWall, rightWall].forEach((wall) => {
            wall.motors.forEach((motor) => {
                if (action.type == 'pose') {
                    if (action.pose == 'fist') {
                        motor.sendCommand(0x14);
                    } else if (action.pose == 'fingers_spread') {
                        motor.sendCommand(0x1e);
                    }
                } else if (action.type == 'move') {
                    var x = action.x;
                    var y = action.y;
                    if (x > 17 && x < 29 && y < 6 && wall.name == 'front') {
                        x = x - 18;
                        y = 5 - y;
                        if (motor.x === x && motor.y === y) {
                            motor.sendCommand(0x1e);
                        } else {
                            motor.sendCommand(0x14);
                        }
                    } else if (x < 18 && y < 6 && wall.name == 'left') {
                        y = 5 - y;
                        if (motor.x === x && motor.y === y) {
                            motor.sendCommand(0x1e);
                        } else {
                            motor.sendCommand(0x14);
                        }
                    } else if (x > 28 && y < 6 && wall.name == 'right') {
                        x = 17 - (46 - x);
                        y = 5 - y;
                        if (motor.x === x && motor.y === y) {
                            motor.sendCommand(0x1e);
                        } else {
                            motor.sendCommand(0x14);
                        }
                    } else if (x > 17 && x < 29 && y > 5 && wall.name == 'top') {
                        x = x - 18;
                        y = 17 - (y - 5);
                        if (motor.x === x && motor.y === y) {
                            motor.sendCommand(0x1e);
                        } else {
                            motor.sendCommand(0x14);
                        }
                    } else {
                        motor.sendCommand(0x14);
                    }
                }

            });
        })
    })
    .on('game', (type) => {
        if (type == 'snake') {
            Game = new Snake([roof, leftWall, frontWall, rightWall]);
        }
        Game.start();
        currentAnimations.push(Game);
    })
    .on('keypress', (key) => {
        //Game.pressKey(key);
    })
    .on('freeze', () => {
        helper.logger.debug(`[Processor] RECECIVED STOP ALL`);
        socket.emit('pilotstatus', `[Processor] RECECIVED STOP ALL`);
        currentAnimations.forEach((animation) => {
            helper.logger.debug(`[Processor] Will CANCEL ${animation.name}`);
            socket.emit('pilotstatus', `[Processor] Will CANCEL ${animation.name}`);
            helper.clearTimers(animation);
        });
        currentAnimations = [];
        AutoPilot.status = false;
        AutoPilot.init();
        lidarHelper.setEnabled(false);
    })
    .on('disconnect', () => {
        helper.logger.debug(`[Processor] Disconnected from port ${settings.SOCKET_PORT}`);
    });
