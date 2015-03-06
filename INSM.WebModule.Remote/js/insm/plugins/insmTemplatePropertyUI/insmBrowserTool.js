
var BrowserToolManager = {
    version: "0.0.1",

    options: {
        mediaId: 0,
        media: {}
    },

    _init: function () {
        contextObject_BrowserToolManager = this;
        rootUI_BrowserToolManager = this.element;
        _browserToolUI = {};
        var uid = "insm-browserpath-" + Math.uuid(15);
        var previewuid = "insm-previewBtn-" + Math.uuid(15);
        _browserToolUI.htmlElements = {
            browseFile: {
                container: $('<div/>'),
                input: $('<input type="text" readonly />').addClass('pathTxt').attr('id', uid),
                browseBtn: $('<input type="button" value="Browse...">').addClass('browseBtns'),
                clearBtn: $('<input type="button" value="Clear">').addClass('browseBtns'),
                previewBtn: $('<input type="button" value="Preview">').attr('id', previewuid).addClass('browseBtns'),
                downloadBtn: $('<a class="insm-playlist-manager-filebrowser-download-button button" style="margin-top: 15px;margin-left: 5px;">Download File..</a>'),
            }
        }

        var browserTool = _browserToolUI.htmlElements.browseFile.container
            .append(_browserToolUI.htmlElements.browseFile.input)
            .append(_browserToolUI.htmlElements.browseFile.browseBtn)
            .append(_browserToolUI.htmlElements.browseFile.clearBtn)
            .append(_browserToolUI.htmlElements.browseFile.previewBtn);

        rootUI_BrowserToolManager.append(browserTool);

        //browse button click event
        _browserToolUI.htmlElements.browseFile.browseBtn.click(function () {
            var fbhandler = $.data(document, "FileBrowserLocation");
            fbhandler.insmFileBrowser({
                singleSelection: true,
                filetype: Menutype.ALL,
                forTemplateProperty:true,
                onFileSelection: function (e, data) {
                    if (data.selectedFiles != undefined) {
                        $.data(document, "FileListFromServer", data.FileList);
                        var selectedImageName = $.grep(data.FileList, function (e) {
                            return e.Id == data.selectedFiles;
                        });
                        contextObject_BrowserToolManager.options.mediaId = data.selectedFiles;
                        contextObject_BrowserToolManager.options.media = selectedImageName[0];
                        _browserToolUI.htmlElements.browseFile.input.removeClass('emptyPathInput');
                        $('#' + previewuid).removeAttr('disabled');
                        $('#' + uid).val(selectedImageName[0].data.Name);
                    }
                }
            });
        });

        //clear button click event
        _browserToolUI.htmlElements.browseFile.clearBtn.click(function () {
            $('#' + uid).val("");
            $('#' + previewuid).attr('disabled', 'disabled');
        });

        $('#' + previewuid).on("click", function () {
            var path = $.insmFramework('getFileImageUrls', { id: contextObject_BrowserToolManager.options.mediaId });
            $.data(document, "previewPopup").empty();
            var targetUI = $.data(document, "previewPopup").append("<span />");
            var dialogui = targetUI.PopupForPreview();
            
            switch (contextObject_BrowserToolManager.options.media.data.FileTypeGroup) {
                case "Image":
                    dialogui.PopupForPreview('invokeDialogForImages', path.original);
                    break;
                case "Video":
                    dialogui.PopupForPreview('invokeDialogForVideo', path.original);
                    break;
                case "Audio":
                    dialogui.PopupForPreview('invokeDialogForAudio', path.original);
                    break;
            }
        });
    },

    _create: function () {
    },

    _destroy: function () {
        
    },

    _log: function (msg) {
        
    }
};

(function ($, undefined) {
    var contextObject_BrowserToolManager, rootUI_BrowserToolManager;
    var _browserToolUI;
    $.widget("insm.BrowserTool", BrowserToolManager);
})(jQuery);