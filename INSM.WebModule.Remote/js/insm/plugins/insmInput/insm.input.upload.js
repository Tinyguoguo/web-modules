/*
* INSM Input Upload
* This file contain the INSM Input Upload function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputUpload(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');
            
            if (_plugin) {
                $this.insmInputUpload('destroy');
            }

            _plugin = {
                settings: $.extend({
                    type: 'upload',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    selectFileCallback: function () {
                        throw new Error('Select file callback not defined');
                    }
                }, options),
                htmlElements: {
                    inputButton: $('<input type="file" />'),
                    browseButton: $('<button />')
                }
            };
            
            if (typeof _plugin.settings.value === "number") {
                _plugin.settings.value = _plugin.settings.value.toString();
            }
            
            $this.data('insmInputUpload', _plugin);

            $this.insmInputUpload('update');

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            $this.empty();

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');
            
            _plugin.htmlElements.inputButton = $('<input type="file" />');
            $this.append(
                _plugin.htmlElements.inputButton
            );
            
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            return _plugin.htmlElements.inputButton;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            if (_plugin.htmlElements.inputButton.val()) {
                return true;
            }
            else {
                _plugin.htmlElements.browseButton.insmHighlight({
                    type: 'error'
                });
                return false;
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            switch(_plugin.data.type){
                case 'input':
                    _plugin.data.element.val("");
                break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                break;
            }
            // clear current value
            _plugin.settings.value = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputUpload');

            $this.data('insmInputUpload', null);

            return $this;
        }
    };

    $.fn.insmInputUpload = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputUpload');
        }
    };
})(jQuery);