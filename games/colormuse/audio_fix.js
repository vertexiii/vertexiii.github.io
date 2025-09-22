var soundVolume = 0;

var introVolume = 0.3;

intro = new Howl({
    src: ["assets/bgm/bgm_third_eye_intro_drums.mp3"],
    volume: 0.0,
    loop: true
});

var menuVolume = 0.26;

menu = new Howl({
    src: ["assets/bgm/bgm_third_eye_drop.mp3"],
    volume: menuVolume,
    loop: true
});

var gameVolume = 1.0;

game = new Howl({
    src: ["assets/bgm/bgm_night_highway.mp3"],
    volume: gameVolume,
    loop: true
});

var hardmodeVolume = 0.45

hardmode = new Howl({
    src: ["assets/bgm/bgm_accelerate.mp3"],
    volume: hardmodeVolume,
    loop: true
});

function playAudio(filePath, volumeDB, loop) {
    soundVolume = volumeDB;
    var sound = new Howl({
        src: [filePath],
        volume: Math.pow(10, volumeDB / 20),
        loop: loop
    });

    sound.play();
}

// intro

function playIntroBgm()
{
    intro.play();
    intro.fade(0.0, introVolume, 500);
}

function stopIntroBgm()
{
    if (intro?.playing())
    {
        intro.fade(intro.volume(), 0.0, 500);

        intro.once('fade', () => { intro.stop(); });        
    }
}

// menu

function playMenuBgm()
{
    if (menu?.playing())
    {
        menu.fade(menu.volume(), menuVolume, 500);
        return;
    }

    menu.play();
}

function stopMenuBgm()
{
    if (menu?.playing())
    {
        menu.fade(menu.volume(), 0.0, 500);
    }
}

// game

function playGameBgm()
{
    game.volume(gameVolume)
    game.play();
}

function stopGameBgm()
{
    if (game?.playing())
    {
        game.fade(game.volume(), 0.0, 500);

        game.once('fade', () => { game.stop(); });        
    }
}

// hardmode

function playHardmodeBgm()
{
    hardmode.volume(hardmodeVolume)
    hardmode.play();
}

function stopHardmodeBgm()
{
    if (hardmode?.playing())
    {
        hardmode.fade(hardmode.volume(), 0.0, 500);

        hardmode.once('fade', () => { hardmode.stop(); });        
    }
}

function stopAllAudio() {
    Howler.stop();
}

function setVolume(volume)
{
    Howler.volume(volume);
}

/*document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        IncrementGlobalVolume(-100, 0);
    } else {
        IncrementGlobalVolume(100, 0);
    }
});*/