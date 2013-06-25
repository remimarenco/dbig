/*
TODO: Supprimer la dernière colonne => On oublie
TODO: Hover bleu avec croix => Ok
TODO: Gérer correctement la fin d'animation
TODO: Croix qui reprend l'animation
 */

$(document).ready(function(){
    // Fonction de vérification de la longueur du tableau
    jQuery.fn.exists = function () { return this.length > 0; };

    var tableauImages = new Array();
    var tableauImagesCourantes = new Array();

    // On charge d'abord les images dans les cases, en fonction de la taille
    var nbImages = calculSize();

    var indexImageSuivante = nbImages;

    var tempsRandom = 4000;
    var tempsAnimation = 2000;
    var tempsPremiereAnimation = 2000;

    var verifAnimation = 200;

    var intervalPowa;

    // On récupère toutes les images qui sont dans divStockage
    if ($("#divStockage").exists()) {
        $("#divStockage").children('img').each(function (index) {
            tableauImages[index] = this;
        });
    }

    // On charge les images dans le Html
    for (var i = 1; i <= nbImages; i++) {
        if ($("#divRedim" + i).exists()) {
            jImg = $(tableauImages[i - 1]);

            $('#divRedim'+i).css("background-image", "url("+jImg.attr("src")+")");
        }
        //indexImageSuivante = i;
    }

    // On lance tout de suite la fonction pour un premier mouvement
    setTimeout(function () { randomMoving() }, tempsPremiereAnimation);

    // var tempsTotalDebut = tempsPremiereAnimation + tempsAnimation;
    // setTimeout(function () { initInterval() }, tempsTotalDebut);

    function initInterval() {
        // On lance ensuite le timer
        intervalPowa = setInterval(function () { randomMoving() }, tempsRandom);
    }

    $(".redim").click(imageClicked);

    function imageClicked(e)
    {
        //intervalPowa = setInterval(function () { randomMoving() }, tempsRandom);
        movingClicked(this);
        //inMouvement = true;
    }

    $(".divMarkedHover").hover(function (e) {
        if($(this).attr("id") == "div1")
        {
            var $newConteneur = $('<span class="spanHover"></span>');
            var $newDiv = $('<div id="hoverBackgroundId" class="backgroundHover"></div>');
            // On met la taille offset de la div que l'on hover

            var $newSpan = $('<span class="spanContenuHover"></span>');
            addContenuHover($newSpan);

            $newConteneur.append($newDiv);
            $newConteneur.append($newSpan);

            $(this).children().append($newConteneur);

            $newConteneur.show("slow");
            //$(this).children().append($newSpan);
        }
    }, function(e){
        if($(this).attr("id") == "div1")
        {
            $div = $(this);
            $('.spanHover').hide("slow", function(){
                $div.children().empty();
            });
        }
    });

    $("#div1").click(function (e) {
        if($(e.target).is('.boutonReplayHover'))
        {
            // On réactive l'animation directement et on lui met un intervalle
            console.log("On a clique sur le bouton");
            initInterval();
        }

    });

    function addContenuHover($newDiv)
    {
        var $newBouton = $('<img class="boutonReplayHover" src="ressources/bouton/close.png">')
        var $newTitle = $('<span class="titleHover">Lorem ipsum dolor</span>');
        var $newText = $('<span class="textInfosHover">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem, voluptatem aut fuga. Ex, repudiandae assumenda quos nostrum itaque beatae eius.</span>');
        
        $newDiv.append($newBouton);
        $newDiv.append($newTitle);
        $newDiv.append($newText);
    }

    // On lance la fonction pour détecter les mouvements
    setTimeout(function () { isAnimate() }, verifAnimation);

    function isAnimate() {
        if (inMouvement) {
            // On désactive le css hover
            $(".divHover").each(function (index) {
                $(this).removeClass("divHover");
            });
        }
        else {

        }
    }

    function movingClicked(elementClicked) {
        // Si on a cliqué sur l'image principale, on ne lance pas l'algo
        if ($(elementClicked).parent().attr("id") == "#div1") {
            return false;
        }

        if (inMouvement) {
            return false;
        }
        else {
            // On arrete l'animation
            clearInterval(intervalPowa);
            intervalPowa = null;
            inMouvement = true;
        }

        isAnimate();

        moveFirst();

        slideFromClicked(elementClicked);

        moveUntilClicked(elementClicked);

        // On retire l'élément qui a été cliqué en fin de transition
        setTimeout(function () { $(elementClicked).remove() }, tempsAnimation);
    }

    function randomMoving(){
        if (inMouvement) {
            return false;
        }
        else {
            clearInterval(intervalPowa);
            intervalPowa = setInterval(function () { randomMoving() }, tempsRandom);
            inMouvement = true;
        }

        isAnimate();

        moveFirst();

        slideFromStorage();

        moveGlobal();

        slideLast();
    }

    function slideEffect($elementToErase, urlImageElementToSlide) {
        // On va créer une div redim qui va accueillir la nouvelle image
        var $newDiv = $('<div class="redim"></div>');
        $newDiv.css("display", "none");
        // On le cache pour le moment
        $newDiv.css("background-image", urlImageElementToSlide);

        $newDiv.addClass("animationEnCours");

        $elementToErase.append($newDiv);

        $newDiv.show("slide", 2000, function () {
            //$(this).removeAttr('style');
            $(this).removeClass("animationEnCours");

            $(this).addClass("divHover");
        });
    }

    function moveToEffect($divToMove, $divToReceive)
    {
        var $divToMoveChild = $($divToMove.children().get(0));

        // On supprime l'id pour éviter des effets de bord
        $divToMoveChild.attr("id", "");

        // On créé une nouvelle div, copie de la toMove, on la cache, et on la place dans divToReceive
        var newDiv = $($divToMove.children().get(0)).clone();
        var $newDiv = $(newDiv);
        $newDiv.css("display", "none");

        $divToReceive.append(newDiv);

        // On sort l'élément de sa dépendance du div parent
        $divToMoveChild.css("top", $divToMove.offset().top);
        $divToMoveChild.css("left", $divToMove.offset().left);
        $divToMoveChild.css("height", $divToMove.css('height'));
        $divToMoveChild.css("width", $divToMove.css('width'));
        $divToMoveChild.css("z-index", "20");
        $divToMoveChild.css("position", "absolute");

        $divToMoveChild.addClass("animationEnCours");

        var offsetElementReceiver = $divToReceive.offset();

        // On fait l'effet de mouvement sur la divToMove
        $divToMoveChild.animate({
            'top': offsetElementReceiver.top,
            'left': offsetElementReceiver.left,
            'height': $divToReceive.css('height'),
            'width': $divToReceive.css('width')
        }, 2000, function(){
            // On supprime la div qui vient de bouger, et on fait apparaitre la nouvelle
            // Remettre le remove à la fin de l'effet
            $divToMoveChild.remove();
            $newDiv.css("display", "");

            $newDiv.click(imageClicked);

            inMouvement = false;
        });
    }

    function moveFirst()
    {
        moveToEffect($("#div1"), $("#div2"));
    }

    function slideFromStorage()
    {
        // On lance le slide effect
        slideEffect($('#div1'), "url("+$(tableauImages[indexImageSuivante]).attr("src")+")");

        if (indexImageSuivante - 1 <= 0) {
            // On recommence à l'index 0
            indexImageSuivante = nbImages;
        }
        else {
            indexImageSuivante--;
        }
    }

    function slideFromClicked(elementClicked)
    {
        // On lance le slide effect
        slideEffect($('#div1'), $(elementClicked).css("background-image"));
    }

    function moveGlobal()
    {
        moveFromTo(2, $($("#div"+nbImages).children().get(0)));
    }

    function moveUntilClicked(elementClicked)
    {
        moveFromTo(2, $(elementClicked));
    }

    function moveFromTo(fromInt, $toElement)
    {
        var i = fromInt;
        var iNext = 0;

        while ($("#div" + i).exists() && $("#div" + i).attr("id") != $toElement.parent().attr("id")) {
            iNext = i + 1;
            //console.log("On bouge l'enfant " + $("#div" + i).attr("id") + " vers " + $("#div" + iNext).attr("id"));
            moveToEffect($("#div" + i), $("#div" + iNext));
            if (i > 30) // Probleme, on sort
            {
                alert("Probleme, on sort");
                break;
            }
            i++;
        }
    }

    function slideLast()
    {
        $divASlide = $($("#div" + nbImages).children().get(0));
        // On slide la dernière image
        $divASlide.addClass("animationEnCours");
        $($divASlide.hide(
            "slide",
            {
                direction: "right"
            },
            2000, function(){
                $divASlide.removeClass("animationEnCours");
                $(this).remove();
            })
        );
    }
});