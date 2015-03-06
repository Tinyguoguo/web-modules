var rootUI, ContextObject;
var obj = {

    options: {
        text: ""
    },

    //Start rendering for plugin
    _init: function () {
        rootUI = this.element;
        ContextObject = this;
    },

    //Call this function when initialize plugin
    _create: function () {
        rootUI = this.element;
        ContextObject = this;
    },

    //Invoke clear DailogBox
    InvokeDialog: function () {
        //rootUI.html("<div class='insm-servercall-backdrop' id='divbackdropforclear'></div>" +
        //    "<div class='insm-servercall-progressbox'><div id='divboxforclear'></div>" +
        //    "<div><br/><p style='text-align:center'>" + ContextObject.options.text + "<p style='text-align:center'><img src='css/insm/plugins/insmLightBox/loader.gif' /></div>" +
        //    "</div></div>");

        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                backdrop: $("<div />").addClass("insm-servercall-backdrop").attr("id", "divbackdropforclear"),
                dialog: {
                    container: $("<div />").addClass("insm-servercall-progressbox"),
                    body: {
                        container: $("<div />").attr("id", "divboxforclear"),
                        body: {
                            container: $("<div />"),
                            blankParagraph: $("<p />"),
                            titleparagraph: $("<p style='text-align: center'/>").text(ContextObject.options.text),
                            imageparagraph: {
                                container: $("<p style='text-align: center'/>"),
                                img: $('<img />').attr("src", "css/insm/plugins/insmLightBox/loader.gif")
                            }
                        }
                    }
                }
            }
        };

        rootUI.append(_plugin.htmlElements.content.backdrop)
                        .append(_plugin.htmlElements.content.dialog.container
                            .append(_plugin.htmlElements.content.dialog.body.body.container
                                .append(_plugin.htmlElements.content.dialog.body.body.blankParagraph)
                                .append(_plugin.htmlElements.content.dialog.body.body.titleparagraph)
                                .append(_plugin.htmlElements.content.dialog.body.body.imageparagraph.container
                                .append(_plugin.htmlElements.content.dialog.body.body.imageparagraph.img))));
        _plugin.htmlElements.content.backdrop.css("z-index", "9999");
        _plugin.htmlElements.content.dialog.container.css("z-index", "10000");
        $('#divbackdropforclear, #divboxforclear').animate({ 'opacity': '.50' }, 300, 'linear');
        $('#divboxforclear').animate({ 'opacity': '1' }, 300, 'linear');
        $('#divbackdropforclear, #divboxforclear').css('display', 'block');
    },

    //Call this function while close Dialog
    closeDialog: function () {
        $('#divbackdropforclear, #divbackdropforclear').animate({ 'opacity': '0' }, 300, 'linear', function () {
            $('#divbackdropforclear, #divbackdropforclear').css('display', 'none');
        });
        ContextObject._destroy();
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI.empty();
    }
};

(function ($, undefiend) {
    $.widget("insm.insmServerProcessingLoader", obj);
})(jQuery);