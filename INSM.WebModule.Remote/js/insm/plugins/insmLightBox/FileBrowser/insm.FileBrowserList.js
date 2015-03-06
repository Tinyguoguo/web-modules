
var FileBrowserList = {
    version: "0.0.1",

    options: {
        filelist: [],
        onSelectedRows: null,
        onSelectedRow: null,
        onSelectedDblClickRow: null,
        filetype: "",
        onReloadData: null,
        onFolderChange:null,
        folderlist: [],
        onDeleteFolder: null,
        onUpdateFileList: null,
        singleSelection:false,
    },

    //Start rendering for plugin
    _init: function () {
        arrayManager = new ArrayUtility();
        contextObject_FileBrowserList = this;
        rootUI_FileBrowserList = this.element;
        container = rootUI_FileBrowserList.html("<div />").children("div").addClass("insm-filebrowserlist-main");
        filelistview = container.append("<table id='filelistview'/>").children("#filelistview");
        contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
    },

    //Reload entire List
    _reload: function (filelist) {
        $.each(filelist, function (index, item) {
            if (item.isFolder) {
                filelistview.append("<tr class='insm-filebrowserlist-tr' data-foldername='"+item.data.Name+"' data-isfolder='y'  data-id='" + item.Id + "'><td class='insm-filebrowserlist-foldericonForList'></td><td class='insm-filebrowserlist-filename'>" + item.data.Name + "</td></tr>");
            } else {
                if (contextObject_FileBrowserList.options.filetype == Menutype.ALL) {
                    filelistview.append("<tr class='insm-filebrowserlist-tr' data-isfolder='n' data-id='" + item.data.Id + "'><td class='" + contextObject_FileBrowserList._getFileIcon(item.data.FileTypeGroup) + "'></td><td class='insm-filebrowserlist-filename'>" + item.data.Name + "</td></tr>")
                } else {
                    filelistview.append("<tr class='insm-filebrowserlist-tr' data-isfolder='n' data-id='" + item.data.Id + "'><td class='" + contextObject_FileBrowserList._getFileType(contextObject_FileBrowserList.options.filetype) + "'></td><td class='insm-filebrowserlist-filename'>" + item.data.Name + "</td></tr>");
                }
                //filelistview.append("<tr class='insm-filebrowserlist-tr' data-isfolder='n' data-id='" + item.data.Id + "'><td class='" + contextObject_FileBrowserList._getFileType(contextObject_FileBrowserList.options.filetype) + "'></td><td class='insm-filebrowserlist-filename'>" + item.data.Name + "</td></tr>");
            }
        });
        $(".insm-filebrowserlist-tr").on("click", function (event) {
            event.preventDefault();
            if (contextObject_FileBrowserList.options.singleSelection) {
                $(".insm-filebrowserlist-tr").removeClass("insm-filebrowserlist-selected-row");
                $(this).addClass("insm-filebrowserlist-selected-row");
                contextObject_FileBrowserList._trigger('onSelectedRow', event, $(this).attr("data-id"));
            } else {
                if (event.ctrlKey) {
                    var selectedrows = [];
                    $(this).toggleClass('insm-filebrowserlist-selected-row');
                    var gr = $(".insm-filebrowserlist-selected-row");
                    $.each(gr, function (index, item) {
                        selectedrows.push($(item).attr("data-id"))
                    });
                    contextObject_FileBrowserList._trigger('onSelectedRows', event, selectedrows.join(":"));
                } else {
                    $(".insm-filebrowserlist-tr").removeClass("insm-filebrowserlist-selected-row");
                    $(this).addClass("insm-filebrowserlist-selected-row");
                    contextObject_FileBrowserList._trigger('onSelectedRow', event, $(this).attr("data-id"));
                }
            }
        });

        $(".insm-filebrowserlist-tr").on("dblclick", function (e) {
            if ($(this).attr("data-isfolder") == 'y') {
                e.preventDefault();
                var $tablerow = $(this);
                var currentID = $(this).attr("data-id");
                $.data(rootUI_FileBrowserList, "currentID", $(this).attr("data-id"));
                contextObject_FileBrowserList._RenderMediaList($tablerow.attr("data-foldername"), $(this).attr("data-id"));
            } else {
                $(".insm-filebrowserlist-tr").removeClass("insm-filebrowserlist-selected-row");
                $(this).addClass("insm-filebrowserlist-selected-row");
                contextObject_FileBrowserList._trigger('onSelectedDblClickRow', event, $(this).attr("data-id"));
            }
        });
    },

    //Public function for get File List
    getFileList: function () {
        return contextObject_FileBrowserList.options.filelist;
    },

    //Render FileList based on current Foldername and Folder id
    _RenderMediaList: function (currentFolderName, currentFolderId) {
        //$.data(document, "parentContentID").name, $.data(document, "parentContentID").id
        //console.log(contextObject_FileBrowserList.options.folderlist);
        $.data(document, "parentContentID", contextObject_FileBrowserList._getParentInfo(currentFolderId));
        var rowFileInformation = [];
        var currentfolders = $.grep(contextObject_FileBrowserList.options.folderlist, function (item) {
            return item.ParentId == currentFolderId;
        });
        $.each(currentfolders, function (index, item) {
            var row = {};
            row.Id = item.Id;
            row.isFolder = true;
            row.data = item;
            rowFileInformation.push(row);
        });

        $.insmFramework('getFileListForFileBrowser', {
            contentDirectoryId: currentFolderId,
            success: function (e) {
                contextObject_FileBrowserList._trigger("onFolderChange", e, currentFolderName);
                var currentinfo = new Object();
                currentinfo.id = currentFolderId;
                currentinfo.name = currentFolderName;

                if ($.data(document, "currentContentID") == 0) {
                    $.data(document, "currentContentID", currentinfo);
                } else {
                    //later
                    //$.data(document, "parentContentID", $.data(document, "currentContentID"));
                    //$.data(document, "currentContentID", $tablerow.attr("data-id"));
                }
                filelistview.empty();
                var filetype = contextObjectFB._getFileType(contextObjectFB.options.filetype);
                $.each(e.MediaFiles, function (index, item) {
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
                contextObject_FileBrowserList.options.filelist = rowFileInformation;
                contextObject_FileBrowserList._trigger("onUpdateFileList");
                contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
            }
        });
    },

    //Get Parent folder information
    _getParentInfo:function (currentID) {
        var result = $.grep(contextObject_FileBrowserList.options.folderlist, function (item) {
            return item.Id == currentID;
        });

        if (result.length != 0) {
            var parentId = result[0].ParentId;
            var parentName;
            $.each(contextObject_FileBrowserList.options.folderlist, function (index, item) {
                if (Number(item.Id) == Number(parentId)) {
                    parentName = item.Name;
                }
            })
        } else {
            var parentId = 0;
            var parentName = "";;
        }
        var parentinfo = new Object();
        parentinfo.id = parentId;
        parentinfo.name = parentName;
        return parentinfo;
    },

    //Public function  for update file List
    updateFolderList: function (folderList) {
        contextObject_FileBrowserList.options.folderlist = folderList;
    },

    //Add new File into memory
    addRow: function (rowitem) {
        filelistview.empty();
        contextObject_FileBrowserList.options.filelist.push(rowitem);
        contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
    },

    //Add Folder into memory
    addFolder: function (rowdata) {
        var row = {};
        row.Id = 0;
        row.isFolder = true;
        row.data = rowdata;
        contextObject_FileBrowserList.options.filelist.splice(0, 0, row);
        filelistview.empty();
        contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
        contextObject_FileBrowserList.rename('0');
    },

    //Remove Folder from memory
    removeRow: function (item) {
        var result = confirm("Are you sure you want to remove the selected items");
        if (result) {
            var selecteditem;
            if (item.indexOf(":") != -1) {
                selecteditem = item.split(":");
                $.each(selecteditem, function (index, item) {
                    contextObject_FileBrowserList._deletefile(item)
                });
                $.each(selecteditem, function (index, item) {
                    contextObject_FileBrowserList._removeElementFromArray(item);
                });
            } else {
                contextObject_FileBrowserList._deletefile(item);
                contextObject_FileBrowserList._removeElementFromArray(item);
            }
            filelistview.empty();
            contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
        }
    },

    //Remove row from Memory
    removeRowFromMemory: function (item) {
        contextObject_FileBrowserList._removeElementFromArray(item);
        filelistview.empty();
        contextObject_FileBrowserList._reload(contextObject_FileBrowserList.options.filelist);
    },

    //Rename File or Folder
    rename: function (item) {
        var selecteditem;
        if (item.indexOf(":") != -1) {
            selecteditem = item.split(":")[0];
        } else {
            selecteditem = item;
        }
        var expression = "#filelistview tr[data-id=" + selecteditem + "] td:nth-child(2)";
        var cell = $(expression);
        var cellpointer = cell.get(0);
        var cellpointertd = cell;
        var OriginalContent = $(cellpointer).text();
        $(cellpointer).addClass("cellEditing");
        $(cellpointer).html("<input id='txtdata' style='height:10px;width:90%' type='text' value='" + OriginalContent + "' />");
        $(cellpointer).children().first().focus();

        contextObject_FileBrowserList._createSelection($("#txtdata").get(0), 0, $("#txtdata").val().indexOf("."));
        $(cellpointer).children().first().keypress(function (e) {
            if (e.which == 13) {
                var newContent = $(cellpointer).val();
                $(cellpointer).parent().text(newContent);
                $(cellpointer).parent().removeClass("cellEditing");
                contextObject_FileBrowserList._renameFile(selecteditem, $("#txtdata").val())
            }
        });
        $(cellpointer).children().first().blur(function () {
            var newContent = $("#txtdata").val();
            cellpointertd.text(newContent);
            cellpointertd.removeClass("cellEditing");
            contextObject_FileBrowserList._renameFile(selecteditem,newContent)

        });
        $(cellpointer).find('input').dblclick(function (e) {
            e.stopPropagation();
        });
    },

    //public function for Get Current Folder information
    getcurrentFolderInfo: function () {
        var currenFolderID = $.data(rootUI_FileBrowserList, "currentID") == undefined ? currnetContentID : $.data(rootUI_FileBrowserList, "currentID");
        var result=$.grep(contextObject_FileBrowserList.options.folderlist, function (item) {
            return item.Id == currenFolderID;
        });
        return result[0];
    },

    //public function for Search file or folder
    reloadFilterData: function (filelist) {
        filelistview.empty();
        contextObject_FileBrowserList._reload(filelist);
        contextObject_FileBrowserList.options.filelist = filelist
    },

    //public function Load file list 
    LoadFileList: function (currentFolderName, currentFolderId) {
        contextObject_FileBrowserList._RenderMediaList(currentFolderName, currentFolderId);
    },

    //Call this function when initialize plugin
    _create: function () {
        contextObject_FileBrowserList = this;
        rootUI_FileBrowserList = this.element;
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI_FileBrowserList.empty();
    },

    //Trace on cosole window
    _log: function (msg) {
        console.log(msg);
    },

    //Remove perticular row from memory
    _removeElementFromArray: function (item) {
        var index = arrayManager.getElementLocation(contextObject_FileBrowserList.options.filelist, "Id", item);
        contextObject_FileBrowserList.options.filelist.splice(index, 1)
    },

    //Get File Icon based on type
    _getFileIcon: function (type) {
        var icontype;
        switch (type) {
            case "Image":
                icontype = "insm-filebrowserlist-imageicon";
                break;
            case "Video":
                icontype = "insm-filebrowserlist-movieIcon";
                break;
            case "Flash":
                icontype = "insm-filebrowserlist-flashIcon";
                break;
        }
        return icontype;
    },

    //Get media type
    _getFileType: function (type) {
        var icontype;
        switch (type) {
            case 1:
                icontype = "insm-filebrowserlist-imageicon";
                break;
            case 2:
                icontype = "insm-filebrowserlist-movieIcon";
                break;
            case 3:
                icontype = "insm-filebrowserlist-flashIcon";
                break;
        }
        return icontype;
    },

    //check media type
    _checkItemType: function (selecteditem) {
        var row = $.grep(contextObject_FileBrowserList.options.filelist, function (item) {
            return item.Id == selecteditem;
        });
        return row[0].isFolder;
    },

    //Rename file or folder
    _renameFile: function (selecteditem, newContent) {
        if (selecteditem == '0') {
            $.insmFramework('createFolder', {
                ParentContentDirectoryId: $.data(rootUI_FileBrowserList, "currentID") == undefined ? currnetContentID : $.data(rootUI_FileBrowserList, "currentID"),
                ContentDirectoryName: newContent,
                success: function (e) {
                    contextObject_FileBrowserList._trigger('onDeleteFolder');
                }
            });
        } else {
            if (contextObject_FileBrowserList._checkItemType(selecteditem)) {
                $.insmFramework('reNameFolder', {
                    directoryid: selecteditem,
                    directoryname: newContent,
                    success: function (e) {

                    }
                });
            } else {
                $.insmFramework('updateFile', {
                    FileId: selecteditem,
                    name: newContent,
                    success: function (e) {

                    }
                });
            }
        }
    },

    //Create Selection for rename
    _createSelection: function (field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else if (field.selectionStart) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    },

    //Delete file
    _deletefile: function (selecteditem) {
        var rows = $('.insm-filebrowserlist-tr');
        var result = $.grep(rows, function (item) {
            return $(item).attr("data-id") == selecteditem;
        });
        if ($(result[0]).attr("data-isfolder") == 'y') {
            $.insmFramework('removeFolder', {
                directoryid: selecteditem,
                success: function (e) {
                    contextObject_FileBrowserList._trigger('onDeleteFolder');
                }
            });
        } else {
            $.insmFramework('deleteFile', {
                id: selecteditem,
                success: function (e) {

                }
            });
        }
    }
};

(function ($, undefined) {
    var container, filelistview;
    var contextObject_FileBrowserList, rootUI_FileBrowserList;
    var arrayManager;
    $.widget("insm.FileBrowserList", FileBrowserList);
})(jQuery);