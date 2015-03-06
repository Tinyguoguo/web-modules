/*
* INSM Ruleset
* This file contain the INSM Ruleset function.
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $.insmRuleset(options);
*
* Author:
* Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRuleset');

            //if (!$.insmFramework('isInitialized')) {
            //    $.insmNotification({
            //        type: 'error',
            //        text: 'Framework not initialized before calling INSM Ruleset.'
            //    });
            //    return $this;
            //}

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        name: 'New ruleset',
                        weight: 1,
                        rules: []
                    }, options),
                    htmlElements: {
                        table: $('<table />'),
                        cell: {
                            name: $('<td />'),
                            weight: $('<td />'),
                            rules: $('<td />')
                        }
                    }
                };

                _plugin.htmlElements.cell.name.insmFormatValue({
                    Type: 'text',
                    Value: _plugin.settings.name
                });
                _plugin.htmlElements.cell.weight.insmFormatValue({
                    Type: 'numeric',
                    Value: _plugin.settings.weight
                });
                $this.data('insmRuleset', _plugin);
            }
            
            _plugin.htmlElements.table.empty();

            _plugin.htmlElements.table.append(
                $('<tr />').append(
                    $('<th />').text('Name'),
                    _plugin.htmlElements.cell.name
                ),
                $('<tr />').append(
                    $('<th />').text('Weight'),
                    _plugin.htmlElements.cell.weight
                ),
                $('<tr />').append(
                    $('<th />').text('Rules'),
                    _plugin.htmlElements.cell.rules
                )
            );

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRuleset');

            $this.empty();
            _plugin.htmlElements.cell.name.insmFormatValue('view');
            _plugin.htmlElements.cell.weight.insmFormatValue('view');
            
            $this.append(
                _plugin.htmlElements.table
            );

            return $this;
        },
        edit: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRuleset');
            
            $this.empty();
            _plugin.htmlElements.cell.name.insmFormatValue('edit');
            _plugin.htmlElements.cell.weight.insmFormatValue('edit');

            $this.append(
                _plugin.htmlElements.table
            );

            return $this;
        }
    };
    $.fn.insmRuleset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRuleset');
        }
    };
})(jQuery);
