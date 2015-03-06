/*
* INSM Asset
* This file contain the INSM Input function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInput(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

;(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            _plugin = {
                settings: $.extend({
                    type: 'string',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false
                }, options)
            };

            $this.data('insmInput', _plugin);

            $this.insmInput('getPlugin').apply(this, [_plugin.settings]);

            return $this.addClass('insmInput');
        },
        getPlugin: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');

            // Only works for plugins prefixed with "insmInput" - maybe make more flexible?
            var inputPlugin = 'insmInput' + _plugin.settings.type.charAt(0).toUpperCase() + _plugin.settings.type.slice(1);

            var returnValue = $this[inputPlugin];

            if (typeof returnValue !== 'function') {
                throw new Error('Input type "' + _plugin.settings.type + '" not defined. (Missing reference?)');
            }

            return returnValue;

            // Old code below. Changed because I didn't want to update this plugin all the time. The above might not be as safe - but a lot more flexible. 
            var returnValue = null;
            switch (_plugin.settings.type.toLowerCase()) {
                case 'string':
                    returnValue = $this.insmInputString;
                    break;
                case 'integer':
                    returnValue = $this.insmInputInteger;
                    break;
                case 'boolean':
                    returnValue = $this.insmInputBoolean;
                    break;
                case 'file':
                    returnValue = $this.insmInputFile;
                    break;
                case 'table':
                    returnValue = $this.insmInputTable;
                    break;
                case 'resolution':
                    returnValue = $this.insmInputResolution;
                    break;
                case 'upload':
                    returnValue = $this.insmInputUpload;
                    break;
                case 'date':
                    returnValue = $this.insmInputDate;
                    break;
                case 'dateinterval':
                    returnValue = $this.insmInputDateInterval;
                    break;
                case 'dateintervalmonth':
                    returnValue = $this.insmInputDateIntervalMonth;
                    break;
                case 'dateintervalyear':
                    returnValue = $this.insmInputDateIntervalYear;
                    break;
                case 'assetproperties':
                    returnValue = $this.insmInputAssetProperties;
                    break;
                case 'fileproperties':
                    returnValue = $this.insmInputFileProperties;
                    break;
                case 'slider':
                    returnValue = $this.insmInputSlider;
                    break;
                case 'templatedata':
                    returnValue = $this.insmInputTemplateData;
                    break;
                default:
                    throw new Error('Input type "' + _plugin.settings.type + '" not implemented');
                    break;                    
            }
            if (typeof returnValue !== 'function') {
                throw new Error('Input type "' + _plugin.settings.type + '" not defined. (Missing reference?)');
            }
            return returnValue;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['view']);
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['edit']);
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['highlightInvalid']);
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['setValue', value]);
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return null;
            }
            return $this.insmInput('getPlugin').apply(this, ['getValue']);
        },
        update: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['update', value]);
        },
        empty: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['empty']);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['validate']);
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['reset', value]);
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            if (!_plugin) {
                return $this;
            }
            return $this.insmInput('getPlugin').apply(this, ['destroy']);
        }
    };

    $.fn.insmInput = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInput');
        }
    };
})(jQuery);