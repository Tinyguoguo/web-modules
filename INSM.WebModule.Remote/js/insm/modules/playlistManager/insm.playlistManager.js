/// <reference path="../../../../pages/menu/insm.playlist.menu.js" />
/// <reference path="../../../../pages/menu/insm.playlist.menu.js" />
/// <reference path="~/js/insm/framework/utility/insmEnums.js" />
/*
* INSM Plugin Template
* This file contains the INSM Plugin Template plugin. 
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPluginTemplate(options);
*
* Author:
* Gateway technolabs
* Instoremedia AB
*/

(function ($) {
    var $this;
    var Startup;
    var PlaylistEditor;
    var playlistuiReferenceForGlobal, regiontreeviewuiForGlobal;
    var _plugin;
    // declare currentPlayelist from playListMaster

    var addPlaylistValues = new Array();
    var methods = {
        init: function (options) {
            $this = $(this);
            _plugin = $this.data('insmPlayListManager');

            if (!_plugin) {
                _plugin = {
                    data: {
                        fullscreenInitialized: false,
                    },
                    settings: $.extend({
                        mediaDirectoryName: 'Media',
                        templateDirectoryName: 'Templates',
                        playlistDirectoryName: 'Data',
                        firstOption: false,
                        secondOption: "Default text",
                        callbackMethod: function () {

                        }
                    }, options)
                };
                $this.data('insmPlayListManager', _plugin);
            }


            //init code will be here
            return $this;
        },

        renderPlayListUI: function () {
            var strhtml = "";
            $this.html(strhtml);
            Startup = $this.find("#Startup");
            PlaylistEditor = $this.find("#PlaylistEditor");
        },

        resize: function () {
            var $this = $(this);
            return $this;
        },
        onClose: function (options) {
            options.success();
        },

        preview: function (options) {
            var $this = $(this);
            _plugin = $this.data('insmPlayListManager');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview playlistEditor').html(
                $('<h2 />').text('Playlist Editor')
            );

            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });
            //From this location rendering is going to start
            $html = _plugin.settings.target;

            $(document).insmplayListManagerHelper("fillDropDown");


            var regiontreeviewui, playlistui;

            _plugin.htmlElements.content.loader.container.insmServerProcessingLoader({ text: 'Save Data' });
            _plugin.htmlElements.content.loader.container.insmServerProcessingLoader("InvokeDialog");
            
            playlistui = _plugin.htmlElements.content.Startup.maincontainer.playlisteditor.insmPlayListGridUI({
                searchui: _plugin.htmlElements.content.Startup.tableview.searchplaylist.container,
                refreshButton: _plugin.htmlElements.content.Startup.tableview.cmdRefreshList.container,
                filterUI: _plugin.htmlElements.content.Startup.tableview.Filtertype,
                ongetdirectoryId: function (e, data) {
                    $.data(document, "directoryid", data);
                },
                onPublish: function (e, data) {
                },
                onEdit: function (e, data) {
                    Startup = $("#Startup");
                    PlaylistEditor = $("#PlaylistEditor");
                    console.log(data);
                    //create an instance of array utility
                    var playlistmanager = new ArrayUtility();
                    $.data(document, "playlistmanager", playlistmanager);

                    //declare playlist master to save each playlist in it.
                    var playlistMaster = [];
                    $.data(document, "playListMaster", playlistMaster);

                    $('.insm-playlisteditor-process-container').empty();
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer();


                    // Fill the Combo-Box and Enter Value
                    PlaylistEditor.find("#spnfileName").text("Filename:" + data.data[0].playListName);
                    Startup.css("display", "none");
                    $('#ShowInfoMsgs').css("display", "none");
                    //   var playlistinfo = $.data(document, "playlistmanager");

                    //create new playlist
                    var tempPlaylistMaster = [];
                    $.each(data.data, function (index, item) {
                        var newPlayList = {
                            playListId: index,
                            playListName: item.playListName,
                            resolution: item.resolution,
                            active: item.active,
                            selected: item.selected,
                            details: [], //array of each items added in this playlist
                        };

                        $.each(item.details, function (i, items) {
                            var timeOptionsData = { timeOptions: items.timeOptionsData };
                            items.timeOptionsData = timeOptionsData;
                            newPlayList.details.push(items);
                        });

                        tempPlaylistMaster.push(newPlayList);
                        $.data(document, "playlistmanager").addPlaylisttoMemory(newPlayList);
                    });


                    //set as current Playlist
                    $.data(document, "currentPlayList", tempPlaylistMaster[0]);

                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);

                    //add new playlist in to playlist master.

                    //$.data(document, "playlistmanager").addPlaylisttoMemory(tempPlaylistMaster);

                    // Fill the Combo-Box and Enter Value
                    $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);

                    PlaylistEditor.css("display", "block");
                    // var data = $this.find("#files");


                },
                onBlankPublish: function () {
                    var notification = _plugin.htmlElements.content.ShowInfoMsgs.container.PlaylistNotificationUI();
                    notification.PlaylistNotificationUI("InvokeNotification", "<span style='font-weight: bold;'>No nodes selected</span> Select nodes with the checkboxes");
                },
                onRemove: function () {
                    var notification = _plugin.htmlElements.content.ShowInfoMsgs.container.PlaylistNotificationUI();
                    notification.PlaylistNotificationUI("InvokeNotification", "<span style='font-weight: bold;'>Can't remove</span> This playlist is published and cannot be removed!")
                },
                onInUse: function (e, data) {
                    var ar;
                    if (data.regionID.toString().indexOf(",") == -1) {
                        ar = [data.regionID];
                    } else {
                        ar = data.regionID.split(",");
                    }
                    regiontreeviewuiForGlobal.insmRegionTreeViewUI("AssignNodes", ar);
                },
                onfinishedload: function () {
                    regiontreeviewui = $html.find(".insm-playlisteditor-regiontree-container").html("<div><div class='insm-playlist-treecontainer'></div></div><div id='divpopupfortreeview'></div>").insmRegionTreeViewUI({
                        onselection: function (e, nodes) {
                            if (nodes == 'y') {
                                playlistui.insmPlayListGridUI("setRegionForPublish", regiontreeviewui.insmRegionTreeViewUI("GetSelectedNode"));
                            } else {
                                playlistui.insmPlayListGridUI("setRegionForPublish", []);
                            }
                        },
                        ongetdata: function (e, data) {
                            playlistui.insmPlayListGridUI("assignInUseIcon", data);
                            regiontreeviewui.insmRegionTreeViewUI('AssignPlaylistGridHandler', playlistui);
                            _plugin.htmlElements.content.loader.container.insmServerProcessingLoader("closeDialog");
                        },
                        onshowMessageforBlankClear: function () {
                            var notification = _plugin.htmlElements.content.ShowInfoMsgs.container.PlaylistNotificationUI();
                            notification.PlaylistNotificationUI("InvokeNotification", "<span style='font-weight: bold;'>No nodes selected</span> Select nodes with the checkboxes");
                        },
                        onshowMessageforPublish: function () {
                            var notification = _plugin.htmlElements.content.ShowInfoMsgs.container.PlaylistNotificationUI();
                            notification.PlaylistNotificationUI("InvokeNotification", "<span style='font-weight: bold;'>Nothing published</span> no playlist published");
                        },
                        deselectbutton: $html.find("#cmdDeselectAllRegion"),
                        clearbuttonui: $html.find("#cmdClearRegionName"),
                        searchbuttonui: $html.find(".insm-search-tree")
                    });
                    regiontreeviewuiForGlobal = regiontreeviewui;
                }
            });

            //playlistui.insmPlayList("getRegionTree", regiontreeviewui);
            //_plugin.htmlElements.content.loader.container.insmServerProcessingLoader({ text: 'Please Wait' });
            //_plugin.htmlElements.content.loader.container.insmServerProcessingLoader("InvokeDialog");
            //playlistui = $html.find(".insm-playlisteditor-playlist-container").html("<div class='insm-playlisteditor-playlist-grid'></div>").insmPlayList({
            //    searchui: $html.find(".insm-search-grid"),
            //    filterUI: $html.find("#drpFilter"),
            //    refreshButton: $html.find("#cmdRefreshList"),
            //    ongetdirectoryId: function (e, data) {
            //        $.data(document, "directoryid", data);
            //    },
            //    onfinishedload: function () {
            //        regiontreeviewui = $html.find(".insm-playlisteditor-regiontree-container").html("<div><div class='insm-playlist-treecontainer'></div></div><div id='divpopupfortreeview'></div>").insmRegionTreeViewUI({
            //            onselection: function (e, nodes) {
            //                if (nodes == 'y') {
            //                    playlistui.insmPlayList("setDataForPublish", regiontreeviewui.insmRegionTreeViewUI("GetSelectedNode"));
            //                } else {
            //                    playlistui.insmPlayList("setDataForPublish", []);
            //                }
            //            },
            //            ongetdata: function () {
            //                _plugin.htmlElements.content.loader.container.insmServerProcessingLoader("closeDialog");
            //            },
            //            deselectbutton: $html.find("#cmdDeselectAllRegion"),
            //            clearbuttonui: $html.find("#cmdClearRegionName"),
            //            searchbuttonui: $html.find(".insm-search-tree")
            //        });
            //        playlistui.insmPlayList("getRegionTree", regiontreeviewui);
            //        regiontreeviewuiForGlobal = regiontreeviewui;
            //    }
            //});

            playlistuiReferenceForGlobal = playlistui;
            return _plugin.settings.previewTarget;
        },

        //filling of playlist dropdown box
        EnterValueForPlayListNameCombo: function (doEmpty, doNewList, doUpdateList) {
            if (doEmpty) {
                $('#insm-playlistNamesDropdown').empty();
            }
            $.each($.data(document, "playListMaster"), function (index, items) {
                var activeTxt = items.active == true ? '(active)' : '';
                var selectedTxt = items.selected;
                // Filling Combo

                $('#insm-playlistNamesDropdown')
                    .append($("<option></option>")
                        .attr("value", items.playListId)
                        .text(items.playListName + ' ' + activeTxt)
                        .attr("selected", selectedTxt));

            });
            //arrange added playlists alphabatically
            // Loop for each select element on the page.
            $("#insm-playlistNamesDropdown").each(function () {
                // Keep track of the selected option.
                var selectedValue = $(this).val();
                // Sort all the options by text. I could easily sort these by val.
                $(this).html($("option", $(this)).sort(function (a, b) {
                    return a.text.toUpperCase() == b.text.toUpperCase() ? 0 : a.text.toUpperCase() < b.text.toUpperCase() ? -1 : 1;
                }));
                $(this).val(selectedValue);
            });
        },

        getTarget: function () {
            var $this = $(this);
            _plugin = $this.data('insmPlayListManager');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                $(document).insmplayListManagerHelper();
                _plugin.settings.target = $('<div />');
                _plugin.htmlElements = {
                    content: {
                        ShowInfoMsgs: {
                            container: $("<div />").addClass("insm-header-infomsg").attr("id", 'ShowInfoMsgs')
                        },
                        Startup: {
                            container: $("<div />").addClass("insm-playlisteditor-startup").attr("id", 'Startup'),
                            tableview: {
                                container: $("<div />").addClass("table-view"),
                                searchInputBox: {
                                    container: $("<div />").addClass("insm-search-playlist insm-search-tree").attr("id", 'searchInputBox'),
                                    searchregionname: $("<input type='text'  placeholder='Search regions' />").addClass("inputWithImge").attr("id", 'txtsearchregionname'),
                                    clearsearch: $("<span />").addClass("insm-input-clearsearch").attr("id", 'cmdclearsearch'),
                                    search: $("<span />").addClass("insm-input-search").attr("id", 'cmdsearch'),
                                },
                                ClearRegionName: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdClearRegionName'),
                                    removebutton: $("<span />").addClass("insm-remove-button").text("Clear")
                                },
                                DeselectAllRegion: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdDeselectAllRegion'),
                                    deselectall: $("<span />").addClass("insm-deselect-button").text("Deselect all")
                                },
                                devider1: $("<div />").addClass("insm-divider"),
                                searchplaylist: {
                                    container: $("<div />").addClass("insm-search-playlist insm-search-grid").attr("id", 'searchInputBox'),
                                    textui: $("<input type='text'  placeholder='Search playlists' />").attr('id', 'txtsearchlistname').addClass('inputWithImge'),
                                    clear: $("<span />").attr('id', 'cmdclearsearchP').addClass('insm-input-clearsearch'),
                                    search: $("<span />").attr('id', 'cmdsearchP').addClass('insm-input-search')
                                },
                                Filtercaption: $("<span />").addClass("insm-div-label").text("Filter:"),
                                Filtertype: $("<select />").attr("id", 'drpFilter').css("margin-right", "5px"),
                                devider2: $("<div />").addClass("insm-divider"),
                                cmdnewPlayList: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdnewPlayList'),
                                    newButton: $("<div />").addClass("insm-add-new-button").text("New playlist")
                                },
                                cmdRefreshList: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdRefreshList'),
                                    refreshButton: $("<span />").addClass("insm-refresh-button").text("Refresh")
                                },
                                More: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdMorePlaylist'),
                                    morebutton: $("<span />").addClass("insm-general-settings-more-button").text("More")
                                },
                                devider3: $("<div />").addClass("insm-divider"),
                                ChanelCaption: $("<span />").addClass("insm-div-label").text("Channel:"),
                                ChanelList: $("<select />").attr("id", 'drpChannelList')
                            },
                            maincontainer: {
                                container: $("<div />").addClass("insm-playlisteditor-main-container"),
                                regiontree: $("<div />").addClass("insm-playlisteditor-regiontree-container"),
                                playlisteditor: $("<div />").addClass("insm-playlisteditor-playlist-container"),
                            }
                        },
                        PlayListEditor: {
                            container: $("<div />").addClass("insm-playlisteditor-editor").attr("id", 'PlaylistEditor'),
                            toolbar: {
                                container: $("<div />").addClass("table-view").css("display", "block"),
                                playlistDropdown: {
                                    container: $("<select />").attr("id", 'insm-playlistNamesDropdown').css("margin-right", "5px")
                                },
                                settings: {
                                    container: $("<div />").addClass("button").attr("id", 'settingsBtn'),
                                    button: $("<span />").addClass('insm-general-settings-button')
                                },
                                devider1: $("<div />").addClass("insm-divider"),
                                newMedia: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdnewMedia'),
                                    button: $("<span />").addClass('insm-add-new-button').text('Add New')
                                },
                                removeMedia: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdremoveMedia'),
                                    button: $("<span />").addClass('insm-remove-button').text('Remove')
                                },
                                moveUp: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdmoveup'),
                                    button: $("<span />").addClass('insm-up-button').text('Up')
                                },
                                moveDown: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdmovedown'),
                                    button: $("<span />").addClass('insm-down-button').text('Down')
                                },
                                more: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdmore'),
                                    button: $("<span />").addClass('insm-more-button').text('More')
                                },
                                publish: {
                                    container: $("<div />").addClass("button insm-playlistmanager-publishbutton").attr("id", 'cmdpublish'),
                                    button: $("<span />").addClass('insm-publish-button').text('Save')
                                },
                                cancel: {
                                    container: $("<div />").addClass("button").attr("id", 'cmdcancel').css('float', 'right'),
                                    button: $("<span />").addClass('insm-deselect-button').text('Cancel')
                                },
                                filetitle: {
                                    container: $("<div />").addClass("insm-playlistmanager-Filetitle"),
                                    button: $("<span />").attr('id', 'spnfileName')
                                },
                            },
                            maincontainer: {
                                container: $("<div />").addClass("insm-playlisteditor-main-container"),
                                thumbnailviewer: $("<div />").addClass("insm-playlisteditor-thumbnail-container").attr("id", 'thumbnailviewer'),
                                processor: $("<div />").addClass("insm-playlisteditor-process-container"),
                            }
                        },
                        loader: {
                            container: $("<div />").attr("id", 'dlgcnvloader'),
                        },
                        NewPlayList: {
                            container: $("<div />").attr("id", 'dlgcnv')
                        },
                        FileBrowser: {
                            container: $("<div />").attr("id", 'dlgfileBrowser')
                        },
                        Menu: {
                            container: $("<div />").attr("id", 'menuspan')
                        },
                        extraComponenets: {
                            container: $("<div />"),
                            importPopup: $("<div/>"),
                            fileforImport: $("<input type='file' accept='application/zip' />").addClass('insm-playlist-manager-import-playlist'),
                            templateUI: $("<div />").addClass("insm-playlist-manager-templateUI"),
                            previewPopup: $("<div />"),
                            remotePlaylistPopupContianer: $("<div id='remotePlayList'/>"),
                        }
                    }
                };

                $this = _plugin.settings.target;

                $this.append(_plugin.htmlElements.content.ShowInfoMsgs.container)
                    .append(_plugin.htmlElements.content.Startup.container
                        .append(_plugin.htmlElements.content.Startup.tableview.container
                            .append(_plugin.htmlElements.content.Startup.tableview.searchInputBox.container
                                .append(_plugin.htmlElements.content.Startup.tableview.searchInputBox.searchregionname)
                                .append(_plugin.htmlElements.content.Startup.tableview.searchInputBox.clearsearch)
                                .append(_plugin.htmlElements.content.Startup.tableview.searchInputBox.search))
                            .append(_plugin.htmlElements.content.Startup.tableview.ClearRegionName.container
                                .append(_plugin.htmlElements.content.Startup.tableview.ClearRegionName.removebutton))
                            .append(_plugin.htmlElements.content.Startup.tableview.DeselectAllRegion.container
                                .append(_plugin.htmlElements.content.Startup.tableview.DeselectAllRegion.deselectall))
                            .append(_plugin.htmlElements.content.Startup.tableview.devider1)
                            .append(_plugin.htmlElements.content.Startup.tableview.searchplaylist.container
                                .append(_plugin.htmlElements.content.Startup.tableview.searchplaylist.textui)
                                .append(_plugin.htmlElements.content.Startup.tableview.searchplaylist.clear)
                                .append(_plugin.htmlElements.content.Startup.tableview.searchplaylist.search))
                            .append(_plugin.htmlElements.content.Startup.tableview.Filtercaption)
                            .append(_plugin.htmlElements.content.Startup.tableview.Filtertype)
                            .append(_plugin.htmlElements.content.Startup.tableview.devider2)
                            .append(_plugin.htmlElements.content.Startup.tableview.cmdnewPlayList.container
                                .append(_plugin.htmlElements.content.Startup.tableview.cmdnewPlayList.newButton))
                            .append(_plugin.htmlElements.content.Startup.tableview.cmdRefreshList.container
                                .append(_plugin.htmlElements.content.Startup.tableview.cmdRefreshList.refreshButton))
                            .append(_plugin.htmlElements.content.Startup.tableview.More.container
                                .append(_plugin.htmlElements.content.Startup.tableview.More.morebutton))
                            .append(_plugin.htmlElements.content.Startup.tableview.devider3)
                            .append(_plugin.htmlElements.content.Startup.tableview.ChanelCaption)
                            .append(_plugin.htmlElements.content.Startup.tableview.ChanelList))
                        .append(_plugin.htmlElements.content.Startup.maincontainer.container
                            .append(_plugin.htmlElements.content.Startup.maincontainer.regiontree)
                            .append(_plugin.htmlElements.content.Startup.maincontainer.playlisteditor)))
                    .append(_plugin.htmlElements.content.PlayListEditor.container
                        .append(_plugin.htmlElements.content.PlayListEditor.toolbar.container
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.playlistDropdown.container)
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.settings.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.settings.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.devider1)
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.newMedia.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.newMedia.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.removeMedia.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.removeMedia.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.moveUp.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.moveUp.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.moveDown.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.moveDown.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.more.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.more.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.publish.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.publish.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.cancel.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.cancel.button))
                            .append(_plugin.htmlElements.content.PlayListEditor.toolbar.filetitle.container
                                .append(_plugin.htmlElements.content.PlayListEditor.toolbar.filetitle.button)))
                        .append(_plugin.htmlElements.content.PlayListEditor.maincontainer.container
                            .append(_plugin.htmlElements.content.PlayListEditor.maincontainer.thumbnailviewer)
                            .append(_plugin.htmlElements.content.PlayListEditor.maincontainer.processor)))
                    .append(_plugin.htmlElements.content.loader.container)
                    .append(_plugin.htmlElements.content.NewPlayList.container)
                    .append(_plugin.htmlElements.content.FileBrowser.container)
                    .append(_plugin.htmlElements.content.Menu.container)
                    .append(_plugin.htmlElements.content.extraComponenets.container
                    .append(_plugin.htmlElements.content.extraComponenets.importPopup)
                    .append(_plugin.htmlElements.content.extraComponenets.fileforImport)
                    .append(_plugin.htmlElements.content.extraComponenets.templateUI)
                    .append(_plugin.htmlElements.content.extraComponenets.previewPopup)
                    .append(_plugin.htmlElements.content.extraComponenets.remotePlaylistPopupContianer));

                $.data(document, "FileBrowserLocation", _plugin.htmlElements.content.FileBrowser.container);
                $.data(document, "previewPopup", _plugin.htmlElements.content.extraComponenets.previewPopup);
                $.data(document, "loader", _plugin.htmlElements.content.loader.container);
                //Save data to Server
                _plugin.htmlElements.content.PlayListEditor.toolbar.publish.container.on("click", function (e) {
                    var gdata = new xmlProceesor();
                    var playlistdata = gdata.getPlayList();
                    gdata.insertPropertyItemsForContentType(playlistdata, $.data(document, "playListMaster"));
                    var xmldata = gdata.Processdata(playlistdata);

                    var resolution = $.data(document, "resolutionInfo");
                    _plugin.htmlElements.content.loader.container.insmServerProcessingLoader({ text: 'Save Data' });
                    _plugin.htmlElements.content.loader.container.insmServerProcessingLoader("InvokeDialog");
                    $.insmFramework('savePlayListToServer', {
                        displayname: $.data(document, "playlistName"),
                        directoryid: $.data(document, "directoryid"),
                        xmldata: xmldata,
                        filename: $.data(document, "playlistName") + '.xml',
                        orientation: resolution.resolutionType,
                        resolution: resolution.resolutionValue,
                        versionGroupId: $.data(document, "playlistName") + '.xml',
                        uploadFileOffset: 0,
                        uploadFileSize: 0,
                        success: function (e) {
                            _plugin.htmlElements.content.PlayListEditor.maincontainer.thumbnailviewer.empty();
                            Startup.show();
                            PlaylistEditor.hide();
                            _plugin.htmlElements.content.ShowInfoMsgs.container.show();
                            //playlistuiReferenceForGlobal.insmPlayList("reloadData");
                            playlistuiReferenceForGlobal.insmPlayListGridUI("RefreshGrid");

                            _plugin.htmlElements.content.loader.container.insmServerProcessingLoader("closeDialog");

                            regiontreeviewuiForGlobal.insmRegionTreeViewUI({
                                onselection: function (e, nodes) {
                                    if (nodes == 'y') {
                                        playlistuiReferenceForGlobal.insmPlayList("setDataForPublish", regiontreeviewuiForGlobal.insmRegionTreeViewUI("GetSelectedNode"));
                                    } else {
                                        playlistuiReferenceForGlobal.insmPlayList("setDataForPublish", []);
                                    }
                                }
                            });
                        },
                        error: function (e) {
                        }
                    });
                });
                //Activate Settings Menu
                _plugin.htmlElements.content.PlayListEditor.toolbar.settings.container.on("click", function () {
                    var menuItems = [{ "name": "Add..", "type": "ADD_NEW_PLAYLIST" },
                        { "name": "Remove", "type": "REMOVE_SELECTED_PLAYLIST" },
                        { "name": "Rename", "type": "RENAME_SELECTED_PLAYLIST" },
                        { "name": "Select as Active", "type": "SET_AS_ACTIVE" }];
                    var setMenuItemDisabledValue;

                    if ($.data(document, "playListMaster").length > 1) {
                        setMenuItemDisabledValue = "";
                    } else {
                        setMenuItemDisabledValue = "Remove";
                    }
                    _plugin.htmlElements.content.PlayListEditor.toolbar.settings.container.menu({
                        menuItems: menuItems,
                        setMenuItemDisabled: setMenuItemDisabledValue,
                        onMenuItemClick: function (e, type) {
                            switch (type) {
                                case Menutype.ADD_NEW_PLAYLIST:
                                    _plugin.htmlElements.content.NewPlayList.container.insmLighbox({
                                        openFrom: 2,
                                        oncancel: function (event) {
                                        },
                                        onsubmit: function (event, data) {
                                            $('#insm-resolutionFilter').insmSpinnerResolution("sendResolutionValue");
                                            // Get playLists from playlist master and set false to selected property of all playlist.
                                            $.each($.data(document, "playListMaster"), function (index, items) {
                                                items.selected = false;
                                            });

                                            var addPlayList = {
                                                playListId: $.data(document, "playListMaster").length,
                                                playListName: data,
                                                resolution: $.data(document, "resolutionInfo"), // remain to set 
                                                active: false,
                                                selected: true,
                                                details: []
                                            };
                                            $.data(document, "currentPlayList", addPlayList);
                                            $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                            //obj.active = addPlaylistValues[Number(items)].active == true ? '(active)' : '';

                                            //add playlist in to playlist master.

                                            $.data(document, "playlistmanager").addPlaylisttoMemory(addPlayList);
                                            // Fill the Combo-Box and Enter Value
                                            $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);
                                        }
                                    });
                                    break;
                                case Menutype.REMOVE_SELECTED_PLAYLIST:
                                    var selectedPlaylistValueTobeRemove = $("#insm-playlistNamesDropdown option:selected").val();
                                    if ($.data(document, "playListMaster")[selectedPlaylistValueTobeRemove].active)
                                        $this.insmPlayListManager('showWarningBoxOnActivePlaylistOnRemove', selectedPlaylistValueTobeRemove);
                                    else {
                                        // To Remove selected playlist item 
                                        $("#insm-playlistNamesDropdown option[value='" + selectedPlaylistValueTobeRemove + "']").remove();
                                        // Updating the Array, by matching Value
                                        $.each($.data(document, "playListMaster"), function (index, items) {
                                            if (items.playListId == selectedPlaylistValueTobeRemove) {
                                                $.data(document, "playListMaster").splice($.inArray(items, $.data(document, "playListMaster")), 1);
                                                return false;
                                            }
                                        });
                                    }
                                    if ($.data(document, "playListMaster").length < 1) {
                                        setMenuItemDisabledValue = "";
                                    }

                                    break;
                                case Menutype.RENAME_SELECTED_PLAYLIST:
                                    var selectedPlaylistValueTobeRename = $("#insm-playlistNamesDropdown option:selected").val();
                                    var selectedPlaylistTextTobeRename = $.data(document, "playListMaster")[selectedPlaylistValueTobeRename].playListName;
                                    var renameSelectedPlaylist = _plugin.htmlElements.content.NewPlayList.container.insmLighbox({
                                        oncancel: function (event) {
                                        },
                                        onsubmit: function (event, data) {
                                            // Updating the Array, by matching Value
                                            $.each($.data(document, "playListMaster"), function (index, items) {
                                                if (items.playListId == selectedPlaylistValueTobeRename) {
                                                    items.playListName = data;
                                                }
                                            });
                                            // Fill the Combo-Box and Enter Value
                                            $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, false, false);
                                        }
                                    });
                                    renameSelectedPlaylist.insmLighbox("setInputText", selectedPlaylistTextTobeRename);
                                    break;
                                case Menutype.SET_AS_ACTIVE:
                                    // Remove current Active Item, and making newly active item
                                    $.each($.data(document, "playListMaster"), function (index, items) {
                                        items.active = false;
                                    });

                                    var selectedPlaylistValue = $("#insm-playlistNamesDropdown option:selected").val();

                                    $.data(document, "playListMaster")[selectedPlaylistValue].active = true;
                                    $.data(document, "playListMaster")[selectedPlaylistValue].selected = true;

                                    // Fill the Combo-Box and Enter Value
                                    $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, false, true);
                                    break;
                                default:
                            }
                        }
                    });
                });
                //Change event of playlist dropdown box
                _plugin.htmlElements.content.PlayListEditor.toolbar.playlistDropdown.container.on("change", function (e) {

                    var selectedPlaylistIndex = this.value;
                    //$('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("onListChangeEventHandler", selectedPlaylistIndex);
                    $.each($.data(document, "playListMaster"), function (index, items) {
                        items.selected = false;
                    });

                    $.data(document, "playListMaster")[this.value].selected = true;

                    //get selected playlist object and set as current playlist.
                    var selectedPlaylist = $.data(document, "playListMaster")[this.value];
                    //console.log(selectedPlaylist);
                    $.data(document, "currentPlayList", selectedPlaylist);
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);

                    var optionSelected = $(this).find("option:selected");
                    var valueSelected = optionSelected.val();
                    var textSelected = optionSelected.text();
                    //$('.insm-playlisteditor-process-container').empty();
                    //$('.insm-thumbanail-div').empty();
                });
                //Add media in thumbnail container
                _plugin.htmlElements.content.PlayListEditor.toolbar.newMedia.container.css("margin-right", "3px").on("click", function (e) {

                    var menuItems = [{ "name": "Image", "type": "IMAGE" },
                        { "name": "Movie", "type": "MOVIE" },
                        { "name": "Flash", "type": "FLASH" },
                        { "name": "Web Page", "type": "WEB_PAGE" },
                        { "name": "", "type": "" }, //to apply horizontal rule
                        { "name": "News Feed(RSS)", "type": "NEWS_FEED" },
                        { "name": "Information", "type": "INFORMATION" },
                        { "name": "Music stream", "type": "MUSIC_STREAM_FILE" },
                        { "name": "Playlist", "type": "PLAYLIST" },
                        { "name": "Menu 2-8", "type": "MENU28" },
                        { "name": "Music File", "type": "MUSICFILE" },
                        { "name": "Skanska Triple News", "type": "SKANSKA_TRIPLE_NEWS" },
                        { "name": "Swedbank Image", "type": "SWEDBANK_IMAGE" }
                    ];

                    $('#cmdnewMedia').menu({
                        menuItems: menuItems,
                        onMenuItemClick: function (e, type) {
                            var mediaData = null;
                            switch (type) {
                                case Menutype.IMAGE:
                                    _plugin.htmlElements.content.FileBrowser.container.insmFileBrowser({
                                        thumbnailContainer: PlaylistEditor.find("#thumbnailviewer"),
                                        filetype: type,
                                        onFileSelection: function (e, data) {
                                            if (data.selectedFiles != undefined) {
                                                $.data(document, "FileListFromServer", data.FileList);
                                                var splitItems = data.selectedFiles.split(':');
                                                $.each(splitItems, function (e, Id) {
                                                    mediaData = {};
                                                    mediaData.Id = Id;
                                                    mediaData.guid = Math.uuid();
                                                    mediaData.Type = type;
                                                    mediaData.previewData = {
                                                        doNotPlayItem: true,
                                                        duration: "10",
                                                        transition: "Fade"
                                                    };
                                                    mediaData.contentData = {
                                                        imagePath: $.grep($.data(document, "FileListFromServer"), function (e) {
                                                            return e.Id == Id;
                                                        })[0].data.Name,
                                                        imageScalling: "1",
                                                        animate: false
                                                    };
                                                    mediaData.timeOptionsData = {
                                                        timeOptions: []
                                                    };
                                                    mediaData.advancedData = {
                                                        imageBgColor: "#ffffffff"
                                                    };
                                                    $.data(document, "currentPlayList").details.push(mediaData);
                                                });
                                                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                            }
                                        }
                                    });
                                    break;
                                case Menutype.MOVIE:
                                case Menutype.MUSICFILE:
                                    var filebrowser = _plugin.htmlElements.content.FileBrowser.container.insmFileBrowser({
                                        thumbnailContainer: PlaylistEditor.find("#thumbnailviewer"),
                                        filetype: type,
                                        onFileSelection: function (e, data) {
                                            if (data.selectedFiles != undefined) {
                                                $.data(document, "FileListFromServer", data.FileList);
                                                var splitItems = data.selectedFiles.split(':');
                                                $.each(splitItems, function (e, Id) {
                                                    mediaData = {};
                                                    mediaData.Id = Id;
                                                    mediaData.guid = Math.uuid();
                                                    mediaData.Type = type;
                                                    mediaData.previewData = {
                                                        doNotPlayItem: false,
                                                        playUntillFinish: true,
                                                        duration: "10",
                                                        transition: "Fade",
                                                        volume: null,
                                                        mute: false
                                                    };
                                                    mediaData.contentData = {
                                                        mediaPath: $.grep($.data(document, "FileListFromServer"), function (e) {
                                                            return e.Id == Id;
                                                        })[0].data.Name,
                                                        RemoteFileName: $.grep($.data(document, "FileListFromServer"), function (e) {
                                                            return e.Id == Id;
                                                        })[0].data.Filename
                                                    };
                                                    mediaData.timeOptionsData = {
                                                        timeOptions: []
                                                    };
                                                    if (type == Menutype.MOVIE) {
                                                        var moviePlayerOptions = [{ "name": "Choose automatically", "value": "1" },
                                                            { "name": "Windows Media Player", "value": "2" },
                                                            { "name": "Media Element", "value": "3" },
                                                            { "name": "QuickTime", "value": "4" },
                                                            { "name": "VLC", "value": "5" },
                                                            { "name": "Direct show video", "value": "6" },
                                                            { "name": "Direct show video(EVR)", "value": "7" }
                                                        ];
                                                        $.data(document, "moviePlayerOptions", moviePlayerOptions);
                                                        mediaData.advancedData = {
                                                            moviePlayerOptions: $.grep(moviePlayerOptions, function (e) { return e.value == 1; })[0].name,
                                                            movieBgColor: "#ffffffff",
                                                            movieMemoryClear: false
                                                        };
                                                    }
                                                    $.data(document, "currentPlayList").details.push(mediaData);
                                                });
                                                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                            }
                                        }
                                    });
                                    break;
                                case Menutype.FLASH:

                                    _plugin.htmlElements.content.FileBrowser.container.insmFileBrowser({
                                        thumbnailContainer: PlaylistEditor.find("#thumbnailviewer"),
                                        filetype: type,
                                        onFileSelection: function (e, data) {
                                            if (data.selectedFiles != undefined) {
                                                $.data(document, "FileListFromServer", data.FileList);
                                                var splitItems = data.selectedFiles.split(':');
                                                $.data(document, "FileListFromServer", data.FileList);
                                                $.each(splitItems, function (e, Id) {
                                                    mediaData = {};
                                                    mediaData.Id = Id;
                                                    mediaData.guid = Math.uuid();
                                                    mediaData.Type = type;
                                                    mediaData.previewData = {
                                                        doNotPlayItem: false,
                                                        duration: "10",
                                                    };
                                                    mediaData.contentData = {
                                                        mediaPath: $.grep($.data(document, "FileListFromServer"), function (e) {
                                                            return e.Id == Id;
                                                        })[0].data.Name,
                                                        zoomOut: false
                                                    };
                                                    mediaData.timeOptionsData = {
                                                        timeOptions: []
                                                    };
                                                    mediaData.advancedData = {
                                                        flashMemoryClear: false
                                                    };
                                                    $.data(document, "currentPlayList").details.push(mediaData);
                                                });
                                                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                            }
                                        }
                                    });
                                    break;
                                case Menutype.WEB_PAGE:
                                    //json object
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
                                    $.data(document, "refreshPageOptions", refreshPageOptions);
                                    mediaData = {};
                                    mediaData.Id = Math.uuid();
                                    mediaData.guid = Math.uuid();
                                    mediaData.Type = type;
                                    mediaData.previewData = {
                                        doNotPlayItem: false,
                                        duration: "10",
                                    };
                                    mediaData.contentData = {
                                        url: "http://www.",
                                        refreshPageOption: $.grep(refreshPageOptions, function (e) { return e.value == 1; })[0].name
                                    };
                                    mediaData.timeOptionsData = {
                                        timeOptions: []
                                    };
                                    $.data(document, "currentPlayList").details.push(mediaData);
                                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                    break;
                                case Menutype.NEWS_FEED:
                                case Menutype.INFORMATION:
                                case Menutype.MENU28:
                                    //json object
                                    var layoutOptions = [{ "name": "Top-aligned", "value": "1" },
                                    { "name": "Centered", "value": "2" },
                                    { "name": "Side by side", "value": "3" }];
                                    $.data(document, "layoutOptions", layoutOptions);
                                    var fontStyleOptions = [{ "name": "Arial", "value": "1" },
                                    { "name": "Calibri", "value": "2" },
                                    { "name": "Cambria", "value": "3" },
                                    { "name": "Franklin Gothic Medium", "value": "4" },
                                    { "name": "Segoe UI", "value": "5" },
                                    { "name": "Times New Roman", "value": "6" },
                                    { "name": "Tahoma", "value": "7" },
                                    { "name": "Segoe Print", "value": "8" },
                                    { "name": "Segoe Script", "value": "9" }];
                                    $.data(document, "fontStyleOptions", fontStyleOptions);
                                    var infoLayoutOptions = [{ "name": "Top-aligned", "value": "1" },
                                    { "name": "Centered", "value": "2" }];
                                    $.data(document, "infoLayoutOptions", infoLayoutOptions);
                                    mediaData = {};
                                    mediaData.Id = Math.uuid();
                                    mediaData.guid = Math.uuid();
                                    mediaData.Type = type;
                                    mediaData.previewData = {
                                        doNotPlayItem: true,
                                        duration: "10",
                                        transition: "Fade"
                                    };
                                    if (type == Menutype.NEWS_FEED) {
                                        mediaData.contentData = {
                                            rssUrl: "http://",
                                            layoutOption: $.grep(layoutOptions, function (e) { return e.value == 1; })[0].name,
                                            bgImage: "",
                                            titleStyle: { fontStyle: $.grep(fontStyleOptions, function (e) { return e.value == 1; })[0].name, fontSize: "50", bold: 0, italic: 0, shadow: 0, align: 1, color: "#ffffffff" },
                                            textStyle: { fontStyle: $.grep(fontStyleOptions, function (e) { return e.value == 1; })[0].name, fontSize: "50", bold: 0, italic: 0, shadow: 0, align: 1, color: "#ffffffff" }
                                        };
                                        mediaData.advancedData = {
                                            username: "",
                                            password: "",
                                            fontScale: 100,
                                            marginScale: 100,
                                            maxNoOfItems: 100,
                                            noRss: "No Rss"
                                        };
                                    }
                                    if (type == Menutype.INFORMATION) {
                                        mediaData.contentData = {
                                            infoLayoutOption: $.grep(infoLayoutOptions, function (e) { return e.value == 1; })[0].name,
                                            bgImage: "",
                                            title: { fontStyle: $.grep(fontStyleOptions, function (e) { return e.value == 1; })[0].name, fontSize: "50", bold: 0, italic: 0, shadow: 0, align: 1, color: "#ffffffff", text: "" },
                                            text: { fontStyle: $.grep(fontStyleOptions, function (e) { return e.value == 1; })[0].name, fontSize: "50", bold: 0, italic: 0, shadow: 0, align: 1, color: "#ffffffff", text: "" }
                                        };
                                        mediaData.advancedData = {
                                            fontScale: 100,
                                            marginScale: 100,
                                        };
                                    }
                                    mediaData.timeOptionsData = {
                                        timeOptions: []
                                    };
                                    $.data(document, "currentPlayList").details.push(mediaData);
                                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                    break;
                                case Menutype.PLAYLIST:
                                case Menutype.MUSIC_STREAM_FILE:
                                    mediaData = {};
                                    mediaData.Id = Math.uuid();
                                    mediaData.guid = Math.uuid();
                                    mediaData.Type = type;
                                    mediaData.previewData = {
                                        doNotPlayItem: false,
                                        playUntillFinish: true,
                                        duration: "10",
                                        transition: "Fade",
                                        volume: null,
                                        mute: false
                                    };
                                    if (type == Menutype.MUSIC_STREAM_FILE) {
                                        mediaData.contentData = {
                                            musicStreamUrl: "http://",
                                        };
                                    }
                                    if (type == Menutype.PLAYLIST) {
                                        mediaData.contentData = {
                                            playlist: -1
                                        };

                                    }
                                    mediaData.timeOptionsData = {
                                        timeOptions: []
                                    };
                                    $.data(document, "currentPlayList").details.push(mediaData);
                                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                    break;
                                case Menutype.SKANSKA_TRIPLE_NEWS:
                                    break;
                                case Menutype.SWEDBANK_IMAGE:
                                    break;
                                default:
                            }
                        }
                    });
                });
                //Selected thumbnail list removed 
                _plugin.htmlElements.content.PlayListEditor.toolbar.removeMedia.container.on("click", function () {
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("removeSelectedItem");
                });
                //Thumbnail list up navigation
                _plugin.htmlElements.content.PlayListEditor.toolbar.moveUp.container.on("click", function () {
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("moveUpSelectedItem");
                });
                //Thumbnail list down navigation
                _plugin.htmlElements.content.PlayListEditor.toolbar.moveDown.container.on("click", function () {
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("moveDownSelectedItem");
                });
                // Click event of add new play list
                _plugin.htmlElements.content.Startup.tableview.cmdnewPlayList.container.on("click", function (e) {
                    Startup = $(e.currentTarget.parentElement.parentElement);
                    PlaylistEditor = $($(e.currentTarget.parentElement.parentElement).next());
                    _plugin.htmlElements.content.NewPlayList.container.insmLighbox({
                        openFrom: 1,
                        oncancel: function (event) {
                        },
                        // on List Ok Button Event
                        onsubmit: function (event, data) {

                            //create an instance of array utility
                            var playlistmanager = new ArrayUtility();
                            $.data(document, "playlistmanager", playlistmanager);

                            //declare playlist master to save each playlist in it.
                            var playlistMaster = [];
                            $.data(document, "playListMaster", playlistMaster);

                            $('.insm-playlisteditor-process-container').empty();
                            $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer();
                            //addPlaylistValues.push({ value: 0, name: data, active: true, selected: true });
                            //$.data(document, "fillNewPlaylist", addPlaylistValues);
                            // Fill the Combo-Box and Enter Value

                            PlaylistEditor.find("#spnfileName").text("Filename:" + data);
                            $('#insm-resolutionFilter').insmSpinnerResolution("sendResolutionValue");
                            $.data(document, "playlistName", data);

                            //$.data(document, "playlistDatabase", []);
                            //$.data(document, "MedialistDatabase", []);

                            Startup.css("display", "none");
                            $('#ShowInfoMsgs').css("display", "none");
                            var playlistinfo = $.data(document, "playlistmanager");

                            //create new playlist
                            var newPlayList = {
                                playListId: 0,
                                playListName: $.data(document, "playlistName"),
                                resolution: $.data(document, "resolutionInfo"),
                                active: true,
                                selected: true,
                                details: [], //array of each items added in this playlist
                            };

                            //set as current Playlist
                            $.data(document, "currentPlayList", newPlayList);

                            //add new playlist in to playlist master.
                            $.data(document, "playlistmanager").addPlaylisttoMemory(newPlayList);

                            // Fill the Combo-Box and Enter Value
                            $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);

                            PlaylistEditor.css("display", "block");
                            var data = $this.find("#files");

                        }
                    });
                });
                // cancel event of playlist
                _plugin.htmlElements.content.PlayListEditor.toolbar.cancel.container.on("click", function () {
                    $this.find("#thumbnailviewer").empty();
                    Startup.css("display", "block");
                    PlaylistEditor.css("display", "none");
                    $('#ShowInfoMsgs').css("display", "");
                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("emptyAllMediaCollection");
                    $('.insm-playlisteditor-process-container').empty();
                });
                // More button functinality for playlist
                _plugin.htmlElements.content.PlayListEditor.toolbar.more.container.css("margin-right", "3px").on("click", function (e) {
                    var menuItems = [{ "name": "Export Playlist to file", "type": "EXPORT_PLAYLIST_TO_FILE" },
                                    { "name": "Import Playlist to file", "type": "IMPORT_PLAYLIST_TO_FILE" },
                                    { "name": "File Browser...", "type": "FILE_BROWSER" },
                                    { "name": "Manage template add-ons...", "type": "MANAGE_TEMPLATE_ADD_ONS" }];
                    $('#cmdmore').menu({
                        menuItems: menuItems,
                        onMenuItemClick: function (e, type) {
                            switch (type) {
                                case Menutype.EXPORT_PLAYLIST_TO_FILE:
                                    alert("EXPORT PLAYLIST TO FILE");
                                    //$.insmFramework('convert', {
                                    //    mimetype: 'text/xml',
                                    //    data: "<?xml version='1.0' encoding='utf-8'?><PlaybackData> <Playlists> <Playlist> <DisplayName>gdata</DisplayName> <Id>2fc6102a-2009-4166-bf66-77e2ce2eeedc</Id> <IsActive>true</IsActive> <ShufflePlaylist>false</ShufflePlaylist> <Width>1920</Width> <Height>1080</Height> <Items><PlaylistItem><AutoDuration>false</AutoDuration> <Description>Video</Description> <Duration>102</Duration> <Id>40b5a1cb-5e0d-4985-bf4c-23f6b70655ec</Id> <IsEnabled>true</IsEnabled> <IsOverlay>false</IsOverlay> <IsVolumeMuted>false</IsVolumeMuted> <IsOverrideSound>false</IsOverrideSound> <RecurrenceInterval>0</RecurrenceInterval> <LastPlayed>0001-01-01T00:00:00</LastPlayed> <OveriddenValues/> <ItemTags/> <PropertyValues><PropertyValue> <Value>movie1.6cf568e1-0e78-4e89-b8c8-af033edc451c.MP4</Value> <Key>Video</Key> <DisplayValue>movie1.MP4</DisplayValue> <FileName>movie1.6cf568e1-0e78-4e89-b8c8-af033edc451c.MP4</FileName> <DefaultPermission>Write</DefaultPermission> </PropertyValue><PropertyValue> <Value/> <Key>MovieUrl</Key> <DisplayValue/> <FileName/> <DefaultPermission>Write</DefaultPermission> </PropertyValue><PropertyValue> <Value>auto</Value> <Key>MoviePlayerType</Key> <DisplayValue/> <FileName/> <DefaultPermission>Write</DefaultPermission> </PropertyValue><PropertyValue> <Value/> <Key>VLCCommands</Key> <DisplayValue/> <FileName/> <DefaultPermission>Write</DefaultPermission> </PropertyValue></PropertyValues> <TemplateName>Video</TemplateName> <TemplateFileId>0</TemplateFileId> <DisplayTimes/> <TransitionEffect>Fade</TransitionEffect> <Volume>1</Volume> <PermissionExceptions/> <DefaultPermission>Write</DefaultPermission></PlaylistItem><PlaylistItem><AutoDuration>false</AutoDuration> <Description>Audio</Description> <Duration>101</Duration> <Id>980427cd-2d7f-49b4-ab5e-306877b77984</Id> <IsEnabled>true</IsEnabled> <IsOverlay>false</IsOverlay> <IsVolumeMuted>false</IsVolumeMuted> <IsOverrideSound>false</IsOverrideSound> <RecurrenceInterval>0</RecurrenceInterval> <LastPlayed>0001-01-01T00:00:00</LastPlayed> <OveriddenValues/> <ItemTags/> <PropertyValues><PropertyValue> <Value>g.4a95f66c-224c-492b-9271-8604ff72a1d7.mp3</Value> <Key>Audio</Key> <DisplayValue>g.mp3</DisplayValue> <FileName>g.4a95f66c-224c-492b-9271-8604ff72a1d7.mp3</FileName> <DefaultPermission>Write</DefaultPermission> </PropertyValue></PropertyValues> <TemplateName>Audio</TemplateName> <TemplateFileId>0</TemplateFileId> <DisplayTimes/> <TransitionEffect>None</TransitionEffect> <Volume>1</Volume> <PermissionExceptions/> <DefaultPermission>Write</DefaultPermission></PlaylistItem><PlaylistItem><AutoDuration>false</AutoDuration> <Description>Flash</Description> <Duration>10</Duration> <Id>69d2b9e0-2480-41ad-83fa-52de6c478170</Id> <IsEnabled>true</IsEnabled> <IsOverlay>false</IsOverlay> <IsVolumeMuted>false</IsVolumeMuted> <IsOverrideSound>false</IsOverrideSound> <RecurrenceInterval>0</RecurrenceInterval> <LastPlayed>0001-01-01T00:00:00</LastPlayed> <OveriddenValues/> <ItemTags/> <PropertyValues><PropertyValue> <Value>Stick_Fight.da1a1432-8cca-4be3-a5b4-7d657d55b8aa.swf</Value> <Key>Flash</Key> <DisplayValue>Stick_Fight.swf</DisplayValue> <FileName>Stick_Fight.da1a1432-8cca-4be3-a5b4-7d657d55b8aa.swf</FileName> <DefaultPermission>Write</DefaultPermission> </PropertyValue><PropertyValue> <Value>True</Value> <Key>AlwaysRestart</Key> <DisplayValue/> <FileName/> <DefaultPermission>Write</DefaultPermission> </PropertyValue><PropertyValue> <Value>True</Value> <Key>ZoomOut</Key> <DisplayValue/> <FileName/> <DefaultPermission>Write</DefaultPermission> </PropertyValue></PropertyValues> <TemplateName>Flash</TemplateName> <TemplateFileId>0</TemplateFileId> <DisplayTimes/> <TransitionEffect/> <Volume>1</Volume> <PermissionExceptions/> <DefaultPermission>Write</DefaultPermission></PlaylistItem></Items> <PermissionExceptions/> <DefaultPermission>Write</DefaultPermission></Playlist></Playlists> <AddonDirectories> <int>39</int> </AddonDirectories> <LastUpdate>2014-12-10T07:38:50.604Z5.5</LastUpdate> <LastPlaybackStarted>0001-01-01T00:00:00</LastPlaybackStarted> <Name>gdata</Name></PlaybackData>",
                                    //    filename: "gdata"
                                    //});
                                    break;
                                case Menutype.IMPORT_PLAYLIST_TO_FILE:
                                    var rowFileInformation = [];
                                    var currnetContentID;
                                    //New Vesion with import popup
                                    _plugin.htmlElements.content.extraComponenets.importPopup.importPopup({
                                        fileUI: _plugin.htmlElements.content.extraComponenets.fileforImport,
                                        parentUI: $this,
                                        onCallRemoteCollection: function () {
                                            //var dataSource = [{ "id": "2", "subItems": [{ "id": "4", "subItems": [], "inUse": false, "name": "ky", "modificationDate": "2014-10-31 12:43:00", "modifiedBy": "instoremedia", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "135", "subItems": [], "inUse": false, "name": "ky", "modificationDate": "2014-11-18 09:52:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "142", "subItems": [], "inUse": false, "name": "ky", "modificationDate": "2014-11-19 06:15:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }], "inUse": false, "name": "ky", "modificationDate": "2014-10-31 12:15:00", "modifiedBy": "instoremedia", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "37", "subItems": [], "inUse": false, "name": "Sample1", "modificationDate": "2014-11-06 10:36:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "40", "subItems": [], "inUse": false, "name": "Sample2", "modificationDate": "2014-11-06 10:38:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "144", "subItems": [], "inUse": false, "name": "gtl_test", "modificationDate": "2014-11-19 06:29:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "153", "subItems": [], "inUse": false, "name": "sample4", "modificationDate": "2014-11-24 14:25:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "269", "subItems": [], "inUse": false, "name": "test 30-Dec", "modificationDate": "2014-12-30 13:15:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "349", "subItems": [], "inUse": false, "name": "test340", "modificationDate": "2015-01-12 06:59:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "354", "subItems": [], "inUse": false, "name": "timeOptiontest", "modificationDate": "2015-01-12 10:48:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }, { "id": "355", "subItems": [], "inUse": false, "name": "to", "modificationDate": "2015-01-13 07:07:00", "modifiedBy": "pmtohtml", "orientation": "Landscape", "resolution": "", "regionID": 0, "dataSetId": 0 }];

                                            var dataSource = [];
                                            $.insmFramework('getDirectoryInformation', {
                                                regionid: 1,
                                                contentDirectoryName: 'Data',
                                                success: function (e) {
                                                    $.insmFramework('getPlayList', {
                                                        contentdirectoryid: e.Id,
                                                        success: function (data) {
                                                            //dataSource = data.MediaFiles;
                                                            var dataSource = playlistuiReferenceForGlobal.insmPlayListGridUI('getPlayListforImport', data.MediaFiles);
                                                            var dialog = _plugin.htmlElements.content.extraComponenets.remotePlaylistPopupContianer.remotePlayList({
                                                                targetLocation: document,
                                                                onSelectRemotePlayList: function (e, obj) {
                                                                    $.each(obj.data, function (index, item) {
                                                                        item.playListId = $.data(document, "playListMaster").length;

                                                                        $.each(item.details, function (i, items) {
                                                                            var timeOptionsData = { timeOptions: items.timeOptionsData };
                                                                            items.timeOptionsData = timeOptionsData;
                                                                        });
                                                                        $.data(document, "playListMaster").push(item);

                                                                    });
                                                                    $.data(document, "currentPlayList", $.data(document, "playListMaster")[$.data(document, "playListMaster").length - 1]);
                                                                    $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                                                    $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);

                                                                }
                                                            });
                                                            dialog.remotePlayList("invokeDialog", dataSource);
                                                        }
                                                    });
                                                }
                                            });

                                        }
                                    });
                                    _plugin.htmlElements.content.extraComponenets.importPopup.importPopup("InvokeDialog");
                                    //                                    =================OLD Version=================================
                                    //_plugin.htmlElements.content.extraComponenets.fileforImport.trigger('click');
                                    //_plugin.htmlElements.content.extraComponenets.fileforImport.on('change', function (e) {
                                    //    var fileshandler = e.target.files[0];
                                    //    var reader = new FileReader();
                                    //    reader.readAsText(fileshandler);
                                    //    reader.onload = (function (theFile) {
                                    //        return function (e) {
                                    //            var rowxmldata = e.target.result;
                                    //            $.insmFramework('getDirectoryListForFileBrowser', {
                                    //                contentDirectoryName: 'Media',
                                    //                success: function (e) {
                                    //                    currnetContentID = e.Id;
                                    //                    $.insmFramework('getFileListForFileBrowser', {
                                    //                        contentDirectoryId: currnetContentID,
                                    //                        success: function (e) {
                                    //                            $.each(e.MediaFiles, function (index, item) {
                                    //                                var row = {};
                                    //                                row.Id = item.Id;
                                    //                                row.isFolder = false;
                                    //                                row.data = item;
                                    //                                rowFileInformation.push(row);
                                    //                            });
                                    //                            arrayProccesor = new ArrayUtility();
                                    //                            var obj = arrayProccesor.convertXmltoPlayList(rowxmldata, rowFileInformation);

                                    //                            obj.playListId = $.data(document, "playListMaster").length;
                                    //                            $.data(document, "currentPlayList", obj);
                                    //                            $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("associateThumbnailMediaData", $.data(document, "currentPlayList").details);
                                    //                            $.data(document, "playlistmanager").addPlaylisttoMemory(obj);
                                    //                            $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, true, false);
                                    //                        }
                                    //                    });
                                    //                }
                                    //            });
                                    //        };
                                    //    })(fileshandler);
                                    //});
                                    break;
                                case Menutype.FILE_BROWSER:
                                    _plugin.htmlElements.content.FileBrowser.container.insmFileBrowser({
                                        thumbnailContainer: PlaylistEditor.find("#thumbnailviewer"),
                                        filetype: Menutype.ALL
                                    });
                                    break;
                                case Menutype.MANAGE_TEMPLATE_ADD_ONS:
                                    _plugin.htmlElements.content.extraComponenets.templateUI.insmAddOnManager();
                                    _plugin.htmlElements.content.extraComponenets.templateUI.insmAddOnManager("InvokeDialog");
                                    break;
                                default:
                            }
                        }
                    });
                });

                // More button functinality for playlist
                _plugin.htmlElements.content.Startup.tableview.More.container.css("margin-right", "3px").on("click", function (e) {
                    var menuItems = [{ "name": "Manage template add-ons...", "type": "MANAGE_TEMPLATE_ADD_ONS" }];
                    $('#cmdMorePlaylist').menu({
                        menuItems: menuItems,
                        onMenuItemClick: function (e, type) {
                            switch (type) {
                                case Menutype.MANAGE_TEMPLATE_ADD_ONS:
                                    _plugin.htmlElements.content.extraComponenets.templateUI.insmAddOnManager();
                                    _plugin.htmlElements.content.extraComponenets.templateUI.insmAddOnManager("InvokeDialog");
                                    break;
                            }
                        }
                    });
                });
            }
            return _plugin.settings.target;
        },

        fullscreen: function (options) {
            $this.insmPlayListManager('renderPlayListUI');
        },

        hasSettings: function () {
            return false;
        },

        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayListManager');
            $this.data('insmPlayListManager', null).empty();
            return $this;
        },


        //This function will add TabUI to the Container
        //Params:Container Object as UI
        applyTabUI: function (mediaId, mediaType, contentData, timeOptionsData, advancedData) {
            var contentcontainer = $(this);

            if (contentcontainer.find(".insm-tabs").length == 0) {

                var heightContainer = contentcontainer.height() - 50;
                var widthContainer = contentcontainer.width() - 20;

                //var heightContainer = 459;
                //var widthContainer = 759;
                contentcontainer.append(function () {
                    var tabs = {};
                    //content
                    tabs.content = { title: "Content", content: $('<div id="contentdata" style="height:' + heightContainer + 'px;width:' + widthContainer + 'px" />') };
                    tabs.content.content.contentUI({ mediaId: mediaId, mediaType: mediaType, contentData: contentData });
                    //timeOption
                    tabs.timeOptions = { title: "Time options", content: $('<div  id="timeoptionsdata" style="height:' + heightContainer + 'px;width:' + widthContainer + 'px" />') };
                    // tabs.timeOptions.content.timeOptionsUI({ mediaId: mediaId, mediaType: mediaType, timeOptionsData: timeOptionsData });

                    //advanced 
                    if (advancedData != null) {
                        tabs.advanced = { title: "Advanced", content: $('<div id="advanceddata" style="height:' + heightContainer + 'px;width:' + widthContainer + 'px" />') };
                        tabs.advanced.content.advancedUI({ mediaId: mediaId, mediaType: mediaType, advancedData: advancedData });
                    }
                    return $('<div />').insmTabs({
                        tabs: tabs,
                        onSelect: function (index) {
                            if (index == 0) //render content UI
                            {
                                tabs.content.content.empty();
                                tabs.content.content.contentUI({ mediaId: mediaId, mediaType: mediaType, contentData: contentData });
                            }
                            if (index == 1) //render time options UI
                            {
                                tabs.timeOptions.content.empty();
                                tabs.timeOptions.content.timeOptionsUI({ mediaId: mediaId, mediaType: mediaType, timeOptionsData: timeOptionsData });
                                // $('#timeoptionsdata').css('height', heightContainer).css('width', widthContainer);
                            }
                            if (index == 2) //render advanced UI
                            {
                                tabs.advanced.content.empty();
                                tabs.advanced.content.advancedUI({ mediaId: mediaId, mediaType: mediaType, advancedData: advancedData });
                            }

                        }
                    });
                });

                var id = setTimeout(function () {
                    clearTimeout(id);
                    var heightContainer = $('.insm-playlisteditor-process-content').height() - 50;
                    var widthContainer = $('.insm-playlisteditor-process-content').width() - 20;
                    $('#contentdata').css('height', heightContainer).css('width', widthContainer);
                    $('#timeoptionsdata').css('height', heightContainer).css('width', widthContainer);
                    $('#advanceddata').css('height', heightContainer).css('width', widthContainer);
                    //  $('#advanceddata').css('height', '621.5px').css('width', '953.5px');
                }, 300);
            }
        },

        // Show Warning Box while active playlist try to remove
        showWarningBoxOnActivePlaylistOnRemove: function (selectedPlaylistValueTobeRemove) {
            _plugin.htmlElements.content.NewPlayList.container.insmWarning({
                onYes: function () {
                    var newActivateValue = 0;
                    // To Remove selected playlist item 
                    _plugin.htmlElements.content.NewPlayList.container.insmServerProcessingLoader({ text: 'Please Wait' });
                    _plugin.htmlElements.content.NewPlayList.container.insmServerProcessingLoader("InvokeDialog");
                    $("#insm-playlistNamesDropdown option[value='" + selectedPlaylistValueTobeRemove + "']").remove();
                    // Updating the Array, by matching Value
                    var matchingIndex;
                    var isMatched = false;
                    $.each(addPlaylistValues, function (items) {
                        if (addPlaylistValues[Number(items)].playlistValue == selectedPlaylistValueTobeRemove) {
                            matchingIndex = Number(items);
                            isMatched = true;
                            newActivateValue = items;
                        }
                    });

                    if (isMatched) {
                        addPlaylistValues.splice(matchingIndex, 1);
                        // If the Active item is last in the array
                        if (newActivateValue == addPlaylistValues.length)
                            newActivateValue -= 1;

                        addPlaylistValues[newActivateValue].active = true;
                        addPlaylistValues[newActivateValue].selecetd = true;
                        // Fill the Combo-Box and Enter Value
                        $this.insmPlayListManager('EnterValueForPlayListNameCombo', true, false, true);
                    }

                    _plugin.htmlElements.content.NewPlayList.container.insmServerProcessingLoader("closeDialog");

                },
                onNo: function () { }
            });
            _plugin.htmlElements.content.NewPlayList.container.insmWarning("InvokeDialog");
        },
    };

    $.fn.insmPlayListManager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPluginTemplate');
        }
    };

})(jQuery);