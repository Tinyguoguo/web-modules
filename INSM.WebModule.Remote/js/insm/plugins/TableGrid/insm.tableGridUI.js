var tableGridUIManager = {
    version: "0.0.1",

    options: {
        xmldata: "",
        elementId:""
    },

    _init: function () {
        contextObject_tableGridUI = this;
        rootUI_tableGridUI = this.element;
        //Assign Dynamic ID
        cmdAddID = 'cmdAdd' + contextObject_tableGridUI.options.elementId;
        cmdRemoveID = 'cmdRemove' + contextObject_tableGridUI.options.elementId;
        cmdMoveUPId = 'cmdMoveUP' + contextObject_tableGridUI.options.elementId;
        cmdMoveDownId = 'cmdMoveDown' + contextObject_tableGridUI.options.elementId;
        cmdCopyId = 'cmdCopyId' + contextObject_tableGridUI.options.elementId;
        tableID = "tbl" + contextObject_tableGridUI.options.elementId;
        errorID = "span" + contextObject_tableGridUI.options.elementId;
        selectedRow = null;
        _tableGridUI = {};
        _tableGridUI.htmlElements = {
            content: {
                container: $('<div />'),
                buttonContainer: {
                    container: $('<div />').addClass("insm-playlist-manager-tableGridUI-toolBarDiv"),
                    buttonAdd: $('<Button>').text("Add").attr('id', cmdAddID),
                    buttonRemove: $('<Button>').text("Remove").attr('id', cmdRemoveID),
                    buttonUP: $('<Button>').text("UP").attr('id', cmdMoveUPId),
                    buttonDown: $('<Button>').text("Down").attr('id', cmdMoveDownId),
                    buttonCopy: $('<Button>').text("Copy").attr('id', cmdCopyId),
                    errorMessage: $('<span/>').addClass("insm-playlist-manager-modified-ui-gridError").attr("id", errorID)
                },
                tableContainer: {
                    container: $('<div />').attr("id", "cn" + contextObject_tableGridUI.options.elementId),
                    table: $('<table />').attr("id", tableID).attr("border", "0").addClass('insm-playlist-manager-tableGridUI-Table'),
                }
            }
        };

        rootUI_tableGridUI.append(_tableGridUI.htmlElements.content.container
            .append(_tableGridUI.htmlElements.content.buttonContainer.container
                .append(_tableGridUI.htmlElements.content.buttonContainer.buttonAdd)
                .append(_tableGridUI.htmlElements.content.buttonContainer.buttonRemove)
                .append(_tableGridUI.htmlElements.content.buttonContainer.buttonUP)
                .append(_tableGridUI.htmlElements.content.buttonContainer.buttonDown)
                .append(_tableGridUI.htmlElements.content.buttonContainer.buttonCopy)
                .append(_tableGridUI.htmlElements.content.buttonContainer.errorMessage))
            .append(_tableGridUI.htmlElements.content.tableContainer.container
                .append(_tableGridUI.htmlElements.content.tableContainer.table)));

        //Render Startup Table
        contextObject_tableGridUI._renderTableAtStartUp(contextObject_tableGridUI.options.xmldata);
        
        //Assign Events to Button
        $("#" + cmdAddID).on("click", function (e) {
            contextObject_tableGridUI._updateUIId($(e.currentTarget).attr("id").split("-")[1]);
            if ($("#" + tableID).find('tr').length <= Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text())) {
                var row = $("<tr>").attr('data-isrole', 'y').attr('data-rowid', "tr-" + Math.uuid(15));
                var ColumnCount = $(contextObject_tableGridUI.options.xmldata).find('DisplayName').length;
                for (var ictr = 0; ictr < ColumnCount; ictr++) {
                    var ItemCell = $("<td/>").attr("contenteditable", "true").text("");
                    row.append(ItemCell);
                }
                $("#" + tableID).append(row);
                row.on("click", tableGridUIManager.rowClick);

                if (selectedRow != null && $("#" + tableID).find('tr').length > 1) {
                    //contextObject_tableGridUI._setToolBarStaus("31");
                }
            } else {
                contextObject_tableGridUI._InvokeNotification("You've reached Maximum row limit");
                //contextObject_tableGridUI._setToolBarStaus("4");
            }
        });

        $("#" + cmdRemoveID).on("click", function (e) {
            contextObject_tableGridUI._updateUIId($(e.currentTarget).attr("id").split("-")[1]);
            if ($("#" + tableID).find('tr').length != 1) {
                switch ($("#" + tableID).find('tr').length - 1) {
                    case 1:
                        selectedRow.remove();
                        break;
                    case 2:
                        var nextRow;
                        if (selectedRow.index() == 1) {
                            nextRow = selectedRow.next();
                        } else {
                            nextRow = selectedRow.prev();
                        }
                        selectedRow.remove();
                        selectedRow = $(nextRow);
                        $(selectedRow).removeClass("insm-playlist-manager-tableGridUI-Table-deselectedRow");
                        $(selectedRow).addClass("insm-playlist-manager-tableGridUI-Table-selectedRow");
                        break;
                    default:
                        var nextRow = selectedRow.next();
                        selectedRow.remove();
                        selectedRow = $(nextRow);
                        $(selectedRow).removeClass("insm-playlist-manager-tableGridUI-Table-deselectedRow");
                        $(selectedRow).addClass("insm-playlist-manager-tableGridUI-Table-selectedRow");
                        break;
                }
            } else {
                contextObject_tableGridUI._InvokeNotification("No more row remain for remove.");
            }
        });

        $("#" + cmdMoveUPId).on("click", function (e) {
            contextObject_tableGridUI._updateUIId($(e.currentTarget).attr("id").split("-")[1]);
            if ($("#" + tableID).find('tr').length == 1) {
                contextObject_tableGridUI._InvokeNotification("No more row for move up.");
            } else if ($("#" + tableID).find('tr').length == 2) {
                contextObject_tableGridUI._InvokeNotification("No more row for move up.");
            } else if (selectedRow.index() == 1) {
                contextObject_tableGridUI._InvokeNotification("No more row for move up.");
            } else {
                if (selectedRow.prev().attr('data-isrole') == 'y') {
                        selectedRow.insertBefore(selectedRow.prev());
                }
            }
        });

        $("#" + cmdMoveDownId).on("click", function (e) {
            contextObject_tableGridUI._updateUIId($(e.currentTarget).attr("id").split("-")[1]);

            if ($("#" + tableID).find('tr').length == 1) {
                contextObject_tableGridUI._InvokeNotification("No more row for move down.");
            } else if ($("#" + tableID).find('tr').length == 2) {
                contextObject_tableGridUI._InvokeNotification("No more row for move down.");
            } else if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text()) + 1) {
                contextObject_tableGridUI._InvokeNotification("No more row for move down.");
            } else if (selectedRow.index() == $("#" + tableID).find('tr').length-1) {
                contextObject_tableGridUI._InvokeNotification("No more row for move down.");
            }else {
                selectedRow.insertAfter(selectedRow.next());
            }
        });

        $("#" + cmdCopyId).on("click", function (e) {
            contextObject_tableGridUI._updateUIId($(e.currentTarget).attr("id").split("-")[1]);
            if ($("#" + tableID).find('tr').length == 1) {
                contextObject_tableGridUI._InvokeNotification("No more row for copy.");
            } else if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text())) {
                contextObject_tableGridUI._InvokeNotification("No more row for copy.");
            } else {
                var cloneRow = selectedRow.clone();
                cloneRow.attr('data-rowid', "tr-" + Math.uuid(15));
                cloneRow.insertAfter(selectedRow);
                cloneRow.on("click", tableGridUIManager.rowClick);
            }
            
        });
    },

    rowClick: function (e) {
        if ($(e.target).parent().attr('data-isrole') == 'y') {
            selectedRow = $(e.target).parent();
            var selectedRowID = selectedRow.attr('data-rowid');
            $.each($("#" + tableID).find('tr'), function (index,item) {
                if (selectedRowID == $(item).attr('data-rowid')) {
                    selectedRow.removeClass("insm-playlist-manager-tableGridUI-Table-deselectedRow");
                    selectedRow.addClass("insm-playlist-manager-tableGridUI-Table-selectedRow");
                } else {
                    $(item).removeClass("insm-playlist-manager-tableGridUI-Table-selectedRow");
                    $(item).addClass("insm-playlist-manager-tableGridUI-Table-deselectedRow");
                }
            });
            //Set Button State
            //contextObject_tableGridUI._setToolBarStaus(contextObject_tableGridUI._getTableRowStatus(selectedRow));
            $("#" + cmdRemoveID).attr('disabled', false);
        }
    },

    _InvokeNotification: function (notificationText) {
        $("#" + errorID).css("opacity", "0");
        $("#" + errorID).html(notificationText);
        $("#" + errorID).css("background-color", "rgb(253,224,174)");
        $("#" + errorID).animate({ opacity: 1 }, 2000,
            function () {
                $("#" + errorID).animate({ opacity: 0 }, 5000, function () {
                    $("#" + errorID).css("background-color", "");
                });
            }
        );
    },


    _renderTableAtStartUp: function ($xdoc) {
        var xdoc = $.parseXML($xdoc);
        var row = $("<tr>").attr('data-isrole', 'n').attr('data-rowid', 'HeaderRow');

        $.each($(xdoc).find("DisplayName"), function (index, item) {
            var HeaderCell = $("<th/>").text($(item).text().split("|")[0].replace(";en", ""));
            row.append(HeaderCell);
        });
        $("#" + tableID).append(row);
        row.css("background-color", "#ffffff");
        //contextObject_tableGridUI._setToolBarStaus("0");
    },

    _setToolBarStaus: function (statusID) {
        switch (statusID) {
            case "0":
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', true);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', true);
                $("#" + cmdCopyId).attr('disabled', true);
                break;
            case "4":
                //All disable
                $("#" + cmdAddID).attr('disabled', true);
                $("#" + cmdRemoveID).attr('disabled', true);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', true);
                $("#" + cmdCopyId).attr('disabled', true);
                break;
            case "1":
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', true);
                $("#" + cmdCopyId).attr('disabled', false);
                console.log(statusID);
                break;
            case "21":
                console.log(statusID);
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', false);
                break;
            case "22":
                console.log(statusID);
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', false);
                $("#" + cmdMoveDownId).attr('disabled', true);
                $("#" + cmdCopyId).attr('disabled', false);
                break;
            case "23":
                console.log(statusID);
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', false);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', false);
                break;
            case "24":
                $("#" + cmdAddID).attr('disabled', true);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', true);
                console.log(statusID);
                break;
            case "25":
                $("#" + cmdAddID).attr('disabled', true);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', false);
                $("#" + cmdMoveDownId).attr('disabled', true);
                $("#" + cmdCopyId).attr('disabled', true);
                console.log(statusID);
                break;
            case "26":
                $("#" + cmdAddID).attr('disabled', true);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', false);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', true);
                console.log(statusID);
                break;
            case "27":
                //Full Table with Normal Up/Down Navigation
                console.log(statusID);
                $("#" + cmdAddID).attr('disabled', true);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', false);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', true);
                break;

            case "31":
                $("#" + cmdAddID).attr('disabled', false);
                $("#" + cmdRemoveID).attr('disabled', false);
                $("#" + cmdMoveUPId).attr('disabled', true);
                $("#" + cmdMoveDownId).attr('disabled', false);
                $("#" + cmdCopyId).attr('disabled', false);
                console.log(statusID);
                break;
        }
    },

    _isTableFull: function () {
        var flag;
        if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text()) + 1) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    },

    _getTableRowStatus: function (row) {
        var Status;
        if ($("#" + tableID).find('tr').length - 1 == 0) {
            //Zero Row
            Status = "0";
        } else if ($("#" + tableID).find('tr').length - 1 == 1) {
            //1-Row
            Status = "1";
        } else if ($("#" + tableID).find('tr').length - 1 > 2) {
            //N-Row
            if (row.index() == 1) {
                //First Row Selection
                if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text()) + 1) {
                    //With Full row
                    Status = "24";
                } else {
                    //Without Full row
                    Status = "21";
                }

            } else if (row.index() == $("#" + tableID).find('tr').length-1) {
                //Last Row Selection
                if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text()) + 1) {
                    //With Full row
                    Status = "25";
                } else {
                    //Without Full row
                    Status = "22";
                }
            } else if (row.index() < $("#" + tableID).find('tr').length) {
                //Normal Row Selection
                if ($("#" + tableID).find('tr').length == Number($(contextObject_tableGridUI.options.xmldata).find('AllowedNumberOfRows').text()) + 1) {
                    Status = "26";
                } else {
                    Status = "23";
                }
                
            }
        } else if ($("#" + tableID).find('tr').length - 1 == 2) {
            //Two Row
            //Status = 3;
            if (row.index() == 1) {
                //First Row Selection
                Status = "21";
            } else if (row.index() == $("#" + tableID).find('tr').length-1) {
                //Last Row Selection
                Status = "22";
            } 
        }
        return Status;
    },

    _updateUIId: function (ID) {
        cmdAddID = 'cmdAdd-' + ID;
        cmdRemoveID = 'cmdRemove-' + ID;
        cmdMoveUPId = 'cmdMoveUP-' + ID;
        cmdMoveDownId = 'cmdMoveDown-' + ID;
        cmdCopyId = 'cmdCopyId-' + ID;
        tableID = "tbl-" + ID;
        errorID = "span-" + ID;
    },

    _create: function () {

    },

    _destroy: function () {

    },

    _log: function (msg) {

    }
};

(function ($, undefined) {
    var contextObject_tableGridUI, rootUI_tableGridUI, _tableGridUI;
    var selectedRow;
    var cmdAddID, cmdRemoveID, cmdMoveUPId, cmdMoveDownId, cmdCopyId, tableID, errorID;
    $.widget("insm.tableGridUI", tableGridUIManager);
})(jQuery);