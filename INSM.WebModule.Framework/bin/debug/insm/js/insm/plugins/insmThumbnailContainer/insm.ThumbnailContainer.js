/// <reference path="../../framework/utility/insmEnums.js" />
// Global variables
var playListData = new Array();
var item = 0;
var thumbnailList = new Array();
var selectedThumbnailIndex = null;
var selectThumbnail = null;
var recentlyAddedItem = null;
var resolution = null;
var ThumbnailViewUIManager = {
    version: "0.0.1",

    // Declare value and events
    options: {},

    // Plugin creation
    _create: function () {
        contextObjectOfThumbnailContainer = this;
        root_thumbnailViewUI = this.element;
    },

    // Initialization of this plugin
    _init: function () {
        item = 0;
        var selectedElementName = "insm-outerdiv__0";
        selectedThumbnailElement = selectedElementName;
        this._setThumbnailContainerHtml();
    },

    // Set Html for thumbnail view 
    _setThumbnailContainerHtml: function () {
        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                dialog: {
                    container: $("<div />").addClass("insm-thumbanail-div").attr("id", "insm-thumbnail-parent-div"),
                }
            }
        }
        //Append html on root target
        root_thumbnailViewUI.append(_plugin.htmlElements.content.dialog.container);
    },

    // Takes data collection of associated media type
    associateThumbnailMediaData: function (thumbnailListCollection) {
        if (thumbnailListCollection.length != 0) {

            recentlyAddedItem = thumbnailListCollection[thumbnailListCollection.length - 1];
        }

        thumbnailList = thumbnailListCollection;
        // For each thumbs generate random uniq id and assign indexing
        $.each(thumbnailList, function (items) {
            // thumbnailList[items].index = index;
            thumbnailList[items].guid = Math.uuid(15);
            thumbnailList[items].playlistId = $.data(document, "currentPlayList").playListId;
            // thumbnailList[items].detail = {};
        });

        //Create playlist with all selected media items with all settings data.
        // this._associateMediaSettingsData();
        // Store playlist data in global for further usage
        $.data(document, "playlistinfo", playListData);
        // Now thumbnail list get ready to show on
        $.data(document, "thumbnaillistinfo", thumbnailList);

        contextObjectOfThumbnailContainer._getThumbnailList($.data(document, "thumbnaillistinfo"));
        contextObjectOfThumbnailContainer._showThumbnailList();

    },

    // Get ready thumbnail list depend on collection data and length
    _showThumbnailList: function () {
        // Get Empty html container to show fresh data on every call
        $('.insm-playlisteditor-process-container').empty();
        $('.insm-thumbanail-div').empty();
        //TODO: set duration static as of now once it will get it from server change it 
        var duration = null;
        //TODO: $.each html is not converted as per feedback
        $.each(thumbnailList, function (items, splitItems) {
            if (splitItems.Type == 2 || splitItems.Type == 9 || splitItems.Type == 16) {
                duration = 0;
            } else {
                duration = splitItems.previewData.duration;
            }

            var innerHtml = '';
            item++;
            var thumbnailHeader = Menutype[splitItems.Type];
            var thumbnailType = splitItems.Type;
            var itemNumber = items + 1;
            thumbnailHeader = contextObjectOfThumbnailContainer._convertCapsToCamelCase(thumbnailHeader);
            thumbnailList[items].localID = items;
            var indicatorID = "insm-indecator_" + items;
            // HTML processing depedend on data collection items
            innerHtml += '<div id="insm-outerdiv__' + items + '" class="mainDiv insm-thumbnail-outer-div" data-guid="' + splitItems.guid + '" data-index="' + splitItems.index + '"  data-location="' + splitItems.Id + item + '" data-Id="' + splitItems.Id + '" data-mediaType="'
                + thumbnailType + '" data-headerValue="' + thumbnailHeader + '" ><div class="insm-thumbnail-middle-div"><span>';
            innerHtml += itemNumber + '. ' + thumbnailHeader + '</span><span class="insm-thumbnail-duration" id="' + indicatorID + '">';
            innerHtml += '<div class="insm-playlist-manager-thumbnail-indicator-basicBlock"></div><span>' + duration + ' Sec</span></span></div>';
            innerHtml += '<div id="innerContainer' + splitItems.Id + '" class="insm-thumbnail-inner-div"><div class="insm-playlist-manager-thumbnail-media-div mediaDiv' + splitItems.Id + item + '" data-type="' + splitItems.Type + '" " data-guid="' + splitItems.guid + '"></div></div>';
            innerHtml += '</div>';



            // Append html in main parent div
            $('.insm-thumbanail-div').append(innerHtml);

            var indicatorUI = $('#' + indicatorID);
            $.data(document, 'indicatorLocation', indicatorUI);
            if (splitItems.Type == 2 || splitItems.Type == 9 || splitItems.Type == 16) {
                if (splitItems.timeOptionsData.timeOptions != undefined) {
                    if (splitItems.timeOptionsData.timeOptions.length == 0) {
                        //set visible false for time indication in case of movie,audio etc..
                        indicatorUI.css('display', 'none');
                    } else {
                        contextObjectOfThumbnailContainer._isTodayWithinRange(splitItems.timeOptionsData.timeOptions, indicatorUI, splitItems.previewData.duration);
                    }
                }
                else {
                    indicatorUI.find('span').text(splitItems.previewData.duration + ' Sec');
                }
            } else {
                indicatorUI.find('span').text(splitItems.previewData.duration + ' Sec');
            }

            // Applying selected border view on last thumb in whole list
            if (recentlyAddedItem != null) {

                $('.mainDiv[data-index="' + recentlyAddedItem.index + '"]').removeClass('insm-thumbnail-outer-div');
                $('.mainDiv[data-index="' + recentlyAddedItem.index + '"]').addClass('insm-thumbnail-outer-div-select');
            }

            //Get ready thumbnail view passing by id and get media path to show on
            $('.mediaDiv' + splitItems.Id + item).ThumbnailUI({ Id: splitItems.Id, mediaType: splitItems.Type });

        });
        //set thumbnail css based on applied resolution
        var id = setTimeout(function () {
            clearTimeout(id);
            $(".mainDiv").Resolution({ resolution: $.data(document, "currentPlayList").resolution, containerWidth: $("#insm-thumbnail-parent-div").width() - 10 });
            $(".insm-thumbnail-inner-div").height($(".mainDiv").height() - 30 + "px");
        }, 200);



        //Get preview ready to show of last added item
        if (recentlyAddedItem != null) {

            var selectedItemInPlaylistdef = $.grep($.data(document, "currentPlayList").details, function (e) {
                return e.guid == recentlyAddedItem.guid;
            });

            $.data(document, "currentMediaItem", selectedItemInPlaylistdef);

            if (selectedItemInPlaylistdef.length > 0) {
                if (selectedItemInPlaylistdef[0].Type == Menutype.IMAGE) {
                    var changestyle = $('.insm-thumbnail-outer-div-select').find('.insm-playlist-manager-thumbnail-media-div');
                    switch (selectedItemInPlaylistdef[0].contentData.imageScalling) {
                        case '1': // SCALE TO FIT
                            $(changestyle).removeClass('insm-thumbnail-strech');
                            $(changestyle).removeClass('insm-thumbnail-fillancrop');
                            $(changestyle).addClass('insm-thumbnail-scaletofit');

                            $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                            $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                            $(".previewScreenDiv").addClass('insm-thumbnail-scaletofit');
                            break;
                        case '2': // STRECH
                            $(changestyle).removeClass('insm-thumbnail-fillancrop');
                            $(changestyle).removeClass('insm-thumbnail-scaletofit');
                            $(changestyle).addClass('insm-thumbnail-strech');

                            $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                            $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                            $(".previewScreenDiv").addClass('insm-thumbnail-strech');
                            break;
                        case '3': // FILL AND CROP
                            $(changestyle).removeClass('insm-thumbnail-strech');
                            $(changestyle).removeClass('insm-thumbnail-scaletofit');
                            $(changestyle).addClass('insm-thumbnail-fillancrop');

                            $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                            $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                            $(".previewScreenDiv").addClass('insm-thumbnail-fillancrop');
                            break;
                    }
                }
            }
            var dheader = Menutype[recentlyAddedItem.Type];
            if (selectedItemInPlaylistdef.length > 0) {
                $('.insm-playlisteditor-process-container').PreviewContainer({ mediaId: recentlyAddedItem.Id, mediaGuid: recentlyAddedItem.guid, mediaType: parseInt(recentlyAddedItem.Type), headerValue: contextObjectOfThumbnailContainer._convertCapsToCamelCase(dheader), previewData: selectedItemInPlaylistdef[0].previewData });
                $(".insm-playlisteditor-process-content").insmPlayListManager("applyTabUI", recentlyAddedItem.Id, parseInt(recentlyAddedItem.Type), selectedItemInPlaylistdef[0].contentData, selectedItemInPlaylistdef[0].timeOptionsData, selectedItemInPlaylistdef[0].advancedData);
            }

        }
        // Click on thumbs to save data in memory for next view
        $(".mainDiv").click(function (e) {


            //get  data to update previous selected item
            // var dataToUpdate = $('.insm-playlisteditor-process-container').PreviewContainer("getDataToSave");

            // On Click of thumbs, Item will change the selection
            //$(".insm-thumbnail-outer-div").click(function (e) {
            selectedThumbnailElement = e.currentTarget.id;
            var mediaTypeVal = $("#" + selectedThumbnailElement).attr('data-mediaType');
            var headerVal = $("#" + selectedThumbnailElement).attr('data-headerValue');
            var mediaId = $("#" + selectedThumbnailElement).attr('data-Id');
            var mediaGuid = $("#" + selectedThumbnailElement).attr('data-guid');
            selectedThumbnailIndex = $("#" + selectedThumbnailElement).attr('data-index');
            $.data(document, 'indicatorLocation', $($(e.target).parent().prev().find('span')[1]));
            var selectedItemInPlaylist = $.grep($.data(document, "currentPlayList").details, function (e) {
                return e.guid == mediaGuid;
            });
            $.data(document, "currentMediaItem", selectedItemInPlaylist);
            
            //Here we set RightHandside Indicator when you click on perticular media
            //Type

            var splitItems = selectedItemInPlaylist[0];
            if (splitItems.Type == 2 || splitItems.Type == 9 || splitItems.Type == 16) {
                if (splitItems.timeOptionsData.timeOptions != undefined) {
                    if (splitItems.timeOptionsData.timeOptions.length == 0) {
                        //set visible false for time indication in case of movie,audio etc..
                    } else {
                        //contextObjectOfThumbnailContainer._isTodayWithinRange(splitItems.timeOptionsData.timeOptions, indicatorUI, splitItems.previewData.duration);

                        contextObjectOfThumbnailContainer._isTodayWithinRangeForRHS(splitItems.timeOptionsData.timeOptions, $.data(document, 'rightHandIndicator'));
                    }
                }
            }

            //console.log($.data(document, "currentPlayList").details);
            //console.log(selectedItemInPlaylist);
            //if ($.data(document, "currentPlayList").details.length <= 1) {
            //    $('#cmdmoveup').attr('disabled', 'disabled');
            //    $('#cmdmovedown').attr('disabled', 'disabled');
            //} else {
            //}
            //if (selectedItemInPlaylist[0].guid == $.data(document, "currentPlayList").details[0].guid) {
            //    $('#cmdmoveup').attr('disabled', 'disabled');
            //} else {
            //    $('#cmdmoveup').removeAttr('disabled');
            //}
            //if (selectedItemInPlaylist[0].guid == $.data(document, "currentPlayList").details[$.data(document, "currentPlayList").details.length - 1].guid) {
            //    $('#cmdmovedown').attr('disabled', 'disabled');
            //}
            //else {
            //    $('#cmdmovedown').removeAttr('disabled');
            //}
            if (selectedItemInPlaylist.length > 0) {
                //to show preview data
                $('.insm-playlisteditor-process-container').PreviewContainer({ mediaId: mediaId, mediaGuid: selectedItemInPlaylist[0].guid, mediaType: parseInt(mediaTypeVal), headerValue: headerVal, previewData: selectedItemInPlaylist[0].previewData });
                //to show content data 
                $(".insm-playlisteditor-process-content").insmPlayListManager("applyTabUI", mediaId, parseInt(mediaTypeVal), selectedItemInPlaylist[0].contentData, selectedItemInPlaylist[0].timeOptionsData, selectedItemInPlaylist[0].advancedData);
            }


            $("#insm-thumbnail-parent-div").each(function (index) {
                $(this).children().removeClass('insm-thumbnail-outer-div-select');
                $(this).children().addClass('insm-thumbnail-outer-div');
            });

            contextObjectOfThumbnailContainer._showSelected(); //give select border click on thumbnail
            $('.module-container').find('div').insmPlayListManager('applyTabUI', $(".insm-playlisteditor-process-content"));


            // set image as per scalling on click // 
            if (selectedItemInPlaylist[0].Type == Menutype.IMAGE) {
                var changestyle = $('.insm-thumbnail-outer-div-select').find('.insm-playlist-manager-thumbnail-media-div');
                switch (selectedItemInPlaylist[0].contentData.imageScalling) {
                    case '1':// SCALE TO FIT
                        $(changestyle).removeClass('insm-thumbnail-strech');
                        $(changestyle).removeClass('insm-thumbnail-fillancrop');
                        $(changestyle).addClass('insm-thumbnail-scaletofit');

                        $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                        $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                        $(".previewScreenDiv").addClass('insm-thumbnail-scaletofit');
                        break;
                    case '2': // STRECH
                        $(changestyle).removeClass('insm-thumbnail-fillancrop');
                        $(changestyle).removeClass('insm-thumbnail-scaletofit');
                        $(changestyle).addClass('insm-thumbnail-strech');

                        $(".previewScreenDiv").removeClass('insm-thumbnail-fillancrop');
                        $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                        $(".previewScreenDiv").addClass('insm-thumbnail-strech');
                        break;
                    case '3':// FILL AND CROP
                        $(changestyle).removeClass('insm-thumbnail-strech');
                        $(changestyle).removeClass('insm-thumbnail-scaletofit');
                        $(changestyle).addClass('insm-thumbnail-fillancrop');

                        $(".previewScreenDiv").removeClass('insm-thumbnail-strech');
                        $(".previewScreenDiv").removeClass('insm-thumbnail-scaletofit');
                        $(".previewScreenDiv").addClass('insm-thumbnail-fillancrop');
                        break;
                }
            }
            //});
            // to get one play list data 
            $.data(document, "thumbnailList", thumbnailList);
        });
    },

    // Set selection on current thumb element
    _showSelected: function () {
        $("#" + selectedThumbnailElement).removeClass('insm-thumbnail-outer-div');
        $("#" + selectedThumbnailElement).addClass('insm-thumbnail-outer-div-select');
    },

    //To Remove current selection from container
    removeSelectedItem: function () {
        contextObjectOfThumbnailContainer._performTaskOnDisplayList("REMOVE", this);
    },
    //To navigate current selection to Upwards
    moveUpSelectedItem: function () {
        contextObjectOfThumbnailContainer._performTaskOnDisplayList("MOVE_UP", this);
    },
    //To navigate current selection to Downwards
    moveDownSelectedItem: function () {
        contextObjectOfThumbnailContainer._performTaskOnDisplayList("MOVE_DOWN", this);
    },

    // This function is combination for Remove Item, Move Up or Down Item
    // taskToBePerformed can be REMOVE / MOVE_UP / MOVE_DOWN
    _performTaskOnDisplayList: function (taskToBePerformed, thisElement) {
        var itemName = selectedThumbnailElement;
        var itemIdForTask = itemName.substr(itemName.lastIndexOf("__") + 2, itemName.length);
        //itemIdForTask = Number(itemIdForTask) - 1 // We have added 1 in name when we created the list

        if (thumbnailList.length >= 1) {
            $.each(thumbnailList, function (items) {
                if (thumbnailList[items].localID == itemIdForTask) {
                    switch (taskToBePerformed) {
                        case "REMOVE":
                            thumbnailList.splice(items, 1);
                            itemIdForTask = Number(itemIdForTask) - 1;
                            selectedThumbnailElement = itemName.substr(0, itemName.lastIndexOf("__")) + "__" + itemIdForTask;
                            return false;
                            break;
                        case "MOVE_UP":
                            if (itemIdForTask > 0) {
                                console.log(itemIdForTask);
                                var a = thumbnailList[items];
                                thumbnailList[items] = thumbnailList[items - 1];
                                thumbnailList[items - 1] = a;
                                itemIdForTask = Number(itemIdForTask) - 1;
                                selectedThumbnailElement = itemName.substr(0, itemName.lastIndexOf("__")) + "__" + itemIdForTask;
                                return false;
                            }
                            break;
                        case "MOVE_DOWN":
                            if (itemIdForTask < thumbnailList.length) {
                                var a = thumbnailList[items];
                                thumbnailList[items] = thumbnailList[items + 1];
                                thumbnailList[items + 1] = a;
                                itemIdForTask = Number(itemIdForTask) + 1;
                                selectedThumbnailElement = itemName.substr(0, itemName.lastIndexOf("__")) + "__" + itemIdForTask;
                                return false;
                            }
                            break;
                    }
                }
            });
            contextObjectOfThumbnailContainer._showThumbnailList();
            contextObjectOfThumbnailContainer._getThumbnailList($.data(document, "thumbnaillistinfo"));
        }
    },


    _getThumbnailList: function (thumbnailList) {
        $.each(thumbnailList, function (i) {
            thumbnailList[i].index = i;
        });
        $.data(document, "MedialistDatabase", thumbnailList);
    },
    //Utility function to convert caps letter in camel case
    _convertCapsToCamelCase: function (str) {
        if (str == undefined) {
            return null;
        }
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    },

    // Destroy plugin references
    _destroy: function () {
        root_thumbnailViewUI.empty();
    },

    // Get empty thumbnail view on cancel event 
    emptyAllMediaCollection: function () {
        thumbnailList = new Array();
    },

    // Set Alpha while do no play item check on from preview container
    setOnAlphaOnDonotPlayItem: function () {
        $("#" + selectedThumbnailElement).fadeTo("fast", .5, function () {
            // Animation complete
        });
    },
    // Remove Alpha while do no play item check off from preview container
    setOffAlphaOnDonotPlayItem: function () {
        $("#" + selectedThumbnailElement).fadeTo("fast", 1, function () {
            // Animation complete
        });
    },
    // Store whole playlist data 
    getPlayListData: function () {
        var playList = {};
    },

    //Central date function i.e define weather Perticular date is withing given range for Right Hand Side
    _isTodayWithinRangeForRHS: function (ardb, indicatorUI) {
        var result = false;
        var indicator = indicatorUI;
        if (!contextObjectOfThumbnailContainer._isAnyVolumeSetAsCustom(ardb)) {
            indicator.removeClass('insm-playlist-manager-thumbnail-blankIndicator');
            if (contextObjectOfThumbnailContainer._isWithinRangeRHS(ardb)) {
                $.data(document, 'flag', 1);
            } else {
                $.data(document, 'flag', 2);
            }
        } else {
            $.data(document, 'flag', 3);
        }
    },

    //This function is check that if any node has set custome mode
    _isAnyVolumeSetAsCustom: function (ardb) {
        var result = false;
        for (var i = 0; i < ardb.length; i++) {
            result = ardb[i].volume.isDefaultVolume;
            if (!result) {
                break;
            }
        }
        return result;
    },

    //Check for if any date is within range for today
    _isWithinRangeRHS: function (ardb) {
        var result = false;
        for (var i = 0; i < ardb.length; i++) {
            var item = ardb[i];
            if (!item.volume.isDefaultVolume) {
                result = contextObjectOfThumbnailContainer._checkTodayWithinRange(item.startDate, item.endDate);
                if (result) {
                    break;
                }
            }
        }
        return result;
    },


    //Central date function i.e define weather Perticular date is withing given range
    _isTodayWithinRange: function (ardb, indicatorUI,duration) {
        var result = false;
        for (var i = 0; i < ardb.length; i++) {
            result = contextObjectOfThumbnailContainer._checkTodayWithinRange(ardb[i].startDate, ardb[i].endDate);
            if (result) {
                break;
            }
        }
        var indicator = indicatorUI.find('div');
        indicatorUI.find('span').text(duration + ' Sec');
        if (result) {
            indicator.removeClass('insm-playlist-manager-thumbnail-orangeIndicator')
            indicator.addClass('insm-playlist-manager-thumbnail-greenIndicator')
        } else {
            indicator.removeClass('insm-playlist-manager-thumbnail-greenIndicator')
            indicator.addClass('insm-playlist-manager-thumbnail-orangeIndicator')
        }
        //Set Perticular Indicator
        //var indicatorUI = $.data(document, 'indicatorLocation');
        //if (indicatorUI != undefined) {
        //    return result;
        //}
    },

    //Utility Function for date range
    _checkTodayWithinRange: function (sDate, eDate) {
        startDate = (sDate == null ? new Date() : new Date(sDate));
        endDate = (eDate == null ? new Date() : new Date(eDate));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        var from = startDate, result;
        var to = endDate;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today >= from) {
            if (today <= to) {
                result = true;
            } else {
                result = false;
            }
        } else {
            result = false;
        }
        return result;
    },


};

(function ($, undefined) {
    var contextObjectOfThumbnailContainer;
    var selectedThumbnailElement, thumbnailList, thumbnail;
    $.widget("insm.ThumbnailContainer", ThumbnailViewUIManager);
})(jQuery);