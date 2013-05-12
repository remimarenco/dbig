$(document).ready(function () {
    // On modifie le css pour que .firstList > li soit en 1/3 en width
    $(".firstList > li").each(function (index) {
        $(this).css("width", 100 / 3 + "%");
    });

    $("img").click(function () {
        movingPowa(this);
    });

    function movingPowa(elementClicked) {
        // Si on a cliqué sur l'image principale, on ne lance pas l'algo
        if ($(elementClicked).attr("id") == "imgPrincipale") {
            return false;
        }

        moveToEffect($('#imgPrincipale'), $("#firstElementImg"));

        slideEffect($('#imgPrincipale'), $(elementClicked));

        var ulli = $('body').find('ul li');
        ulli.each(function (index) {
            if (index !== ulli.length - 1) {
                // select the next span
                if ($(ulli.eq(index).find('img'))[0] == $(elementClicked)[0]) {
                    return false;
                }
                else {
                    moveToEffect(ulli.eq(index).find('img'), ulli.eq(index + 1).find('img'));
                }

            }
        });
    }

    function slideEffect(elementToErase, elementToSlide) {
        // On bouge celui qui a été cliqué
        var thisClone = elementToSlide.clone();

        $(thisClone).hide();
        // On lui donne la taille de l'élément également
        $(thisClone).css("height", elementToErase.css('height'));
        $(thisClone).css("width", elementToErase.css('width'));

        $(thisClone).attr("id", elementToErase.attr("id"));

        // On supprime sa valeur top si il en avait une
        $(thisClone).css("top", "");

        elementToErase.replaceWith($(thisClone));
        $(thisClone).show("slide", 1000);
    }

    function moveToEffect(elementToMove, elementReceiver) {
        // On va créer un element qui part de la position de elementToMove et qui va a la position de elementReceiver
        var elementToMoveClone = elementToMove.clone();

        // On lui met une position absolue
        $(elementToMoveClone).css("position", "absolute");
        $(elementToMoveClone).css("top", elementToMove.offset().top);
        $(elementToMoveClone).css("left", elementToMove.offset().left);

        // On lui donne la taille de l'élément également
        $(elementToMoveClone).css("height", elementToMove.css('height'));
        $(elementToMoveClone).css("width", elementToMove.css('width'));

        $('body').append($(elementToMoveClone));
        var offsetElementReceiver = elementReceiver.offset();

        // On cache l'élément qui recoit pour éviter de le voir pendant l'animation
        elementToMove.attr("src", "images/transparent.gif");

        elementToMoveClone.animate({
            'top': offsetElementReceiver.top,
            'left': offsetElementReceiver.left,
            'height': elementReceiver.css("height"),
            'width': elementReceiver.css("width")
        }, 1000, function () {
            elementToMoveClone.attr("id", elementReceiver.attr("id"));
            elementToMoveClone.css("position", "");
            elementReceiver.replaceWith(elementToMoveClone);
        });

        // On lui remet la fonction movingPowa
        $(elementToMoveClone).click(function () {
            movingPowa(this);
        });
    }
});