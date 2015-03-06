/*
* INSM Search field
* This file contain the INSM Search Field function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmSearchField(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            if (this instanceof $) {
                var $this = $(this);
            }
            else {
                var $this = $('<div />');
            }

            var _plugin = $this.data('insmSearchField');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        searchInput: $('<input type="text" />').addClass('insm-search-input'),
                        searchButton: $('<a />').addClass('insm-search-button'),
                        clearButton: $('<a />').addClass('insm-clear-button')
                    },
                    data: $.extend({
                        placeholderText: 'Search...',
                        onClear: function () {
                            _plugin.htmlElements.searchInput.val('').focus();
                        },
                        onSearch: function () {

                        },
                        autoSearch: true,
                        autoSearchTimeout: 0,
                        autoSearchHandler: setTimeout(function () {

                        }, 0),
                        searchstring: ''
                    }, options)
                };
                $this.data('insmSearchField', _plugin);
            }

            // Listeners
            $this.append(
                _plugin.htmlElements.searchInput.bind('keyup', function () {
                    if (_plugin.data.autoSearch) {
                        clearTimeout(_plugin.data.autoSearchHandler);

                        var newString = $(this).val();
                        _plugin.data.autoSearchHandler = setTimeout(function () {
                            if (_plugin.data.searchstring != newString) {
                                _plugin.data.onSearch(newString);
                                _plugin.data.searchstring = newString;
                            }
                        }, _plugin.data.autoSearchTimeout);
                    }
                })
            );

            _plugin.htmlElements.searchInput.insmInputPlaceholder({
                text: _plugin.data.placeholderText
            });

            return $this;
        },
        triggerSearch: function () {
            if (this instanceof $) {
                var $this = $(this);
            }
            else {
                $.insmNotification({
                    type: 'error',
                    text: 'No target available in INSM Search Field'
                });
            }
            var _plugin = $this.data('insmSearchField');
            
            _plugin.data.onSearch(_plugin.data.searchstring);

            return $this;
        },
        clearSearchField: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSearchField');
            _plugin.htmlElements.searchInput.val('').focus();
            _plugin.data.searchstring = '';
            return $this;
        },
        setInputField: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSearchField');
            if (_plugin) {
                _plugin.htmlElements.searchInput.val(options.text);
            }
            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSearchField');

            if (_plugin) {
                clearInterval(_plugin.data.autoSearchHandler);
            }

            _plugin.htmlElements.searchInput.insmInputPlaceholder.destroy();
            $this.data('insmSearchField', '');
            $this.empty();
            return $this;
        }
    };

    $.insmSearchField = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSearchField');
        }
    };

    $.fn.insmSearchField = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSearchField');
        }
    };
})(jQuery);