
var previewUIPlayercontrolbar = {
    version: "0.0.1",

    options: {
        onplayClick: null,
        onpauseClick: null,
        onstopClick: null,
    },

    //Start rendering for plugin
    _init: function () {
        contextObject_previewUIPlayercontrolbar = this;
        rootUI_previewUIPlayercontrolbar = this.element;

        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                container: $("<div />").addClass("playlist-manager-preview-controlbutton-container"),
                slider: {
                    container: $("<div />").addClass("playlist-manager-preview-controlbutton-slider"),
                    sliderui: $("<div />").addClass("playlist-manager-preview-controlbutton-sliderui")
                },
                controller: {
                    container: $("<div />").addClass("playlist-manager-preview-controlbutton-master-container"),
                    spanfiller: $("<span />").addClass("playlist-manager-preview-span playlist-manager-preview-spanfiller"),
                    playbutton: $("<div />").addClass("playlist-manager-preview-controlbutton playlist-manager-preview-playbutton"),
                    stopbutton: $("<div />").addClass("playlist-manager-preview-controlbutton playlist-manager-preview-stopbutton"),
                    spantime: $("<span />").addClass("playlist-manager-preview-span playlist-manager-preview-spantime").text("00:00/00:16"),
                }
            }
        };

        rootUI_previewUIPlayercontrolbar.append(_plugin.htmlElements.content.container
                        .append(_plugin.htmlElements.content.slider.container
                            .append(_plugin.htmlElements.content.slider.sliderui)
                            ).append(_plugin.htmlElements.content.controller.container
                                .append(_plugin.htmlElements.content.controller.spanfiller)
                                .append(_plugin.htmlElements.content.controller.playbutton)
                                .append(_plugin.htmlElements.content.controller.stopbutton)
                                .append(_plugin.htmlElements.content.controller.spantime)
                                ));

        isplay = true;
        $.data(document, "timecaption", $('.playlist-manager-preview-spantime'));
        _plugin.htmlElements.content.controller.playbutton.on("click", function (e) {
            if (isplay) {
                $(this).removeClass("playlist-manager-preview-pausebutton");
                $(this).addClass("playlist-manager-preview-playbutton");
                isplay = false;
                contextObject_previewUIPlayercontrolbar._trigger('onpauseClick');
            } else {
                isplay = true;
                $(this).addClass("playlist-manager-preview-pausebutton");
                $(this).removeClass("playlist-manager-preview-playbutton");
                contextObject_previewUIPlayercontrolbar._trigger('onplayClick');
            }
        });

        _plugin.htmlElements.content.controller.stopbutton.on("click", function (e) {
            $(".playlist-manager-preview-pausebutton").addClass("playlist-manager-preview-playbutton");
            $(".playlist-manager-preview-playbutton").removeClass("playlist-manager-preview-pausebutton");
            isplay = false;
            contextObject_previewUIPlayercontrolbar._trigger('onstopClick');
        });
    },

    //Activate controller bar in case of Audio/Vide
    startPlayState: function (data) {
        $('.playlist-manager-preview-playbutton').addClass("playlist-manager-preview-pausebutton");
        //sliderUI = $(".playlist-manager-preview-controlbutton-sliderui").slider({
        //    min: 0,
        //    max: data.totalforslider,
        //});

        sliderUI = $(".playlist-manager-preview-controlbutton-sliderui").insmSlider({
            minvalue:0,
            maxvalue:data.totalforslider,
            onChange:function(e,position){
                console.log(position);
            },
            onEnd: function () {
                
            }
        });
        return sliderUI;
    },

    //Call this function when initialize plugin
    _create: function () {
    },

    //Call this function while remove plugin
    _destroy: function () {

    },

    //Trace on cosole window
    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var contextObject_previewUIPlayercontrolbar, rootUI_previewUIPlayercontrolbar, sliderUI;
    var isplay,totalLength;
    $.widget("insm.previewUIPlayercontrolbar", previewUIPlayercontrolbar);
})(jQuery);