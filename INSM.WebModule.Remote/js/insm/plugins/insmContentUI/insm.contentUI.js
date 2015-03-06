/// <reference path="../../js/insm/framework/utility/insmEnums.js" />
/// <reference path="~/js/insm/framework/utility/insmEnums.js" />
var contextObject_contentUI, rootUI_contentUI;
ContentUIManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        mediaId: null,
        mediaType: null,
        contentData: null,
    },

    // Initilization of plugin
    _init: function () {
        contextObject_contentUI = this;
        rootUI_contentUI = this.element;
        $(rootUI_contentUI).empty();
        this._setContentHtmlByMediaType();
    },

    // Set Html for side preivew and middle content
    _setContentHtmlByMediaType: function () {
        //html for content
        var _plugin = {};

        _plugin.htmlElements = {
            title: {
                container: $('<div/>')
            },
            browseFile: {
                container: $('<div/>'),
                input: $('<input type="text" readonly/>').addClass('pathTxt').attr('id', 'mediaPath'),
                browseBtn: $('<input type="button" value="Browse...">').addClass('browseBtns'),
                clearBtn: $('<input type="button" value="Clear">').addClass('browseBtns'),
                previewBtn: $('<input type="button" value="Preview">').addClass('browseBtns'),
                // downloadBtn: $('<input type="button" value="Download File...">').addClass('browseBtns'),
                downloadBtn: $('<a class="insm-playlist-manager-filebrowser-download-button button" style="margin-top: 15px;margin-left: 5px;">Download File..</a>'),
            },
            imageContent: {
                image: {
                    title: $('<span/>').text('Image'),
                    browserContainer: $('<div/>'),
                },
                imageScaling: {
                    container: $('<div/>'),
                    title: $('<div/>').text('Image Scaling').addClass('marginTop'),
                    input: {
                        select: $('<select/>').attr('id', 'imageScalling').addClass('marginTop Select'),
                        options: {
                            ScaleToFit: $('<option value="1"/>').text('Scale to fit'),
                            Stretch: $('<option value="2"/>').text('Stretch'),
                            FillAndCrop: $('<option value="3"/>').text('Fill and crop'),
                        }
                    },
                },
                animate: {
                    container: $('<div/>').addClass('marginTop'),
                    title: $('<span/>').text('Animate(zoom effect)').addClass('marginLeft'),
                    input: $('<input type="checkbox">').attr('id', 'animate'),
                },
            },
            flashContent: {
                zoomOut: {
                    container: $('<div/>').addClass('marginTop'),
                    title: $('<span/>').text('Zooms out and shows entire flash(not always recommanded)').addClass('marginLeft'),
                    input: $('<input type="checkbox">').attr('id', 'zoomOut'),
                }
            },
            webPageContent: {
                url: {
                    title: $('<div/>').text("Url"),
                    input: $('<input type="text"/>').addClass('urlTxt').attr('id', 'webPageUrl')
                },
                refreshPage: {
                    title: $('<div/>').text("Refresh Page automatically every").addClass('marginTop'),
                    option: {
                        container: $('<div/>').addClass('marginTop'),
                        select: $('<select/>').attr('id', 'refreshPageOption').addClass('Select'),
                    },
                }
            },
            newsFeedContent: {
                rssUrl: {
                    title: $('<div/>').text("RSS Url"),
                    input: $('<input type="text"/>').addClass('urlTxt').attr('id', 'rssUrl')
                },
                layout: {
                    title: $('<div/>').text("Layout").addClass('marginTop'),
                    option: {
                        container: $('<div/>').addClass('marginTop'),
                        select: $('<select/>').attr('id', 'layoutOption').addClass('Select'),
                    },
                },
                backgroundImage: {
                    title: $('<div/>').text("Background Image").addClass('marginTop'),
                    browserContainer: $('<div/>'),
                },
                titleStyle: {
                    title: $('<div/>').text("Title Style").addClass('marginTop'),
                    styleContainer: $('<div/>')
               
                },
                textStyle: {
                    title: $('<div/>').text("Text Style").addClass('marginTop'),
                    styleContainer: $('<div/>')
                 
                },

            },
            musicStreamContent: {
                musicStreamUrl: {
                    title: $('<div/>').text("Music Stream URL"),
                    input: $('<input type="text"/>').addClass('urlTxt').attr('id', 'musicStreamUrl')
                },
            },
            playlistContent: {
                playlist: {
                    container: $('<div/>'),
                    title: $('<span/>').text("Selected Playlist").addClass('bold '),
                    select: $('<select/>').attr('id', 'playListSelect').addClass('Select marginLeft'),
                    option: $('<option/>')
                }
            },
            informationContent: {
                layoutOption: {
                    container: $('<div/>'),
                    title: $('<div/>').text("Layout"),
                    select: $('<select/>').attr('id', 'infoLayoutOption').addClass('Select marginTop'),
                },
                backgroundImage: {
                    title: $('<div/>').text("Background").addClass('marginTop'),
                    browserContainer: $('<div/>'),
                },
                title: {
                    title: $('<div/>').text("Title").addClass('marginTop'),
                    styleContainer: $('<div/>'),
                    text: $('<input type="text"/>').attr('id', 'infoTitleContent').addClass('titleContentInput')
                },
                text: {
                    title: $('<div/>').text("Text").addClass('marginTop'),
                    styleContainer: $('<div/>'),
                    text: $('<textarea rows="4"/>').attr('id', 'infoTextContent').addClass('textContentInput')
                }
            },
        };
        downloadHandler = _plugin.htmlElements.browseFile.downloadBtn;
        var browserTool = _plugin.htmlElements.browseFile.container
            .append(_plugin.htmlElements.browseFile.input)
            .append(_plugin.htmlElements.browseFile.browseBtn)
            .append(_plugin.htmlElements.browseFile.clearBtn)
            .append(_plugin.htmlElements.browseFile.previewBtn);
        var browseMediaType = contextObject_contentUI.options.mediaType;

        //render content html by media type
        switch (contextObject_contentUI.options.mediaType) {
            case Menutype.IMAGE:
                //set image content html
                rootUI_contentUI.append(_plugin.htmlElements.imageContent.image.title)
                              .append(_plugin.htmlElements.imageContent.image.browserContainer
                              .append(browserTool))
                                .append(_plugin.htmlElements.imageContent.imageScaling.container
                                        .append(_plugin.htmlElements.imageContent.imageScaling.title)
                                        .append(_plugin.htmlElements.imageContent.imageScaling.input.select
                                                .append(_plugin.htmlElements.imageContent.imageScaling.input.options.ScaleToFit).append(_plugin.htmlElements.imageContent.imageScaling.input.options.Stretch).append(_plugin.htmlElements.imageContent.imageScaling.input.options.FillAndCrop)))
                                .append(_plugin.htmlElements.imageContent.animate.container
                                        .append(_plugin.htmlElements.imageContent.animate.input)
                                        .append(_plugin.htmlElements.imageContent.animate.title));
                //set image content data
                _plugin.htmlElements.browseFile.input.val($.data(document, "currentMediaItem")[0].contentData.imagePath);
                if ($.data(document, "currentMediaItem")[0].contentData.imagePath == "") {
                    _plugin.htmlElements.browseFile.previewBtn.attr('disabled', 'disabled');
                    _plugin.htmlElements.browseFile.input.addClass('emptyPathInput');
                }
                _plugin.htmlElements.imageContent.imageScaling.input.select.val($.data(document, "currentMediaItem")[0].contentData.imageScalling);
                _plugin.htmlElements.imageContent.animate.input.attr('checked', $.data(document, "currentMediaItem")[0].contentData.animate);

                break;
            case Menutype.MOVIE:
            case Menutype.MUSICFILE:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.imageContent.image.title)
                               .append(_plugin.htmlElements.imageContent.image.browserContainer.append(browserTool));

                if (contextObject_contentUI.options.mediaType == Menutype.MOVIE) {
                    _plugin.htmlElements.imageContent.image.title.text('Movie');
                }
                if (contextObject_contentUI.options.mediaType == Menutype.MUSICFILE) {
                    _plugin.htmlElements.imageContent.image.title.text('Music file');
                }
                //set content data
                _plugin.htmlElements.browseFile.input.val($.data(document, "currentMediaItem")[0].contentData.mediaPath);
                if ($.data(document, "currentMediaItem")[0].contentData.mediaPath == "") {
                    _plugin.htmlElements.browseFile.previewBtn.attr('disabled', 'disabled');
                    _plugin.htmlElements.browseFile.input.addClass('emptyPathInput');
                }
                break;
            case Menutype.FLASH:
                //set html
                _plugin.htmlElements.browseFile.previewBtn.hide();
                rootUI_contentUI.append(_plugin.htmlElements.imageContent.image.title)
                          .append(_plugin.htmlElements.imageContent.image.browserContainer.append(_plugin.htmlElements.browseFile.container
            .append(_plugin.htmlElements.browseFile.input)
            .append(_plugin.htmlElements.browseFile.browseBtn)
            .append(_plugin.htmlElements.browseFile.clearBtn)
            .append(_plugin.htmlElements.browseFile.downloadBtn)))
                 .append(_plugin.htmlElements.flashContent.zoomOut.container
                                        .append(_plugin.htmlElements.flashContent.zoomOut.input)
                                        .append(_plugin.htmlElements.flashContent.zoomOut.title));
                _plugin.htmlElements.imageContent.image.title.text('Flash');
                //set content data
                _plugin.htmlElements.flashContent.zoomOut.input.attr('checked', $.data(document, "currentMediaItem")[0].contentData.zoomOut);
                _plugin.htmlElements.browseFile.input.val($.data(document, "currentMediaItem")[0].contentData.mediaPath);
                if ($.data(document, "currentMediaItem")[0].contentData.mediaPath == "") {
                    _plugin.htmlElements.browseFile.downloadBtn.click(function () { return false; });
                    _plugin.htmlElements.browseFile.input.addClass('emptyPathInput');
                } else {
                    contextObject_contentUI._setdownload("Flash.swf", $.insmFramework('getFileImageUrls', { id: contextObject_contentUI.options.mediaId }));
                }
                break;
            case Menutype.WEB_PAGE:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.webPageContent.url.title)
                                .append(_plugin.htmlElements.webPageContent.url.input)
                                .append(_plugin.htmlElements.webPageContent.refreshPage.title)
                                 .append(_plugin.htmlElements.webPageContent.refreshPage.option.container
                                        .append(_plugin.htmlElements.webPageContent.refreshPage.option.select));
                var refreshPageOptions = [{ "name": "First time only", "value": "1" },
                                                              { "name": "1 minute", "value": "2" },
                                                              { "name": "5 minutes", "value": "3" },
                                                              { "name": "10 minutes", "value": "4" },
                                                              { "name": "30 minutes", "value": "5" },
                                                              { "name": "1 hour", "value": "6" },
                                                              { "name": "2 hours", "value": "7" },
                                                              { "name": "4 hours", "value": "8" },
                                                              { "name": "8 hours", "value": "9" }
                ];

                for (var i = 0; i < refreshPageOptions.length; i++) {
                    var op = '<option>' + refreshPageOptions[i].name;
                    _plugin.htmlElements.webPageContent.refreshPage.option.select.append(op);
                }

                //set content data
                if ($.data(document, "currentMediaItem")[0].contentData.url == "") {
                    _plugin.htmlElements.webPageContent.url.input.addClass('emptyPathInput');
                } else {
                    _plugin.htmlElements.webPageContent.url.input.removeClass('emptyPathInput');
                }
                _plugin.htmlElements.webPageContent.url.input.val($.data(document, "currentMediaItem")[0].contentData.url);
                _plugin.htmlElements.webPageContent.refreshPage.option.select.val($.data(document, "currentMediaItem")[0].contentData.refreshPageOption);

                _plugin.htmlElements.webPageContent.url.input.focusout(function () {
                    if (_plugin.htmlElements.webPageContent.url.input.val() == "") {
                        _plugin.htmlElements.webPageContent.url.input.addClass('emptyPathInput');
                    } else {
                        _plugin.htmlElements.webPageContent.url.input.removeClass('emptyPathInput');
                    }

                });

                break;
            case Menutype.NEWS_FEED:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.newsFeedContent.rssUrl.title)
                                     .append(_plugin.htmlElements.newsFeedContent.rssUrl.input)
                                     .append(_plugin.htmlElements.newsFeedContent.layout.title)
                                     .append(_plugin.htmlElements.newsFeedContent.layout.option.container
                                             .append(_plugin.htmlElements.newsFeedContent.layout.option.select))
                                     .append(_plugin.htmlElements.newsFeedContent.backgroundImage.title)
                                     .append(_plugin.htmlElements.newsFeedContent.backgroundImage.browserContainer.append(browserTool))
                                     .append(_plugin.htmlElements.newsFeedContent.titleStyle.title)
                                     .append(_plugin.htmlElements.newsFeedContent.titleStyle.styleContainer)
                                     .append(_plugin.htmlElements.newsFeedContent.textStyle.title)
                                     .append(_plugin.htmlElements.newsFeedContent.textStyle.styleContainer);
                
                //set font style tool for title
                var sizeOption = [];
                var j = 0;
                for (var i = 10; i <= 400;) {
                    sizeOption.push({ name: i, value: j });
                    if (i >= 100) {
                        i = i + 50;
                    } else {
                        i = i + 10;
                    }
                    j++;
                }


                _plugin.htmlElements.newsFeedContent.titleStyle.styleContainer.fontStyleTool({
                    role: "title",
                    bold: $.data(document, "currentMediaItem")[0].contentData.titleStyle.bold,
                    italic: $.data(document, "currentMediaItem")[0].contentData.titleStyle.italic,
                    shadow: $.data(document, "currentMediaItem")[0].contentData.titleStyle.shadow,
                    align: $.data(document, "currentMediaItem")[0].contentData.titleStyle.align,
                    styleOption: [{ "name": "Arial", "value": "1" },
                                    { "name": "Calibri", "value": "2" },
                                    { "name": "Cambria", "value": "3" },
                                    { "name": "Franklin Gothic Medium", "value": "4" },
                                    { "name": "Segoe UI", "value": "5" },
                                    { "name": "Times New Roman", "value": "6" },
                                    { "name": "Tahoma", "value": "7" },
                                    { "name": "Segoe Print", "value": "8" },
                                    { "name": "Segoe Script", "value": "9" }],//$.data(document, "fontStyleOptions"),
                    styleSelectedOption: $.data(document, "currentMediaItem")[0].contentData.titleStyle.fontStyle,
                    sizeOption: sizeOption,
                    sizeSelectedOption: $.data(document, "currentMediaItem")[0].contentData.titleStyle.fontSize,
                    selectedColor: $.data(document, "currentMediaItem")[0].contentData.titleStyle.color
                });
                //set font style tool for text
                _plugin.htmlElements.newsFeedContent.textStyle.styleContainer.fontStyleTool({
                    role: "text",
                    bold: $.data(document, "currentMediaItem")[0].contentData.textStyle.bold,
                    italic: $.data(document, "currentMediaItem")[0].contentData.textStyle.italic,
                    shadow: $.data(document, "currentMediaItem")[0].contentData.textStyle.shadow,
                    align: $.data(document, "currentMediaItem")[0].contentData.textStyle.align,
                    styleOption:[{ "name": "Arial", "value": "1" },
                                    { "name": "Calibri", "value": "2" },
                                    { "name": "Cambria", "value": "3" },
                                    { "name": "Franklin Gothic Medium", "value": "4" },
                                    { "name": "Segoe UI", "value": "5" },
                                    { "name": "Times New Roman", "value": "6" },
                                    { "name": "Tahoma", "value": "7" },
                                    { "name": "Segoe Print", "value": "8" },
                                    { "name": "Segoe Script", "value": "9" }], //$.data(document, "fontStyleOptions"),
                    styleSelectedOption: $.data(document, "currentMediaItem")[0].contentData.textStyle.fontStyle,
                    sizeOption: sizeOption,
                    sizeSelectedOption: $.data(document, "currentMediaItem")[0].contentData.textStyle.fontSize,
                    selectedColor: $.data(document, "currentMediaItem")[0].contentData.textStyle.color
                });

                
                browseMediaType = Menutype.IMAGE;
                var layoutOptions = [{ "name": "Top-aligned", "value": "1" },
                                   { "name": "Centered", "value": "2" },
                                   { "name": "Side by side", "value": "3" }];
                for (var i = 0; i < layoutOptions.length; i++) {
                    var op = '<option>' + layoutOptions[i].name;
                    _plugin.htmlElements.newsFeedContent.layout.option.select.append(op);
                }
                //set content data
                if ($.data(document, "currentMediaItem")[0].contentData.rssUrl == "") {
                    _plugin.htmlElements.newsFeedContent.rssUrl.input.addClass('emptyPathInput');
                }
                _plugin.htmlElements.newsFeedContent.rssUrl.input.focusout(function () {
                    if (_plugin.htmlElements.newsFeedContent.rssUrl.input.val() == "") {
                        _plugin.htmlElements.newsFeedContent.rssUrl.input.addClass('emptyPathInput');
                    }
                });
                _plugin.htmlElements.newsFeedContent.rssUrl.input.val($.data(document, "currentMediaItem")[0].contentData.rssUrl);
                _plugin.htmlElements.newsFeedContent.layout.option.select.val($.data(document, "currentMediaItem")[0].contentData.layoutOption);
                _plugin.htmlElements.browseFile.input.val($.data(document, "currentMediaItem")[0].contentData.bgImage);
                if ($.data(document, "currentMediaItem")[0].contentData.bgImage == "") {
                    _plugin.htmlElements.browseFile.previewBtn.attr('disabled', 'disabled');
                }



                break;
            case Menutype.MUSIC_STREAM_FILE:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.musicStreamContent.musicStreamUrl.title)
                                .append(_plugin.htmlElements.musicStreamContent.musicStreamUrl.input);
                //set content data
                if ($.data(document, "currentMediaItem")[0].contentData.musicStreamUrl == "") {
                    _plugin.htmlElements.musicStreamContent.musicStreamUrl.input.addClass('emptyPathInput');
                }
                _plugin.htmlElements.musicStreamContent.musicStreamUrl.input.focusout(function () {
                    if (_plugin.htmlElements.musicStreamContent.musicStreamUrl.input.val() == "") {
                        _plugin.htmlElements.musicStreamContent.musicStreamUrl.input.addClass('emptyPathInput');
                    } else {
                        _plugin.htmlElements.musicStreamContent.musicStreamUrl.input.removeClass('emptyPathInput');
                    }
                });
                _plugin.htmlElements.musicStreamContent.musicStreamUrl.input.val($.data(document, "currentMediaItem")[0].contentData.musicStreamUrl);

                break;
            case Menutype.PLAYLIST:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.playlistContent.playlist.container
                            .append(_plugin.htmlElements.playlistContent.playlist.title)
                            .append(_plugin.htmlElements.playlistContent.playlist.select));
                var playlists = $.grep($.data(document, "playListMaster"), function (e) {
                    return e.playListId != $.data(document, "currentPlayList").playListId;
                });
                var op = "<option value='-1'>(None)";
                _plugin.htmlElements.playlistContent.playlist.select.append(op);
                $.each(playlists, function (index, items) {
                    op = '<option value=' + items.playListId + '>' + items.playListName;
                    _plugin.htmlElements.playlistContent.playlist.select.append(op);
                    i++;
                });

                //set content data
                _plugin.htmlElements.playlistContent.playlist.select.change(function () {
                    if (_plugin.htmlElements.playlistContent.playlist.select.val() < 0) {
                        _plugin.htmlElements.playlistContent.playlist.select.addClass('emptyPathInput');
                    } else {
                        _plugin.htmlElements.playlistContent.playlist.select.removeClass('emptyPathInput');
                    }
                });
                if ($.data(document, "currentMediaItem")[0].contentData.playlist < 0) {
                    _plugin.htmlElements.playlistContent.playlist.select.addClass('emptyPathInput');
                } else {
                    _plugin.htmlElements.playlistContent.playlist.select.removeClass('emptyPathInput');
                }
                _plugin.htmlElements.playlistContent.playlist.select.val($.data(document, "currentMediaItem")[0].contentData.playlist);
                break;
            case Menutype.INFORMATION:
                //set html
                rootUI_contentUI.append(_plugin.htmlElements.informationContent.layoutOption.title)
                                  .append(_plugin.htmlElements.informationContent.layoutOption.select)
                                  .append(_plugin.htmlElements.informationContent.backgroundImage.title)
                                  .append(_plugin.htmlElements.informationContent.backgroundImage.browserContainer.append(browserTool))
                                  .append(_plugin.htmlElements.informationContent.title.title)
                                  .append(_plugin.htmlElements.informationContent.title.styleContainer)
                                  .append(_plugin.htmlElements.informationContent.title.text)
                                  .append(_plugin.htmlElements.informationContent.text.title)
                                  .append(_plugin.htmlElements.informationContent.text.styleContainer)
                                  .append(_plugin.htmlElements.informationContent.text.text);
                browseMediaType = Menutype.IMAGE;
                var infoLayoutOptions = [{ "name": "Top-aligned", "value": "1" },
                                   { "name": "Centered", "value": "2" }];
                for (var i = 0; i < infoLayoutOptions.length; i++) {
                    var op = '<option>' + infoLayoutOptions[i].name;
                    _plugin.htmlElements.informationContent.layoutOption.select.append(op);
                }
                //set font style tool for title
                var sizeOption = [];
                var j = 0;
                for (var i = 10; i <= 400;) {
                    sizeOption.push({ name: i, value: j });
                    if (i >= 100) {
                        i = i + 50;
                    } else {
                        i = i + 10;
                    }
                    j++;
                }


                _plugin.htmlElements.informationContent.title.styleContainer.fontStyleTool({
                    role: "title",
                    bold: $.data(document, "currentMediaItem")[0].contentData.title.bold,
                    italic: $.data(document, "currentMediaItem")[0].contentData.title.italic,
                    shadow: $.data(document, "currentMediaItem")[0].contentData.title.shadow,
                    align: $.data(document, "currentMediaItem")[0].contentData.title.align,
                    styleOption: [{ "name": "Arial", "value": "1" },
                                    { "name": "Calibri", "value": "2" },
                                    { "name": "Cambria", "value": "3" },
                                    { "name": "Franklin Gothic Medium", "value": "4" },
                                    { "name": "Segoe UI", "value": "5" },
                                    { "name": "Times New Roman", "value": "6" },
                                    { "name": "Tahoma", "value": "7" },
                                    { "name": "Segoe Print", "value": "8" },
                                    { "name": "Segoe Script", "value": "9" }], //$.data(document, "fontStyleOptions"),
                    styleSelectedOption: $.data(document, "currentMediaItem")[0].contentData.title.fontStyle,
                    sizeOption: sizeOption,
                    sizeSelectedOption: $.data(document, "currentMediaItem")[0].contentData.title.fontSize,
                    selectedColor: $.data(document, "currentMediaItem")[0].contentData.title.color
                });
                //set font style tool for text
                _plugin.htmlElements.informationContent.text.styleContainer.fontStyleTool({
                    role: "text",
                    bold: $.data(document, "currentMediaItem")[0].contentData.text.bold,
                    italic: $.data(document, "currentMediaItem")[0].contentData.text.italic,
                    shadow: $.data(document, "currentMediaItem")[0].contentData.text.shadow,
                    align: $.data(document, "currentMediaItem")[0].contentData.text.align,
                    styleOption: [{ "name": "Arial", "value": "1" },
                                    { "name": "Calibri", "value": "2" },
                                    { "name": "Cambria", "value": "3" },
                                    { "name": "Franklin Gothic Medium", "value": "4" },
                                    { "name": "Segoe UI", "value": "5" },
                                    { "name": "Times New Roman", "value": "6" },
                                    { "name": "Tahoma", "value": "7" },
                                    { "name": "Segoe Print", "value": "8" },
                                    { "name": "Segoe Script", "value": "9" }], //$.data(document, "fontStyleOptions"),
                    styleSelectedOption: $.data(document, "currentMediaItem")[0].contentData.text.fontStyle,
                    sizeOption: sizeOption,
                    sizeSelectedOption: $.data(document, "currentMediaItem")[0].contentData.text.fontSize,
                    selectedColor: $.data(document, "currentMediaItem")[0].contentData.text.color
                });

                //set content data
                _plugin.htmlElements.informationContent.layoutOption.select.val($.data(document, "currentMediaItem")[0].contentData.infoLayoutOption);
                _plugin.htmlElements.browseFile.input.val($.data(document, "currentMediaItem")[0].contentData.bgImage);
                if ($.data(document, "currentMediaItem")[0].contentData.bgImage == "") {
                    _plugin.htmlElements.browseFile.previewBtn.attr('disabled', 'disabled');
                }
                _plugin.htmlElements.informationContent.title.text.val($.data(document, "currentMediaItem")[0].contentData.title.text);
                _plugin.htmlElements.informationContent.text.text.val($.data(document, "currentMediaItem")[0].contentData.text.text);
                break;

        }

        var Mediapath = $.insmFramework('getFileImageUrls', { id: contextObject_contentUI.options.mediaId });

        _plugin.htmlElements.browseFile.previewBtn.on("click", function () {
            var path = $.insmFramework('getFileImageUrls', { id: contextObject_contentUI.options.mediaId });
            $.data(document, "previewPopup").empty();
            var targetUI = $.data(document, "previewPopup").append("<span />");
            var dialogui = targetUI.PopupForPreview();
            if ($.data(document, "currentMediaItem")[0].Type == Menutype.IMAGE) {
                dialogui.PopupForPreview('invokeDialogForImages', path.original);
            }
            else if ($.data(document, "currentMediaItem")[0].Type == Menutype.MOVIE) {
                dialogui.PopupForPreview('invokeDialogForVideo', path.original);
            }

        });

        contextObject_contentUI._setdownload("Flash.swf", Mediapath.original);

        //browse button click event
        _plugin.htmlElements.browseFile.browseBtn.click(function () {
            var fbhandler = $.data(document, "FileBrowserLocation");
            fbhandler.insmFileBrowser({
                //thumbnailContainer: PlaylistEditor.find("#thumbnailviewer"),
                singleSelection: true,
                filetype: browseMediaType,
                //filetype: contextObject_contentUI.options.mediaType,
                onFileSelection: function (e, data) {
                    if (data.selectedFiles != undefined) {
                        $.data(document, "FileListFromServer", data.FileList);
                        var selectedImageName = $.grep(data.FileList, function (e) {
                            return e.Id == data.selectedFiles;
                        });
                        console.log(selectedImageName[0].Id);
                        $.data(document, "mediaIdtoUpdate", selectedImageName[0].Id);
                        _plugin.htmlElements.browseFile.input.removeClass('emptyPathInput');
                        _plugin.htmlElements.browseFile.previewBtn.removeAttr('disabled');
                        _plugin.htmlElements.browseFile.input.val(selectedImageName[0].data.Name);
                    }
                }
            });
        });

        //download button click event
        _plugin.htmlElements.browseFile.downloadBtn.click(function () {
            if (_plugin.htmlElements.browseFile.input.val() == "") {
                return false;
            }
        });
        //clear button click event
        _plugin.htmlElements.browseFile.clearBtn.click(function () {
            $.data(document, "mediaIdtoUpdate", -1);
            _plugin.htmlElements.browseFile.input.val("");
            if (contextObject_contentUI.options.mediaType != Menutype.NEWS_FEED && contextObject_contentUI.options.mediaType != Menutype.INFORMATION) {
                _plugin.htmlElements.browseFile.input.addClass('emptyPathInput');
            }
            _plugin.htmlElements.browseFile.previewBtn.attr('disabled', 'disabled');

        });

        _plugin.htmlElements.imageContent.imageScaling.input.select.change(function () {
            var selectedValue = $('option:selected', this).val();
            var changestyle = $('.insm-thumbnail-outer-div-select').find('.insm-playlist-manager-thumbnail-media-div');
            switch (selectedValue) {
                case '1':// SCALE TO FIT
                    $(changestyle).removeClass('insm-thumbnail-strech');
                    $(changestyle).removeClass('insm-thumbnail-fillancrop');
                    $(changestyle).addClass('insm-thumbnail-scaletofit');

                    $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                    $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                    $(".previewScreenDiv").addClass('insm-thumbnail-scaletofit');
                    break;
                case '2': // STRECH
                    $(changestyle).removeClass('insm-thumbnail-fillancrop');
                    $(changestyle).removeClass('insm-thumbnail-scaletofit');
                    $(changestyle).addClass('insm-thumbnail-strech');

                    $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                    $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                    $(".previewScreenDiv").addClass('insm-thumbnail-strech');
                    break;
                case '3':// FILL AND CROP
                    $(changestyle).removeClass('insm-thumbnail-strech');
                    $(changestyle).removeClass('insm-thumbnail-scaletofit');
                    $(changestyle).addClass('insm-thumbnail-fillancrop');

                    $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                    $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                    $(".previewScreenDiv").addClass('insm-thumbnail-fillancrop');
                    break;
            }

        });
    },

    //download file
    _setdownload: function (data, url) {
        downloadHandler.attr("target", "_blank").attr("href", url).attr("download", data.substr(0, data.indexOf(".")));
    },

    //Create this plugin
    _create: function () {
        contextObject_contentUI = this;
        rootUI_contentUI = this.element;
    },
    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_contentUI.empty();
    },

};

(function ($, undefined) {
    var downloadHandler;
    $.widget("insm.contentUI", ContentUIManager);
})(jQuery);