$(document).ready(function () {
    jQuery.fn.exists = function () { return this.length > 0; }

    var indexImageSuivante = 0;
    var tableauImages = new Array();

    // On récupère toutes les images qui sont dans divStockage
    if ($("#divStockage").exists()) {
        $("#divStockage").children('img').each(function (index) {
            tableauImages[index] = this;
        });
    }

    // On charge d'abord les images dans les cases
    var nbImages = 18;
    for (var i = 1; i <= nbImages; i++) {
        if ($("#div" + i).exists()) {
            jImg = $(tableauImages[i - 1]).clone();
            jImg.attr("id", "img" + i);
            $("#div" + i).append(jImg);
        }
        indexImageSuivante = i;
    }

    // Une fois les images chargées, on lance le timer
    intervalPowa = setInterval(function () { randomMovingPowa() }, 2000);

    var inMouvement = false;

    $("img").click(function () {
        movingPowa(this);
    });

    function movingPowa(elementClicked) {
        // Si on a cliqué sur l'image principale, on ne lance pas l'algo
        if ($(elementClicked).attr("id") == "#img1") {
            return false;
        }

        if (inMouvement) {
            return false;
        }
        else {
            inMouvement = true;
        }

        moveToEffect($("#img1"), $("#img2"));

        // On lance le slide effect
        slideEffect($('#img1'), $(elementClicked));

        // Et on lance le moveToEffect jusqu'à l'élément cliqué (non compris)
        var i = 2;

        var i = 2;
        var iNext = 0;
        while ($("#img" + i).exists() && $("#img" + i).attr("id") != $(elementClicked).attr("id")) {
            iNext = i + 1;
            console.log("On bouge " + $("#img" + i).attr("id") + " vers " + $("#img" + iNext).attr("id"));
            moveToEffect($("#img" + i), $("#img" + iNext));
            if (i > 30) // Probleme, on sort
            {
                alert("Probleme, on sort");
                break;
            }
            i++;
        }
    }

    function randomMovingPowa() {
        if (inMouvement) {
            return false;
        }
        else {
            inMouvement = true;
        }

        moveToEffect($("#img1"), $("#img2"));

        // On lance le slide effect
        slideEffect($('#img1'), $(tableauImages[indexImageSuivante]));
        
        if (indexImageSuivante + 1 >= tableauImages.length) {
            // On recommence à l'index 0
            indexImageSuivante = 0;
        }
        else {
            indexImageSuivante++;
        }

        var i = 2;
        var iNext = 0;
        while ($("#img" + i).exists() && $("#img" + i).attr("id") != $("#img18").attr("id")) {
            iNext = i + 1;
            console.log("On bouge " + $("#img" + i).attr("id") + " vers " + $("#img" + iNext).attr("id"));
            moveToEffect($("#img" + i), $("#img" + iNext));
            if (i > 30) // Probleme, on sort
            {
                alert("Probleme, on sort");
                break;
            }
            i++;
        }
        


        /*
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
        */
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
        $(thisClone).show("slide", 1000, function () {
            $(this).removeAttr('style');
        });
    }

    function moveToEffect(elementToMove, elementReceiver) {
        // On va créer un element qui part de la position de elementToMove et qui va a la position de elementReceiver
        var elementToMoveClone = elementToMove.clone();

        // addClass, .className.split(' ')[0];
        // .attr(id, value);

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
            elementToMoveClone.removeAttr('style');
            elementReceiver.replaceWith(elementToMoveClone);

            // Si on est sur le dernier élément
            inMouvement = false;
        });

        // On lui remet la fonction movingPowa
        $(elementToMoveClone).click(function () {
            movingPowa(this);
        });
        clearInterval(intervalPowa);
        intervalPowa = setInterval(function () { randomMovingPowa() }, 2000);
    }
});

