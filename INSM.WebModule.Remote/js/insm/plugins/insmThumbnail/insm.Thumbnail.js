/// <reference path="../../framework/utility/insmEnums.js" />
var ThumbnailUI = {
    version: "0.0.1",
    //Declare event and variables 
    options: {
        Id: null,
        mediaType: null
    },
    // Initialization of plugin
    _init: function () {
        contextObjectThumbnail = this;
        rootUI_Thumbnail = this.element;

        switch (this.options.mediaType) {
            case Menutype.IMAGE:
                var path = $.insmFramework('getFileImageUrls', { id: this.options.Id, type: "image" });
                rootUI_Thumbnail.css('background-image', 'url(' + path.preview + ')');
                break;
            case Menutype.MOVIE:
                ThumbnailUI._imagePreivew(this.options.Id);
                break;
            case Menutype.FLASH:
                //rootUI_Thumbnail.css('background-image', 'url(' + path.preview + ')');
                // ThumbnailUI._imagePreivew(this.options.Id);
                var path = 'gfx/insm/icons/flash.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');

                break;
            case Menutype.MUSICFILE:
                //ThumbnailUI._imagePreivew(this.options.Id);
                var path = 'gfx/insm/icons/preview-not-available.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');
                break;
            case Menutype.WEB_PAGE:
                var path = 'gfx/insm/icons/preview-not-available.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');
                break;
            case Menutype.PLAYLIST:
                var path = 'gfx/insm/icons/playlist.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');
                break;
            case Menutype.NEWS_FEED:
                // ThumbnailUI._imagePreivew(this.options.Id);
                var path = 'gfx/insm/icons/preview-not-available.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');
                break;
            case Menutype.INFORMATION:
                //ThumbnailUI._imagePreivew(this.options.Id);
                var path = 'gfx/insm/icons/preview-not-available.png';
                rootUI_Thumbnail.css('background-image', 'url(' + path + ')');
                break;
            case Menutype.MENU28:
                ThumbnailUI._imagePreivew(this.options.Id);
                break;
            case Menutype.SKANSKA_TRIPLE_NEWS:
                ThumbnailUI._imagePreivew(this.options.Id);
                break;
            case Menutype.SWEDBANK_IMAGE:
                ThumbnailUI._imagePreivew(this.options.Id);
                break;
            case Menutype.MUSIC_STREAM_FILE:
                ThumbnailUI._imagePreivew(this.options.Id);
                break;
            default:
        }
    },
    //Creation of plugin
    _create: function () {
    },
    // To show preview image in thumbnail view  // show image by media type and its id.
    _imagePreivew:function(dataId) {
        var path = $.insmFramework('getFileImageUrls', { id: dataId, type: "image" });
        rootUI_Thumbnail.css('background-image', 'url(' + path.preview + ')');
        //var img = $('<img/>');
        //img.attr('src', path.preview);
        //img.load(function () {
        //    rootUI_Thumbnail.css('background-image', 'url('+path.preview+')');
        //});
        //img.css("display", "");

        //if (img.height() > img.width()) {
        //    img.css("max-width", "100%");
        //    img.css("height", "auto");
        //} else {
        //    img.css("max-height", "100%");
        //    img.css("width", "auto");
        //}
        //img.addClass("insm-playlist-manager-preview-loading-media-position");
    },

    imageThumbnail: function (source) {
    },
    //Destroy this plugin to get empty the reference
    _destroy: function () {
        rootUI_Thumbnail.empty();
    },
    
};

(function ($, undefined) {
    var contextObjectThumbnail, rootUI_Thumbnail;
    var audioElement, videoElement;
    $.widget("insm.ThumbnailUI", ThumbnailUI);
})(jQuery);