// Permet de modifier le code lorsque l'on passe en mode resizing
function resizing(){
	$(".animationEnCours").each(
            function (index) {
                $(this).stop(true, true);
            });

    inMouvement = true;
    inResize = true;
}

// Permet de modifier le code lorsque l'on arrete le resizing
function stopResizing(timeout){
	inMouvement = false;
    timeout = false;
    inResize = false;
}

// Permet de modifier le code lorsque l'on passe en mode présentation
function inPresentationMode(){

}

// Permet de modifier le code lorsque l'on passe en mode détail
function inDetailedMode(){

}