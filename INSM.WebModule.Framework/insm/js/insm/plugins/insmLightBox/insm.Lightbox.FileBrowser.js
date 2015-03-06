var FileBrowserObject = {
    version: "0.0.1",

    options: {
        renderHtml: '',
        thumbnailContainer: {},
        onsubmit: null,
        oncancel: null,
        onFileSelection: null,
        filetype: "",
        singleSelection: false,
        forTemplateProperty: false
    },

    _init: function () {
        FileBrowsermode = 1;
        browserState = 1;
        preview = null;
        sliderUI = null;
        this._RenderLightbox();
    },

    _create: function () {
        contextObjectFB = this;
    },

    close_box: function (event) {
        $('.insm-lightbox-fb-backdrop, .insm-lightbox-fb-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
            $('.insm-lightbox-fb-backdrop, .insm-lightbox-fb-box').css('display', 'none');
        });
        if (sliderUI != null) {
            if (preview.previewUI('getCurrentMediaType') == 1) {
                preview.previewUI('PreviewMoviePause');
            } else {
                preview.previewUI('PreviewAudioPause');
            }
        }
        //rootUIFB.empty();
    },

    //File upload to server
    cmdupload_click: function (e) {
        $("#divpopup").insmServerProcessingLoader({ text: 'Uploading Image..' });
        $("#divpopup").insmServerProcessingLoader("InvokeDialog");
        var picReader = new FileReader();
        var imgdata = $("<img />");
        picReader.readAsDataURL(e.target.files[0]);
        var filename = e.target.files[0].name;
        $.data(document, "filename", filename);
        picReader.addEventListener("load", function (e) {

        });
        var folderinfo = fileListUI.FileBrowserList('getcurrentFolderInfo');
        //$.insmFramework('uploadFile', {
        //    fileInputElement: $(e.currentTarget),
        //    name: filename,
        //    progress: function (data) {
        //        contextObjectFB._log(data);
        //    },
        //    regionId: folderinfo.RegionId,
        //    directoryName: folderinfo.Name,
        //    properties: e.currentTarget,
        //    done: function (data) {
        //        fileListUI.FileBrowserList('LoadFileList', folderinfo.Name, folderinfo.Id);
        //        $("#divpopup").insmServerProcessingLoader("closeDialog");
        //    }
        //});

        $.insmFramework('uploadFileInner', {
            fileInputElement: $(e.currentTarget),
            name: filename,
            progress: function (data) {
                contextObjectFB._log(data);
            },
            contentDirectoryId: folderinfo.Id,
            properties: e.currentTarget,
            done: function (data) {
                fileListUI.FileBrowserList('LoadFileList', folderinfo.Name, folderinfo.Id);
                $("#divpopup").insmServerProcessingLoader("closeDialog");
            }
        });
    },

    //Call this function while remove plugin
    _destroy: function () {
        currnetContentID = 0;
    },

    //Trace on cosole window
    _log: function (msg) {
        console.log(msg);
    },

    //Render Popup
    _RenderLightbox: function () {

        rootUIFB = this.element;
        rootUIFB.empty();
        _plugin = {};
        _plugin.htmlElements = {
            content: {
                dialog: {
                    container: $("<div />").addClass("insm-lightbox-fb-box").addClass("insm-lightbox-fb-normal"),
                    header: {
                        container: $("<div />").addClass("insm-lightbox-header").text("Select File"),
                        buttonStatus: $("<span />").addClass("insm-lightbox-fb-buttonStatus").addClass("insm-lightbox-fb-buttonStatusforMax"),
                        close: $("<span />").addClass("insm-lightbox-fb-close")
                    },
                    body: {
                        container: $("<div />").addClass("insm-playlistManager-fb-maincontainer").attr("id", "maincontainer"),
                        fileSection: {
                            container: $("<div />").addClass("insm-filebrowserlist-filesection").attr("id", "filesection"),
                            folderInfo: {
                                container: $("<div />").addClass("insm-filebrowserlist-folderinfo").attr("id", "folderinfo"),
                                foldericon: {
                                    container: $("<div />").addClass("insm-filebrowserlist-foldericon").attr("id", "foldericon"),
                                    foldername: $("<span />").addClass("insm-filebrowserlist-foldername").attr("id", "foldername")
                                },
                                search: {
                                    container: $("<div />").addClass("insm-filebrowserlist-searchBox"),
                                    textbox: $("<input type='text'/>").attr("id", "txtsearch"),
                                    searchbutton: $("<div />").addClass("button button--icon button--icon-search insm-playlist-manager-filebrowser-search")
                                },
                                newfolder: $("<div />").addClass("button button--icon button--icon-newfolder insm-playlist-manager-filebrowser-newfolder").css("margin-right", "0px"),
                                upfolder: $("<div />").addClass("button button--icon button--icon-upfolder insm-playlist-manager-filebrowser-upfolder"),
                            },
                            filelistcontainer: $("<span />").attr("id", "filelistcontainer")
                        },
                        moveToSection: {
                            container: $("<div />").addClass("insm-filebrowserlist-movetosection")
                        },
                        previewSection: {
                            container: $("<div />").addClass("insm-filebrowserlist-previewsection"),
                            previewsectioncontainer: $("<div />").addClass("insm-filebrowserlist-previewsectioncontainer"),
                            playcontrollercontainer: $("<div />").addClass("insm-filebrowserlist-playcontrollercontainer"),
                            fileinfosection: $("<div />").addClass("insm-filebrowserlist-fileinfosection"),
                        },
                        buttonControll: {
                            container: $("<div />").addClass("insm-filebrowserlist-buttoncontrol").attr("id", "buttoncontrol"),
                            upload: {
                                container: $("<div />").addClass("button button--upload"),
                                ui: $("<input id='files' type='file' title='Upload file...' accept='image/*' multiple=''/>")
                            },
                            download: $("<a />").addClass("insm-playlist-manager-filebrowser-download-button button").text("Download File.."),
                            filler1: $("<span style='width: 4%; display: inline-block' />"),
                            Move: $("<button />").addClass("button insm-playlist-manager-filebrowser-move").text("Move File.."),
                            Rename: $("<button />").addClass("button").attr("id", "cmdrename").text("Rename"),
                            Remove: $("<button />").addClass("button").attr("id", "cmdremovefile").text("Remove File"),
                            filler2: $("<span style='width: 10%; display: inline-block'/>"),
                            ok: $("<button />").addClass("button").attr("id", "cmdokfb").text("OK"),
                            cancel: $("<button />").addClass("button").attr("id", "cmdcancelfb").text("Cancel"),
                        }
                    }
                },
                backdrop: {
                    container: $("<div />").addClass("insm-lightbox-fb-backdrop")
                }
            }
        };

        rootUIFB.append(_plugin.htmlElements.content.dialog.container
                        .append(_plugin.htmlElements.content.dialog.header.container
                            .append(_plugin.htmlElements.content.dialog.header.close)
                            .append(_plugin.htmlElements.content.dialog.header.buttonStatus))
                        .append(_plugin.htmlElements.content.dialog.body.container
                            .append(_plugin.htmlElements.content.dialog.body.buttonControll.container)
                            .append(_plugin.htmlElements.content.dialog.body.moveToSection.container)
                            .append(_plugin.htmlElements.content.dialog.body.fileSection.container
                                .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.container
                                    .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.foldericon.container
                                        .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.foldericon.foldername))
                                    .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.container
                                        .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.textbox)
                                        .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.searchbutton))
                                    .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.newfolder)
                                    .append(_plugin.htmlElements.content.dialog.body.fileSection.folderInfo.upfolder))
                                .append(_plugin.htmlElements.content.dialog.body.fileSection.filelistcontainer))
                            .append(_plugin.htmlElements.content.dialog.body.moveToSection.container)
                            .append(_plugin.htmlElements.content.dialog.body.previewSection.container
                                .append(_plugin.htmlElements.content.dialog.body.previewSection.previewsectioncontainer)
                                .append(_plugin.htmlElements.content.dialog.body.previewSection.playcontrollercontainer)
                                .append(_plugin.htmlElements.content.dialog.body.previewSection.fileinfosection)
                                )
                            .append(_plugin.htmlElements.content.dialog.body.buttonControll.container
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.upload.container
                                    .append(_plugin.htmlElements.content.dialog.body.buttonControll.upload.ui))
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.download)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.filler1)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.Move)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.Rename)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.Remove)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.filler2)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.ok)
                                .append(_plugin.htmlElements.content.dialog.body.buttonControll.cancel))))
                    .append(_plugin.htmlElements.content.backdrop.container)

        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.textbox.css("margin-left", "3px");
        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.searchbutton.html("&nbsp;").css("margin-left", "3px");
        //        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.newfolder.html("&nbsp;").css("margin-left", "3px");
        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.newfolder.html("&nbsp;").css("height", "15px");
        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.upfolder.html("&nbsp;").css("margin-left", "3px");


        _plugin.htmlElements.content.dialog.body.previewSection.previewsectioncontainer.append("<div id='preiviewUI' class='insm-filebrowserlist-preiviewUI'/>");
        _plugin.htmlElements.content.dialog.body.previewSection.playcontrollercontainer.append("<span class='insm-filebrowserlist-preiviewUI-playerController'/>");

        _plugin.htmlElements.content.dialog.body.previewSection.fileinfosection.append("<div class='insm-filebrowserlist-fileinfosection' > <div>Name :<span class='insm-playlist-manager-filebrowser-preview-filename'></span></div> <div>Size :<span class='insm-playlist-manager-filebrowser-preview-filesize'></span></div> <div>Length :<span class='insm-playlist-manager-filebrowser-preview-fileLength'></span></div></div>");

        $('.insm-lightbox-fb-backdrop, insm-lightbox-fb-box').animate({ 'opacity': '.50' }, 300, 'linear');
        $('.insm-lightbox-fb-box').animate({ 'opacity': '1.00' }, 300, 'linear');
        $('.insm-lightbox-fb-backdrop, .insm-lightbox-fb-box').css('display', 'block');
        this._on(_plugin.htmlElements.content.dialog.header.close, { click: "close_box" });
        this._on(_plugin.htmlElements.content.dialog.body.buttonControll.upload.ui, { change: "cmdupload_click" });
        _plugin.htmlElements.content.dialog.container.css("z-index", "100000");

        _plugin.htmlElements.content.dialog.header.buttonStatus.on("click", function () {
            //Maximize Process will be done here
            if (browserState == 1) {
                browserState = 2;
                _plugin.htmlElements.content.dialog.container.removeClass('insm-lightbox-fb-normal');
                _plugin.htmlElements.content.dialog.container.addClass('insm-lightbox-fb-max');
                _plugin.htmlElements.content.dialog.header.buttonStatus.removeClass('insm-lightbox-fb-buttonStatusforMax');
                _plugin.htmlElements.content.dialog.header.buttonStatus.addClass('insm-lightbox-fb-buttonStatusforRestore');
                _plugin.htmlElements.content.dialog.body.buttonControll.container.addClass('insm-lightbox-fb-moveToBottom');
                $('.insm-filebrowserlist-main').css("height", "140%");
                $('.insm-filebrowserlist-previewsection').css("height", "120vh");
            } else {
                browserState = 1;
                _plugin.htmlElements.content.dialog.container.addClass('insm-lightbox-fb-normal');
                _plugin.htmlElements.content.dialog.container.removeClass('insm-lightbox-fb-max');

                _plugin.htmlElements.content.dialog.header.buttonStatus.removeClass('insm-lightbox-fb-buttonStatusforRestore');
                _plugin.htmlElements.content.dialog.header.buttonStatus.addClass('insm-lightbox-fb-buttonStatusforMax');
                _plugin.htmlElements.content.dialog.body.buttonControll.container.removeClass('insm-lightbox-fb-moveToBottom');
                $('.insm-filebrowserlist-main').css("height", "300px");
                $('.insm-filebrowserlist-previewsection').css("height", "362px");
            }
        });

        if (contextObjectFB.options.filetype == Menutype.ALL) {
            if (contextObjectFB.options.forTemplateProperty == false) {
                _plugin.htmlElements.content.dialog.body.buttonControll.ok.hide();
                _plugin.htmlElements.content.dialog.body.buttonControll.cancel.text("Close");
            }
        }

        $.insmFramework('getDirectoryListForFileBrowser', {
            contentDirectoryName: 'Media',
            success: function (e) {
                rowFileInformation = [];
                currnetContentID = e.Id;
                var parentinfo = new Object();
                parentinfo.id = currnetContentID;
                parentinfo.name = 'Media';
                folderList = [];

                //Add RootFolder
                var obj = new Object();
                obj.Id = e.Id;
                obj.ParentId = 0;
                obj.RegionId = e.RegionId;
                obj.Name = e.Name;
                folderList.push(obj);
                //Call Recursive Function
                contextObjectFB._PrepareFolderList(e);
                $.data(document, "parentContentID", parentinfo);
                $.data(document, "currentContentID", 0);
                $.each(e.ContentDirectories, function (index, item) {
                    var row = {};
                    row.Id = item.Id;
                    row.isFolder = true;
                    row.data = item;
                    rowFileInformation.push(row);
                });
                $.insmFramework('getFileListForFileBrowser', {
                    contentDirectoryId: currnetContentID,
                    success: function (filesobject) {
                        var filetype = contextObjectFB._getFileType(contextObjectFB.options.filetype);
                        $.data(document, "FileListFromRemoteServer", filesobject.MediaFiles);
                        $.each(filesobject.MediaFiles, function (index, item) {
                            var row = {};
                            row.Id = item.Id;
                            row.isFolder = false;
                            row.data = item;
                            if (contextObjectFB.options.filetype != Menutype.ALL) {
                                if (filetype == item.FileTypeGroup) {
                                    rowFileInformation.push(row);
                                }
                            } else {
                                rowFileInformation.push(row);
                            }
                        });
                        fileListUI = rootUIFB.find("#filelistcontainer").FileBrowserList({
                            singleSelection: contextObjectFB.options.singleSelection,
                            filetype: contextObjectFB.options.filetype,
                            filelist: rowFileInformation,
                            folderlist: folderList,
                            onSelectedRows: function (e, data) {
                                $.data(rootUIFB, "selectedrow", data);
                            },
                            onSelectedRow: function (e, data) {
                                $.data(rootUIFB, "selectedrow", data);
                                var selecteddata = $.grep(rowFileInformation, function (item) {
                                    return item.Id == data;
                                })[0];
                                var path = $.insmFramework('getFileImageUrls', { id: data });
                                if (!selecteddata.isFolder) {
                                    contextObjectFB.activatePlayerControlBar(selecteddata.data.FileTypeGroup);
                                } else {
                                    contextObjectFB._removePreview();
                                }
                                if (!selecteddata.isFolder) {
                                    switch (selecteddata.data.FileTypeGroup) {
                                        case "Image":
                                            preview.previewUI("previewImage", path.original, "Loading " + selecteddata.data.OriginalFilename + "...");
                                            break;
                                        case "Video":
                                            preview.previewUI("previewMovie", path.original, "Loading Media...");
                                            break;
                                        case "Audio":
                                            preview.previewUI("previewAudio", path.original, "Loading Media...");
                                            break;
                                        case "Flash":
                                            preview.previewUI("previewFlash", path.original, "No Preview Available");
                                            break;
                                    }
                                    contextObjectFB._setdownload(selecteddata.data.OriginalFilename, path.original);
                                }
                                contextObjectFB._showFileInformation(data);

                            },
                            onFolderChange: function (e, data) {
                                $('.insm-filebrowserlist-foldername').text(data);
                            },
                            onUpdateFileList: function () {
                                rowFileInformation = fileListUI.FileBrowserList("getFileList");
                            },
                            onDeleteFolder: function () {
                                contextObjectFB._updateFolderList();
                            },
                            onSelectedDblClickRow: function (e, data) {
                                var fileInfo = new Object();
                                fileInfo.selectedFiles = data;
                                fileInfo.FileList = fileListUI.FileBrowserList("getFileList");
                                contextObjectFB._trigger('onFileSelection', e, fileInfo);
                                contextObjectFB.close_box();
                            }
                        });
                    }
                });
            }
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.Rename.on("click", function () {
            fileListUI.FileBrowserList('rename', $.data(rootUIFB, "selectedrow"));
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.Remove.on("click", function () {
            fileListUI.FileBrowserList('removeRow', $.data(rootUIFB, "selectedrow"));
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.ok.on("click", function (e) {
            if (FileBrowsermode == 1) {
                var fileInfo = new Object();
                fileInfo.selectedFiles = $.data(rootUIFB, "selectedrow");
                fileInfo.FileList = fileListUI.FileBrowserList("getFileList");
                if (fileInfo.FileList.length != 0) {
                    contextObjectFB._trigger('onFileSelection', e, fileInfo);
                }
                contextObjectFB.close_box();
            } else {
                if ($.data(rootUIFB, "selectedrow").indexOf(":") != -1) {
                    var selectedfiles = $.data(rootUIFB, "selectedrow").split(":");
                    var rowcount = 0;
                    var maxlength = selectedfiles.length;
                    $.each(selectedfiles, function (index, item) {
                        if (contextObjectFB._isFolderType(item) == false) {
                            $.insmFramework('moveFiles', {
                                fileId: selectedfiles[index],
                                contentdirectoryid: selectedFolderID,
                                success: function (e) {
                                    rowcount++;
                                    contextObjectFB._removeRow(item);
                                    if (rowcount == maxlength) {
                                        contextObjectFB._switchToPreviewMode();
                                    }
                                }
                            });
                        } else {
                            $.insmFramework('moveFolder', {
                                contentdirectoryid: Number(item),
                                parentcontentdirectoryid: selectedFolderID,
                                success: function (e) {

                                }
                            });
                            contextObjectFB._removeRow(Number(item));
                        }
                    });
                    contextObjectFB._updateFolderList();
                    contextObjectFB._switchToPreviewMode();
                } else {
                    var fileId = $.data(rootUIFB, "selectedrow");
                    if (contextObjectFB._isFolderType(fileId) == false) {
                        $.insmFramework('moveFiles', {
                            fileId: fileId,
                            contentdirectoryid: selectedFolderID,
                            success: function (e) {
                                contextObjectFB._removeRow($.data(rootUIFB, "selectedrow"));
                                contextObjectFB._switchToPreviewMode();
                            }
                        });
                    } else {
                        $.insmFramework('moveFolder', {
                            contentdirectoryid: Number($.data(rootUIFB, "selectedrow")),
                            parentcontentdirectoryid: selectedFolderID,
                            success: function (e) {

                            }
                        });
                        contextObjectFB._removeRow($.data(rootUIFB, "selectedrow"));
                        contextObjectFB._updateFolderList();
                        contextObjectFB._switchToPreviewMode();
                    }
                }
            }
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.cancel.on("click", function () {
            if (FileBrowsermode == 2) {
                _plugin.htmlElements.content.dialog.body.previewSection.container.show();
                _plugin.htmlElements.content.dialog.body.moveToSection.container.hide();
                _plugin.htmlElements.content.dialog.body.moveToSection.container.empty();
                FileBrowsermode = 1;
            } else {
                contextObjectFB.close_box();
            }
        });

        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.upfolder.on("click", function () {
            if ($.data(document, "parentContentID").id != 0) {
                fileListUI.FileBrowserList('LoadFileList', $.data(document, "parentContentID").name, $.data(document, "parentContentID").id);
            }
        });

        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.newfolder.on("click", function () {
            //$.data(document, "parentContentID").name, $.data(document, "parentContentID").id
            var row = {
                "Type": "ContentDirectory",
                "Id": 0,
                "ParentId": $.data(document, "parentContentID").id,
                "RegionId": "1",
                "Name": "New Folder",
                "Description": "",
                "ContentDirectories": null,
                "Creator": "",
                "CreationDate": "",
                "Modifier": "",
                "ModificationDate": "",
                "VersionId": 0,
                "Version": 0,
                "Action": "Unknown",
                "AccessLevel": null
            };
            fileListUI.FileBrowserList('addFolder', row);
        });

        _plugin.htmlElements.content.dialog.body.fileSection.folderInfo.search.searchbutton.on("click", function () {
            var searchdata = $("#txtsearch").val();
            var ardata = $.grep(rowFileInformation, function (item) {
                var targetstring;
                if (item.isFolder) {
                    targetstring = item.data.Name;
                } else {
                    targetstring = item.data.OriginalFilename;
                }
                return targetstring.indexOf(searchdata) != -1;
            });
            fileListUI.FileBrowserList("reloadFilterData", ardata);
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.Move.on("click", function () {
            _plugin.htmlElements.content.dialog.body.previewSection.container.hide();
            _plugin.htmlElements.content.dialog.body.moveToSection.container.show();
            _plugin.htmlElements.content.dialog.body.moveToSection.container.append("<span id='target'>");
            folderUI = $("#target").insmRemoteFolderViewer({
                data: folderList,
                title: "Where do you want to move the file?",
                onnodeSelection: function (e, data) {
                    selectedFolderID = data;
                }
            });
            FileBrowsermode = 2;
        });

        _plugin.htmlElements.content.dialog.body.buttonControll.upload.ui.attr("accept", contextObjectFB._setFileTypeForUpload(contextObjectFB.options.filetype));
    },

    //Update Folder List
    _updateFolderList: function () {
        $.insmFramework('getDirectoryListForFileBrowser', {
            contentDirectoryName: 'Media',
            success: function (e) {
                rowFileInformation = [];
                currnetContentID = e.Id;
                var parentinfo = new Object();
                parentinfo.id = currnetContentID;
                parentinfo.name = 'Media';
                folderList = [];
                //Add RootFolder
                var obj = new Object();
                obj.Id = e.Id;
                obj.ParentId = 0;
                obj.RegionId = e.RegionId;
                obj.Name = e.Name;
                folderList.push(obj);
                contextObjectFB._PrepareFolderList(e);
                fileListUI.FileBrowserList('updateFolderList', folderList);
            }
        });
    },

    //Activate Player control in case of  Audio/Video Media type
    activatePlayerControlBar: function (datatype) {
        var timecaption, totaltime;
        preview = _plugin.htmlElements.content.dialog.body.previewSection.previewsectioncontainer.previewUI({
            player: {},
            onplay: function (e, data) {
                totaltime = data.total;
                sliderUI = player.previewUIPlayercontrolbar('startPlayState', data);
                timecaption = $.data(document, "timecaption");
            },
            ontimeupdate: function (e, data) {
                sliderUI.insmSlider('setHeaderPosition', data.currentforslider);
                if (timecaption != undefined) {
                    timecaption.text(data.current + "/" + totaltime);
                }
            }
        });

        if (datatype == 'Flash' || datatype == 'Image') {
            $('.playlist-manager-preview-controlbutton-container').css("display", "none");
        } else {
            $('.playlist-manager-preview-controlbutton-container').empty();
            player = _plugin.htmlElements.content.dialog.body.previewSection.playcontrollercontainer.previewUIPlayercontrolbar({
                onplayClick: function () {
                    if (preview.previewUI('getCurrentMediaType') == 1) {
                        preview.previewUI('PreviewMoviePlay');
                    } else {
                        preview.previewUI('PreviewAudioPlay');
                    }
                },
                onpauseClick: function () {
                    if (preview.previewUI('getCurrentMediaType') == 1) {
                        preview.previewUI('PreviewMoviePause');
                    } else {
                        preview.previewUI('PreviewAudioPause');
                    }
                },
                onstopClick: function () {
                    if (preview.previewUI('getCurrentMediaType') == 1) {
                        preview.previewUI('PreviewMovieStop');
                    } else {
                        preview.previewUI('PreviewAudioStop');
                    }
                },
            });
        }
    },

    //Remove Preview and clean this area to load new preview
    _removePreview: function () {
        if (preview != null) {
            //preview.previewUI('destroy');
            _plugin.htmlElements.content.dialog.body.previewSection.playcontrollercontainer.hide();
        }
    },

    //Remove row from memory
    _removeRow: function (item) {
        if (FileBrowsermode == 2) {
            fileListUI.FileBrowserList('removeRowFromMemory', item);
        }
    },

    //Activate preivew portion
    _switchToPreviewMode: function () {
        if (FileBrowsermode == 2) {
            folderUI.insmRemoteFolderViewer('destroy');
            _plugin.htmlElements.content.dialog.body.previewSection.container.show();
            _plugin.htmlElements.content.dialog.body.moveToSection.container.hide();

            FileBrowsermode = 1;
        }
    },

    //download file
    _setdownload: function (data, url) {
        _plugin.htmlElements.content.dialog.body.buttonControll.download.attr("target", "_blank");
        _plugin.htmlElements.content.dialog.body.buttonControll.download.attr("href", url);
        _plugin.htmlElements.content.dialog.body.buttonControll.download.attr("download", data.substr(0, data.indexOf(".")));
    },

    //Show file information in preview window
    _showFileInformation: function (seleteditem) {
        var result = $.grep(rowFileInformation, function (item) {
            return item.Id == seleteditem;
        });
        var row = result[0];
        if (row.isFolder == false) {
            $('.insm-playlist-manager-filebrowser-preview-filename').text(row.data.OriginalFilename);
            $('.insm-playlist-manager-filebrowser-preview-filesize').text(Math.round(row.data.Length / 1024) + " kB");
            if (row.data.Attributes.hasOwnProperty("Duration")) {
                $('.insm-playlist-manager-filebrowser-preview-fileLength').text((row.data.Attributes.Duration / 1000).toString().toHHMMSS());
            }
        } else {
            $('.insm-playlist-manager-filebrowser-preview-filename').text(row.data.Name);
            $('.insm-playlist-manager-filebrowser-preview-filesize').text("");
            $('.insm-playlist-manager-filebrowser-preview-fileLength').text("");
        }
    },

    //Get perticular file type
    _getFileType: function (type) {
        var mediatype;
        switch (type) {
            case 1:
                mediatype = "Image";
                break;
            case 2:
                mediatype = "Video";
                break;
            case 3:
                mediatype = "Flash";
                break;
            case 9:
                mediatype = "Audio";
                break;
        }
        return mediatype;
    },

    //Check weather selected row is folder or not
    _isFolderType: function (rowId) {
        var obj = $.grep(rowFileInformation, function (item) {
            return item.Id == Number(rowId);
        })
        return obj[0].isFolder;
    },

    //Prepare folder list
    _PrepareFolderList: function (node) {
        if (node.hasOwnProperty("ContentDirectories")) {
            var folderlist = node.ContentDirectories;
            if (folderlist != undefined) {
                $.each(folderlist, function (index, item) {
                    var obj = new Object();
                    obj.Id = item.Id;
                    obj.ParentId = item.ParentId;
                    obj.RegionId = item.RegionId;
                    obj.Name = item.Name;
                    folderList.push(obj);
                    contextObjectFB._PrepareFolderList(item);
                });
            }
        }
    },

    //Set file type for upload
    _setFileTypeForUpload: function (type) {
        var mediatype;
        switch (type) {
            case 1:
                mediatype = "image/*";
                break;
            case 2:
                mediatype = "video/*";
                break;
            case 3:
                mediatype = ".swf|application/x-shockwave-flash";
                break;
            case 9:
                mediatype = "audio/*";
                break;
        }
        return mediatype;
    }

};

(function ($, undefined) {
    var contextObjectFB, rootUIFB, currnetContentID, preview, rowFileInformation, fileListUI, folderList;
    var player, FileBrowsermode, selectedFileID, selectedFolderID, folderUI, sliderUI, _plugin, browserState;
    $.widget("insm.insmFileBrowser", FileBrowserObject);
})(jQuery);

