var sliderObject = {

    options: {
        minvalue: 0,
        maxvalue: 0,
        onChange: null,
        onEnd:null
    },

    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
        rootUI_Slider = this.element;
        ContextObject_Slider = this;
        var strhtml = "<span class='insm-playlist-manager-slider-container'> <div class='insm-playlist-manager-slider-header'></div> </span>";
        rootUI_Slider.html(strhtml);
        totalLength= $(".insm-playlist-manager-slider-container").width();
        unit = totalLength / ContextObject_Slider.options.maxvalue;
        rootUI_Slider.find(".insm-playlist-manager-slider-container").css("background-size", (totalLength + 30) + "px 2px")

        var pointer = rootUI_Slider.find(".insm-playlist-manager-slider-header").draggable({
            containment: "parent",
            axis: "x",
            drag: function (event, ui) {
                ContextObject_Slider._trigger('onChange', event, ui.position.left/unit);
            }
        });
    },

    /*
    Description:Get current value for Slider
    Parameters:none
    Return:none
    */
    getCurrentValue: function () {
        var currentPosition = $(".insm-playlist-manager-slider-header").css("left");
        return currentPosition / unit;
    },

    /*
    Description:Set Header position for slider
    Parameters:Value
    Return:
    */
    setHeaderPosition: function (value) {
        if (value * unit <= totalLength) {
            $(".insm-playlist-manager-slider-header").css("left", value * unit + "px");
        } else {
            ContextObject_Slider._trigger("onEnd");
        }
    },

    /*
    Description:Rendering function for plugin
    Parameters:
    Return:
    */
    _create: function () {

    },
	
    /*
    Description:Destructor for plugin
    Parameters:
    Return:
    */
    _destroy: function () {

    }
};

(function ($, undefiend) {
    var rootUI_Slider, ContextObject_Slider;
    var unit,totalLength;
	$.widget("insm.insmSlider", sliderObject);
})(jQuery);