"use strict";
(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputImage');

            _plugin = {
                settings: $.extend({
                    type: 'Movie',
                    required: true,
                    currentValue: {},
                    initObject: {},
                    mediaContentDirectory: 0,
                    onUpdate: function (newValue) { }
                }, options)
            };
            $this.data('insmInputImage', _plugin);
            $this.insmInputMediaFile(_plugin.settings);
            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.insmInputMediaFile('view');
            return $this;
        },
        getFileInfo: function (options) {
            var $this = $(this);
            return $this.insmInputMediaFile('getFileInfo');
        },
        edit: function () {
            var $this = $(this);
            $this.insmInputMediaFile('edit');
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            return $this.insmInputMediaFile('getValue');
        },
        getThumbnail: function () {
            var $this = $(this);
            return $this.insmInputMediaFile('getThumbnail');
        },
        getPreview: function () {
            var $this = $(this);
            return $this.insmInputMediaFile('getPreview');
        },
        validate: function () {
            var $this = $(this);
            return $this.insmInputMediaFile('validate');
        },
        destroy: function () { }
    };

    $.fn.insmInputImage = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputImage');
        }
    };
})(jQuery);