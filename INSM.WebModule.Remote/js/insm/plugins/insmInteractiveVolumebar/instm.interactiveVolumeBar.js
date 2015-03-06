var contextObject_interactiveVolumeBar, rootUI_interactiveVolumeBar;
var popup, interactivVolumeBar, slider, sliderValue, currentUI;
var interactiveVolumeBarUIManager = {
    version: "0.0.1",

    options: {
        GUID: '',
        data: null,
        onClick: null,
        onClose: null,
        onIndicatorState:null
    },
    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
        contextObject_interactiveVolumeBar = this;
        rootUI_interactiveVolumeBar = this.element;
        sliderValue = 0;
        rootUI_interactiveVolumeBar.empty();
        rootUI_interactiveVolumeBar.append('<span class="insm-playlist-manager-interactive-volumeUI insm-playlist-manager-interactive-volumebar-startup" data-type="button" data-isdefault="true" data-volume="1"  data-id="' + contextObject_interactiveVolumeBar.options.GUID + '" data-ismute="false" ></span>'
                    + ' <div class="generateBox"></div>');
        popup = $('<div/>');
        popup.addClass('insm-playlist-manager-interactive-volumebar-popupBox');
        interactivVolumeBar = {};
        interactivVolumeBar.htmlElements = {
            content: {
                defaultContainer: {
                    container: $('<div />'),
                    defaultRadio: $('<input name="audio" data-type="button" type="radio" id="defaultAudio" checked/>'),
                    label: $('<label />').text('Default volume')
                },
                customeContainer: {
                    container: $('<div />'),
                    customeRadio: $('<input name="audio" data-type="button" type="radio" id="customeAudio"/>'),
                    label: $('<label />').text('Custome volume')
                },
                sidebarContainer: {
                    container: $('<div />'),
                    sideBar: $("<div />").attr("id", "interactivevolumeBar")
                },
                muteContainer: {
                    container: $('<div />'),
                    mute: $('<input type="checkbox" data-type="button" id="chkMuteVolumeBar"/>'),
                    title: $('<span />').text('Mute')
                }
            }
        };
        popup.append(interactivVolumeBar.htmlElements.content.defaultContainer.container
            .append(interactivVolumeBar.htmlElements.content.defaultContainer.defaultRadio)
            .append(interactivVolumeBar.htmlElements.content.defaultContainer.label))
            .append(interactivVolumeBar.htmlElements.content.customeContainer.container
            .append(interactivVolumeBar.htmlElements.content.customeContainer.customeRadio)
            .append(interactivVolumeBar.htmlElements.content.customeContainer.label))
            .append(interactivVolumeBar.htmlElements.content.sidebarContainer.container
            .append(interactivVolumeBar.htmlElements.content.sidebarContainer.sideBar))
            .append(interactivVolumeBar.htmlElements.content.muteContainer.container
            .append(interactivVolumeBar.htmlElements.content.muteContainer.mute)
            .append(interactivVolumeBar.htmlElements.content.muteContainer.title));
        //  contextObject_interactiveVolumeBar._setVolumeIcon($("span[data-type='button']"), contextObject_interactiveVolumeBar.options.data.volume);
        contextObject_interactiveVolumeBar._assignStartupIcon();
        rootUI_interactiveVolumeBar.parent().after(popup);
        interactivVolumeBar.htmlElements.content.customeContainer.customeRadio.on("click", function (e) {
            e.stopPropagation();
            currentUI.css("opacity", "1");
            var id = setTimeout(function () {
                clearInterval(id);
                slider.volumeBar("setStatus", true);
            }, 500);
            $.data(document, "currentData").isDefaultVolume = false;
            interactivVolumeBar.htmlElements.content.muteContainer.mute.prop("disabled", false);
            contextObject_interactiveVolumeBar._trigger('onIndicatorState', e, 1);
        });

        interactivVolumeBar.htmlElements.content.defaultContainer.defaultRadio.on("click", function (e) {
            e.stopPropagation();
            $.data(document, "currentData").isDefaultVolume = true;
            currentUI.css("opacity", "0.6");
            var id = setTimeout(function () {
                clearInterval(id);
                slider.volumeBar("setStatus", false);
            }, 300);
            contextObject_interactiveVolumeBar._trigger('onIndicatorState', e, -1);
            interactivVolumeBar.htmlElements.content.muteContainer.mute.prop("disabled", true);
            currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
            currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
            currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
            currentUI.addClass("insm-playlist-manager-interactive-volumebar-phase4");
            currentUI.addClass("insm-playlist-manager-interactive-volumebar-startup");
        });

        slider = interactivVolumeBar.htmlElements.content.sidebarContainer.sideBar.volumeBar({
            onChange: function (e, ui) {
                $.data(document, "currentData").volume = ui;
                contextObject_interactiveVolumeBar._setVolumeIcon(currentUI, ui);
            }
        });

        interactivVolumeBar.htmlElements.content.muteContainer.mute.on("click", function (e) {
            e.stopPropagation();
            if (interactivVolumeBar.htmlElements.content.muteContainer.mute.prop('checked')) {
                //slider.volumeBar("setHeaderPositiontoZero");
                sliderValue = 0;
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
                currentUI.addClass("insm-playlist-manager-interactive-volumebar-phase1");
                $.data(document, "currentData").isMute = true;

            } else {
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
                currentUI.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
                currentUI.addClass("insm-playlist-manager-interactive-volumebar-phase4");
                $.data(document, "currentData").isMute = false;
            }
        });

        interactivVolumeBar.htmlElements.content.muteContainer.container.css("margin-top", "10px");
        slider.css('margin-left', "20px");


        $('body').on('click', function (e) {
            if ($(e.target).attr('data-type') == undefined) {
                //close Popup
                contextObject_interactiveVolumeBar._closePopup();
            }
        });

        $('span[ data-type="button"]').on("click", function (e) {
            //Show Popup

            var id = $(this).attr('data-id');
            // var id = $(e.target).attr("data-id");

            contextObject_interactiveVolumeBar._showPopup(e, id);
        });

        //slider.attr('data-type','button');
    },
    /*
    Description:Set Value
    Parameters:Jquery Event
    Return:none
    */
    _setValue: function (e) {
        sliderValue = Number(e.volume);
        slider.volumeBar("setHeaderPosition", Number(e.volume));
        if (e.isDefaultVolume) {
            slider.css('opacity', "0.6");
            slider.volumeBar("setStatus", false);
            interactivVolumeBar.htmlElements.content.customeContainer.customeRadio.prop("checked", false);
            interactivVolumeBar.htmlElements.content.defaultContainer.defaultRadio.prop("checked", true);
            interactivVolumeBar.htmlElements.content.muteContainer.mute.prop("disabled", true);
        } else {
            slider.css('opacity', "1.0");
            slider.volumeBar("setStatus", true);
            interactivVolumeBar.htmlElements.content.customeContainer.customeRadio.prop("checked", true);
            interactivVolumeBar.htmlElements.content.defaultContainer.defaultRadio.prop("checked", false);
            interactivVolumeBar.htmlElements.content.muteContainer.mute.prop("disabled", false);
        }
        interactivVolumeBar.htmlElements.content.muteContainer.mute.prop('checked', e.isMute);
    },
    /*
    Description:Close Popup
    Parameters:none
    Return:none
    */
    _closePopup: function () {
        popup.css("display", "none");
        contextObject_interactiveVolumeBar._trigger('onClose', null, $.data(document, "currentData"));
    },
    /*
    Description:show popup
    Parameters:Jquery Event,id
    Return:none
    */
    _showPopup: function (e, id) {
        popup.css("display", "block");
        $('.insm-playlist-manager-interactive-volumebar-popupBox').offset({ top: $('.insm-playlist-manager-interactive-volumeUI[data-id="' + id + '"]').offset().top + 32 });
        $('.insm-playlist-manager-interactive-volumebar-popupBox').offset({ left: $('.insm-playlist-manager-interactive-volumeUI[data-id="' + id + '"]').offset().left });
        currentUI = $(e.target);
        var data = $.grep($.data(document, "timeOptionsData"), function (e) {
            return e.timeOptionId == id;
        });
        //console.log(data[0].volume);
        contextObject_interactiveVolumeBar._setValue(data[0].volume);
        $.data(document, "currentData", data[0].volume);
    },
    /*
    Description:Assign startup Icon
    Parameters:none
    Return:none
    */
    _assignStartupIcon: function () {
        if (contextObject_interactiveVolumeBar.options.data.isDefaultVolume == true) {
            $("span[data-type='button']").addClass("insm-playlist-manager-interactive-volumebar-startup");
            $("span[data-type='button']").addClass("insm-playlist-manager-interactive-volumebar-phase4");
        } else {

            var volumeVal = contextObject_interactiveVolumeBar.options.data.volume;
            var handler = $('.insm-playlist-manager-interactive-volumeUI[data-id="' + contextObject_interactiveVolumeBar.options.GUID + '"]');
            handler.css("opacity", "1");
            var id = setTimeout(function () {
                clearTimeout(id);
                if (volumeVal >= 0.1 && volumeVal < 0.3) {
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
                    handler.addClass("insm-playlist-manager-interactive-volumebar-phase2");
                } else if (volumeVal >= 0.3 && volumeVal < 0.6) {
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
                    handler.addClass("insm-playlist-manager-interactive-volumebar-phase3");
                } else if (volumeVal >= 0.6 && volumeVal <= 1) {
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
                    handler.addClass("insm-playlist-manager-interactive-volumebar-phase4");
                } else if (volumeVal < 0.1) {
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
                    handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
                    handler.addClass("insm-playlist-manager-interactive-volumebar-phase1");
                }
            }, 500);
        }
    },
    /*
    Description:set volume Icon
    Parameters:Jquery object,volume
    Return:none
    */
    _setVolumeIcon: function (handler, volumeVal) {
        handler.addClass("insm-playlist-manager-interactive-volumebar-startup");
        handler.css("opacity", "1");
        if (volumeVal >= 0.1 && volumeVal < 0.3) {
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
            handler.addClass("insm-playlist-manager-interactive-volumebar-phase2");
        } else if (volumeVal >= 0.3 && volumeVal < 0.6) {
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
            handler.addClass("insm-playlist-manager-interactive-volumebar-phase3");
        } else if (volumeVal >= 0.6 && volumeVal <= 1) {
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase1");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
            handler.addClass("insm-playlist-manager-interactive-volumebar-phase4");
        } else if (volumeVal < 0.1) {
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase4");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase2");
            handler.removeClass("insm-playlist-manager-interactive-volumebar-phase3");
            handler.addClass("insm-playlist-manager-interactive-volumebar-phase1");
        }
    },
    /*
    Description:Rendering function for plugin
    Parameters:none
    Return:none
    */
    _create: function () {

    },

    /*
    Description:Destructor for plugin
    Parameters:none
    Return:none
    */
    _destroy: function () {

    },
};

(function ($, undefined) {
    $.widget("insm.interactiveVolumeBar", interactiveVolumeBarUIManager);
})(jQuery);