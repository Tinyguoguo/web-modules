var FolderBrowserList = {
    version: "0.0.1",

    options: {
        renderHtml: '',
        thumbnailContainer: {},
        onsubmit: null,
        oncancel: null,
        filetype: ""
    },

    _init: function () {
        this._RenderLightbox();
    },

    _create: function () {
        contextObjectFolder = this;
    },

    close_box: function (event) {
        $('.insm-lightbox-fb-backdrop, .insm-lightbox-fb-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
            $('.insm-lightbox-fb-backdrop, .insm-lightbox-fb-box').css('display', 'none');
        });
        rootUIFolder.empty();
    },

    cmdupload_click: function (e) {
        //contextObjectFolder.close_box();
        $("#divpopup").insmServerProcessingLoader({ text: 'Uploading Image..' });
        $("#divpopup").insmServerProcessingLoader("InvokeDialog");
        var picReader = new FileReader();
        var imgdata = $("<img />");
        picReader.readAsDataURL(e.target.files[0]);
        var filename = e.target.files[0].name;
        $.data(document, "filename", filename);
        picReader.addEventListener("load", function (e) {
            alert("done with load");
            //var img = e.target.result;
            //imgdata.attr("src", img);
            //imgdata.on("load", function (e) {
            //    if (this.width > $("#thumbnailviewer").width()) {
            //        imgdata.css("width", "90%");
            //        imgdata.addClass("insm-playlistmanager-ImageThumbnailview");
            //        imgdata.css("margin-left", "2%");

            //    } else {
            //        imgdata.addClass("insm-playlistmanager-ImageThumbnailview");
            //        imgdata.css("margin-left", this.width / 2);
            //    }
            //});
        });

        $.insmFramework('uploadFile', {
            fileInputElement: $(e.currentTarget),
            name: filename,
            progress: function (data) {
                contextObjectFolder._log(data);
            },
            regionId: 2,
            directoryName: "Media",
            properties: e.currentTarget,
            done: function (data) {
                contextObjectFolder._log(data);
                //contextObjectFolder.close_box();
                //$("#thumbnailviewer").html(imgdata.get(0));
                $("#divpopup").insmServerProcessingLoader("closeDialog");
            }
        });
    },

    _destroy: function () {
        currnetContentID = 0;
    },

    _log: function (msg) {
        console.log(msg);
    },

    _RenderLightbox: function () {
//        var strhtml = " <div id='filesection' class='insm-folderbrowserlist-filesection'> <div id='folderinfo' > <div id='foldericon' class='insm-folderbrowserlist-foldericon' > <span id='foldername' class='insm-folderbrowserlist-foldername'>Test Folder</span> </div> <div id='upfolder' class='insm-folderbrowserlist-upfolder'> <img src='FileBrowser/FileList/icons/levelUpIcon.png' /> </div> </div> <div id='folderlistcontainer' > folder List UI </div> <div id='buttoncontrol' class='insm-folderbrowserlist-buttoncontrol'> <button class='button'>OK</button> <button class='button'>Cancel</button> </div> </div>";

        var strhtml = "<div class='insm-lightbox-folder-box'> <div class='insm-lightbox-header'>Select File<span class='insm-lightbox-fb-close'></span></div>" +
                    "<div class='insm-playlistManager-folderbrowser-maincontainer' id='foldercontainer'>" +
                    "<div id='filesection' class='insm-folderbrowserlist-filesection'> <div id='folderinfo' > <div id='foldericon' class='insm-folderbrowserlist-foldericon' > <span id='foldername' class='insm-folderbrowserlist-foldername'>Test Folder</span> </div> <div id='upfolder' class='insm-folderbrowserlist-upfolder'> <img src='' /> </div> </div> <div id='folderlistcontainer' > folder List UI </div> <div id='buttoncontrol' class='insm-folderbrowserlist-buttoncontrol'> <button class='button'>OK</button> <button class='button'>Cancel</button> </div> </div> " +
                    "</div></div>";
        
        rootUIFolder = this.element;
        rootUIFolder.html(strhtml);

        //$('.insm-lightbox-fb-backdrop, insm-lightbox-fb-box').animate({ 'opacity': '.50' }, 300, 'linear');
        $('.insm-lightbox-folder-box').animate({ 'opacity': '1.00' }, 300, 'linear');
        $('.insm-lightbox-folder-box').css('display', 'block');
        this._on($('.insm-lightbox-fb-close'), { click: "close_box" });


        //rootUIFolder.find("#cmdrename").on("click", function () {
        //    fileListUI.FileBrowserList('rename', $.data(rootUIFolder, "selectedrow"));
        //});

        //rootUIFolder.find("#cmdremovefile").on("click", function () {
        //    fileListUI.FileBrowserList('removeRow', $.data(rootUIFolder, "selectedrow"));
        //});

        //rootUIFolder.find("#cmdokfb").on("click", function () {
        //    contextObjectFolder.close_box();
        //});

        //rootUIFolder.find("#cmdcancelfb").on("click", function () {
        //    contextObjectFolder.close_box();
        //});

        //rootUIFolder.find(".insm-playlist-manager-filebrowser-upfolder").on("click", function () {
        //    fileListUI.FileBrowserList('LoadFileList', $.data(document, "parentContentID").name, $.data(document, "parentContentID").id);
        //});

        //rootUIFolder.find(".insm-playlist-manager-filebrowser-newfolder").on("click", function () {
        //    //$.data(document, "parentContentID").name, $.data(document, "parentContentID").id
        //    var row = {
        //        "Type": "ContentDirectory",
        //        "Id": 0,
        //        "ParentId": $.data(document, "parentContentID").id,
        //        "RegionId": "1",
        //        "Name": "New Folder",
        //        "Description": "",
        //        "ContentDirectories": null,
        //        "Creator": "",
        //        "CreationDate": "",
        //        "Modifier": "",
        //        "ModificationDate": "",
        //        "VersionId": 0,
        //        "Version": 0,
        //        "Action": "Unknown",
        //        "AccessLevel": null
        //    };
        //    fileListUI.FileBrowserList('addFolder', row);
        //});

        //rootUIFolder.find(".insm-playlist-manager-filebrowser-search").on("click", function () {
        //    var searchdata = $("#txtsearch").val();
        //    var ardata = $.grep(rowFileInformation, function (item) {
        //        var targetstring;
        //        if (item.isFolder) {
        //            targetstring = item.data.Name;
        //        } else {
        //            targetstring = item.data.OriginalFilename;
        //        }
        //        return targetstring.indexOf(searchdata) != -1;
        //    });
        //    fileListUI.FileBrowserList("reloadFilterData", ardata);
        //});

        //$('#files').attr("accept", contextObjectFolder._setFileTypeForUpload(contextObjectFolder.options.filetype));
    },

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
                mediatype = "";
                break;
        }
        return mediatype;
    },

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
    var contextObjectFolder, rootUIFolder, currnetContentID, rowFileInformation, fileListUI;
    $.widget("insm.insmFolderBrowserList", FolderBrowserList);
})(jQuery);

