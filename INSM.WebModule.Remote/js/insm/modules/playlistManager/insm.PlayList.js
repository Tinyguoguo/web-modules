var contextObject, contextObjectGrid, rootUIGrid, grid, colModel, ardb, gridInlineData, todayDateObject, dateObject, selectedFilterValue;
var m_bln_data = false;
var PlayListManager = {
    version: "0.0.1",

    options: {
        searchui: {},
        filterUI: {},
        refreshButton: {},
        onfinishedload: null,
        ongetdirectoryId: null
    },
    sortme: function () {
        rootUIGrid.find("#jqgh_grddata_Name").click();
    },
    _init: function () {
        contextObject = this;
        contextObjectGrid = this;
        rootUIGrid = this.element;

    },
    getRegionTree: function (regiontreeparam) {
        $.data(document, "regiontree", regiontreeparam);
        $.data(document, "regiontree").insmRegionTreeViewUI({
            ondeselectall: function (e, selectedlist) {
                $.each(selectedlist.ar, function (index, item) {
                    var obj = $.grep(ardb, function (row) {
                        var str = row.regionID.join();
                        if (str.indexOf(item.id) != -1) {
                            row.in_use = 'n';
                            row.regionID = [];
                        }
                    });
                });
                grid.jqGrid('setGridParam', {
                    datatype: "jsonstring",
                    datastr: ardb,
                }).trigger("reloadGrid");
                console.log(ardb);
            }
        });
    },
    _create: function () {
        contextObject = this;
        ggrid = this,
        contextObjectGrid = this;
        rootUIGrid = this.element;
        rootUIGrid.html("<table id='grddata'></table><div id='divpopup'></div>");
        this.options.filterUI.change(function () {

            dateObject = new Date();
            todayDateObject = new Date();
            gridInlineData = new Array();

            selectedFilterValue = $('option:selected', this).val();
            grid.jqGrid("clearGridData", true).trigger("reloadGrid");

            switch (selectedFilterValue) {
                case '1': // Show all
                    $.each(ardb, function (index, value) {
                        gridInlineData.push(value);
                    });
                    break;
                case '2'://Only published
                    $.each(ardb, function (index, value) {
                        if (ardb[index].in_use == "y") {
                            gridInlineData.push(value);
                        }
                    });
                    break;
                case '3'://With old versions published
                    break;
                case '4'://Modified last 7 days
                    dateObject.setDate(dateObject.getDate() - 7);
                    $.each(ardb, function (index, value) {
                        if (ProcessMediaArray.convertDate(ardb[index].modified_date) >= ProcessMediaArray.convertDate(dateObject) && ProcessMediaArray.convertDate(ardb[index].modified_date) <= ProcessMediaArray.convertDate(todayDateObject)) {
                            gridInlineData.push(value);
                        }
                    });
                    break;
                case '5'://Modified last 30 days
                    dateObject.setDate(dateObject.getDate() - 30);
                    $.each(ardb, function (index, value) {
                        if (ProcessMediaArray.convertDate(ardb[index].modified_date) >= ProcessMediaArray.convertDate(dateObject) && ProcessMediaArray.convertDate(ardb[index].modified_date) <= ProcessMediaArray.convertDate(todayDateObject)) {
                            gridInlineData.push(value);
                        }
                    });
                    break;
                case '6'://Landscape
                    $.each(ardb, function (index, value) {
                        if (ardb[index].orientation == "Landscape") {
                            gridInlineData.push(value);
                        }
                    });
                    break;
                case '7'://Portrait
                    $.each(ardb, function (index, value) {
                        if (ardb[index].orientation == "Portrait") {
                            gridInlineData.push(value);
                        }
                    });
                    break;
                default:
            }
            for (var item = 0; item <= gridInlineData.length; item++) {
                grid.jqGrid('addRowData', item, gridInlineData[item]);
            }
        });
        this.options.refreshButton.on("click", function () {
            $("#divpopup").insmServerProcessingLoader({ text: 'Loading Data..' });
            $("#divpopup").insmServerProcessingLoader("InvokeDialog");
            ardb = [];
            grid.jqGrid('setGridParam', {
                datatype: "jsonstring",
                datastr: ardb,
            }).trigger("reloadGrid");
            $.insmFramework('getDirectoryInformation', {
                regionid: 1,
                contentDirectoryName: 'Data',
                success: function (e) {
                    $.insmFramework('getPlayList', {
                        contentdirectoryid: e.Id,
                        success: function (data) {
                            grid = rootUIGrid.find("#grddata");
                            ggrid._assignSearchevents(ggrid.options.searchui);
                            var rowarraysimple = ProcessMediaArray.fetchRowArray(data.MediaFiles);
                            ardb = ProcessMediaArray.processArray(rowarraysimple);
                            grid.jqGrid('setGridParam', {
                                datatype: "jsonstring",
                                datastr: ardb,
                            }).trigger("reloadGrid");
                            $("#divpopup").insmServerProcessingLoader("closeDialog");
                        }
                    });
                }
            });
        });
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Data',
            success: function (e) {
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        ggrid._trigger('ongetdirectoryId', e, e.Id);
                        grid = rootUIGrid.find("#grddata");
                        ggrid._assignSearchevents(ggrid.options.searchui);
                        var rowarraysimple = ProcessMediaArray.fetchRowArray(data.MediaFiles);
                        ardb = ProcessMediaArray.processArray(rowarraysimple);
                        grid.jqGrid({
                            datatype: "jsonstring",
                            datastr: ardb,
                            loadComplete: function () {
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'versions', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'name', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'modified_date', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'modified_by', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'orientation', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'Resolution', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'in_use', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'publish', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'edit', '', { 'vertical-align': 'bottom' });
                                rootUIGrid.find("#grddata").jqGrid('setLabel', 'remove', '', { 'vertical-align': 'bottom' });
                                contextObject._trigger("onfinishedload");
                            },
                            colModel: [
                                { name: 'id', label: 'ID', index: 'id', hidden: true },
                                { name: 'versions', label: 'Versions', index: 'versions', width: 100, sortable: false },
                                {
                                    name: 'in_use', label: 'In Use', width: 60, sortable: false, align: "center", formatter: function (item) {
                                        debugger;
                                        if (item == 'y') {
                                            return '<img src="css/insm/modules/playlistManager/icons/In Use.png" style="cursor:pointer"  />';
                                        } else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    name: 'publish', label: 'Publish', width: 60, sortable: false, align: "center", formatter: function (item) {
                                        return '<img src="css/insm/modules/playlistManager/icons/general_publish.png" class="insm-playlisteditor-playlist-grid-publish"  />';
                                    }
                                },
                                {
                                    name: 'edit', label: 'Edit', width: 60, sortable: false, align: "center", formatter: function (item) {
                                        return '<img src="css/insm/modules/playlistManager/icons/edit.png" class="insm-playlisteditor-playlist-grid-edit"  />';
                                    }
                                },
                                { name: 'name', label: 'Name', width: 100 },
                                {
                                    name: 'modified_date', label: 'Modified Date', align: "left", formatter: function (item) {
                                        return ProcessMediaArray.convertDate(item) + " " + ProcessMediaArray.convertTime(item);
                                    }
                                },
                                { name: 'modified_by', label: 'Modified By', width: 90, align: "left" },
                                 { name: 'orientation', label: 'Orientation', width: 90, align: "left" },
                                { name: 'Resolution', label: 'Resolution', width: 100, align: "left" },
                                {
                                    name: 'remove', label: 'Remove', sortable: false, width: 100, align: "center", formatter: function (item) {
                                        return '<img src="css/insm/modules/playlistManager/icons/delete.png" class="insm-playlisteditor-playlist-grid-remove"  />';
                                    }
                                }
                            ],
                            onCellSelect: function (rowid, index, contents, event) {
                                switch (index) {
                                    case 2:
                                        var rowitem = $.grep(ardb, function (item) {
                                            return item.id == rowid;
                                        });
                                        $.data(document, "regiontree").insmRegionTreeViewUI("AssignNodes", rowitem[0].regionID);
                                        break;
                                    case 3:
                                        var selectednodes = $.data(document, "nodes");
                                        console.log(selectednodes)
                                        var ictr = 0;
                                        $('#divpopup').insmPublish({
                                            onok: function () {
                                                $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                                $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                                $.each(selectednodes, function (index, item) {
                                                    $.insmFramework('PublishPlayList', {
                                                        datasetid: item.datasetid,
                                                        datasetitemkey: item.datasetitemkey,
                                                        value: rowid,
                                                        DataSetItemType: 'Archive',
                                                        success: function (e) {
                                                            // Close the loader popup on last call
                                                            ictr++;
                                                            if (ictr == selectednodes.length) {
                                                                $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                                contextObject._log(e);
                                                            }
                                                            //Set the Icon
                                                            var rowitem = $.grep(ardb, function (item) {
                                                                return item.id == grid.jqGrid('getRowData', rowid).id;
                                                            });
                                                            rowitem[0].in_use = "y";
                                                            rowitem[0].regionID = [];
                                                            $.each(selectednodes, function (index, item) {
                                                                rowitem[0].regionID.push(item.id)
                                                            });
                                                            grid.jqGrid('setGridParam', {
                                                                datatype: "jsonstring",
                                                                datastr: ardb,
                                                            }).trigger("reloadGrid");
                                                        }
                                                    });
                                                });
                                            },
                                            oncancel: function () {

                                            }
                                        });

                                        $('#divpopup').insmPublish("InvokeDialog");
                                        break;
                                    case 4:
                                        alert('edit');
                                        break;
                                    case 10:
                                        var rowobj = grid.jqGrid('getRowData', rowid);

                                        var rowitem = $.grep(ardb, function (item) {
                                            return item.name == rowobj.name;
                                        });
                                        if (rowitem.length > 1) {
                                            $("#divpopup").insmRemovePlayList({
                                                onRemoveNewest: function () {
                                                    $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                                    $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                                    var removerowid = rowitem[1].id;
                                                    console.log(removerowid);
                                                    $.insmFramework('RemovePlayList', {
                                                        fileId: removerowid,
                                                        success: function (e) {
                                                            $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                            grid.jqGrid('delRowData', removerowid);
                                                        },
                                                        denied: function () {
                                                            alert("error");
                                                        }
                                                    });
                                                },
                                                onRemoveAll: function () {
                                                    $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                                    $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                                    $.each(rowitem, function (index, item) {
                                                        $.insmFramework('RemovePlayList', {
                                                            fileId: item.id,
                                                            success: function (e) {
                                                                grid.jqGrid('delRowData', item.id);
                                                            },
                                                            denied: function () {
                                                                alert("error");
                                                            }
                                                        });
                                                    });
                                                    $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                },
                                                oncancel: function () {

                                                }
                                            });
                                            $("#divpopup").insmRemovePlayList("InvokeDialog");
                                        } else {
                                            $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                            $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                            $.insmFramework('RemovePlayList', {
                                                fileId: rowid,
                                                success: function (e) {
                                                    $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                    grid.jqGrid('delRowData', rowid);
                                                },
                                                denied: function () {
                                                    alert("error");
                                                }
                                            });
                                        }
                                        break;
                                }
                            },
                            gridComplete: function () {
                                //$.each($("#treegrid tr"), function (index, item) {
                                //    console.log($(item).attr("id"));
                                //    if ($(item).attr("id") != 1996) {
                                //        var tablecell = $(item).find("td")[0];
                                //        $(tablecell).find("div").css("display", "none")
                                //    }
                                //});
                            },
                            height: 'auto',
                            //treeGrid: true,
                            //treeGridModel: 'adjacency',
                            //treedatatype: "local",
                            //ExpandColumn: 'versions',
                            jsonReader: {
                                repeatitems: false,
                                root: function (obj) { return obj; },
                                page: function () { return 1; },
                                total: function () { return 1; },
                                records: function (obj) { return obj.length; }
                            }
                        });
                    }
                });
            }
        });
    },
    setDataForPublish: function (selectednodes) {
        if (selectednodes.length == 0) {
            $.data(document, "nodes", []);
        } else {
            $.data(document, "nodes", selectednodes);
        }

        //Remove Root Node
        //selectednodes.splice(arrayObjectIndexOf(selectednodes, "1", 'Id'), 1);
        //function arrayObjectIndexOf(myArray, searchTerm, property) {
        //    for (var i = 0, len = myArray.length; i < len; i++) {
        //        if (myArray[i][property] === searchTerm) return i;
        //    }
        //    return -1;
        //}

        //console.log(selectednodes);

        $.each(selectednodes, function (index, item) {
            if (item.id == 1) {
                selectednodes.splice(1);
            }
        });
        //to highlight perticular row
        $.each(selectednodes, function (index, item) {
            var obj = $.grep(ardb, function (row) {
                var str = row.regionID.join();
                if (str.indexOf(item.id) != -1) {
                    grid.jqGrid('setSelection', row.id);
                }
            });
        });
    },

    reloadData: function () {
        $("#divpopup").insmServerProcessingLoader({ text: 'Loading Data..' });
        $("#divpopup").insmServerProcessingLoader("InvokeDialog");
        ardb = [];
        grid.jqGrid('setGridParam', {
            datatype: "jsonstring",
            datastr: ardb,
        }).trigger("reloadGrid");
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Data',
            success: function (e) {
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        grid = rootUIGrid.find("#grddata");
                        ggrid._assignSearchevents(ggrid.options.searchui);
                        var rowarraysimple = ProcessMediaArray.fetchRowArray(data.MediaFiles);
                        ardb = ProcessMediaArray.processArray(rowarraysimple);
                        grid.jqGrid('setGridParam', {
                            datatype: "jsonstring",
                            datastr: ardb,
                        }).trigger("reloadGrid");
                        $("#divpopup").insmServerProcessingLoader("closeDialog");
                    }
                });
            }
        });
    },

    _assignSearchevents: function (SearchUI) {
        var txtsearch = SearchUI.find("#txtsearchlistname");
        SearchUI.find("#cmdsearchP").on("click", function () {
            var searchFiler = txtsearch.val(), f;
            if (searchFiler.length === 0) {
                grid[0].p.search = false;
                $.extend(grid[0].p.postData, { filters: "" });
            }
            f = { groupOp: "OR", rules: [] };
            f.rules.push({ field: "name", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_date", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_by", op: "cn", data: searchFiler });
            f.rules.push({ field: "orientation", op: "cn", data: searchFiler });
            f.rules.push({ field: "Resolution", op: "cn", data: searchFiler });
            grid[0].p.search = true;
            $.extend(grid[0].p.postData, { filters: JSON.stringify(f) });
            grid.trigger("reloadGrid", [{ page: 1, current: true }]);
        });
        SearchUI.find("#cmdclearsearchP").on("click", function () {
            txtsearch.val("");
            var searchFiler = txtsearch.val(), f;
            if (searchFiler.length === 0) {
                grid[0].p.search = false;
                $.extend(grid[0].p.postData, { filters: "" });
            }
            f = { groupOp: "OR", rules: [] };
            f.rules.push({ field: "name", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_date", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_by", op: "cn", data: searchFiler });
            f.rules.push({ field: "orientation", op: "cn", data: searchFiler });
            f.rules.push({ field: "Resolution", op: "cn", data: searchFiler });
            grid[0].p.search = true;
            $.extend(grid[0].p.postData, { filters: JSON.stringify(f) });
            grid.trigger("reloadGrid", [{ page: 1, current: true }]);
        });
        txtsearch.keyup(function () {
            var searchFiler = txtsearch.val(), f;
            if (searchFiler.length === 0) {
                grid[0].p.search = false;
                $.extend(grid[0].p.postData, { filters: "" });
            }
            f = { groupOp: "OR", rules: [] };
            f.rules.push({ field: "name", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_date", op: "cn", data: searchFiler });
            f.rules.push({ field: "modified_by", op: "cn", data: searchFiler });
            f.rules.push({ field: "orientation", op: "cn", data: searchFiler });
            f.rules.push({ field: "Resolution", op: "cn", data: searchFiler });
            grid[0].p.search = true;
            $.extend(grid[0].p.postData, { filters: JSON.stringify(f) });
            grid.trigger("reloadGrid", [{ page: 1, current: true }]);
        });
    },

    _destroy: function () {

    },

    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    $.widget("insm.insmPlayList", PlayListManager);
})(jQuery);

