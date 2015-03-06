/*
* INSM Rules Input
* This file contain the INSM Rules Input function.
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $.insmRulesInput(options);
*
* Author:
* Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRulesInput');

            //if (!$.insmFramework('isInitialized')) {
            //    $.insmNotification({
            //        type: 'error',
            //        text: 'Framework not initialized before calling INSM Rules Input.'
            //    });
            //    return $this;
            //}

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        tag: null,
                        value: null,
                        tags: [],
                        values: []
                    }, options)
                };
                $this.data('insmRulesInput', _plugin);
            }
            
            return $this;
        },
        get: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRulesInput');

            $this.empty();
            $this.append(
                'Asset.'
            ).append(
                $.insmFormatValue({
                    Type: 'select',
                    Value: _plugin.settings.tag,
                    Values: _plugin.settings.tags
                })
            ).append(
                ' = '
            ).append(
                $.insmFormatValue({
                    Type: 'select',
                    Value: _plugin.settings.value,
                    Values: _plugin.settings.values
                })
            );

            return $this;
        },
        edit: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRulesInput');
            
            $this.empty();
            $this.append(
                'Asset.'
            ).append(
                $.insmFormatValue('edit', {
                    Type: 'select',
                    Value: _plugin.settings.tag,
                    Values: _plugin.settings.tags
                })
            ).append(
                ' = '
            ).append(
                $.insmFormatValue('edit', {
                    Type: 'select',
                    Value: _plugin.settings.value,
                    Values: _plugin.settings.values
                })
            );

            return $this;
        }
    };
    $.fn.insmRulesInput = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRulesInput');
        }
    };
})(jQuery);
