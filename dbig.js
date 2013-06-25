$(document).ready(function(){
    // Fonction de vérification de la longueur du tableau
    jQuery.fn.exists = function () { return this.length > 0; }

    var tableauImages = new Array();
    var tableauImagesCourantes = new Array();

    // On charge d'abord les images dans les cases, en fonction de la taille
    var nbImages = calculSize();

    var indexImageSuivante = nbImages;

    var inMouvement = false;

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

    
    // On lance ensuite le timer
    intervalPowa = setInterval(function () { randomMoving() }, 4000);

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

    function randomMoving(){
        if (inMouvement) {
            return false;
        }
        else {
            inMouvement = true;
        }

        isAnimate();

        moveFirst();

        slideFromStorage();

        moveGlobal();

        slideLast();
    }

    function slideEffect($elementToErase, $srcImageElementToSlide) {
        // On va créer une div redim qui va accueillir la nouvelle image
        var $newDiv = $('<div class="redim"></div>');
        $newDiv.css("display", "none");
        // On le cache pour le moment
        $newDiv.css("background-image", "url("+$srcImageElementToSlide+")");

        $newDiv.addClass("animationEnCours");

        $elementToErase.append($newDiv);

        $newDiv.show("slide", 2000, function () {
            //$(this).removeAttr('style');
            $(this).removeClass("animationEnCours");

            $(this).addClass("divHover");

            // On retire l'elementclone
            //setTimeout(function () { $elementToErase.remove() }, 500);
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
        $divToMoveChild.css("position", "absolute");

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
        slideEffect($('#div1'), $(tableauImages[indexImageSuivante]).attr("src"));

        if (indexImageSuivante - 1 <= 0) {
            // On recommence à l'index 0
            indexImageSuivante = nbImages;
        }
        else {
            indexImageSuivante--;
        }
    }

    function moveGlobal()
    {
        var i = 2;
        var iNext = 0;

        while ($("#div" + i).exists() && $("#div" + i).attr("id") != $("#div" + nbImages).attr("id")) {
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
        // On slide la dernière image
        $($("#div" + nbImages).children().get(0)).hide(
            "slide",
            {
                direction: "right"
            },
            2000, function(){
                $(this).remove();
            }
        );
    }
});