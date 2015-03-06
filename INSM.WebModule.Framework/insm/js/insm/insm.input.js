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
* Koji Wakayama - Creuna AB
*/

;(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            _plugin = {
                settings: $.extend({
                    type: "String",
                    values: [],
                    multiSelect: false,
                    required: true,
                    initObject: {}
                }, options)
            };
            $this.data('insmInput', _plugin);
            $this.insmInput('getPlugin').apply(this, [_plugin.settings]);
            return $this;
        },
        getPlugin: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');

            if ($.inArray(_plugin.settings.type.toLowerCase(), ['text', 'float', 'select', 'numeric']) >= 0) {
                _plugin.settings.type = 'string';
            }
            if ($.inArray(_plugin.settings.type.toLowerCase(), ['int', 'number']) >= 0) {
                _plugin.settings.type = 'integer';
            }
            if ($.inArray(_plugin.settings.type.toLowerCase(), ['bool']) >= 0) {
                _plugin.settings.type = 'boolean';
            }
            if ($.inArray(_plugin.settings.type.toLowerCase(), ['mediafile']) >= 0) {
                _plugin.settings.type = 'file';
            }

            // Only works for plugins prefixed with "insmInput" - maybe make more flexible?
            var inputPlugin = 'insmInput' + _plugin.settings.type.charAt(0).toUpperCase() + _plugin.settings.type.slice(1);
            
            var returnValue = $this[inputPlugin];

            if (typeof returnValue !== 'function') {
                throw new Error('Input type "' + _plugin.settings.type + '" not defined. (Missing reference?)');
            }

            return returnValue;

            var ret = null;
            switch (_plugin.settings.type.toLowerCase()) {
                case 'string':
                case 'text':
                    ret = $this.insmInputString;
                    break;
                case 'integer':
                case 'int':
                case 'number':
                    ret = $this.insmInputInteger;
                    break;
                case 'slider':
                    ret = $this.insmInputSlider;
                    break;
                case 'rules':
                    ret = $this.insmInputRules;
                    break;
                case 'ruleset':
                    ret = $this.insmInputRuleSet;
                    break;
                case 'float':
                case 'select':
                case 'numeric':
                    ret = $this.insmInputString;
                    break;
                case 'boolean':
                case 'bool':
                    ret = $this.insmInputBoolean;
                    break;
                case 'constant':
                    ret = $this.insmInputConstant;
                    break;
                case 'display':
                    ret = $this.insmInputDisplay;
                    break;
                case 'weekdays':
                    ret = $this.insmInputWeekdays;
                    break;
                case 'time':
                    ret = $this.insmInputTime;
                    break;
                case 'timeinterval':
                    ret = $this.insmInputTimeInterval;
                    break;
                case 'date':
                    ret = $this.insmInputDate;
                    break;
                case 'dateinterval':
                    ret = $this.insmInputDateInterval;
                    break;
                case 'table':
                    ret = $this.insmInputTable;
                    break;
                case 'resolution':
                    ret = $this.insmInputResolution;
                    break;
                case 'dataset':
                    ret = $this.insmInputDataset;
                    break;
                case 'plugin':
                    ret = $this.insmInputPlugin;
                    break;
                case 'dropdown':
                    ret = $this.insmInputDropdown;
                    break;
                case 'display':
                    ret = $this.insmInputDisplay;
                    break;
                case 'resolution':
                    ret = $this.insmInputResolution;
                    break;
                case 'file':
                case 'mediafile':
                    ret = $this.insmInputFile;
                    break;
                case 'image':
                    ret = $this.insmInputImage;
                    break;
                case 'audio':
                    ret = $this.insmInputAudio;
                    break;
                case 'video':
                    ret = $this.insmInputVideo;
                    break;
                default:
                    $.insmNotification({
                        type: 'error',
                        text: 'type "' + _plugin.settings.type + '" not implemented for get in INSM Input'
                    });
                    break;                    
            }
            if (typeof ret !== 'function') {
                throw new Error('Input type "' + _plugin.settings.type + '" is not declared (missing file reference in index.html?)');
            }
            return ret;
        },
        view: function () {
            var $this = $(this);
            $this.insmInput('getPlugin').apply(this, ['view']);
            return $this;
        },
        edit: function () {
            var $this = $(this);
            $this.insmInput('getPlugin').apply(this, ['edit']);
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            return $this.insmInput('getPlugin').apply(this, ['getValue']);
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            return $this.insmInput('getPlugin').apply(this, ['setValue', value]);
        },
        empty: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            return $this.insmInput('getPlugin').apply(this, ['empty']);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            return $this.insmInput('getPlugin').apply(this, ['validate']);
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInput');
            return $this.insmInput('getPlugin').apply(this, ['reset']);
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