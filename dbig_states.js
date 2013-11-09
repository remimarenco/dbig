// Permet de modifier le code lorsque l'on passe en mode resizing
function resizing(){
	$(".animationEnCours").each(
            function (index) {
                $(this).stop(true, true);
            }
    );

    //inMouvement = true;
    inResize = true;
}

// Permet de modifier le code lorsque l'on arrete le resizing
function stopResizing(){
	inMouvement = false;
    dbig_timeout = false;
    inResize = false;
}

// Permet de modifier le code lorsque l'on passe en mode présentation
function inPresentationMode(){
	inDetail = false;
	inPresentation = true;
}

// Permet de modifier le code lorsque l'on passe en mode détail
function inDetailedMode(){
	inDetail = true;
	inPresentation = false;
}