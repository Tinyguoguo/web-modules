/// <reference path="~/js/insm/framework/utility/insmEnums.js" />
var contextObject_mediaSettings, rootUI_mediaSettings;
var MediaSettingsUIManager = {
    version: "0.0.1",

    options: {
        mediaId: null,
        mediaGuid: null,
        setPlayUntillFinishedOption: true,
        setTransitionOption: true,
        setVolumeOption: true,
        setDefaultData: null,
    },

    _init: function () {

        contextObject_mediaSettings = this;
        rootUI_mediaSettings = this.element;
        $(rootUI_mediaSettings).empty();

        // html as per feedback
        _plugin = {};
        _plugin.htmlElements = {
            content: {
                backdrop: $("<div/>").addClass("mainMediaSettingsDiv").attr("id", "mainDiv").attr("float", "right"),
                previewScreen: {
                    container: $("<div/><br/>").addClass("previewScreenDiv").attr("id", "previewScreenDiv"),
                },
                mediaSettingControlls: {
                    settingsTable: $("<table/>").addClass("insm-mediaSettings"),
                    doNotPlayOption: {
                        row: $("<tr/>").attr("id", "doNotPlayOption"),
                        column: $("<td/>").css("height", "30px").css("width", "50%"),
                        input: $("<input type='checkbox'/>").addClass("marginRight").attr("id", "doNotPlayItem"),
                        text: $("<span/>").text("Do not play item"),
                        PreviewColumn: $("<td/>").css("height", "30px")
                    },
                    playUntillOption: {
                        row: $("<tr/>").attr("id", "playUntillOption"),
                        column: $("<td colspan='2'/>").css("height", "30px"),
                        input: $("<input type='checkbox'/>").addClass("marginRight").attr("id", "playUntillFinished"),
                        text: $("<span/>").text("Play Until finished"),
                    },
                    durationOption: {
                        row: $("<tr/>").attr("id", "durationOption").css("height", "40px"),
                        titleColumn: $("<td/>").addClass("paddingTop").css("width", "40%"),
                        inputColumn: $("<td/>").css("height", "30px"),
                        title: $("<span/>").text("Duration(sec):"),
                        input: $("<input type='text'/>").addClass("numericInput").attr("id", "duration").attr("dir", "rtl").attr("maxlength", "10"),
                    },
                    transitionOption: {
                        row: $("<tr/>").attr("id", "transitionOption"),
                        titleColumn: $("<td/>").addClass("paddingTop"),
                        selectColumn: $("<td/>"),
                        title: $("<span/>").text("Transition:"),
                        select: $("<select/>").addClass("select").attr("id", "transition"),
                        fadeOption: $("<option/>").text("Fade"),
                        noneOption: $("<option/>").text("None").attr("selected", "selected"),
                    },
                    volumeOption: {
                        row: $("<tr/>").attr("id", "volumeOption"),
                        titleColumn: $("<td/>").addClass("paddingTop"),
                        sliderColumn: $("<td/>").addClass("paddingTop"),
                        title: $("<span/>").text("Volume:"),
                        indicatorUI: $("<div/>").attr('title', 'A custom volume setting is set in time options.It is active now').addClass('insm-playlist-manager-thumbnail-indicator-basicBlock'),
                        slider: $("<div/>").attr("id", "volumeBar"),
                    },
                    muteOption: {
                        row: $("<tr/>").attr("id", "muteOption"),
                        column: $("<td/>").addClass("muteDiv"),
                        title: $("<span/>").text("Mute"),
                        input: $("<input type='checkbox' style='margin-right: 10px;'>").attr("id", "mute"),
                    },
                    saveButton: {
                        row: $("<tr/>").attr("id", "saveBtn"),
                        column: $("<td colspan='2'/>"),
                        input: $("<input type='button' value='Save'/>").addClass("button").css("margin-top", "15px"),
                    },
                },
            }
        },
        rootUI_mediaSettings.append((_plugin.htmlElements.content.backdrop)
            .append(_plugin.htmlElements.content.previewScreen.container)
           .append((_plugin.htmlElements.content.mediaSettingControlls.settingsTable)
                        .append(_plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.row
                                .append(_plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.column
                                    .append(_plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.input)
                                    .append(_plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.text))
                                    .append(_plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.PreviewColumn))
                       .append(_plugin.htmlElements.content.mediaSettingControlls.playUntillOption.row
                                .append(_plugin.htmlElements.content.mediaSettingControlls.playUntillOption.column
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.playUntillOption.input)
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.playUntillOption.text)))
                       .append(_plugin.htmlElements.content.mediaSettingControlls.durationOption.row
                               .append(_plugin.htmlElements.content.mediaSettingControlls.durationOption.titleColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.durationOption.title))
                               .append(_plugin.htmlElements.content.mediaSettingControlls.durationOption.inputColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.durationOption.input)))
                        .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.row
                                .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.titleColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.title))
                                .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.selectColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.select
                                                .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.fadeOption)
                                                .append(_plugin.htmlElements.content.mediaSettingControlls.transitionOption.noneOption))))
                         .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.row
                                .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.titleColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.title)
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.indicatorUI))
                                .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.sliderColumn
                                        .append(_plugin.htmlElements.content.mediaSettingControlls.volumeOption.slider)
                                         .append(_plugin.htmlElements.content.mediaSettingControlls.muteOption.input)
                                    .append(_plugin.htmlElements.content.mediaSettingControlls.muteOption.title)))
                        .append(_plugin.htmlElements.content.mediaSettingControlls.saveButton.row
                                .append(_plugin.htmlElements.content.mediaSettingControlls.saveButton.column
                                    .append(_plugin.htmlElements.content.mediaSettingControlls.saveButton.input)))
                         ));
        var previewIcon = $('<div />').addClass('insm-mediaSettings-previewIcon');
        _plugin.htmlElements.content.mediaSettingControlls.doNotPlayOption.PreviewColumn.append(previewIcon);
        
        $.data(document, 'rightHandIndicator', _plugin.htmlElements.content.mediaSettingControlls.volumeOption.indicatorUI);

        previewIcon.on("click", function () {
            MediaSettingsUIManager.onPreviewClick();
        });

        //Indicator Operations
        $.data(document, 'durationValue', _plugin.htmlElements.content.mediaSettingControlls.durationOption.input);
        _plugin.htmlElements.content.mediaSettingControlls.playUntillOption.input.on('click', function (e) {
            var indicatorUI = $.data(document, 'indicatorLocation');
            if ($(e.target).prop('checked')) {
                indicatorUI.find('span').text('');
            } else {
                indicatorUI.css('display', '');
                indicatorUI.find('span').text($.data(document, 'durationValue').val() + ' Sec');
            }
        });

        if ($.data(document, 'flag') != undefined) {
            var ui = $.data(document, 'rightHandIndicator');
            switch ($.data(document, 'flag')) {
                case 1:
                    ui.removeClass('insm-playlist-manager-thumbnail-orangeIndicator');
                    ui.addClass('insm-playlist-manager-thumbnail-greenIndicator');
                    break;
                case 2:
                    ui.removeClass('insm-playlist-manager-thumbnail-greenIndicator');
                    ui.addClass('insm-playlist-manager-thumbnail-orangeIndicator');
                    break;
                case 3:
                    ui.removeClass('insm-playlist-manager-thumbnail-orangeIndicator');
                    ui.removeClass('insm-playlist-manager-thumbnail-greenIndicator');
                    ui.addClass('insm-playlist-manager-thumbnail-blankIndicator');
                    break;
            }
            $.data(document, 'flag', undefined);
        }

        //set vlomue bar
        _plugin.htmlElements.content.mediaSettingControlls.volumeOption.slider.volumeBar({
            onChange: function (e, ui) {
                $.data(document, "volumeVal", ui);
            }
        });
        _plugin.htmlElements.content.mediaSettingControlls.volumeOption.slider.volumeBar('setHeaderPosition', $.data(document, "currentMediaItem")[0].previewData.volume);
        //on click mute change value of slider
        _plugin.htmlElements.content.mediaSettingControlls.muteOption.input.on("click", function () {
            if ($(this).prop("checked") == true) {
                _plugin.htmlElements.content.mediaSettingControlls.volumeOption.slider.volumeBar('setHeaderPositiontoZero');
            }
        });
        // html as per feedback

        //set preview screen css as per given resolution
        var id = setTimeout(function () {
            clearTimeout(id);
            if ($.data(document, "currentPlayList").resolution.resolutionType == "Portrait" || $.data(document, "currentPlayList").resolution.resolutionType == "Potrait") {
                _plugin.htmlElements.content.previewScreen.container.Resolution({ resolution: $.data(document, "currentPlayList").resolution, containerWidth: _plugin.htmlElements.content.backdrop.width() / 2 - 10 });
            } else {
                _plugin.htmlElements.content.previewScreen.container.Resolution({ resolution: $.data(document, "currentPlayList").resolution, containerWidth: _plugin.htmlElements.content.backdrop.width() - 10 });
            }
        }, 200);
        this._setMediaSettingsData();

        //popup screen
        $('#previewScreenDiv').click(MediaSettingsUIManager.onPreviewClick);

        $("#slider-range-min").slider({
            range: "min",
            //value: 37,
            // min: 1,
            //max: 700,
            slide: function (event, ui) {
                //  $("#amount").val("$" + ui.value);
            }
        });
        // $("#amount").val("$" + $("#slider-range-min").slider("value"));

        //$('#slider-range-min span').css("height", "25px");
        $('#slider-range-min span').css("width", "10px");
        $('.ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min').css("background-color", "black");


        $(".numericInput").keypress(function (e) {
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });

        $('input[id="playUntillFinished"]').click(function () {
            if ($(this).prop("checked") == true) {
                $('.numericInput').attr('disabled', 'disabled');
                $('.numericInput').css('background-color', '#fafafa');
            }
            else if ($(this).prop("checked") == false) {
                $('.numericInput').removeAttr('disabled');
                $('.numericInput').css('background-color', 'white');
            }
        });
        $('input[id="doNotPlayItem"]').click(function () {
            if ($(this).prop("checked") == true) {
                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("setOnAlphaOnDonotPlayItem");
            }
            else if ($(this).prop("checked") == false) {
                $('.insm-playlisteditor-thumbnail-container').ThumbnailContainer("setOffAlphaOnDonotPlayItem");
            }
        });

        if (contextObject_mediaSettings.options.setPlayUntillFinishedOption == false) {
            $('#playUntillOption').remove();
        }
        if (contextObject_mediaSettings.options.setTransitionOption == false) {
            $('#transitionOption').remove();
        }
        if (contextObject_mediaSettings.options.setVolumeOption == false) {
            $('#volumeOption').remove();
            $('#muteOption').remove();

        }

        //Update preview data of current playlist object on save button click 
        _plugin.htmlElements.content.mediaSettingControlls.saveButton.input.click(function () {

            var dataToUpdate = $.grep($.data(document, "currentPlayList").details, function (e) {
                return e.guid == contextObject_mediaSettings.options.mediaGuid;
            });

            //update preview data
            dataToUpdate[0].previewData = contextObject_mediaSettings.getMediaSettingsData()[0];
            //update content data
            dataToUpdate[0].contentData = contextObject_mediaSettings.getContentData(dataToUpdate[0].Type)[0];
            //update time option data
            if (dataToUpdate[0].timeOptionsData != undefined) {
                dataToUpdate[0].timeOptionsData = contextObject_mediaSettings.getTimeOptionsData(dataToUpdate[0].Type)[0];
            }
            //update advanced data
            if (dataToUpdate[0].advancedData != undefined) {
                dataToUpdate[0].advancedData = contextObject_mediaSettings.getAdvancedData(dataToUpdate[0].Type)[0];
            }

            //update media Id 
            if ($.data(document, "mediaIdtoUpdate") != undefined && dataToUpdate[0].Id != $.data(document, "mediaIdtoUpdate")) {
                dataToUpdate[0].Id = $.data(document, "mediaIdtoUpdate");
                $('.insm-playlist-manager-thumbnail-media-div[data-guid="' + dataToUpdate[0].guid + '"]').ThumbnailUI({ Id: dataToUpdate[0].Id, mediaType: dataToUpdate[0].Type });
                $('.insm-playlisteditor-process-container').PreviewContainer(
                    {
                        mediaId: dataToUpdate[0].Id, mediaGuid: dataToUpdate[0].guid,
                        mediaType: parseInt(dataToUpdate[0].Type),
                        headerValue: Menutype[dataToUpdate[0].Type].replace(/\w\S*/g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        }),
                        previewData: dataToUpdate[0].previewData
                    });
                $(".insm-playlisteditor-process-content").insmPlayListManager("applyTabUI",
                    dataToUpdate[0].Id,
                    parseInt(dataToUpdate[0].Type),
                    dataToUpdate[0].contentData,
                    dataToUpdate[0].timeOptionsData,
                    dataToUpdate[0].advancedData);
            }
            //$('.mainDiv[ data-guid=' + contextObject_mediaSettings.options.mediaGuid + ']').find('.insm-thumbnail-middle-div span.insm-thumbnail-duration').text(dataToUpdate[0].previewData.duration + "sec");
            $('.mainDiv[ data-guid=' + contextObject_mediaSettings.options.mediaGuid + ']').find('.insm-playlist-manager-thumbnail-indicator-basicBlock').next().text(dataToUpdate[0].previewData.duration + "sec");
        });


        //set duration header 
        $('#duration').bind("change paste keyup", function () {
            //$('.mainDiv[ data-guid=' + contextObject_mediaSettings.options.mediaGuid + ']').find('.insm-thumbnail-middle-div span.insm-thumbnail-duration').text($(this).val() + "sec");
            //console.log($('.mainDiv[ data-guid=' + contextObject_mediaSettings.options.mediaGuid + ']').find('.insm-thumbnail-middle-div span.insm-thumbnail-duration'));
            $('.mainDiv[ data-guid=' + contextObject_mediaSettings.options.mediaGuid + ']').find('.insm-thumbnail-middle-div span.insm-thumbnail-duration span').text($(this).val() + " sec");
        });

        //$('#duration').blur(function () {
        //    var thumbnail = $.grep($.data(document, "currentPlayList").details, function (e) {
        //        return e.Id == parseInt(contextObject_mediaSettings.options.mediaId);
        //    });
        // $('.mainDiv[data-id=' + contextObject_mediaSettings.options.mediaId + ']').find('.insm-thumbnail-middle-div span.insm-thumbnail-duration').text(thumbnail[0].previewData.duration + "sec");
        //});


    },

    onPreviewClick: function () {
        //console.log($.data(document, "currentMediaItem")[0].Id);
        var path = $.insmFramework('getFileImageUrls', { id: $.data(document, "currentMediaItem")[0].Id });
        $.data(document, "previewPopup").empty();
        var targetUI = $.data(document, "previewPopup").append("<span />");
        //targetUI.Resolution({ resolution: $.data(document, "currentPlayList").resolution, containerWidth: $(document).width() - 150 });
        var dialogui = targetUI.PopupForPreview();
        switch ($.data(document, "currentMediaItem")[0].Type) {
            case 2:
                dialogui.PopupForPreview('invokeDialogForVideo', path.original);
                break;
            case 5:
                dialogui.PopupForPreview('invokeDialogForImages', 'gfx/insm/icons/preview-not-available.png');
                break;
            case 6:
                dialogui.PopupForPreview('invokeDialogForImages', 'gfx/insm/icons/preview-not-available.png');
                break;
            case 9:
                dialogui.PopupForPreview('invokeDialogForImages', 'gfx/insm/icons/preview-not-available.png');
                break;
            default:
                dialogui.PopupForPreview('invokeDialogForImages', path.original);
        }

    },


    playMovie: function () {
        var timecaption, totaltime;
        var path = $.insmFramework('getFileImageUrls', { id: contextObject_mediaSettings.options.mediaID });
        preview = $(".previewScreenDiv").previewUI({
            player: {},
            onplay: function (e, data) {
                totaltime = data.total;
                sliderUI = player.previewUIPlayercontrolbar('startPlayState', data);
                timecaption = $.data(document, "timecaption");
            },
            ontimeupdate: function (e, data) {
                sliderUI.insmSlider('setHeaderPosition', data.currentforslider);
                timecaption.text(data.current + "/" + totaltime);
            }
        });
        preview.previewUI("previewMovie", path.original, "Loading Media...");
    },

    //$('#duration').bind("change paste keyup", function () {
    //    $('.insm-thumbnail-duration').text($(this).val() + "sec");
    //});
    //$('#duration').on('change', function () {
    //    if ($('#duration').text() == "") {
    //        $('#duration').val("0");
    //        $('.insm-thumbnail-duration').text("0 sec");
    //    } else {

    //    }
    //});


    _create: function () {
        contextObject_mediaSettings = this;
        rootUI_mediaSettings = this.element;
    },

    // get current image content data to update object
    getContentData: function (type) {
        var result = null;
        switch (type) {
            case Menutype.IMAGE:
                var animateVal;
                if ($('input[id="animate"]:checked').length > 0) {
                    animateVal = true;
                } else {
                    animateVal = false;
                }
                result = [{
                    imagePath: $('#mediaPath').val(),
                    imageScalling: $('#imageScalling').val(),
                    animate: animateVal
                }];
                break;
            case Menutype.MOVIE:
            case Menutype.MUSICFILE:
                result = [{
                    mediaPath: $('#mediaPath').val(),
                }];
                break;
            case Menutype.FLASH:
                var zoomsOutVal;
                if ($('input[id="zoomOut"]:checked').length > 0) {
                    zoomsOutVal = true;
                } else {
                    zoomsOutVal = false;
                }
                result = [{
                    mediaPath: $('#mediaPath').val(),
                    zoomOut: zoomsOutVal
                }];
                break;
            case Menutype.WEB_PAGE:
                result = [{
                    url: $('#webPageUrl').val(),
                    refreshPageOption: $('#refreshPageOption').val(),
                }];
                break;
            case Menutype.NEWS_FEED:
                result = [
                {
                    rssUrl: $('#rssUrl').val(),
                    layoutOption: $('#layoutOption').val(),
                    bgImage: $('#mediaPath').val(),
                    titleStyle: {
                        fontStyle: $('.styleTool[data-role="title"]').find('.fontStyle').val(),
                        fontSize: $('.styleTool[data-role="title"]').find('.fontSize').val(),
                        bold: $('.styleTool[data-role="title"]').find('.bold').attr('data-value'),
                        italic: $('.styleTool[data-role="title"]').find('.italic').attr('data-value'),
                        shadow: $('.styleTool[data-role="title"]').find('.shadow').attr('data-value'),
                        align: $('.styleTool[data-role="title"]').find('.align').attr('data-value'),
                        color: contextObject_mediaSettings.rgb2hex($('.styleTool[data-role="title"]').find('.color').find('.insm-color-picker').css('background-color')),
                    },
                    textStyle: {
                        fontStyle: $('.styleTool[data-role="text"]').find('.fontStyle').val(),
                        fontSize: $('.styleTool[data-role="text"]').find('.fontSize').val(),
                        bold: $('.styleTool[data-role="text"]').find('.bold').attr('data-value'),
                        italic: $('.styleTool[data-role="text"]').find('.italic').attr('data-value'),
                        shadow: $('.styleTool[data-role="text"]').find('.shadow').attr('data-value'),
                        align: $('.styleTool[data-role="text"]').find('.align').attr('data-value'),
                        color: contextObject_mediaSettings.rgb2hex($('.styleTool[data-role="text"]').find('.color').find('.insm-color-picker').css('background-color')),
                    }
                }];
                break;
            case Menutype.MUSIC_STREAM_FILE:
                result = [{
                    musicStreamUrl: $('#musicStreamUrl').val()
                }];
                break;
            case Menutype.PLAYLIST:
                result = [{
                    playlist: $('#playListSelect').val()
                }];
                break;
            case Menutype.INFORMATION:
                result = [{
                    infoLayoutOption: $('#infoLayoutOption').val(),
                    bgImage: $('#mediaPath').val(),
                    title: {
                        fontStyle: $('.styleTool[data-role="title"]').find('.fontStyle').val(),
                        fontSize: $('.styleTool[data-role="title"]').find('.fontSize').val(),
                        bold: $('.styleTool[data-role="title"]').find('.bold').attr('data-value'),
                        italic: $('.styleTool[data-role="title"]').find('.italic').attr('data-value'),
                        shadow: $('.styleTool[data-role="title"]').find('.shadow').attr('data-value'),
                        align: $('.styleTool[data-role="title"]').find('.align').attr('data-value'),
                        color: contextObject_mediaSettings.rgb2hex($('.styleTool[data-role="title"]').find('.color').find('.insm-color-picker').css('background-color')),
                        text: $('#infoTitleContent').val()
                    },
                    text: {
                        fontStyle: $('.styleTool[data-role="text"]').find('.fontStyle').val(),
                        fontSize: $('.styleTool[data-role="text"]').find('.fontSize').val(),
                        bold: $('.styleTool[data-role="text"]').find('.bold').attr('data-value'),
                        italic: $('.styleTool[data-role="text"]').find('.italic').attr('data-value'),
                        shadow: $('.styleTool[data-role="text"]').find('.shadow').attr('data-value'),
                        align: $('.styleTool[data-role="text"]').find('.align').attr('data-value'),
                        color: contextObject_mediaSettings.rgb2hex($('.styleTool[data-role="text"]').find('.color').find('.insm-color-picker').css('background-color')),
                        text: $('#infoTextContent').val()
                    }

                }];
                break;
        }

        return (result);
    },
    //get time options data 
    getTimeOptionsData: function (type) {
        var result = null;
        switch (type) {
            case Menutype.IMAGE:
            case Menutype.FLASH:
            case Menutype.WEB_PAGE:
            case Menutype.NEWS_FEED:
            case Menutype.INFORMATION:
            case Menutype.PLAYLIST:
            case Menutype.MOVIE:
            case Menutype.MUSICFILE:
            case Menutype.MUSIC_STREAM_FILE:
                result = [{
                    timeOptions: $.data(document, "timeOptionsData")
                }];
                break;
        }
        return (result);
    },
    //get advanced data
    getAdvancedData: function (type) {
        var result = null;
        switch (type) {
            case Menutype.IMAGE:
                result = [{
                    imageBgColor: contextObject_mediaSettings.rgb2hex($("#imageBGColorPicker").find('.insm-color-picker').css('background-color')),
                }];
                break;
            case Menutype.MOVIE:
                var memoryClearVal;
                if ($('input[id="movieMemoryCheck"]:checked').length > 0) {
                    memoryClearVal = true;
                } else {
                    memoryClearVal = false;
                }
                result = [{
                    moviePlayerOption: $('#moviePlayerOption').val(),
                    movieBgColor: contextObject_mediaSettings.rgb2hex($("#movieBGColorPicker").find('.insm-color-picker').css('background-color')),
                    movieMemoryClear: memoryClearVal
                }];
                break;
            case Menutype.FLASH:
                var memoryClearFlashVal;
                if ($('input[id="flashMemoryCheck"]:checked').length > 0) {
                    memoryClearFlashVal = true;
                } else {
                    memoryClearFlashVal = false;
                }
                result = [{
                    flashMemoryClear: memoryClearFlashVal
                }];
                break;
            case Menutype.INFORMATION:
                result = [{
                    fontScale: $("#setInfoFontScale").spinner("value"),
                    marginScale: $("#setInfoMarginScale").spinner("value")
                }];
                break;
            case Menutype.NEWS_FEED:
                result = [{
                    username: $("#uName").val(),
                    password: $("#uPwd").val(),
                    fontScale: $("#setNSFontScale").spinner("value"),
                    marginScale: $("#setNSMarginScale").spinner("value"),
                    maxNoOfItems: $("#setNSMaxNoItems").spinner("value"),
                    noRss: $("#noRssFeed").val()
                }];
                break;
        }
        return (result);
    },
    getMediaSettingsData: function () {

        var doNotPlayVal;
        var playUntillFinishedVal;
        var muteVal;
        if ($('input[id="doNotPlayItem"]:checked').length > 0) {
            doNotPlayVal = true;
        } else {
            doNotPlayVal = false;
        }
        if ($('input[id="playUntillFinished"]:checked').length > 0) {
            playUntillFinishedVal = true;
        } else {
            playUntillFinishedVal = false;
        }
        if ($('input[id="mute"]:checked').length > 0) {
            muteVal = true;
        } else {
            muteVal = false;
        }
        var durationVal = $('#duration').val();
        var transitionVal = $('#transition').val();
        var result = [{
            "doNotPlayItem": doNotPlayVal,
            "playUntillFinish": playUntillFinishedVal,
            "duration": durationVal,
            "transition": transitionVal,
            "volume": $.data(document, "volumeVal"),
            "mute": muteVal,
        }];
        return (result);
    },

    _setMediaSettingsData: function () {
        var obj = this.options.setDefaultData;
        $('input[id="doNotPlayItem"]').attr('checked', obj.doNotPlayItem);
        $('input[id="playUntillFinished"]').attr('checked', obj.playUntillFinish);
        $('#duration').val(obj.duration);
        $('#transition').val(obj.transition);
        $('input[id="mute"]').attr('checked', obj.mute);
    },

    //Convert RGB value in # hex
    rgb2hex: function (rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" +
         ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
    },

    _destroy: function () {
        rootUI_mediaSettings.empty();
    },

};

(function ($, undefined) {
    var _plugin;

    $.widget("insm.MediaSettings", MediaSettingsUIManager);
})(jQuery);