var ProcessMediaArray = {
    fetchRowArray: function (rowdata) {
        var rowarraysimple = [];
        $.each(rowdata, function (index, item) {
            var row = { versions: "", id: "", in_use: "n", regionID: [], publish: "", edit: "", remove: "", name: "", modified_date: "", modified_by: "", orientation: "", resolution: "", isskip: false, level: "0", parent: "null", isLeaf: false, expanded: false, loaded: true };
            row.id = item.Id.toString();
            row.name = item.Name;
            row.modified_date = item.ModificationDate;
            row.modified_by = item.Modifier;
            row.orientation = item.Attributes.Orientation;
            row.Resolution = item.Attributes.Resolution;
            rowarraysimple.push(row);
        });
        return rowarraysimple;
    },

    processArray: function (rowarraysimple) {
        var parentID, ParentName;

        $.each(rowarraysimple, function (index, item) {
            var name = ProcessMediaArray.fetchFileName(item.name);
            if (item.isskip == false) {
                var resultSet = $.grep(rowarraysimple, function (e) {
                    return e.name.indexOf(name) == 0;
                });
                if (resultSet.length > 1) {
                    $.each(resultSet, function (index, item) {
                        if (item.name.indexOf("[") == -1) {
                            //console.log("Parent-" + item.name);
                            parentID = item.id;
                            ParentName = item.name.substr(0, item.name.indexOf("."));
                            item.name = ParentName;
                            item.versions = (resultSet.length - 1).toString() + " versions"
                        } else {
                            //console.log("Child-" + item.name);
                            item.parent = parentID.toString();
                            item.isLeaf = true;
                            item.isskip = true;
                            item.level = 1;
                            item.name = ParentName;
                        }
                    });
                } else {
                    if (!item.isskip) {
                        //console.log("Normal-" + item.name);
                        item.name = item.name.substr(0, item.name.indexOf("."));
                        item.isLeaf = false;
                    }
                }
            }
        });
        return rowarraysimple;
    },

    fetchFileName: function (filename) {
        return filename.substr(0, filename.indexOf("zip") - 1);
    },

    convertDate: function (inputFormat) {
        function cDate(s) {
            return (s < 10) ? '0' + s : s;
        }
        var newDate = new Date(inputFormat);
        if (newDate.getUTCDate() <= 9) {
            return [cDate(newDate.getUTCFullYear()), cDate(newDate.getUTCMonth() + 1), "0" + newDate.getUTCDate()].join('-');
        } else {
            return [cDate(newDate.getUTCFullYear()), cDate(newDate.getUTCMonth() + 1), newDate.getUTCDate()].join('-');
        }
    },

    convertTime: function (inputFormat) {
        var newTime = new Date(inputFormat);
        if (newTime.getUTCMinutes() <= 9 && newTime.getUTCHours() <= 9) {
            return ["0" + newTime.getUTCHours(), "0" + newTime.getUTCMinutes()].join(':');
        } else if (newTime.getUTCMinutes() <= 9) {
            return [newTime.getUTCHours(), "0" + newTime.getUTCMinutes()].join(':');
        } else if (newTime.getUTCHours() <= 9) {
            return ["0" + newTime.getUTCHours(), newTime.getUTCMinutes()].join(':');
        } else {
            return [newTime.getUTCHours(), newTime.getUTCMinutes()].join(':');
        }
    }
};