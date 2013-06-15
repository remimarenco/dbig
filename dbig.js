/*
DBIG de Rémi Marenco est mis à disposition selon les termes de la licence Creative Commons Attribution 3.0 non transposé.
Fondé(e) sur une œuvre à https://github.com/remimarenco/dbig
*/
$(document).ready(function () {
    jQuery.fn.exists = function () { return this.length > 0; }

    var indexImageSuivante = 0;
    var tableauImages = new Array();

    // TODO: Faire une accélération/décélération selon l'état de la transition
    // TODO: Faire une seule variable qui contrôle les vitesses
    // TODO: Faire une vitesse différente en fonction du support
    // TODO: Trouver une solution à la pixellisation de l'image sur le déplacement
    // TODO: Finir très vite l'animation lors du redimensionnement d'image
    // TODO: Utiliser le css sur les images pour le redimensionnement en cover
    var tempsRandom = 4000;
    var tempsAnimation = 3000;
    var tempsPremiereAnimation = 500;

    // On récupère toutes les images qui sont dans divStockage
    if ($("#divStockage").exists()) {
        $("#divStockage").children('img').each(function (index) {
            tableauImages[index] = this;
        });
    }

    // On charge d'abord les images dans les cases, en fonction de la taille
    var nbImages = calculSize();

    for (var i = 1; i <= nbImages; i++) {
        if ($("#div" + i).exists()) {
            jImg = $(tableauImages[i - 1]).clone();
            jImg.attr("id", "img" + i);
            $("#div" + i).append(jImg);
        }
        indexImageSuivante = i;
    }

    var inMouvement = false;

    // Une fois les images chargées

    // On lance tout de suite la fonction pour un premier mouvement
    setTimeout(function(){randomMovingPowa()}, tempsPremiereAnimation);

    var tempsTotalDebut = tempsPremiereAnimation + tempsAnimation;
    setTimeout(function(){initInterval()}, tempsTotalDebut);

    function initInterval()
    {
        // On lance ensuite le timer
        intervalPowa = setInterval(function () { randomMovingPowa() }, tempsRandom);           
    }

    $("img").click(function () {
        clearInterval(intervalPowa);
        intervalPowa = setInterval(function () { randomMovingPowa() }, tempsRandom);
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
            clearInterval(intervalPowa);
            intervalPowa = setInterval(function () { randomMovingPowa() }, tempsRandom);
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
        while ($("#img" + i).exists() && $("#img" + i).attr("id") != $("#img" + nbImages).attr("id")) {
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

        // On slide la dernière image
        $("#img" + nbImages).animate({
            paddingLeft: $("#img" + nbImages).width()
        }, tempsAnimation);
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
        $(thisClone).show("slide", tempsAnimation, function () {
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
        }, tempsAnimation, function () {
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
    }

    function calculSize() {
        if ($(document).width() >= 1025) {
            _nbImages = 18;
        }
        else if ($(document).width() >= 800) {
            _nbImages = 12;
        }
        else {
            _nbImages = 6;
        }

        return _nbImages;
    }
});

