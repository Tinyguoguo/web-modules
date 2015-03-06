
var importPopupManager = {

    options: {
        fileUI: {},
        parentUI: {},
        onCallRemoteCollection: null
    },

    //Start rendering for plugin
    _init: function () {
        rootUI_importPopup = this.element;
        ContextObject_importPopup = this;
    },

    //Call this function when initialize plugin
    _create: function () {
        rootUI_importPopup = this.element;
        ContextObject_importPopup = this;
    },

    //Invoke DailogBox
    InvokeDialog: function () {
        var _plugin = {};
        rowFileInformation = [];
        _plugin.htmlElements = {
            content: {
                backdrop: $("<div />").addClass("insm-servercall-backdrop"),
                dialog: {
                    container: $("<div />").addClass("insm-servercall-fb-box").attr("id", "divbackdropforimportPopup"),
                    header: {
                        container: $("<div />").addClass("insm-servercall-header-box").attr("id", "divboxforremoveplaylist").text("Import from..."),
                        close: $("<span />").addClass("insm-lightbox-fb-close").attr("id", "closeforremoveplaylist")
                    },
                    body: {
                        container: $("<div />"),
                        blankParagraph: $("<p />"),
                        title: $("<p/>").text("Where do you want to import playlist from?The playlist collection or from disk?"),
                        buttonGroup: {
                            container: $("<div />").addClass("insm-button-position"),
                            blankParagraph1: $("<p />"),
                            blankParagraph2: $("<p />"),
                            collection: $("<div />").addClass("button").attr("id", "cmdCollection").text("collection"),
                            disk: $("<div />").addClass("button").attr("id", "cmdDisk").text("Disk"),
                            cancel: $("<div />").addClass("button").attr("id", "cmdCancelforimportPopup").text("Cancel"),
                        }
                    }
                }
            }
        };

        rootUI_importPopup.append(_plugin.htmlElements.content.backdrop)
            .append(_plugin.htmlElements.content.dialog.container
                .append(_plugin.htmlElements.content.dialog.header.container
                    .append(_plugin.htmlElements.content.dialog.header.close))
            .append(_plugin.htmlElements.content.dialog.body.container
                .append(_plugin.htmlElements.content.dialog.body.blankParagraph)
                .append(_plugin.htmlElements.content.dialog.body.title)
            .append(_plugin.htmlElements.content.dialog.body.buttonGroup.container
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.blankParagraph1)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.blankParagraph2)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.collection)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.disk)
                .append(_plugin.htmlElements.content.dialog.body.buttonGroup.cancel))));


        $('.insm-servercall-backdrop').animate({ 'opacity': '.5' }, 300, 'linear');
        $('.insm-servercall-backdrop, #divbackdropforimportPopup').css({
            'display': 'block'
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.collection.on("click", function () {
            closeDialog(1);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.disk.on("click", function () {
            closeDialog(2);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.cancel.on("click", function () {
            closeDialog();
        });

        _plugin.htmlElements.content.dialog.header.container.click(function () {
            closeDialog();
        });

        function closeDialog(index) {
            $('#divbackdropforimportPopup, #divbackdropforimportPopup').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('#divbackdropforimportPopup, #divbackdropforimportPopup').css('display', 'none');
            });
            ContextObject_importPopup._destroy();
            switch (index) {
                case 2:
                    ContextObject_importPopup.options.fileUI.trigger('click');
                    ContextObject_importPopup.options.fileUI.on("click", function () {
                        this.value = null;
                    });
                    ContextObject_importPopup.options.fileUI.on('change', importPopupManager.convertProcess);
                    break;
                case 1:
                    ContextObject_importPopup._trigger("onCallRemoteCollection");
                    closeDialog();
                    //alert('New Plug in need to develop')
                    break;
            }
        };
    },

    //Convert XML to JSON Object
    convertProcess: function (e) {
        var fileshandler = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(fileshandler);
        reader.onload = (function (theFile) {
            return function (e) {
                var rowxmldata = e.target.result;
                $.insmFramework('getDirectoryListForFileBrowser', {
                    contentDirectoryName: 'Media',
                    success: function (e) {
                        currnetContentID = e.Id;
                        $.insmFramework('getFileListForFileBrowser', {
                            contentDirectoryId: currnetContentID,
                            success: function (e) {
                                $.each(e.MediaFiles, function (index, item) {
                                    var row = {};
                                    row.Id = item.Id;
                                    row.isFolder = false;
                                    row.data = item;
                                    rowFileInformation.push(row);
                                });
                                arrayProccesor = new ArrayUtility();
                                var obj = arrayProccesor.convertXmltoPlayList(rowxmldata, rowFileInformation);
                                //console.log(obj);
                                $.each(obj, function (index, item) {
                                    item.playListId = $.data(document, "playListMaster").length;

                                    $.each(item.details, function (i, items) {
                                        var timeOptionsData = { timeOptions: items.timeOptionsData };
                                        items.timeOptionsData = timeOptionsData;
                                        item.details.push(items);
                                    });


                                    $.data(document, "playListMaster").push(item);

                                });
                                $.data(document, "currentPlayList", $.data(document, "playListMaster")[$.data(document, "playListMaster").length - 1]);
                                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                // $.data(document, "playlistmanager").addPlaylisttoMemory($.data(document, "playListMaster"));
                                ContextObject_importPopup.options.parentUI.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);
                                ContextObject_importPopup.options.fileUI.off('change', importPopupManager.convertProcess);
                            }
                        });
                    }
                });
            };
        })(fileshandler);
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI_importPopup.empty();
    }
};

(function ($, undefiend) {
    var rootUI_importPopup, ContextObject_importPopup;
    var rowFileInformation;
    $.widget("insm.importPopup", importPopupManager);
})(jQuery);