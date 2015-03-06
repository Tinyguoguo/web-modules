var ArrayUtility = (function () {
    function ArrayUtility() {

    }
    //public function
    /*
    Description:Utility function that gives Element index from array based on property value
    Parameters:Array,Value,Property
    Return:Index number
    */
    ArrayUtility.prototype.getElementLocation = function (arrayObject, property, Value) {
        var location;
        $.each(arrayObject, function (index, item) {
            if (item[property]==Value) {
                location = index;
            }
        });
        return location;
    };

    /*
    Description:Add Playlist to memory
    Parameters:Playlist object
    Return:None
    */
    ArrayUtility.prototype.addPlaylisttoMemory = function (playlistObj) {
        $.data(document, "playListMaster").push(playlistObj);
    }

    /*
    Description:Add Media to memory
    Parameters:Media object
    Return:None
    */
    ArrayUtility.prototype.addMediatoMemory = function (mediaObj) {
        var db = $.data(document, "playlistDatabase");
        db.push(prepareMediaRow);
    }

    //public function
    //Description:This function will call while import Playlist that convert xml to json object
    ArrayUtility.prototype.convertXmltoPlayList = function (rowxmldata, rowFileInformation) {
        var xdoc = $.parseXML(rowxmldata);
        var playlists = $(xdoc).find("Playlist");
        var itemCollection = [];
        $.each(playlists, function (index, item) {
            var basePlayList = getplayListBody(item);
            var Items = $(item).find("PlaylistItem")
            $.each(Items, function (index, item) {
                var detailobj = {
                    "Id": getIDBasedonFilename(item, rowFileInformation),
                    "Type": getMediaType(item),
                    "guid": Math.uuid(15),
                    "playlistId": 0,
                    "index": index,
                    "localID": 0,
                    "previewData": getPreviewType(item),
                    "contentData": getContentType(item),
                    "advancedData": getAdvanceType(item),
                    "timeOptionsData":getTimeOptions(item)
                }
                basePlayList.details.push(detailobj);
            });
            itemCollection.push(basePlayList);
        });
        return itemCollection;
    };

    /*
    Description:convert Time Options from xml to JSON
    Parameters:Time Options in xml
    Return:Time Options in Json
    */
    function getTimeOptions(item) {
        var timeOptions = [];
        $.each($(item).find('DisplayTimes'), function (index, node) {
            $.each($(node).find('TimeOptions'), function (index, timenode) {
                var obj = {
                    "timeOptionId": Math.uuid(),
                    "showAllWeekDays": $(timenode).find('ShowAllWeekdays').text(),
                    "showAllDates": $(timenode).find('ShowAllDates').text(),
                    "showAllHours": $(timenode).find('ShowAllHours').text(),
                    "startTime": null,//$(timenode).find('DoNotPlay').text(),
                    "endTime": null,//$(timenode).find('DoNotPlay').text(),
                    "startDate": null,//$(timenode).find('DoNotPlay').text(),
                    "endDate": null,//$(timenode).find('DoNotPlay').text(),
                    "noEndDate": false,
                    "selectedDays": prepareWeekdayObject($(timenode).find('DayOfWeek')),
                    "volume": {
                        "relatedID": Math.uuid(),
                        "isDefaultVolume": $(timenode).find('DefaultVolumeSelected').text() == "false" ? false : true,
                        "volume": $(timenode).find('Volume').text(),
                        "isMute": $(timenode).find('Mute').text() == "false" ? false : true
                    }
                };
                timeOptions.push(obj);
            });
        });
        return timeOptions;
    }

    function prepareWeekdayObject(days) {
        var daysDetail = [];
        $.each(days, function (index, item) {
            var dayinfo = [];
            var obj = getWeekDaysinfo($(item).text());
            var daydata = {
                "day": obj.number,
                "checkstate": true,
                "fixstate": true,
                "name": obj.shortname
            };
            dayinfo.push(daydata);
            daysDetail.push(dayinfo);
        })
        return daysDetail;
    }

    /*
    Description:convert Week Days from xml to JSON
    Parameters:Week Days in xml
    Return:Week Days in Json
    */
    function getWeekDaysinfo(Name) {
        var day = {};
        switch (Name) {
            case "Monday":
                day = { number: 1, shortname: 'Mon' };
                break;
            case "Tuesday":
                day = { number: 2, shortname: 'Tue' };
                break;
            case "Wednesday":
                day = { number: 3, shortname: 'Wed' };
                break;
            case "Thursday":
                day = { number: 4, shortname: 'Thu' };
                break;
            case "Friday":
                day = { number: 5, shortname: 'Fri' };
                break;
            case "Saturday":
                day = { number: 6, shortname: 'Sat' };
                break;
            case "Sunday":
                day = { number: 7, shortname: 'Sun' };
                break;
        }
        return day;
    }

    function getSelectedDaysObject() {

    }

    /*
    Description:convert Advance Type from xml to JSON
    Parameters:Advance Type in xml
    Return:Advance Type in Json
    */
    function getAdvanceType(item) {
        var content = {};
        var filenode = $(item).find("PropertyValue")[0];

        switch ($(item).find("Description").text()) {
            case "Image":
                content = {
                    "imageBgColor": getValueBasedOnKey(item, "BackgroundColor"),
                }
                break;
            case "Video":
                content = {
                    "moviePlayerOption": getValueBasedOnKey(item, "MoviePlayerType"),
                    "movieBgColor": getValueBasedOnKey(item, "BackgroundColor"),
                    "movieMemoryClear": getValueBasedOnKey(item, "UnloadOnStop"),
                }
                break;
            case "Flash":
                content = {
                    "flashMemoryClear": getValueBasedOnKey(item, "AlwaysRestart"),
                }
                break;
            case "NEWS_FEED":
                content = {
                    "username": getValueBasedOnKey(item, "Username"),
                    "password": getValueBasedOnKey(item, "Password"),
                    "fontScale": getValueBasedOnKey(item, "FontScale"),
                    "marginScale": getValueBasedOnKey(item, "MarginScale"),
                    "maxNoOfItems": getValueBasedOnKey(item, "RssMaxNumberOfItems"),
                    "noRss": getValueBasedOnKey(item, "NoRssMessage")
                }
                break;
            case "INFORMATION":
                content = {
                    "fontScale": getValueBasedOnKey(item, "FontScale"),
                    "marginScale": getValueBasedOnKey(item, "MarginScale"),
                }
                break;
        }
        return content;
    }

    /*
    Description:Get Files ID
    Parameters:item,File List
    Return:FileId
    */
    function getIDBasedonFilename(item, rowFileInformation) {
        var g = 1;
        var filename = $(item).find("DisplayValue").text();
        var result = $.grep(rowFileInformation, function (item) {
            return item.data.OriginalFilename == filename;
        });
        if (result.length == 0) {
            return Math.uuid().toLowerCase();
        } else {
            return result[0].Id.toString();
        }
    }

    /*
    Description:convert Preview Type from xml to JSON
    Parameters:Preview Type in xml
    Return:Preview Type in Json
    */
    function getPreviewType(item) {
        var preview = {};
        switch ($(item).find("Description").text()) {
            case "Image":
                preview = {
                    "doNotPlayItem": false,
                    "duration": $(item).find("Duration").text(),
                    "transition": $(item).find("TransitionEffect").text(),
                };
                break;
            case "Video":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish":true,
                    "duration": $(item).find("Duration").text(),
                    "transition": $(item).find("TransitionEffect").text(),
                    "volume": null,
                    "mute": false
                };
                break;
            case "Flash":
                preview = {
                    "doNotPlayItem": false,
                    "duration": $(item).find("Duration").text(),
                };
                break;
            case "Audio":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish": true,
                    "duration": $(item).find("Duration").text(),
                    "transition": $(item).find("TransitionEffect").text(),
                    "volume": null,
                    "mute": false
                };
                break;
            case "WEB_PAGE":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish": true,
                    "duration": $(item).find("Duration").text(),
                    "volume": null,
                    "mute": false
                };
                break;
            case "MUSIC_STREAM_FILE":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish": true,
                    "duration": $(item).find("Duration").text(),
                    "volume": null,
                    "mute": false,
                    "transition": $(item).find("TransitionEffect").text(),
                };
                break;
            case "PLAYLIST":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish": true,
                    "duration": $(item).find("Duration").text(),
                    "volume": null,
                    "mute": false,
                    "transition": $(item).find("TransitionEffect").text(),
                };
                break;
            case "NEWS_FEED":
                preview = {
                    "doNotPlayItem": false,
                    "playUntillFinish": true,
                    "duration": $(item).find("Duration").text(),
                    "volume": null,
                    "mute": false,
                    "transition": $(item).find("TransitionEffect").text(),
                };
                break;

        }
        return preview;
    }

    /*
    Description:convert Content Type from xml to JSON
    Parameters:Content Type in xml
    Return:Content Type in Json
    */
    function getContentType(item) {
        var content = {};
        var filenode = $(item).find("PropertyValue")[0];
        
        switch ($(item).find("Description").text()) {
            case "Image":
                content = {
                    "imagePath": $(filenode).find("DisplayValue").text(),
                    "imageScalling": getValueBasedOnKey(item, "StretchMode"),
                    "animate": getZoomingEffect(item)
                }
                break;
            case "Video":
                content = {
                    "mediaPath": $(filenode).find("DisplayValue").text(),
                }
                break;
            case "Flash":
                content = {
                    "mediaPath": $(filenode).find("DisplayValue").text(),
                    "zoomOut": getZoomoutValue(item)
                    }
                break;
            case "Audio":
                content = {
                    "mediaPath": $(filenode).find("DisplayValue").text(),
                }
                break;
            case "WEB_PAGE":
                content = {
                    "url": getValueBasedOnKey(item, "Url"),
                    "refreshPageOption": getValueBasedOnKey(item, "RefreshInterval")
                }
                break;
            case "MUSIC_STREAM_FILE":
                content = {
                    "musicStreamUrl": getValueBasedOnKey(item, "Url")
                }
                break;
            case "PLAYLIST":
                content = {
                    "playlist": getValueBasedOnKey(item, "Playlist")
                }
                break;
            case "INFORMATION":
                var titlenode = getNodeBasedOnKey(item, "Title");
                var textnode = getNodeBasedOnKey(item, "Text");
                content = {
                    "rssUrl": getValueBasedOnKey(item, "RSSUrl"),
                    "layoutOption": getValueBasedOnKey(item, "Layout"),
                    "bgImage": getValueBasedOnKey(item, "BackgroundImage"),
                    "title": {
                        "fontStyle": getValueBasedOnKeyForNode(titlenode, "Font"),
                        "fontSize": getValueBasedOnKeyForNode(titlenode, "FontSize"),
                        "bold": getValueBasedOnKeyForNode(titlenode, "FontBold"),
                        "italic": getValueBasedOnKeyForNode(titlenode, "FontItalic"),
                        "shadow": getValueBasedOnKeyForNode(titlenode, "DropShadow"),
                        "align": getValueBasedOnKeyForNode(titlenode, "TextAlign"),
                        "color": getValueBasedOnKeyForNode(titlenode, "Color"),
                        "text": getValueBasedOnKey(item, "Title",true),
                    },
                    "text": {
                        "fontStyle": getValueBasedOnKeyForNode(textnode, "Font"),
                        "fontSize": getValueBasedOnKeyForNode(textnode, "FontSize"),
                        "bold": getValueBasedOnKeyForNode(textnode, "FontBold"),
                        "italic": getValueBasedOnKeyForNode(textnode, "FontItalic"),
                        "shadow": getValueBasedOnKeyForNode(textnode, "DropShadow"),
                        "align": getValueBasedOnKeyForNode(textnode, "TextAlign"),
                        "color": getValueBasedOnKeyForNode(textnode, "Color"),
                        "text": getValueBasedOnKey(item, "Text",true),
                    }
                }
                break;
            case "NEWS_FEED":
                var titlenode = getNodeBasedOnKey(item, "Title");
                var textnode = getNodeBasedOnKey(item, "Text");
                content = {
                    "rssUrl": getValueBasedOnKey(item, "RSSUrl"),
                    "layoutOption": getValueBasedOnKey(item, "Layout"),
                    "bgImage": getValueBasedOnKey(item, "BackgroundImage"),
                    "titleStyle": {
                        "fontStyle": getValueBasedOnKeyForNode(titlenode, "Font"),
                        "fontSize": getValueBasedOnKeyForNode(titlenode, "FontSize"),
                        "bold": getValueBasedOnKeyForNode(titlenode, "FontBold"),
                        "italic": getValueBasedOnKeyForNode(titlenode, "FontItalic"),
                        "shadow": getValueBasedOnKeyForNode(titlenode, "DropShadow"),
                        "align": getValueBasedOnKeyForNode(titlenode, "TextAlign"),
                        "color": getValueBasedOnKeyForNode(titlenode, "Color")
                    },
                    "textStyle": {
                        "fontStyle": getValueBasedOnKeyForNode(textnode, "Font"),
                        "fontSize": getValueBasedOnKeyForNode(textnode, "FontSize"),
                        "bold": getValueBasedOnKeyForNode(textnode, "FontBold"),
                        "italic": getValueBasedOnKeyForNode(textnode, "FontItalic"),
                        "shadow": getValueBasedOnKeyForNode(textnode, "DropShadow"),
                        "align": getValueBasedOnKeyForNode(textnode, "TextAlign"),
                        "color": getValueBasedOnKeyForNode(textnode, "Color")
                    }
                }
                break;

        }
        return content;
    }
    
    /*
    Description:convert Media Type from xml to JSON
    Parameters:Media Type in xml
    Return:Media Type in Json
    */
    function getMediaType(item) {
        var type = 0;
        switch ($(item).find("Description").text()) {
            case "Image":
                type = 1;
                break;
            case "Video":
                type = 2;
                break;
            case "Flash":
                type = 3;
                break;
            case "Audio":
                type = 9;
                break;
            case "MUSIC_STREAM_FILE":
                type = 16;
                break;
            case "PLAYLIST":
                type = 7;
                break;
            case "NEWS_FEED":
                type = 5;
                break;
            case "WEB_PAGE":
                type = 4;
                break;
            case "INFORMATION":
                type = 6;
                break;
        }
        return type;
    }

    /*
    Description:convert PlayList Body from xml to JSON
    Parameters:PlayList Body in xml
    Return:PlayList Body in Json
    */
    function getplayListBody(item) {
        return {
            "playListId": 0,
            "playListName": $(item).find("DisplayName").text(),
            "resolution": {
                "resolutionValue": $(item).find("Width").text() + "x" + $(item).find("Height").text(),
                "resolutionType": Number($(item).find("Width").text()) > Number($(item).find("Height").text())?"Landscape":"Potrait"
            },
            "active": false,
            "selected": false,
            "details":[]
        };
    }

    /*
    Description:convert Zoomout Value from xml to JSON
    Parameters:Zoomout Value in xml
    Return:Zoomout Value in Json
    */
    function getZoomoutValue(item) {
        var value;
        $.each($(item).find("PropertyValue"), function (index, item) {
            if ($(item).find("Key").text() == 'ZoomOut') {
                value = $(item).find("Value").text()
            }
        });
        return value;
    }

    /*
    Description:convert Zoom effect from xml to JSON
    Parameters:Zoom effect in xml
    Return:Zoom effect in Json
    */
    function getZoomingEffect(item) {
        var value;
        $.each($(item).find("PropertyValue"), function (index, item) {
            if ($(item).find("Key").text() == 'ZoomingEffect') {
                value = $(item).find("Value").text()
            }
        });
        return value;
    }

    /*
    Description:Get Value from xml based on key
    Parameters:xml,key,flag
    Return:Value
    */
    function getValueBasedOnKey(item,key,iscomplex) {
        var value;
        if (iscomplex == undefined) {
            $.each($(item).find("PropertyValue"), function (index, item) {
                if ($(item).find("Key").text() == key) {
                    value = $(item).find("Value").text()
                }
            });
        } else {
            $.each($(item).find('PropertyValue').find('Key'), function (index, item) {
                if ($(item).text() == key) {
                    node = item;
                    value = $($(node).parent().find('Value')[0]).text();
                }
            })
        }
        return value;
    }

    /*
    Description:Get Value from xml based on key for different xml node
    Parameters:xml,key
    Return:Value
    */
    function getValueBasedOnKeyForNode(titlenode, key) {
        var value;
        $.each(titlenode, function (index, item) {
            if ($(item).find('Key').text() == key) {
                value = $(item).find('Value').text();
            }
        });
        return value;
    }

    /*
    Description:Get Value from xml based on key for different xml node
    Parameters:xml,key
    Return:Value
    */
    function getNodeBasedOnKey(item, key) {
        var node;
        $.each($(item).find('PropertyValue').find('Key'), function (index, item) {
            if ($(item).text() == key) {
                node = item;
            }
        })
        return $(node).parent().find('PropertyValue');
        //$.each($(item).find("PropertyValue"), function (index, item) {
        //    if ($(item).find("Key").text().indexOf(key)!= -1) {
        //        node = $(item)
        //    }
        //});
        //return node.find("AdditionalValues").find("PropertyValue");
    }

    return ArrayUtility;
})();
