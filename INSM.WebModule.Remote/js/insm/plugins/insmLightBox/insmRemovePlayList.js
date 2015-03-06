var rootUI, ContextObject;
var obj = {

    options: {
        onRemoveNewest: null,
        onRemoveAll: null,
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
                backdrop: $("<div />").addClass("insm-servercall-backdrop"),
                dialog: {
                    container: $("<div />").addClass("insm-servercall-fb-box").attr("id", "divbackdropforremoveplaylist"),
                    header: {
                        container: $("<div />").addClass("insm-servercall-header-box").attr("id", "divboxforremoveplaylist").text("Remove"),
                        close: $("<span />").addClass("insm-lightbox-fb-close").attr("id", "closeforremoveplaylist")
                    },
                    body: {
                        container: $("<div />"),
                        blankParagraph: $("<p />"),
                        title: $("<p/>").text("Do you want to remove the newest playlist only or all playlists in this series?"),
                        buttonGroup: {
                            container: $("<div />").addClass("insm-button-position"),
                            blankParagraph1: $("<p />"),
                            blankParagraph2: $("<p />"),
                            RemoveNewestforremoveplaylist: $("<div />").addClass("button").attr("id", "cmdRemoveNewestforremoveplaylist").text("Remove newest"),
                            Removeplaylist: $("<div />").addClass("button").attr("id", "cmdRemoveplaylist").text("Remove all"),
                            cancel: $("<div />").addClass("button").attr("id", "cmdCancelforremoveplaylist").text("Cancel"),
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
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.blankParagraph1)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.blankParagraph2)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.RemoveNewestforremoveplaylist)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.Removeplaylist)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.cancel))));


        $('.insm-servercall-backdrop').animate({ 'opacity': '.5' }, 300, 'linear');
        $('.insm-servercall-backdrop, #divbackdropforremoveplaylist').css({
            'display': 'block'
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.RemoveNewestforremoveplaylist.on("click", function () {
            closeDialog(1);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.Removeplaylist.on("click", function () {
            closeDialog(2);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.cancel.on("click", function () {
            ContextObject._trigger("oncancel");
            closeDialog();
        });

        _plugin.htmlElements.content.dialog.header.container.click(function () {
            closeDialog();
        });

        function closeDialog(index) {
            $('#divbackdropforremoveplaylist, #divbackdropforremoveplaylist').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('#divbackdropforremoveplaylist, #divbackdropforremoveplaylist').css('display', 'none');
            });
            ContextObject._destroy();
            switch (index) {
                case 1:
                    ContextObject._trigger("onRemoveNewest");
                    break;
                case 2:
                    ContextObject._trigger("onRemoveAll");
                    break;
            }
        };
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI.empty();
    }
};

(function ($, undefiend) {
    $.widget("insm.insmRemovePlayList", obj);
})(jQuery);