var contextObject;
var rootUI;

var _pluginLightboxObject = {
    version: "0.0.1",

    // Declare button click event as option 
    options: {
        onsubmit: null,
        oncancel: null,
        openFrom: 0,
    },

    //Initialization of this plugin
    _init: function () {
        contextObject = this;
        rootUI = this.element;
        this._setLightBoxHtml();
        this._renderLightbox();
        openfrom = this.options.openFrom;
        rootUI.find("#txtplaylistname").focus();
        fileList = [];
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Data',
            success: function (e) {
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        fileList = data.MediaFiles;
                    }
                });
            }
        });
    },
    //creation of plugin
    _create: function () {
        this._renderLightbox();
    },

    //set input text data to show in next screen of playlist name combobox
    setInputText: function (text) {
        rootUI.find("#txtplaylistname").val(text);
    },
    // Close event this popup 
    close_box: function (event) {
        contextObject._trigger("oncancel", event);
        $('.insm-lightbox-backdrop, .insm-lightbox-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
            $('.insm-lightbox-backdrop, .insm-lightbox-box').css('display', 'none');
            $("#dlgcnv").empty();
        });
    },
    // On submit button click 
    onokclick: function (event) {
        _pluginLightboxObject._onSubmitData(event);
    },
    // Check duplicate playlist name while enter new playlist
    checkDuplicateValue: function () {
        if (openfrom == 1) {
            var Playlist = fileList;
            var result = true;
            if (Playlist != undefined) {
                $.each(Playlist, function (index, item) {
                    if (_pluginLightboxObject.fetchFileName(item.Filename) == rootUI.find("#txtplaylistname").val()) {
                        result = false;
                    }
                });
            }
            return result;
        } else if (openfrom == 2) {
            var addPlaylistValues = $.data(document, "playListMaster");
            if (addPlaylistValues != undefined) {
                for (var i = 0; i < addPlaylistValues.length; i++) {
                    if (addPlaylistValues[i].playListName == rootUI.find("#txtplaylistname").val()) {
                        return false;
                    }
                }
            }
            return true;
        }
    },

    // Fetch File from REST Call Object property
    fetchFileName: function (filename) {
        return filename.substr(0, filename.indexOf("xml") - 1);
    },

    // destroy this plugin
    destroy: function () {
        rootUI.empty();
    },

    // Render all component of ligh popup box with css and events
    _renderLightbox: function () {

        rootUI.find("#txtplaylistname").focus();
        $('.insm-lightbox-backdrop, insm-lightbox-box').animate({ 'opacity': '.5' }, 300, 'linear');
        $('.insm-lightbox-box').animate({ 'opacity': '1' }, 300, 'linear');
        $('.insm-lightbox-backdrop, .insm-lightbox-box').css('display', 'block');
        this._on($('.insm-lightbox-close, #cmdcancle'), { click: "close_box" });
        this._on($("#cmdok"), { click: "onokclick" });
        // set enter press event once input text fill and press enter
        $("#txtplaylistname").keydown(function (event) {
            if (event.which == 13) {
                event.preventDefault();
                _pluginLightboxObject._onSubmitData(event);
            }
        });

        // Set Resolution filter with option value and name
        $('#insm-resolutionFilter').insmSpinnerResolution({
            selectTemplate: [
                { "name": "1920X1080", "value": "1" },
                { "name": "1080X1920", "value": "2" },
                { "name": "1360X768", "value": "3" },
                { "name": "768X1360", "value": "4" },
                { "name": "", "value": "5" }]
        });
    },

    _onSubmitData: function (event) {
        var playlistname = rootUI.find("#txtplaylistname").val();

        if ($.trim(playlistname).length == 0) {
            rootUI.find("#spnMessage").text("The name can't be empty");
        } else if (!_pluginLightboxObject.checkDuplicateValue()) {
            rootUI.find("#spnMessage").text("This name is already exists");
        } else {
            contextObject._trigger("onsubmit", event, playlistname);
            $('.insm-lightbox-backdrop, .insm-lightbox-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('.insm-lightbox-backdrop, .insm-lightbox-box').css('display', 'none');
                $("#dlgcnv").empty();
            });
        }
    },

    // Create html structure as per code review feedback
    _setLightBoxHtml: function () {
        // set html elements and create container to open pop up 
        contextObject.htmlElements = {
            content: {
                container: $('<div />').addClass('insm-lightbox-box'),
                header: {
                    container: $('<div />').addClass('insm-lightbox-header').text('Add Playlist'),
                    spanButton: $('<span />').addClass('insm-lightbox-close')
                },
                mainContainerView: {
                    container: $('<div />').addClass('insm-lightbox-content'),
                    innerContainer: {
                        text: $('<label/>').text("Enter Name : "),
                        input: {
                            container: $('<div />').addClass('insm-control-group-label'),
                            id: $('<input type="text" style="width: 98%" id="txtplaylistname" autofocus />')
                        }
                    },
                },
                innerContainerViews: {
                    container: $('<div />').addClass('insm-spinner-outer'),
                    innerContainer: {
                        filter: $("<div id='insm-resolutionFilter'  />").addClass('insm-spinner-div'),
                        insmSpinnerLandscapeView: {
                            container1: $("<div id='insm-spinner-div-width' />").addClass('insm-spinner-div'),
                            id1: $("<input id='insm-spinner-landscape' name='value' />").addClass('insm-spinner-input')
                        },
                        insmSpinnerSetCross: {
                            container2: $("<div />").addClass('insm-spinner-div').addClass('insm-set-cross').text('X')
                        },
                        insmSpinnerPortaitView: {
                            container3: $("<div id='insm-spinner-div-height' />").addClass('insm-spinner-div'),
                            id3: $("<input id='insm-spinner-portrait' name='value' />").addClass('insm-spinner-input')
                        },
                        insmSpinnerResolutionInfo: {
                            container4: $("<div/>").addClass('insm-spinner-div').addClass('insm-set-cross'),
                            id4: $("<label id='insm-resolution-info' />").addClass('insm-resolution-label')
                        }
                    }
                },
                buttonView: {
                    container: $('<div />').addClass('insm-set-button-position'),
                    innerContainer: {
                        container: $('<div />').addClass('insm-button-position'),
                        span: $('<span id="spnMessage" />').addClass('insm-playlistManager-NewplaylistPopup-ErrorDiv'),
                        button1: $('<button id="cmdok" />').addClass('button').text('OK').addClass('insm-set-button'),
                        button2: $('<button id="cmdcancle" />').addClass('button').text('Cancel'),
                    }
                }
            },
            backdropView: {
                container: $('<div />').addClass('insm-lightbox-backdrop')
            },
        },
        // Start append all div container as thier visulization
        // Header widh lable and close button
        rootUI
            .append(
                contextObject.htmlElements.content.container.append(
                    contextObject.htmlElements.content.header.container.append(
                        contextObject.htmlElements.content.header.spanButton)));
        // Container shows comboobox of select with option content
        rootUI
            .append(
                contextObject.htmlElements.content.container.append(
                    contextObject.htmlElements.content.mainContainerView.container.append(
                    contextObject.htmlElements.content.mainContainerView.innerContainer.text,
                    contextObject.htmlElements.content.mainContainerView.innerContainer.input.container.append(
                        contextObject.htmlElements.content.mainContainerView.innerContainer.input.id))));
        // Set landscape and portrait spinner and resolution information
        rootUI
           .append(
               contextObject.htmlElements.content.container.append(
                   contextObject.htmlElements.content.innerContainerViews.container.append(
                       contextObject.htmlElements.content.innerContainerViews.innerContainer.filter,
                       contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerLandscapeView.container1.append(
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerLandscapeView.container1,
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerLandscapeView.id1),
                       contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerSetCross.container2.append(
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerSetCross.container2),
                       contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerPortaitView.container3.append(
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerPortaitView.container3,
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerPortaitView.id3),
                       contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerResolutionInfo.container4.append(
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerResolutionInfo.container4,
                           contextObject.htmlElements.content.innerContainerViews.innerContainer.insmSpinnerResolutionInfo.id4))));
        //Set ok and cancel button
        rootUI
           .append(
               contextObject.htmlElements.content.container.append(
                   contextObject.htmlElements.content.buttonView.container.append(
                   contextObject.htmlElements.content.buttonView.innerContainer.span,
                       contextObject.htmlElements.content.buttonView.innerContainer.button1,
                   contextObject.htmlElements.content.buttonView.innerContainer.button2)));
        //Set backdrop to hide backend window
        rootUI
            .append(
                contextObject.htmlElements.backdropView.container.append(contextObject.htmlElements.backdropView.container));
    },

};

(function ($, undefined) {
    var fileList;
    var openfrom;
    $.widget("insm.insmLighbox", _pluginLightboxObject);
})(jQuery);