var PlayListManagerGrid = {
    version: "0.0.1",

    options: {
        searchui: {},
        filterUI: {},
        refreshButton: {},
        onfinishedload: null,
        ongetdirectoryId: null,
        onPublish: null,
        onEdit: null,
        onRemove: null,
        onBlankPublish: null,
        onInUse: null
    },


    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
        contextObjectGrid = this;
        rootUIGrid = this.element;
        arrayManager = new ArrayUtility();
    },
    /*
    Description:get Region Tree and assign to Treeview
    Parameters:Region tree data
    Return:none
    */
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
            }
        });
    },
    /*
    Description:Rendering function for plugin
    Parameters:none
    Return:none
    */
    _create: function () {
        ggrid = this,
        contextObjectGrid = this;
        rootUIGrid = this.element;
        _plugin = {};
        _plugin.htmlElements = {
            content: {
                container: $("<div />"),
                popupcontainer: $("<div />").attr("id", 'divpopup')
            }
        };

        this.options.refreshButton.on("click", function () {
            $("#divpopup").insmServerProcessingLoader({ text: 'Loading Data..' });
            $("#divpopup").insmServerProcessingLoader("InvokeDialog");
            contextObjectGrid.RefreshGrid();
            $("#divpopup").insmServerProcessingLoader("closeDialog");
        });
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Data',
            success: function (e) {
                contextObjectGrid._trigger('ongetdirectoryId', e, e.Id);
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        contextObjectGrid._reloadGrid(data.MediaFiles);
                        contextObjectGrid._trigger("onfinishedload");
                        contextObjectGrid._assignSearchevents(contextObjectGrid.options.searchui);
                    }
                });
            }
        });
    },
    /*
    Description:Assign in use icon based on dataset
    Parameters:dataset icons
    Return:none
    */
    assignInUseIcon: function (dataset) {
        $.data(document, "datasetRegionMap", dataset);
        $.insmFramework('getDataSetList', {
            datasetids: contextObjectGrid._convertToDatasetString(dataset),
            success: function (e) {
                for (name in e) {
                    currentid = e[name]['Id'];
                    var node = e[name]['Items'];
                    if (contextObjectGrid._isvalidObject(node)) {
                        var fileId = contextObjectGrid._fetchFileId(node);
                        if (fileId != 0) {
                            var row = $.grep(ardb, function (item) {
                                return item.id == fileId.toString();
                            });
                            if (row.length == 1) {
                                row[0].inUse = true;
                                row[0].dataSetId = currentid;
                                row[0].regionID = row[0].regionID == 0 ? contextObjectGrid._getRegionIDBasedonDatasetID(currentid) : row[0].regionID + "," + contextObjectGrid._getRegionIDBasedonDatasetID(currentid);
                            }
                        }
                    }
                }
                contextObjectGrid._assignData(ardb);
            }
        });
    },
    /*
    Description:Refresh Grid
    Parameters:none
    Return:none
    */
    RefreshGrid: function () {
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Data',
            success: function (e) {
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        contextObjectGrid._reloadGrid(data.MediaFiles, false);
                        contextObjectGrid.assignInUseIcon($.data(document, "datasetRegionMap"))
                    }
                });
            }
        });
    },

    /*
    Description:Get play list for import
    Parameters:Play list data
    Return:none
    */
    getPlayListforImport: function (data) {
        var rowarraysimple = ProcessMediaArray.fetchRowArray(data);
        ardb = ProcessMediaArray.processArrayForGrid(rowarraysimple);
        return ardb;
    },

    /*
    Description:Utility function to get regionID based on datasetID
    Parameters:dataset id
    Return:RegionID
    */
    _getRegionIDBasedonDatasetID: function (datasetID) {
        return $.grep($.data(document, "datasetRegionMap").dataset, function (item) {
            return datasetID.toString() == item.dataSetID
        })[0].id;
    },
    /*
    Description:Convert to DatasetString based on region data
    Parameters:region data
    Return:Dataset
    */
    _convertToDatasetString: function (regionArray) {
        var datasetString = "";
        $.each(regionArray.dataset, function (index, item) {
            datasetString += item.dataSetID + ",";
        });
        return datasetString.substr(0, datasetString.length - 1);
    },
    /*
    Description:Fetch FileID
    Parameters:tree node
    Return:file id
    */
    _fetchFileId: function (node) {
        var FileID = 0;
        for (propertyName in node) {
            if (node[propertyName].hasOwnProperty("FileId")) {
                FileID = node[propertyName].FileId;
            }
        }
        return FileID;
    },
    /*
    Description:check for valid object
    Parameters:tree node
    Return:boolean
    */
    _isvalidObject: function (node) {
        var propertycounter = 0;
        for (name in node) {
            propertycounter++;
        }
        return (propertycounter > 1 ? false : true);
    },
    /*
    Description:reload entire grid
    Parameters:data,flag
    Return:none
    */
    _reloadGrid: function (data, isStartup) {
        var rowarraysimple = ProcessMediaArray.fetchRowArray(data);
        ardb = ProcessMediaArray.processArrayForGrid(rowarraysimple);
        rootUIGrid.append(_plugin.htmlElements.content.container);
        rootUIGrid.append(_plugin.htmlElements.content.popupcontainer);
        if (isStartup == undefined) {
            grid = _plugin.htmlElements.content.container.insmPlayListGrid({
                onPublish: function (playlist) {

                    var selectednodes = $.data(document, "nodes");
                    if (contextObjectGrid._isNodeSelected(selectednodes)) {
                        var ictr = 0;

                        $('#divpopup').insmPublish({
                            onok: function () {
                                $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                var PreviewGridItemIndex = arrayManager.getElementLocation(ardb, "regionID", contextObjectGrid._getNodeList(selectednodes));
                                contextObjectGrid._assignData(ardb);
                                $.each(selectednodes, function (index, item) {
                                    var datasetid = item.datasetid;
                                    var regionid = item.id;
                                    $.insmFramework('PublishPlayList', {
                                        datasetid: item.datasetid,
                                        datasetitemkey: item.datasetitemkey,
                                        value: playlist.id,
                                        DataSetItemType: 'Archive',
                                        success: function (e) {
                                            // Close the loader popup on last call
                                            ictr++;
                                            if (ictr == selectednodes.length) {
                                                $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                var elementIndex = arrayManager.getElementLocation(ardb, "id", playlist.id);
                                                ardb[elementIndex].inUse = true;
                                                ardb[elementIndex].regionID = regionid;
                                                ardb[elementIndex].dataSetId = datasetid;
                                                if (PreviewGridItemIndex != undefined) {
                                                    ardb[PreviewGridItemIndex].inUse = false;
                                                }
                                                contextObjectGrid._assignData(ardb);
                                            }
                                        }
                                    });
                                });
                            },
                            oncancel: function () {

                            }
                        });

                        $('#divpopup').insmPublish("InvokeDialog");
                    } else {
                        contextObjectGrid._trigger('onBlankPublish');
                    }
                },
                onEdit: function (playlist) {
                    //alert('edit');
                    var rowFileInformation = [];
                    var currnetContentID;

                    $.insmFramework('getSchedule', {
                        fileId: playlist.id,
                        success: function (e) {
                            //contextObject._log(e);
                            var rowxmldata = e;
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
                                            var EditedData = { data: obj };
                                            contextObjectGrid._trigger('onEdit', null, EditedData);
                                            //obj.playListId = $.data(document, "playListMaster").length;
                                            //$.data(document, "currentPlayList", obj);
                                            //$('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                            //$.data(document, "playlistmanager").addPlaylisttoMemory(obj);
                                            //$this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);
                                        }
                                    });
                                }
                            });

                        }
                    });

                },
                onRemove: function (playlist) {
                    var rootID = Number(playlist.id);
                    if (playlist.regionID !== 0) {
                        contextObjectGrid._trigger('onRemove');
                    } else {
                        if (playlist.subItems.length >= 1) {
                            _plugin.htmlElements.content.popupcontainer.insmRemovePlayList({
                                onRemoveNewest: function () {
                                    var removerowid = playlist.subItems[0].id;

                                    $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                    $("#divpopup").insmServerProcessingLoader("InvokeDialog");

                                    $.insmFramework('RemovePlayList', {
                                        fileId: removerowid,
                                        success: function (e) {
                                            contextObjectGrid._removeSingalRow(removerowid)
                                            $("#divpopup").insmServerProcessingLoader("closeDialog");
                                            PlayListManagerGrid.RefreshGrid();
                                        },
                                        denied: function () {
                                            alert("error");
                                        }
                                    });
                                },
                                onRemoveAll: function () {
                                    $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                                    $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                                    $.each(playlist.subItems, function (index, item) {
                                        console.log(item);
                                        $.insmFramework('RemovePlayList', {
                                            fileId: item.id,
                                            success: function (e) {
                                                //contextObjectGrid._removeSingalRow(item.id);
                                                if (playlist.subItems.length == index + 1) {
                                                    console.log("Last node");
                                                    $.insmFramework('RemovePlayList', {
                                                        fileId: rootID,
                                                        success: function (e) {
                                                            contextObjectGrid._removeSingalRow(rootID);
                                                            $("#divpopup").insmServerProcessingLoader("closeDialog");
                                                        },
                                                        denied: function () {
                                                            alert("error");
                                                        }
                                                    });
                                                }
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
                                fileId: playlist.id,
                                success: function (e) {
                                    contextObjectGrid._removeSingalRow(playlist.id);
                                    $("#divpopup").insmServerProcessingLoader("closeDialog");
                                },
                                denied: function () {
                                    alert("error");
                                }
                            });
                        }
                    }
                },
                onInUse: function (playlist) {
                    contextObjectGrid._trigger('onInUse', null, playlist);
                }
            });
        }
        contextObjectGrid._assignData(ardb);

        this.options.filterUI.change(function () {

            dateObject = new Date();
            todayDateObject = new Date();
            gridInlineData = new Array();

            selectedFilterValue = $('option:selected', this).val();
            //grid.jqGrid("clearGridData", true).trigger("reloadGrid");

            switch (selectedFilterValue) {
                case '1': // Show all
                    $.each(ardb, function (index, value) {
                        gridInlineData.push(value);
                    });
                    break;
                case '2'://Only published
                    $.each(ardb, function (index, value) {
                        if (ardb[index].inUse == true) {
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
            contextObjectGrid._assignData(gridInlineData);
        });
    },
    /*
    Description:get Node list based on selected node
    Parameters:tree node
    Return:node list
    */
    _getNodeList: function (selectednodes) {
        var nodelist = "";
        $.each(selectednodes, function (index, item) {
            nodelist += item.id + ",";
        });
        return nodelist.substr(nodelist, nodelist.length - 1)
    },
    /*
    Description:remove in use icon from grid
    Parameters:playlist object
    Return:none
    */
    removeInUseIcon: function (item) {
        var row = $.grep(ardb, function (rowitem) {
            return rowitem.regionID == item.id;
        });
        if (row.length == 1) {
            row[0].regionID = 0;
            row[0].dataSetId = 0;
            row[0].inUse = false;
            contextObjectGrid._assignData(ardb);
        }
    },
    /*
    Description:check weather node is selected or node
    Parameters:tree node
    Return:boolean
    */
    _isNodeSelected: function (selectednodes) {
        var flag;
        if (selectednodes != undefined) {
            if (selectednodes.length == 0) {
                flag = false;
            } else {
                flag = true;
            }
        } else {
            flag = false;
        }
        return flag;
    },
    /*
    Description:Remove row 
    Parameters:rowId
    Return:none
    */
    _removeSingalRow: function (rowID) {
        var removerowid = rowID;
        var index = arrayManager.getElementLocation(ardb, "id", removerowid);
        ardb.splice(index, 1);
        contextObjectGrid._assignData(ardb);
    },

    /*
    Description:update row for playlistgrid
    Parameters:PlayList row
    Return:none
    */
    _assignData: function (playlistDB) {
        grid.insmPlayListGrid('update', { items: playlistDB });
    },

    /*
    Description:get selected region from region plugin
    Parameters:collections of nodes
    Return:none
    */
    setRegionForPublish: function (selectednodes) {
        if (selectednodes.length == 0) {
            $.data(document, "nodes", []);
        } else {
            $.data(document, "nodes", selectednodes);
        }

        $.each(selectednodes, function (index, item) {
            if (item.id == 1) {
                selectednodes.splice(1);
            }
        });
    },

    /*
    Description:Assign Various events to Toolbar objects
    Parameters:Toolbar objects
    Return:none
    */
    _assignSearchevents: function (SearchUI) {
        var txtsearch = SearchUI.find("#txtsearchlistname");
        SearchUI.find("#cmdsearchP").on("click", function () {
            var searchFiler = txtsearch.val();
            contextObjectGrid._assignData(ProcessMediaArray.filterArray(ardb, searchFiler));
        });
        SearchUI.find("#cmdclearsearchP").on("click", function () {
            txtsearch.val("");
            contextObjectGrid._assignData(ardb);
        });
        txtsearch.keyup(function () {
            var searchFiler = txtsearch.val();
            contextObjectGrid._assignData(ProcessMediaArray.filterArray(ardb, searchFiler));
        });
    },

    /*
    Description:Destructor for plugin
    Parameters:none
    Return:none
    */
    _destroy: function () {
        rootUIGrid.empty();
    },

    /*
    Description:log function for console.log
    Parameters:message
    Return:none
    */
    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var contextObjectGrid, rootUIGrid, grid, colModel, ardb, gridInlineData, todayDateObject, dateObject, selectedFilterValue;
    var arrayManager, rowdata, _plugin;
    $.widget("insm.insmPlayListGridUI", PlayListManagerGrid);
})(jQuery);

var ProcessMediaArray = {

    /*
    Description:Convert array of rest call to Grid compitible with Flat Array
    Parameters:Json Array from REST Call
    Return:Json array 
    */
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
    /*
    Description:Convert Flat array to Group Array
    Parameters:Json Array
    Return:Group Array
    */
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
    /*
    Description:Convert Flat array to Group Array
    Parameters:Json Array
    Return:Group Array
    */
    processArrayForGrid: function (rowarraysimple) {
        var parentID, ParentName;
        var masterArray = [];
        $.each(rowarraysimple, function (index, item) {
            var name = ProcessMediaArray.fetchFileName(item.name);
            if (item.isskip == false) {
                var resultSet = $.grep(rowarraysimple, function (e) {
                    return e.name.indexOf(name) == 0;
                });
                if (resultSet.length > 1) {
                    var subar = [];
                    var parent = {};
                    $.each(resultSet, function (index, item) {
                        if (item.name.indexOf("[") == -1) {
                            //console.log("Parent-" + item.name);
                            parent = ProcessMediaArray.convertObjectToGridObject(item);
                            masterArray.push(parent);
                        } else {
                            //console.log("Child-" + item.name);
                            subar.push(ProcessMediaArray.convertObjectToGridObject(item));
                            item.isskip = true;
                        }
                    });
                    parent.subItems = subar;
                } else {
                    if (!item.isskip) {
                        //console.log("Normal-" + item.name);
                        masterArray.push(ProcessMediaArray.convertObjectToGridObject(item));
                    }
                }
            }
        });
        debugger;
        return masterArray;
    },
    /*
    Description:utility function that convert REST Call element to Grid compitible element
    Parameters:Rest Call element
    Return:Grid element
    */
    convertObjectToGridObject: function (item) {
        debugger;
        var row = {
            "id": item.id,
            "subItems": [],
            "inUse": false,
            "name": item.name.substr(0, item.name.indexOf(".")),
            "modificationDate": ProcessMediaArray.convertDate(item.modified_date) + " " + ProcessMediaArray.convertTime(item.modified_date) + ":00",
            "modifiedBy": item.modified_by,
            "orientation": item.orientation,
            "resolution": item.resolution,
            "regionID": 0,
            "dataSetId": 0
        };
        return row;
    },

    /*
    Description:utility function that fetch file name from RestCall Array
    Parameters:File name
    Return:File name
    */
    fetchFileName: function (filename) {
        return filename.substr(0, filename.indexOf("zip") - 1);
    },
    /*
    Description:utility function for date 
    Parameters:date
    Return:date format dd/mm/yyyy
    */
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
    /*
    Description:utility function for time
    Parameters:time
    Return:time format hh:mm:ss
    */
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
    },
    /*
    Description:utility function for filter playlist
    Parameters:playlist,property
    Return:array
    */
    filterArray: function (playListinfo, property) {
        return $.grep(playListinfo, function (items) {
            var result = 0;
            if (items.name.indexOf(property) != -1) {
                result++;
            }
            if (items.orientation.indexOf(property) != -1) {
                result++;
            }
            if (items.modificationDate.indexOf(property) != -1) {
                result++;
            }
            if (items.modifiedBy.indexOf(property) != -1) {
                result++;
            }
            if (items.resolution.indexOf(property) != -1) {
                result++;
            }
            return result == 0 ? false : true;
        });
    }
};