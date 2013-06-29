$(document).ready(function(){
    // On pose la fonction de détection de resize
    var rtime = new Date(1, 1, 2000, 12, 00, 00);
    dbig_timeout = false;
    var delta = 1000;
    
    $(window).resize(function () {
        rtime = new Date();
        if (dbig_timeout === false) {
            dbig_timeout = true;
            setTimeout(resizeend, delta);
        }

        resizing();
    });

    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            stopResizing();                
        }
    }
});