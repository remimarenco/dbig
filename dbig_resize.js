$(document).ready(function(){
    // On pose la fonction de détection de resize
    var rtime = new Date(1, 1, 2000, 12, 00, 00);
    var timeout = false;
    var delta = 2000;
    
    $(window).resize(function () {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }

        resizing();
    });

    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            stopResizing(timeout);                
        }
    }
});