var rootUI, ContextObject;
var obj = {
    // Declare event and varibales
    options: {
        onYes: null,
        onNo: null,
    },
    //Initialization of plugin
    _init: function () {
        rootUI = this.element;
        ContextObject = this;
    },
    //Creation of plugin
    _create: function () {
        rootUI = this.element;
        ContextObject = this;
    },
    // Set html for this popup box
    _setHtml: function () {
        ContextObject.htmlElements = {
            content: {
                container: $('<div id="divRemovePlaylistWarning" />').addClass('insm-servercall-fb-box'),
                header: {
                    container: $('<div id="divRemovePlaylist"/>').addClass('insm-servercall-header-box').text('Remove'),
                    spanButton: $('<span id="closeWarningBox" />').addClass('insm-lightbox-fb-close')
                },
                mainContainerView: {
                    container: $('<div />').addClass('insm-servercall-paragraph'),
                    innerContainer: {
                        text: $('<p />').text("Warning ! You are trying to remove your active playlist.").append($('<p />').text("Are you sure this is what you want to do?")),
                    }
                },
                buttonView: {
                    container: $('<div />').addClass('insm-set-button-position'),
                    innerContainer: {
                        container: $('<div />').addClass('insm-button-position'),
                        button1: $('<button id="cmdYes" />').addClass('button').text('Yes').addClass('insm-set-button'),
                        button2: $('<button id="cmdNo" />').addClass('button').text('No'),
                    }
                }
            },
            backdropView: {
                container: $('<div />').addClass('insm-servercall-backdrop')
            },
        },
        // Append all html elements at root - target 
        // Header widh lable and close button
        rootUI.append(
                ContextObject.htmlElements.content.container.append(
                    ContextObject.htmlElements.content.header.container.append(
                        ContextObject.htmlElements.content.header.spanButton)));
        // Container shows warning msg 
        rootUI
            .append(
                ContextObject.htmlElements.content.container.append(
                    ContextObject.htmlElements.content.mainContainerView.container.append(
                    ContextObject.htmlElements.content.mainContainerView.innerContainer.text)));

        //Set yes no button
        rootUI
           .append(
               ContextObject.htmlElements.content.container.append(
                   ContextObject.htmlElements.content.buttonView.container.append(
                       ContextObject.htmlElements.content.buttonView.innerContainer.button1,
                   ContextObject.htmlElements.content.buttonView.innerContainer.button2)));

        //Set backdrop to hide backend window to deactivate backend functions
        rootUI
            .append(
                ContextObject.htmlElements.backdropView.container.append(ContextObject.htmlElements.backdropView.container));
    },
    // Invoke the dialog box
    InvokeDialog: function () {
        this._setHtml();
        $('.insm-servercall-backdrop').animate({ 'opacity': '.5' }, 300, 'linear');
        $('.insm-servercall-backdrop, #divRemovePlaylistWarning').css({
            'display': 'block'
        });

        $("#cmdYes").on("click", function () {
            closeDialog(1);
        });

        $("#cmdNo").on("click", function () {
            ContextObject._trigger("onNo");
            closeDialog();
        });

        $('#closeWarningBox').click(function () {
            closeDialog();
        });
        // Close dialog on click on cross button
        function closeDialog(index) {
            $('#divRemovePlaylistWarning, #divRemovePlaylistWarning').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('#divRemovePlaylistWarning, #divRemovePlaylistWarning').css('display', 'none');
            });
            ContextObject._destroy();
            switch (index) {
                case 1:
                    ContextObject._trigger("onYes");
                    break;
            }
        };
    },
    //Destroy this plugin reference by empty the container
    _destroy: function () {
        rootUI.empty();
    }
};

(function ($, undefiend) {
    $.widget("insm.insmWarning", obj);
})(jQuery);