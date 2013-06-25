/*!
 * Triggers a callback after all the selected/child images have been loaded
 *
 * (C) darkma773r (https://github.com/darkma773r)
 */
(function($){$.fn.loaded=function(e){var c=this.find("img").add(this.filter("img")),b=[],a=[];if(c.length<1){setTimeout(e,0);return}function d(h){var f=$(this).data("originalImage")||this;if($.inArray(f,b)===-1){b.push(f)}if(b.length>=c.length){c.unbind("load error",d);for(var g=0;g<a.length;g++){a[g].unbind("load error",d)}setTimeout(e,0)}}return c.bind("load error",d).each(function(g,h){if(this.complete){$(this).load()}else{if(this.readyState){if(this.src.lastIndexOf("/")===this.src.length-1){$(this).load()}else{var f=$("<img />");a.push(f);f.bind("load error",d);f.data("originalImage",this);f.attr("src",this.src)}}}})};})(jQuery);