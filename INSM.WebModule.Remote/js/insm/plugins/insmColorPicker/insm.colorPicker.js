var contextObject_colorPicker, rootUI_colerPicker;
ColorPickerManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        role:null,
        selectedcolor: null,
        currentColorValue: null
        
    },

    //Create this plugin
    _create: function () {
        contextObject_colorPicker = this;
        rootUI_colerPicker = this.element;
    },
    
    // Initilization of plugin
    _init: function () {
        contextObject_colorPicker = this;
        rootUI_colerPicker = this.element;
        $(rootUI_colerPicker).empty();
        var colorPickerHtml = '<span class="insm-color-picker"  data-role="'+  this.options.role+'" ></span><span id="color'+this.options.role+'" class="insm-color-picker-span"></span>';
        rootUI_colerPicker.append(colorPickerHtml);
        ColorPickerManager._setColorPalate();
    },

    // set html for color palate
    _setColorPalate: function () {
        rootUI_colerPicker.find('.insm-color-picker').colpick({
            colorScheme: 'dark',
            layout: 'rgbhex',
            color: 'ff8800',
            onSubmit: function (hsb, hex, rgb, el) {
                $("#color"+$(el).attr('data-role')).text('#' + hex);
                $(el).css('background-color', '#' + hex);
                $(el).colpickHide();
            },
            onShow:function() {
                $(".colpick_rgbhex").css('z-index', 1000);
            }
        }).css('background-color', contextObject_colorPicker.options.selectedcolor);
        
        rootUI_colerPicker.find(".insm-color-picker-span").text(contextObject_colorPicker.options.currentColorValue);
    },
    
    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_colerPicker.empty();
    },
    
};

(function ($, undefined) {
    $.widget("insm.colorPicker", ColorPickerManager);
})(jQuery);