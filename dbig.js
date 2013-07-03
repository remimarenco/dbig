/*
TODO: BIG => Gerer les autres supports, iPad / (iPhone)
TODO: Ne montrer que la fleche du switch de la barre latéral quand on clique dessus => réduire la width de la iframe
TODO: Barre latérale => La redimensionner en fonction de la taille de l'écran
TODO: Identifier l'origine du problème d'écran noir sur iPad
    Installer xampp
    Lancer dbig sur xampp
TODO: Réparer les problèmes sur l'intégration Google Maps
 */

/* 
*ATTENTION: Plusieurs variables doivent être initialisés dans l'environnement global afin que tous les js puissent y accéder :
*   // inMouvement permet de savoir si une animation est en cours ou non
*   var inMouvement = false;
*   // inDetail permet de savoir si on est en mode détail (une image a été cliquée) ou non
*   var inDetail = false;
*   // inPresentation permet de savoir si on est en mode automatique/random de mouvement des images
*   var inPresentation = true;
*   // inResize permet de savoir si on est en train de redimensionner la fenêtre ou non
*   var inResize = false;
*   // dbig_timeout permet de savoir si le temps de fin de resize à été atteint ou si nous devons encore attendre    
*   var dbig_timeout = false;
*/
$(document).ready(function(){
    // Première fonction qui va attendre le chargement de toutes les images dans le HTML
    //$(".divGallerie").queryLoader2();

    // Fonction de vérification de l'existence d'un objet js en regardant si sa longueur est > 0
    jQuery.fn.exists = function () { return this.length > 0; };

    // Tableau contenant toutes les images qui vont défilées
    var tableauImages = new Array();

    // On calcule le nb d'images selon la taille du browser
    var nbImages = calculSize();

    // L'image d'après correspond au nombre d'images (tableauImages[0->nbImages-1])
    var indexImageSuivante = nbImages;

    /*
    * Section de manipulation des temps de transitions
    */
    // Temps qui s'écoule entre le lancement du mouvement complet et le suivant
    var tempsRandom = 4000;
    // Temps que prend un mouvement complet
    var tempsAnimation = 2000;

    // Temps que met la première animation à se déclencher
    var tempsPremiereAnimation = 2000;

    // On récupère le temps total pour lequel nous devons lancer le cycle d'animation
    var tempsTotalDebut = tempsPremiereAnimation + tempsAnimation;

    // Temps pour lequel on vérifie qu'une animation est en cours
    var verifAnimation = 200;

    /*
    * Fin de section de transition des manipulation de transitions
    */

    // Intervalle permettant de relancer la fonction de mouvement random 
    var intervalMouvement;

    /*
    * Fin du setup des variables
    */

    // On récupère toutes les images qui sont dans divStockage
    if ($("#divStockage").exists()) {
        $("#divStockage").children('img').each(function (index) {
            tableauImages[index] = this;
        });
    }

    // On charge nbImages en tant qu'images de fond des div dans le html
    for (var i = 1; i <= nbImages; i++) {
        if ($("#divRedim" + i).exists()) {
            var $jImg = $(tableauImages[i - 1]);
            
            $('#divRedim'+i).css("background-image", "url("+$jImg.attr("src")+")");
        }
    }

    // On lance la fonction pour un premier mouvement
    setTimeout(function () { randomMoving() }, tempsPremiereAnimation);

    // On lance l'initialisation de l'intervalle en calculant le temps de lancement de la premiere animation + sa durée
    setTimeout(function () { initInterval() }, tempsTotalDebut);

    // Fonction permettant d'initialiser l'intervalle de lancement de l'animation
    function initInterval() {
        intervalMouvement = setInterval(function () { randomMoving() }, tempsRandom);
    }

    /*
    * Section d'abonnements aux évènements récurrents
    */

    // Abonnement au click sur l'image principale pour lancer le replay
    $(document).on('click', '#div1', replay);
    // Abonnement aux clicks sur les div bougeantes
    $(document).on('click', '.redim', imageClicked)
    // Abonnement au hover entrant et sortant pour l'image principale marqué en css .divMarkedHoverPrincipal
    $(document).on({
        mouseenter: addHoverPrincipal,
        mouseleave: removeHoverPrincipal
        }
        , '.divMarkedHoverPrincipal'
    );

    // Fonction permettant de lancer le mouvement inDetail depuis l'objet cliqué
    function imageClicked(e)
    {
        // Si on a cliqué dans l'image principale, alors on ignore
        if(!$(e.target).parents('#div1').length)
        {
            // On appelle une fonction pour effectuer le mouvement global jusqu'à l'image cliquée
            movingClicked(this);

            //TODO: Trouver une autre moyen que de placer cette fonction ici => Problème d'effets de bord
            // Permet de remettre la marque css pour gestion du hover sur l'image principale après que le mouvement ait été effectué
            setTimeout(function () { 
                stopAnimate(); 
                $("#div1").addClass("divMarkedHoverPrincipal");
            }, tempsAnimation+50);

            // On active le mode détail
            inDetailedMode();
        }        
    }

    // Fonction permettant de faire apparaitre le texte de l'image reliée
    // TODO: Récupérer le texte de l'image depuis l'image chargée dans le tableau
    function addHoverPrincipal(e)
    {
        // On n'exécute ceci que sur la div principale et si elle n'est pas en mouvement
        if($(this).attr("id") == "div1" && !inMouvement)
        {
            // Création du span parent de la description de l'image
            var $newConteneur = $('<span class="spanHover"></span>');
            // Création de la div permettant de faire l'effet de couleur semi-opaque
            var $newDiv = $('<div id="hoverBackgroundId" class="backgroundHover"></div>');

            // Création de la span contenant le texte de l'image
            var $newSpan = $('<span class="spanContenuHover"></span>');
            
            // On ajoute les informations de l'image dans le span
            addContenuHover($newSpan);

            // On ajoute au conteneur parent la div d'opacité
            $newConteneur.append($newDiv);
            // On ajoute au conteneur parent le texte de l'image
            $newConteneur.append($newSpan);

            // On ajoute à l'élement qui a recu l'évènement ce conteneur
            $(this).children().append($newConteneur);

            // On met un effet lent d'apparition sur le span parent nouvellement créé
            $newConteneur.show("slow");
        }
    }
    
    // Fonction permettant de supprimer les explications sur l'image principale en mode détail
    function removeHoverPrincipal(e)
    {
        // On n'applique cet effet seulement sur la div principale
        if($(this).attr("id") == "div1")
        {
            // On récupère la div cliquée
            $div = $(this);
            // On cache la span contenant le texte et l'opacité, à la fin de cette animation, on supprime les enfants
            // TODO: Attention à l'effet de bord, ne supprimer que .spanHover
            $('.spanHover').hide("fast", function(){
                $div.children().empty();
            });
        }
    }

    // Fonction permettant de repasser du mode détail au mode présentation
    function replay(e)
    {
        // On  
        if($(e.target).is('.boutonReplayHover'))
        {
            // On active le mode présentation
            inPresentationMode();

            $div = $(this);
            $div.removeClass("divMarkedHoverPrincipal");
            //$div.unbind('mouseenter mouseleave');

            $div.children().empty();
            // On réactive l'animation directement et son compteur
            randomMoving();
        }
    }

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
            $(".divMarkedHoverPrincipal").mouseleave();
            $(".divMarkedHoverPrincipal").removeClass("divMarkedHoverPrincipal");

            $(".divMarkedHover").each(function (index) {
                $(this).removeClass("divMarkedHover");
            });
        }
    }

    function stopAnimate(){
        if (!inMouvement || !inResize) {
            // On désactive le css hover
            for(var i = 2; i <= nbImages; i++)
            {
                $("#div"+i).each(function (index) {
                    $(this).addClass("divMarkedHover");
                });
            }
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
            clearInterval(intervalMouvement);
            intervalMouvement = null;
            inMouvement = true;
        }

        isAnimate();

        moveFirst();

        slideFromClicked(elementClicked);

        moveUntilClicked(elementClicked);

        // On retire l'élément qui a été cliqué en fin de transition
        setTimeout(function () { $(elementClicked).remove() }, tempsAnimation-50);
    }

    function randomMoving(){
        if (inMouvement || inResize || inDetail) {
            return false;
        }
        else {
            clearInterval(intervalMouvement);
            initInterval();
            inMouvement = true;
        }

        isAnimate();

        moveFirst();

        slideFromStorage();

        moveGlobal();

        slideLast();

        setTimeout(function () { stopAnimate(); }, tempsAnimation+50);
    }

    function slideEffect($elementToErase, urlImageElementToSlide) {
        // On va créer une div redim qui va accueillir la nouvelle image
        var $newDiv = $('<div class="redim"></div>');
        $newDiv.css("display", "none");
        // On le cache pour le moment
        $newDiv.css("background-image", urlImageElementToSlide);

        $newDiv.addClass("animationEnCours");

        $elementToErase.append($newDiv);

        $newDiv.show("slide", tempsAnimation, function () {
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
        }, tempsAnimation, function(){
            // On supprime la div qui vient de bouger, et on fait apparaitre la nouvelle
            // Remettre le remove à la fin de l'effet
            $divToMoveChild.remove();
            $newDiv.css("display", "");

            // On rattache l'eventhandler
            //$newDiv.click(imageClicked);

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
            tempsAnimation, function(){
                $divASlide.removeClass("animationEnCours");
                $(this).remove();
            })
        );
    }
});