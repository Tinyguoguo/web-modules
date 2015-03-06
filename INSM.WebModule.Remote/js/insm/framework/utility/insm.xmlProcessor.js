var xmlProceesor = (function () {
    var xmltemplaterow;
    var $xmltemplate;

    /*
    Description:Constructor function i.e. use to start basic structure of XML Documentation
    Parameters:none
    Return:none
    */
    function xmlProceesor() {
        xmltemplaterow = '<?xml version="1.0" encoding="utf-8"?><PlaybackData> <Playlists> </Playlists> <AddonDirectories> <int></int> </AddonDirectories> <LastUpdate></LastUpdate> <LastPlaybackStarted></LastPlaybackStarted> <Name></Name></PlaybackData>';
        $xmltemplate = $.parseXML(xmltemplaterow);
    }

    /*
    Description:transfer entire object structure from source object to target object
    Parameters:Source JSON object,target JSON Object
    Return:none
    */

    xmlProceesor.prototype.insertPropertyItemsForContentType = function (sourceObject, targetObject) {
        var playlistIndex, itemIndex;
        $.each(sourceObject.Playlists, function (index,item) {
            playlistIndex = index;
            $.each(item.Items, function (indexitem, item) {
                itemIndex = indexitem;
                var obj = targetObject[playlistIndex].details[indexitem].contentData;
                var preivew = targetObject[playlistIndex].details[indexitem].previewData;
                var advance = targetObject[playlistIndex].details[indexitem].advancedData;
                item.Duration = preivew.duration;
                item.TransitionEffect = preivew.transition;
                switch (targetObject[playlistIndex].details[indexitem].Type) {
                    case Menutype.IMAGE:
                        item.PropertyValues.push({
                            Value: obj.animate,
                            Key: 'ZoomingEffect',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.imageBgColor,
                            Key: 'BackgroundColor',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: 'True',
                            Key: 'UnloadImageAfterStop',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: getStretchMode(obj.imageScalling),
                            Key: 'StretchMode',
                            DefaultPermission: 'Write'
                        });
                        break;
                    case Menutype.MOVIE:
                        item.PropertyValues.push({
                            Value: "",
                            Key: 'MovieUrl',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.moviePlayerOption,
                            Key: 'MoviePlayerType',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: "",
                            Key: 'VLCCommands',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.movieBgColor,
                            Key: 'BackgroundColor',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.movieMemoryClear,
                            Key: 'UnloadOnStop',
                            DefaultPermission: 'Write'
                        });
                        break;
                    case Menutype.FLASH:
                        item.PropertyValues.push({
                            Value: advance.flashMemoryClear,
                            Key: 'AlwaysRestart',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: 'True',
                            Key: 'ZoomOut',
                            DefaultPermission: 'Write'
                        });
                        break;
                    case Menutype.WEB_PAGE:
                        item.PropertyValues.push({
                            Value: 'False',
                            Key: 'CacheWebPage',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: 'True',
                            Key: 'SilentBrowser',
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: 'True',
                            Key: 'AppendSystemParameters',
                            DefaultPermission: 'Write'
                        });
                        break;
                    case Menutype.NEWS_FEED:
                        item.PropertyValues.push({
                            Value: advance.username,
                            Key: "Username",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.password,
                            Key: "Password",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.fontScale,
                            Key: "FontScale",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.marginScale,
                            Key: "MarginScale",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.maxNoOfItems,
                            Key: "RssMaxNumberOfItems",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.noRss,
                            Key: "NoRssMessage",
                            DefaultPermission: 'Write'
                        });
                        break;
                    case Menutype.INFORMATION:
                        item.PropertyValues.push({
                            Value: advance.fontScale,
                            Key: "FontScale",
                            DefaultPermission: 'Write'
                        });
                        item.PropertyValues.push({
                            Value: advance.marginScale,
                            Key: "MarginScale",
                            DefaultPermission: 'Write'
                        });
                        break;
                }
            });
        });
    };

    /*
    Description:Prepare Playlist based on In-Memory Data Structure
    Parameters:none
    Return:XML documentation
    */
    xmlProceesor.prototype.getPlayList = function () {
        var baseTemplate = prepareBaseTemplate();
        var currentIndex = 0;
        baseTemplate.Playlists=preparePlayListObject($.data(document, "playListMaster"));
        $.each(baseTemplate.Playlists, function (index, item) {
            currentIndex = index;
            $.each($.data(document, "playListMaster")[index].details, function (index, item) {
                var mediaitem = {
                    AutoDuration: false,
                    Description: getFileType(item.Type),
                    Duration:10,
                    Id: Math.uuid().toLowerCase(),
                    IsEnabled: true,
                    IsOverlay: false,
                    IsVolumeMuted: false,
                    IsOverrideSound: false,
                    RecurrenceInterval: 0,
                    LastPlayed: '0001-01-01T00:00:00',
                    TemplateName: getFileType(item.Type),
                    TemplateFileId: 0,
                    TransitionEffect: 'Fade',
                    Volume: 1,
                    PropertyValues: getPropertyValue(item),
                    TimesOptions: item.timeOptionsData.timeOptions,
                    DefaultPermission: 'Write'
                };
                baseTemplate.Playlists[currentIndex].Items.push(mediaitem);
            });
        });

        //baseTemplate.Playlists.push(preparePlayListObject());
        //$.each($.data(document, "thumbnailList", thumbnailList), function (index, item) {
        //    var mediaitem = {
        //        AutoDuration: false,
        //        Description: getFileType(item.Type),
        //        Duration:10,
        //        Id: Math.uuid().toLowerCase(),
        //        IsEnabled: true,
        //        IsOverlay: false,
        //        IsVolumeMuted: false,
        //        IsOverrideSound: false,
        //        RecurrenceInterval: 0,
        //        LastPlayed: '0001-01-01T00:00:00',
        //        TemplateName: getFileType(item.Type),
        //        TemplateFileId: 0,
        //        TransitionEffect: 'Fade',
        //        Volume: 1,
        //        PropertyValues: getPropertyValue(item),
        //        TimesOptions: item.timeOptionsData.timeOptions,
        //        DefaultPermission: 'Write'
        //    };
        //    baseTemplate.Playlists[0].Items.push(mediaitem);
        //});
        return baseTemplate;
    };

    /*
    Description:Utility function for convert Stretch mode to XML compitible data
    Parameters:mode
    Return:number
    */
    function getStretchMode(mode) {
        var StretchMode = "";
        switch (Number(mode)) {
            case 1:
                StretchMode = "Uniform";
                break;
            case 2:
                StretchMode = "Fill";
                break;
            case 3:
                StretchMode = "UniformToFill";
                break;
        }
        return StretchMode;
    }

    /*
    Description:Prepare xml document at Playlist Level
    Parameters:Playlist xml
    Return:Playlist in Json
    */
    function preparePlayListObject(playListDetail) {
        var playListInfo = [];
        $.each(playListDetail, function (index, item) {
            var resolution = item.resolution;
            var obj = {
                DisplayName: item.playListName,
                Id: Math.uuid().toLowerCase(),
                IsActive: item.active,
                ShufflePlaylist: false,
                Width: resolution.resolutionValue.split("X")[0],
                Height: resolution.resolutionValue.split("X")[1],
                Items: [],
                DefaultPermission: 'Write'
            };
            playListInfo.push(obj);
        });
        return playListInfo;

        //var resolution = $.data(document, "resolutionInfo");
        //var obj = {
        //    DisplayName: $.data(document, "playlistName"),
        //    Id: Math.uuid().toLowerCase(),
        //    IsActive: true,
        //    ShufflePlaylist: false,
        //    Width: resolution.resolutionValue.split("X")[0],
        //    Height: resolution.resolutionValue.split("X")[1],
        //    Items: [],
        //    DefaultPermission: 'Write'
        //};
        //return obj;
    }

    /*
    Description:Prepare Property value from Data-Structure. 
    Parameters:Item object from data-structure
    Return:PropertyValue Object
    */
    //Extra data will be submitted here
    function getPropertyValue(item) {
        var PropertyValueAr = [];
        switch (item.Type) {
            case 4:
                PropertyValueAr.push({
                    Value: item.contentData.url,
                    Key: "Url",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.refreshPageOption,
                    Key: "RefreshInterval",
                    DefaultPermission: 'Write'
                });
                break;
            case 7:
                PropertyValueAr.push({
                    Value: item.contentData.playlist,
                    Key: "Playlist",
                    DefaultPermission: 'Write'
                });
                break;
            case 16:
                PropertyValueAr.push({
                    Value: item.contentData.musicStreamUrl,
                    Key: "Url",
                    DefaultPermission: 'Write'
                });
                break;
            case 5:
                PropertyValueAr.push({
                    Value: item.contentData.rssUrl,
                    Key: "RSSUrl",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.layoutOption,
                    Key: "Layout",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.bgImage,
                    Key: "BackgroundImage",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: "",
                    Key: "RssXmlFile",
                    DefaultPermission: 'Write'
                });

                PropertyValueAr.push({
                    Value: item.contentData.titleStyle,
                    Key: "Title",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.textStyle,
                    Key: "Text",
                    DefaultPermission: 'Write'
                });
                break;
            case 6:
                PropertyValueAr.push({
                    Value: item.contentData.infoLayoutOption,
                    Key: "Layout",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.bgImage,
                    Key: "BackgroundImage",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.title,
                    Key: "Title",
                    DefaultPermission: 'Write'
                });
                PropertyValueAr.push({
                    Value: item.contentData.text,
                    Key: "Text",
                    DefaultPermission: 'Write'
                });
                break;
            default:
                var fileinfo = getFileInformation(item);
                var item = {
                    Value: fileinfo.Filename,
                    Key: getFileType(item.Type),
                    DisplayValue: fileinfo.Name,
                    FileName: fileinfo.Filename,
                    DefaultPermission: 'Write'
                };
                PropertyValueAr.push(item)
        }
        
        return PropertyValueAr;
    }

    /*
    Description:Get file information object
    Parameters:item
    Return:File information
    */
    function getFileInformation(item) {
        var fileinfo = $.grep($.data(document, "FileListFromRemoteServer"), function (row) {
            return row.Id == item.Id;
        });
        return fileinfo[0];
    }

    /*
    Description:convert String filetype based on Number file type from data-structure
    Parameters:file type
    Return:string file type
    */
    function getFileType(type) {
        var mediatype;
        switch (type) {
            case 4:
                mediatype = "WEB_PAGE";
                break;
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
            case 16:
                mediatype = "MUSIC_STREAM_FILE";
                break;
            case 7:
                mediatype = "PLAYLIST";
                break;
            case 5:
                mediatype = "NEWS_FEED";
                break;
            case 6:
                mediatype = "INFORMATION";
                break;
        }
        return mediatype;
    }

    /*
    Description:Prepare base template Json object
    Parameters:none
    Return:base template json
    */
    function prepareBaseTemplate() {
        var currentDate = new Date();
        var dateInfo = new Date().toISOString() + Math.abs(currentDate.getTimezoneOffset() / 60);
        var playBackData = {
            int: 39,
            LastUpdate: dateInfo,
            LastPlaybackStarted: '0001-01-01T00:00:00',
            Name: $.data(document, "playlistName"),
            Playlists: []
        };
        return playBackData;
    }

    /*
    Description:Convert xml document from Json Object
    Parameters:data-structure in Json format
    Return:XML document
    */
    xmlProceesor.prototype.Processdata = function (Playbackdata) {
        //Prepare Top Level Document
        prepareTopLevelXML(Playbackdata);
        //Prepare xml PlayLists
        $($xmltemplate).find("Playlists").append(preparePlayListItem(Playbackdata.Playlists));

        //console.log(new XMLSerializer().serializeToString($xmltemplate));

        return new XMLSerializer().serializeToString($xmltemplate);
    };

    /*
    Description:Convert property value in xml format from Json
    Parameters:Property value in json
    Return:Property value in xml
    */
    function preparePropertyValues(propertyValuesList) {
        var propertyValues = "";
        $.each(propertyValuesList, function (index, item) {
            switch (item.Key) {
                case "Text":
                    var propertystr = " <PropertyValue> <Value></Value> <Key></Key><AdditionalValues></AdditionalValues><DefaultPermission></DefaultPermission> </PropertyValue>";
                    var $xmlproperty = $.parseXML(propertystr);
                    $($xmlproperty).find("Value").text(item.Value.hasOwnProperty("text")==true?item.Value.text:"");
                    $($xmlproperty).find("Key").text(item.Key);
                    $($xmlproperty).find("AdditionalValues").html(prepareAdditionalValue(item));
                    break;

                case "Title":
                    var propertystr = " <PropertyValue> <Value></Value> <Key></Key><AdditionalValues></AdditionalValues><DefaultPermission></DefaultPermission> </PropertyValue>";
                    var $xmlproperty = $.parseXML(propertystr);
                    $($xmlproperty).find("Value").text(item.Value.hasOwnProperty("text") == true ? item.Value.text : "");
                    $($xmlproperty).find("Key").text(item.Key);
                    $($xmlproperty).find("AdditionalValues").html(prepareAdditionalValue(item));
                    break;
                default:
                    var propertystr = " <PropertyValue> <Value></Value> <Key></Key> <DisplayValue></DisplayValue> <FileName></FileName> <DefaultPermission></DefaultPermission> </PropertyValue>";
                    var $xmlproperty = $.parseXML(propertystr);
                    $($xmlproperty).find("Value").text(item.Value);
                    $($xmlproperty).find("Key").text(item.Key);
                    if (item.hasOwnProperty("DisplayValue")) {
                        $($xmlproperty).find("DisplayValue").text(item.DisplayValue);
                    } else {
                        $($xmlproperty).find("DisplayValue").text("");
                    }
                    if (item.hasOwnProperty("FileName")) {
                        $($xmlproperty).find("FileName").text(item.FileName);
                    } else {
                        $($xmlproperty).find("FileName").text("");
                    }
                    if (item.hasOwnProperty("DefaultPermission")) {
                        $($xmlproperty).find("DefaultPermission").text(item.DefaultPermission);
                    } else {
                        $($xmlproperty).find("DefaultPermission").text(item.DefaultPermission);
                    }
            }
            propertyValues += new XMLSerializer().serializeToString($xmlproperty);
        });
        return propertyValues;
    }

    /*
    Description:Convert Additional value in xml format from Json
    Parameters:Additional value in json
    Return:Property value in xml
    */
    function prepareAdditionalValue(item) {
        var finalstr = prepareAddtionalPropertyValue(item, 'shadow', 'DropShadow');
        finalstr += prepareAddtionalPropertyValue(item, 'color', 'Color');
        finalstr += prepareAddtionalPropertyValue(item, 'align', 'TextAlign');
        finalstr += prepareAddtionalPropertyValue(item, 'bold', 'FontBold');
        finalstr += prepareAddtionalPropertyValue(item, 'italic', 'FontItalic');
        finalstr += prepareAddtionalPropertyValue(item, 'fontSize', 'FontSize');
        finalstr += prepareAddtionalPropertyValue(item, 'fontStyle', 'Font');
        return finalstr;
    }

    /*
    Description:Convert Additional value in xml format from Json
    Parameters:Additional value in json
    Return:Property value in xml
    */
    function prepareAddtionalPropertyValue(item, property, key) {
        var propertystr = " <PropertyValue> <Value></Value><Key></Key><DefaultPermission></DefaultPermission> </PropertyValue>";
        var $xmlproperty = $.parseXML(propertystr);
        $($xmlproperty).find("Value").text(item.Value[property]);
        $($xmlproperty).find("Key").text(key);
        $($xmlproperty).find("DefaultPermission").text("write");
        return new XMLSerializer().serializeToString($xmlproperty);
    }

    /*
    Description:Convert Media Items value in xml format from Json
    Parameters:Media Items in json
    Return:Property value in xml
    */
    function prepareMediaItem(mediaItems) {
        var mediaItemList = "";
        $.each(mediaItems, function (index, item) {
            var mediaitemstr = " <PlaylistItem><AutoDuration></AutoDuration> <Description></Description> <Duration></Duration> <Id></Id> <IsEnabled></IsEnabled> <IsOverlay></IsOverlay> <IsVolumeMuted></IsVolumeMuted> <IsOverrideSound></IsOverrideSound> <RecurrenceInterval></RecurrenceInterval> <LastPlayed></LastPlayed> <OveriddenValues /> <ItemTags /> <PropertyValues /> <DisplayTimes /> <TemplateName></TemplateName> <TemplateFileId></TemplateFileId> <TransitionEffect></TransitionEffect> <Volume></Volume> <PermissionExceptions /> <DefaultPermission></DefaultPermission></PlaylistItem>";
            var $xmlmediaitem = $.parseXML(mediaitemstr);
            $($xmlmediaitem).find("AutoDuration").text(item.AutoDuration);
            $($xmlmediaitem).find("Description").text(item.Description);
            $($xmlmediaitem).find("Duration").text(item.Duration);
            $($xmlmediaitem).find("Id").text(item.Id);
            $($xmlmediaitem).find("IsEnabled").text(item.IsEnabled);
            $($xmlmediaitem).find("IsOverlay").text(item.IsOverlay);
            $($xmlmediaitem).find("IsVolumeMuted").text(item.IsVolumeMuted);
            $($xmlmediaitem).find("IsOverrideSound").text(item.IsOverrideSound);
            $($xmlmediaitem).find("RecurrenceInterval").text(item.RecurrenceInterval);
            $($xmlmediaitem).find("LastPlayed").text(item.LastPlayed);
            $($xmlmediaitem).find("TemplateName").text(item.TemplateName);
            $($xmlmediaitem).find("TemplateFileId").text(item.TemplateFileId);
            $($xmlmediaitem).find("TransitionEffect").text(item.TransitionEffect);
            $($xmlmediaitem).find("Volume").text(item.Volume);
            $($xmlmediaitem).find("DefaultPermission").text(item.DefaultPermission);
            $($xmlmediaitem).find("PropertyValues").html(preparePropertyValues(item.PropertyValues));
            $($xmlmediaitem).find("DisplayTimes").html(prepareTimeOptions(item.TimesOptions));
            
            mediaItemList += new XMLSerializer().serializeToString($xmlmediaitem);
        });
        return mediaItemList;
    }

    /*
    Description:Convert Time Options value in xml format from Json
    Parameters:Time Options in json
    Return:Property value in xml
    */
    function prepareTimeOptions(timeOptions) {
        var timeOptionsStrXML = "";
        if (timeOptions != undefined) {
            $.each(timeOptions, function (index, item) {
                var timeOptionsStr = "<TimeOptions><DoNotPlay /><DefaultVolumeSelected /><Mute /><Volume /><Enabled /><ShowAllWeekdays /><ShowAllDates /><SelectedWeekdays/><ShowAllHours /><StartTime /><EndTime /><StartDate/><EndDate/></TimeOptions>";
                var $timeOptions = $.parseXML(timeOptionsStr);
                $($timeOptions).find("DoNotPlay").text("false");
                if (item.hasOwnProperty('volume')) {
                    $($timeOptions).find("DefaultVolumeSelected").text(item.volume.isDefaultVolume);
                    $($timeOptions).find("Mute").text(item.volume.isMute);
                    $($timeOptions).find("Volume").text(item.volume.volume);
                } else {
                    $($timeOptions).find("DefaultVolumeSelected").text(false);
                    $($timeOptions).find("Mute").text(false);
                    $($timeOptions).find("Volume").text(-1);
                }
                $($timeOptions).find("Enabled").text("true");
                $($timeOptions).find("ShowAllWeekdays").text(item.showAllWeekDays);
                $($timeOptions).find("SelectedWeekdays").html(prepareSelectedDays(item.selectedDays));
                $($timeOptions).find("ShowAllDates").text(item.showAllDates);
                $($timeOptions).find("ShowAllHours").text(item.showAllHours);
                $($timeOptions).find("StartTime").text("1900-01-01T08:00:00");
                $($timeOptions).find("EndTime").text("1900-01-01T17:00:00");
                if (item.startDate != null) {
                    $($timeOptions).find("StartDate").text(new Date().toISOString() + Math.abs(new Date(item.startDate).getTimezoneOffset() / 60));
                } else {
                    //$($timeOptions).find("StartDate").attr("xmlns:p8", "'http://www.w3.org/2001/XMLSchema-instance'").attr("p8:nil", "true");
                }
                if (item.endDate != null) {
                    $($timeOptions).find("EndDate").text(new Date().toISOString() + Math.abs(new Date(item.endDate).getTimezoneOffset() / 60));
                } else {
                    //$($timeOptions).find("StartDate").attr("xmlns:p8", "'http://www.w3.org/2001/XMLSchema-instance'").attr("p8:nil", "true");
                }
                timeOptionsStrXML += new XMLSerializer().serializeToString($timeOptions);
            });
        }
        return timeOptionsStrXML;
    }

    /*
    Description:Convert Selected Days value in xml format from Json
    Parameters:Selected Days in json
    Return:Property value in xml
    */
    function prepareSelectedDays(days) {
        var selectedDaysXML = "";
        $.each(days, function (index, item) {
            var selectedDayStr = "<DayOfWeek/>";
            var $selectedDay = $.parseXML(selectedDayStr);
            $($selectedDay).find("DayOfWeek").text(getWeekDaysName(item[0].day));
            selectedDaysXML += new XMLSerializer().serializeToString($selectedDay);
        });
        return selectedDaysXML;
    }

    /*
    Description:Convert number of days into day
    Parameters:number of days
    Return:day
    */
    function getWeekDaysName(index) {
        var day = "";
        switch (index) {
            case 1:
                day = "Monday";
                break;
            case 2:
                day = "Tuesday";
                break;
            case 3:
                day = "Wednesday";
                break;
            case 4:
                day = "Thursday";
                break;
            case 5:
                day = "Friday";
                break;
            case 6:
                day = "Saturday";
                break;
            case 7:
                day = "Sunday";
                break;
        }
        return day;
    }

    /*
    Description:Convert Playlist top item value in xml format from Json
    Parameters:Playlist top item
    Return:Playlist top item in xml
    */
    function preparePlayListItem(Playbackdatalist) {
        var playlist="";
        $.each(Playbackdatalist, function (index, item) {
            var playlistitemstr = "<Playlist> <DisplayName></DisplayName> <Id></Id> <IsActive></IsActive> <ShufflePlaylist></ShufflePlaylist> <Width></Width> <Height></Height> <Items></Items> <PermissionExceptions /> <DefaultPermission></DefaultPermission></Playlist>";
            var $xmlplaylistNode = $.parseXML(playlistitemstr);
            $($xmlplaylistNode).find("DisplayName").text(item.DisplayName);
            $($xmlplaylistNode).find("Id").text(item.Id);
            $($xmlplaylistNode).find("IsActive").text(item.IsActive);
            $($xmlplaylistNode).find("ShufflePlaylist").text(item.ShufflePlaylist);
            $($xmlplaylistNode).find("Width").text(item.Width);
            $($xmlplaylistNode).find("Height").text(item.Height);
            $($xmlplaylistNode).find("DefaultPermission").text(item.DefaultPermission);
            $($xmlplaylistNode).find("Items").html(prepareMediaItem(item.Items));
            playlist += new XMLSerializer().serializeToString($xmlplaylistNode);
        });
        
        return  playlist
    }

    /*
    Description:Convert TopLevel Object in xml format from Json
    Parameters:TopLevel Object
    Return:TopLevel Object in xml
    */
    function prepareTopLevelXML(Playbackdata) {
        $($xmltemplate).find("int").text(Playbackdata.int);
        $($xmltemplate).find("LastUpdate").text(Playbackdata.LastUpdate);
        $($xmltemplate).find("LastPlaybackStarted").text(Playbackdata.LastPlaybackStarted);
        $($xmltemplate).find("Name").text(Playbackdata.Name);
    }

    /*
    Description:Utility function for time
    Parameters:Number
    Return:Number
    */
    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    /*
    Description:Utility function for convert javascript time to HH:MM:SS format
    Parameters:Time
    Return:Time in HH:MM:SS
    */
    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        // add a zero in front of numbers<10
        m = checkTime(m);
        s = checkTime(s);
        document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
        t = setTimeout(function () {
            startTime()
        }, 500);
    }

    return xmlProceesor;
})()