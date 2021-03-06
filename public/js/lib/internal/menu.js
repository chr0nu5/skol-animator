var gui = new dat.GUI();

//SCROLL TEXT
var ContextMenuScrollText = function() {
    var _this = this;
    this.message = 'SKOL';
    this.continuous = false;
    this.loop = false;
    this.START = function() {
        if (_this.message.length > 0) {
            socket.emit('animation', {
                animation: 'ScrollText',
                message: _this.message,
                continuous: _this.continuous,
                loop: _this.loop
            });
        } else {
            window.alert('Type a message!');
        }
    };
};
var optionsScrollText = new ContextMenuScrollText();

var scrollTextMenu = gui.addFolder('Scroll Text');
scrollTextMenu.add(optionsScrollText, 'message');
scrollTextMenu.add(optionsScrollText, 'continuous');
scrollTextMenu.add(optionsScrollText, 'loop');
scrollTextMenu.add(optionsScrollText, 'START');
scrollTextMenu.open();

//SCORE BOARD
var ContextMenuScoreBoard = function() {
    var _this = this;
    this.text1 = 'BRA';
    this.text2 = 'NOT';
    this.text3 = 'FOR';
    this.text4 = 'BEG';
    this.loop = false;
    this.START = function() {
        if (_this.text1.length > 0 && _this.text2.length > 0 && _this.text3.length > 0 && _this.text4.length > 0) {
            socket.emit('animation', {
                animation: 'ScoreBoard',
                country1: _this.text1,
                score1: _this.text2,
                country2: _this.text3,
                score2: _this.text4,
                loop: _this.loop
            });
        } else {
            window.alert('We need four words!');
        }
    };
};
var optionsScoreBoard = new ContextMenuScoreBoard();

var scoreBoardMenu = gui.addFolder('Score Board');
scoreBoardMenu.add(optionsScoreBoard, 'text1');
scoreBoardMenu.add(optionsScoreBoard, 'text2');
scoreBoardMenu.add(optionsScoreBoard, 'text3');
scoreBoardMenu.add(optionsScoreBoard, 'text4');
scoreBoardMenu.add(optionsScoreBoard, 'loop');
scoreBoardMenu.add(optionsScoreBoard, 'START');
scoreBoardMenu.open();

//OLA
var ContextMenuOla = function() {
    var _this = this;
    this.type = 'little';
    this.loop = false;
    this.START = function() {
        socket.emit('animation', {
            animation: 'Ola',
            type: _this.type,
            loop: _this.loop
        });
        if (_this.type == 'full') {
            $('body').append('<div class="HELL_ON_EARTH">THIS IS TO PREVENT YOU FROM GOING TO HELL</div>');
            setTimeout(function() {
                $('.HELL_ON_EARTH').remove();
            }, 120000);
        }
    };
};
var optionsOla = new ContextMenuOla();

var olaMenu = gui.addFolder('Ola');
olaMenu.add(optionsOla, 'type', {
    '45º short': 'little',
    '45º long': 'full',
    'Vertical': 'vertical'
});
olaMenu.add(optionsOla, 'loop');
olaMenu.add(optionsOla, 'START');
olaMenu.open();

//IDLE
var ContextMenuIdle = function() {
    var _this = this;
    this.type = 'shuffle';
    this.loop = false;
    this.START = function() {
        socket.emit('animation', {
            animation: 'Idle',
            type: _this.type,
            loop: _this.loop
        });
    };
};
var optionsIdle = new ContextMenuIdle();

var idleMenu = gui.addFolder('IDLE');
idleMenu.add(optionsIdle, 'type', {
    Randomized: 'shuffle',
    Live: 'live',
    Linear: 'open',
    Breathing: 'breathing',
    Spiral: 'spiral',
    Reel: 'reel',
    BrendaCadente: 'brendacadente',
    Dehzinho: 'dehzinho'
});
idleMenu.add(optionsIdle, 'loop');
idleMenu.add(optionsIdle, 'START');
idleMenu.open();

//MUSIC
var ContextMenuMusic = function() {
    var _this = this;
    this.type = 'equalizer';
    this.START = function() {
        socket.emit('animation', {
            animation: 'Music',
            type: _this.type
        });
    };
};
var optionsMusic = new ContextMenuMusic();

var musicMenu = gui.addFolder('MUSIC');
musicMenu.add(optionsMusic, 'type', {
    'Bass Sync': 'equalizer',
    //'BPM': 'bpm',
    '---------': '',
    'TooFast (~166bpm)': 'very_fast_boom',
    'Fastest (~120bpm)': 'fast_boom',
    'Slow (~65bpm)': 'boom',
    'Slower (~35bmp)': 'long_boom',
});
musicMenu.add(optionsMusic, 'START');
musicMenu.open();
