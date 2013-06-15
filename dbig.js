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
    // TODO: Trouver une solution à la pixellisation de l'image sur le déplacement (PNG ? SVG ?)
    // TODO: Finir très vite l'animation lors du redimensionnement d'image

    // OK TODO: Utiliser le css sur les images pour le redimensionnement en cover
    var tempsRandom = 4000;
    var tempsAnimation = 2000;
    var tempsPremiereAnimation = 2000;

    var animationUsed = "easeOutQuad";

    var inMouvement = true;

    // On récupère toutes les images qui sont dans divStockage
    if ($("#divStockage").exists()) {
        $("#divStockage").children('img').each(function (index) {
            tableauImages[index] = this;
        });
    }

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

        $(".animationEnCours").each(
            function (index) {
                $(this).stop(true, true);
            });

        //this.stop(true,true);
        inMouvement = true;
    });

    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            inMouvement = false;
            timeout = false;
            //alert('Done resizing');
        }
    }

    // On charge d'abord les images dans les cases, en fonction de la taille
    var nbImages = calculSize();

    for (var i = 1; i <= nbImages; i++) {
        if ($("#div" + i).exists()) {
            jImg = $(tableauImages[i - 1]).clone();
            //jImg.attr("id", "img" + i);
            //$("#div" + i).append(jImg);
            var tata = $("#div" + i).backstretch(jImg.attr("src"), { speed: 150 });

            //var monImg = toto.children("img")[0];
            // On récupère l'instance des images backstretch
            //var instance = $("#div" + i).data('backstretch');
            var img = $(tata.children()[0].children[0]);

            img.attr("id", "img" + i);
            img.attr("alt", $(tableauImages[i-1]).attr("alt"));
            //instance.images[0].attr("id", "img" + i);
        }
        indexImageSuivante = i;
    }

    // Une fois les images chargées

    // On lance tout de suite la fonction pour un premier mouvement
    setTimeout(function () { randomMovingPowa() }, tempsPremiereAnimation);

    var tempsTotalDebut = tempsPremiereAnimation + tempsAnimation;
    setTimeout(function () { initInterval() }, tempsTotalDebut);

    function initInterval() {
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

        $(thisClone).addClass("animationEnCours");

        $(thisClone).show("slide", tempsAnimation, function () {
            $(this).removeAttr('style');
            $(this).removeClass("animationEnCours");
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

        elementToMoveClone.addClass("animationEnCours");

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

            elementToMoveClone.removeClass("animationEnCours");
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
        /* A utiliser si on remet les colonnes
        else if ($(document).width() >= 800) {
        _nbImages = 12;
        }
        else {
        _nbImages = 6;
        }
        */

        return _nbImages;
    }
});