
var ResolutionManager = {
    version: "0.0.1",

    // Declare value and events
    options: {
        resolution: null,
        containerWidth: null,
    },

    // Plugin creation
    _create: function () {
        contextObjectOfResolution = this;
        root_Resolution = this.element;
    },

    // Initialization of this plugin
    _init: function () {
        var resolutionw = 1920;
        var resolutionh = 1080;
        if (this.options.resolution.resolutionValue.indexOf('X') >= 0) {
            resolutionw = this.options.resolution.resolutionValue.substr(0, this.options.resolution.resolutionValue.indexOf('X'));
            resolutionh = this.options.resolution.resolutionValue.substr(this.options.resolution.resolutionValue.indexOf('X') + 1);
        }
        if (this.options.resolution.resolutionValue.indexOf('x') >= 0) {
            resolutionw = this.options.resolution.resolutionValue.substr(0, this.options.resolution.resolutionValue.indexOf('x'));
            resolutionh = this.options.resolution.resolutionValue.substr(this.options.resolution.resolutionValue.indexOf('x') + 1);
        }

        var outerW = this.options.containerWidth;
        var setH = resolutionh / resolutionw * outerW;
        root_Resolution.css("height", setH + "px");
        root_Resolution.css("width", (outerW) + "px");
    },

    // Destroy plugin references
    _destroy: function () {
        // root_thumbnailViewUI.empty();
    },


};

(function ($, undefined) {
    var contextObjectOfResolution, root_Resolution;

    $.widget("insm.Resolution", ResolutionManager);
})(jQuery);