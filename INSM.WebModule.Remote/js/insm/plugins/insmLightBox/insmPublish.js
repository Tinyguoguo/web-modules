var rootUI, ContextObject;
var obj = {

    options: {
        onok: null,
        oncancel: null
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

        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                backdrop: $("<div />").addClass("insm-servercall-backdrop").attr("id", "divbackdropforpublish"),
                dialog: {
                    container: $("<div />").addClass("insm-servercall-fb-box"),
                    header: {
                        container: $("<div />").addClass("insm-servercall-header-box").attr("id", "divboxforpublish").text("Publish"),
                        close: $("<div />").addClass("insm-servercall-close").attr("id", "closeforpublish")
                    },
                    body: {
                        container: $("<div />"),
                        blankParagraph: $("<p />"),
                        title: $("<p style='margin-left: 5px'/>").text("You are about to make changes to the content displayed on screens.Are you sure you want to publish this playlist on checked nodes?"),
                        buttonGroup: {
                            container: $("<div />").addClass("insm-button-position"),
                            ok: $("<div />").addClass("button").attr("id", "cmdOkforpublish").text("OK"),
                            cancel: $("<div />").addClass("button").attr("id", "cmdCancelforpublish").text("Cancel"),
                        }
                    }
                }
            }
        };

        rootUI.append(_plugin.htmlElements.content.backdrop)
            .append(_plugin.htmlElements.content.dialog.container
                .append(_plugin.htmlElements.content.dialog.header.container
                    .append(_plugin.htmlElements.content.dialog.header.close))
            .append(_plugin.htmlElements.content.dialog.body.container
                .append(_plugin.htmlElements.content.dialog.body.blankParagraph)
                .append(_plugin.htmlElements.content.dialog.body.title)
            .append(_plugin.htmlElements.content.dialog.body.buttonGroup.container
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.ok)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.cancel))));

        $('#divbackdropforpublish, #divboxforpublish').animate({ 'opacity': '.50' }, 300, 'linear');
        $('#divboxforpublish').animate({ 'opacity': '1' }, 300, 'linear');
        $('#divbackdropforpublish, #divboxforpublish').css('display', 'block');

        _plugin.htmlElements.content.dialog.body.buttonGroup.ok.on("click", function () {
            closeDialog(1);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.cancel.on("click", function () {
            ContextObject._trigger("oncancel");
            closeDialog();
        });

        _plugin.htmlElements.content.dialog.header.close.click(function () {
            closeDialog();
        });

        function closeDialog(index) {
            $('#divbackdropforpublish, #divbackdropforpublish').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('#divbackdropforpublish, #divbackdropforpublish').css('display', 'none');
            });
            ContextObject._destroy();
            if (index == 1) {
                ContextObject._trigger("onok");
            }
        };
    },

    //Call this function while remove plugin
    _destroy: function () {
        console.log("test");
        rootUI.empty();
    }
};

(function ($, undefiend) {
    $.widget("insm.insmPublish", obj);
})(jQuery);