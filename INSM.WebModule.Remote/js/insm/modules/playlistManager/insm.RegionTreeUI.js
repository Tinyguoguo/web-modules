var contextObject, rootUITree;
var to = false;
var RegionViewUIManager = {
    version: "0.0.1",

    options: {
        deselectbutton: {},
        clearbuttonui: {},
        searchbuttonui: {},
        onselection: null,
        ondeselectall: null,
        onshowMessageforPublish: null,
        onshowMessageforBlankClear: null,
        ongetdata: null,
        selecteditems: []
    },
    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
        contextObject = this;
        rootUITree = this.element;
        dataSetIdArray = [];
        selectedNodes = [];
    },

    /*
    Description:Rendering function for plugin
    Parameters:
    Return:
    */
    _create: function () {
        contextObject = this;
        contextObject_RegionTree = this;
        rootUITree = this.element;
        contextObject._assignEvents();
        contextObject._RenderTree();
    },
    /*
    Description:selection of node
    Parameters:Region List 
    Return:none
    */
    AssignNodes: function (regionlist) {
        rootUITree.find(".insm-playlist-treecontainer").jstree(true).deselect_all();
        $.each(regionlist, function (index, item) {
            rootUITree.find(".insm-playlist-treecontainer").jstree(true).select_node(item);
        });
    },
    /*
    Description:assign Event to toolbar UI
    Parameters:none
    Return:none
    */
    _assignEvents: function () {
        var txtsearch = contextObject.options.searchbuttonui.find("#txtsearchregionname");
        contextObject.options.deselectbutton.on("click", function () {
            rootUITree.find(".insm-playlist-treecontainer").jstree(true).deselect_all();
        });
        contextObject.options.clearbuttonui.on("click", function () {
            if (selectedNodes.length == 0) {
                contextObject._trigger("onshowMessageforBlankClear");
            } else {
                var ictr = 0;
                $("#divpopupfortreeview").insmClear({
                    onok: function () {
                        $("#divpopup").insmServerProcessingLoader({ text: 'Please Wait' });
                        $("#divpopup").insmServerProcessingLoader("InvokeDialog");
                        $.each(contextObject.options.selecteditems, function (index, item) {
                            $.insmFramework('ClearPlayList', {
                                datasetid: item.datasetid,
                                datasetitemkey: item.datasetitemkey,
                                success: function (e) {
                                    ictr++;
                                    if (ictr == contextObject.options.selecteditems.length) {
                                        $("#divpopup").insmServerProcessingLoader("closeDialog");
                                        var sender = {};
                                        sender.ar = contextObject.options.selecteditems;
                                        contextObject._trigger("ondeselectall", e, sender);
                                    }
                                    playlistGridUI.insmPlayListGridUI('removeInUseIcon', item);
                                }
                            });
                        });
                    },
                    oncancel: function () {

                    }
                });
                $("#divpopupfortreeview").insmClear("InvokeDialog");
            }
        });
        contextObject.options.searchbuttonui.find("#cmdsearch").on("click", function () {
            var data = txtsearch.val();
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                rootUITree.find(".insm-playlist-treecontainer").jstree(true).search(data);
            }, 250);
        });
        contextObject.options.searchbuttonui.find("#cmdclearsearch").on("click", function () {
            txtsearch.val("");
            var data = txtsearch.val();
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                rootUITree.find(".insm-playlist-treecontainer").jstree(true).search(data);
            }, 250);
        });
        txtsearch.keyup(function (e) {
            var data = $(e.currentTarget).val();
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                rootUITree.find(".insm-playlist-treecontainer").jstree(true).search(data);
            }, 250);
        });
    },

    /*
    Description:Assign Array to Tree plugin
    Parameters:
    Return:none
    */
    _RenderTree: function () {

        $.insmFramework('regionTree', {
            rowdata: 'y',
            success: function (data) {
                ProcessTreeData.getdetail(data, data.Id);
                var tempdataArray = $.grep(dataArray, function (item) {
                    return item.datasetid != null;
                });
                rootUITree.find(".insm-playlist-treecontainer").jstree({
                    'core': {
                        'data': dataArray
                    },
                    "checkbox": {
                        "keep_selected_style": false
                    },
                    "plugins": ["checkbox", "search", "sort"]
                });


                var dataSetArray = [];
                $.each(dataSetIdArray, function (index, item) {
                    if (item.DatasetId != null) {
                        var row = { id: item.Id, dataSetID: item.DatasetId };
                        dataSetArray.push(row);
                    }
                });
                
                contextObject._trigger("ongetdata", null, { dataset: dataSetArray });

                rootUITree.find(".insm-playlist-treecontainer").on("changed.jstree", function (e, data) {
                    var i, j, r = [], selecteditems = [];
                    selectedNodes = data.selected;
                    if (data.selected.length != 0) {
                        for (i = 0, j = data.selected.length; i < j; i++) {
                            r.push(data.instance.get_node(data.selected[i]));
                        }
                        $.each(r, function (index, item) {
                            var selecteditem = jQuery.grep(dataArray, function (row) {
                                return item.id == row.id;
                            });
                            if (selecteditem[0].datasetid != null) {
                                selecteditems.push(selecteditem[0])
                            } else {
                                contextObject._trigger("onshowMessageforPublish");
                                rootUITree.find(".insm-playlist-treecontainer").jstree(true).deselect_all();
                            }
                        });

                        contextObject.options.selecteditems = selecteditems;
                        //contextObject._trigger("onselection", e, "y");
                        contextObject_RegionTree._trigger("onselection", e, "y");
                    } else {
                        //contextObject._trigger("onselection", e, "n");
                        contextObject_RegionTree._trigger("onselection", e, "y");
                    }
                });
            }
        });
        return dataArray;
    },

    /*
    Description:Assign Array to Tree plugin
    Parameters:PlayList Grid
    Return:none
    */
    AssignPlaylistGridHandler: function (playlistgrid) {
        playlistGridUI = playlistgrid;
    },
    /*
    Description:Get Reference of selected node
    Parameters:none
    Return:Node
    */
    GetSelectedNode: function () {
        return contextObject.options.selecteditems;
    },
    /*
    Description:get Detail of perticular node
    Parameters:Node,id
    Return:Node
    */
    _getdetail: function (obj, id) {
        if (obj.hasOwnProperty("Regions")) {
            var gobj = {};
            gobj.pid = id;
            gobj.cid = obj.Id;
            datalist.push(gobj);
            getdetail(obj.Regions, obj.Id);
        } else {
            var gobj = {};
            gobj.pid = id;
            gobj.cid = obj.Id;
            datalist.push(gobj, obj.Id);
        }
    },

    /*
    Description:Destructor for plugin
    Parameters:none
    Return:none
    */
    _destroy: function () {

    },
    /*
    Description:console log function
    Parameters:Message
    Return:none
    */
    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var dataSetIdArray, playlistGridUI, selectedNodes;
    var contextObject_RegionTree;
    $.widget("insm.insmRegionTreeViewUI", RegionViewUIManager);
})(jQuery);

var datalist = [];
var dataArray = [];

var ProcessTreeData = {
    /*
    Description:convert to Tree compitible Array
    Parameters:REST Call Array
    Return:none
    */
    getdetail: function (obj, id) {
        if (obj.DatasetId != null) {
            dataSetIdArray.push(obj)
        }
        if (id == 1) {
            var gobj = { "id": obj.Id, datasetid: obj.DatasetId, datasetitemkey: obj.DatasetItemKeys, "parent": "#", "text": obj.Name, 'state': { 'opened': true } };
            dataArray.push(gobj);
        }
        if (obj.hasOwnProperty("Regions")) {

            var regionarray = obj.Regions;
            var pid = obj.Id;
            $.each(regionarray, function (index, item) {
                var gobj = { "id": item.Id, datasetid: item.DatasetId, datasetitemkey: item.DatasetItemKeys, "parent": pid, "text": item.Name, 'state': { 'opened': false } };
                dataArray.push(gobj);
                ProcessTreeData.getdetail(item, item.Id);
            })
        }
    }
};