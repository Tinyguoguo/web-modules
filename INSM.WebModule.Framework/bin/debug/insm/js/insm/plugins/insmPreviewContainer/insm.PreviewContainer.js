/// <reference path="../../js/insm/framework/utility/insmEnums.js" />
/// <reference path="~/js/insm/framework/utility/insmEnums.js" />
var contextObject_preview, rootUI_preview;
var PreviewViewUIManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        headerValue: null,
        mediaId: null,
        mediaGuid:null,
        mediaType: null,
        previewData: null,
    },

    // Initilization of plugin
    _init: function () {
        contextObject_preview = this;
        rootUI_preview = this.element;
        $(rootUI_preview).empty();
        this._setPreivewContainerHtml();
        this._getHtmlByMediaType(this.options.mediaType);
    },

    // Set Html for side preivew and middle content
    _setPreivewContainerHtml: function () {
        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                dialog: {
                    container: $("<div />").addClass("insm-playlisteditor-process-container-header").append($("<span />").text(this.options.headerValue)),
                    header: {
                        container: $("<div />").addClass("insm-playlisteditor-process-content"),
                        content: $("<div />").addClass("insm-playlisteditor-preview-content")
                    },
                }
            },
        },
        // Append html on root target
        rootUI_preview.append(_plugin.htmlElements.content.dialog.container)
            .append(_plugin.htmlElements.content.dialog.header.container)
                .append(_plugin.htmlElements.content.dialog.header.content);
    },

    //Create this plugin
    _create: function () {
        contextObject_preview = this;
        rootUI_preview = this.element;
    },

    // Depend on media type set the different media with its control and data 
    _getHtmlByMediaType: function (type) {
        switch (type) {
            case Menutype.IMAGE:
            case Menutype.NEWS_FEED:
            case Menutype.INFORMATION:
            case Menutype.MENU28:
            case Menutype.SKANSKA_TRIPLE_NEWS:
            case Menutype.SWEDBANK_IMAGE:
                $('.insm-playlisteditor-preview-content').MediaSettings({ mediaId: this.options.mediaId, mediaGuid: this.options.mediaGuid, setPlayUntillFinishedOption: false, setVolumeOption: false, setDefaultData: this.options.previewData });
                $('.previewScreenDiv').ThumbnailUI({ Id: this.options.mediaId, mediaType: this.options.mediaType });
                break;
            case Menutype.MOVIE:
            case Menutype.MUSICFILE:
            case Menutype.PLAYLIST:
            case Menutype.MUSIC_STREAM_FILE:
                $('.insm-playlisteditor-preview-content').MediaSettings({ mediaId: this.options.mediaId,mediaGuid: this.options.mediaGuid, setDefaultData: this.options.previewData });
                $('.previewScreenDiv').ThumbnailUI({ Id: this.options.mediaId, mediaType: this.options.mediaType });
                break;
            case Menutype.WEB_PAGE:
                $('.insm-playlisteditor-preview-content').MediaSettings({ mediaId: this.options.mediaId, mediaGuid: this.options.mediaGuid, setPlayUntillFinishedOption: false, setVolumeOption: false, setTransitionOption: false, setDefaultData: this.options.previewData });
                $('.previewScreenDiv').ThumbnailUI({ Id: this.options.mediaId, mediaType: this.options.mediaType });
                break;
            case Menutype.FLASH:
                $('.insm-playlisteditor-preview-content').MediaSettings({ mediaId: this.options.mediaId, mediaGuid: this.options.mediaGuid, setPlayUntillFinishedOption: false, setVolumeOption: false, setTransitionOption: false, setDefaultData: this.options.previewData });
                $('.previewScreenDiv').ThumbnailUI({ Id: this.options.mediaId, mediaType: this.options.mediaType });
                break;
            default:
        }
    },

    // Get data to save in memory for view
    getDataToSave: function () {
        return $('.insm-playlisteditor-preview-content').MediaSettings("getMediaSettingsData");
    },

    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_preview.empty();
    },

    // To get empty preview container on cancel event
    emptyPreviewContainer: function () {
        rootUI_preview.empty();
    },
};

(function ($, undefined) {
    $.widget("insm.PreviewContainer", PreviewViewUIManager);
})(jQuery);