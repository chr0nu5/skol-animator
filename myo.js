//main functions
var helper = require('./lib/shared');
var settings = require('./settings.json');

//libs
var ioc = require('socket.io-client');
var socket = ioc.connect(`http://${settings.SOCKET_IP}:${settings.SOCKET_PORT}`);

var move = false;
var center_x = 23;
var last_yaw = 0;

socket.on('connect', () => {
        helper.logger.debug(`[Myo] Connected to port ${settings.SOCKET_PORT}`);
    })
    .on('disconnect', () => {
        helper.logger.debug(`[Myo] Disconnected from port ${settings.SOCKET_PORT}`);
    })



//to receive the double_tap post from myo on iOS
socket.on('pose', () => {
    if (move) {
        move = false
    } else {
        center_x = 23;
        move = true;
    }
});

//receive the myo orientation from the iOS
socket.on('orientation', (data) => {

    var x = data.x;
    var y = data.y;
    var z = data.z;
    var w = data.w;

    //vertical
    var pitch = Math.asin(Math.max(-1.0, Math.min(1.0, 2.0 * (w * y - z * x))));
    var pitch_w = ((pitch + Math.PI / 2.0) / Math.PI * 180);

    //horizontal
    var yaw = Math.atan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z));
    var yaw_w = ((yaw + Math.PI) / (Math.PI * 2.0) * 360);

    //rotation
    var roll = Math.atan2(2.0 * (w * x + y * z), 1.0 - 2.0 * (x * x + y * y));
    var roll_w = ((roll + Math.PI) / (Math.PI * 2.0) * 40);

    y = parseInt((pitch_w - 90) / 4);

    if (yaw_w - 4 > last_yaw) {
        center_x++;
        last_yaw = yaw_w;
    } else if (yaw_w + 4 < last_yaw) {
        center_x--;
        last_yaw = yaw_w;
    }
    if (center_x == 80) {
        center_x = 0;
    } else if (center_x == -1) {
        center_x = 79;
    }
    if (move) {
        socket.emit('myo', {
            type: 'move',
            x: center_x,
            y: y
        });
    }
});
