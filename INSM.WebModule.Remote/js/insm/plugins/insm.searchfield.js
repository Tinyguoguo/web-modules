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
            $this.empty();
            $this.append(
                _plugin.htmlElements.searchInput.bind('keyup', function (e) {
                    if (e.keyCode == 13) {
                        var newString = $(this).val();
                        _plugin.data.onSearch(newString);
                        _plugin.data.searchstring = newString;
                    }
                    else if (_plugin.data.autoSearch) {
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
                text: _plugin.data.placeholderText,
                hasIcon: true
            });
            
            return $this;
        },
        getSearchstring: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSearchField');

            if (!_plugin) {
                return '';
            }

            return _plugin.htmlElements.searchInput.val();
        },
        triggerSearch: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSearchField');

            
            if (!_plugin) {
                return $this;
            }

            _plugin.data.onSearch(_plugin.htmlElements.searchInput.val());

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