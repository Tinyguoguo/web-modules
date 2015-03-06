/*
* INSM Combobox
* This file contain the INSM Combobox plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Invoked by $('identifier').insmCombobox(settings);
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmCombobox');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        availableValues: [],
                        onSelect: function () {

                        }
                    }, options),
                    data: {
                        selectedValue: null,
                        filteredValues: []
                    },
                    htmlElements: {
                        wrapper: $('<div />').addClass('insmCombobox'),
                        backdrop: $('<div />').addClass('backdrop is-clickable'),
                        inputContainer: $('<div />').addClass('input-container'),
                        searchField: $('<div />'),
                        cancelButton: $('<button />').text('Cancel'),
                        selectButton: $('<button />').text('Done'),
                        listContainer: $('<ul />')
                    }
                };

                $this.data('insmCombobox', _plugin);
            }

            _plugin.htmlElements.searchField.insmSearchField({
                onSearch: function (searchstring) {
                    _plugin.data.filteredValues = [];
                    $.each(_plugin.settings.availableValues, function (index, item) {
                        if (item.displayName.toLowerCase().indexOf(searchstring.toLowerCase()) >= 0) {
                            _plugin.data.filteredValues.push($.extend(true, {}, item));
                        }
                    });

                    $.insmCombobox('populateList');
                }
            });

            $.each(_plugin.settings.availableValues, function (index, item) {
                if (!item.displayName) {
                    item.displayName = item.name;
                }
                if (!item.displayName) {
                    item.displayName = item.title;
                }
            });


            _plugin.settings.availableValues.sort(function (itemA, itemB) {
                return itemA.displayName.localeCompare(itemB.displayName);
            });

            
            _plugin.data.filteredValues = [];
            $.each(_plugin.settings.availableValues, function (index, item) {
                _plugin.data.filteredValues.push($.extend(true, {}, item));
            });

            _plugin.htmlElements.selectButton.attr('disabled', 'disabled').click(function () {
                _plugin.settings.onSelect(_plugin.data.selectedValue);
                $.insmCombobox('destroy');
            });
            _plugin.htmlElements.cancelButton.click(function () {
                $.insmCombobox('destroy');
            });
            _plugin.htmlElements.backdrop.click(function () {
                $.insmCombobox('destroy');
            });

            $.insmCombobox('populateList');

            $this.append(
                _plugin.htmlElements.wrapper.append(
                    _plugin.htmlElements.backdrop,
                    _plugin.htmlElements.inputContainer.append(
                        _plugin.htmlElements.selectButton,
                        _plugin.htmlElements.cancelButton,
                        _plugin.htmlElements.searchField,
                        _plugin.htmlElements.listContainer
                    )
                )
            );

            var margin = _plugin.htmlElements.listContainer.outerHeight(true) - _plugin.htmlElements.listContainer.height();
            _plugin.htmlElements.listContainer.css({
                height: parseInt(_plugin.htmlElements.inputContainer.height() - _plugin.htmlElements.searchField.outerHeight(true) - margin) + 'px'
            });

            return $this;
        },
        populateList: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmCombobox');

            _plugin.htmlElements.listContainer.empty();
            $.each(_plugin.data.filteredValues, function (index, value) {
                var listItem = $('<li />');
                _plugin.htmlElements.listContainer.append(
                    listItem.text(value.displayName).addClass('is-clickable').dblClick({
                        instant: function() {
                            _plugin.htmlElements.selectButton.removeAttr('disabled');
                            _plugin.htmlElements.listContainer.children().removeClass('is-selected');
                            listItem.addClass('is-selected');
                            _plugin.data.selectedValue = value;
                        },
                        click: function () {

                        },
                        dblClick: function() {
                            _plugin.settings.onSelect(_plugin.data.selectedValue);
                            $.insmCombobox('destroy');
                        }
                    })
                );
                
                if (_plugin.data.selectedValue && _plugin.data.selectedValue.key == value.key) {
                    listItem.addClass('is-selected');
                }
            });

            return $this;
        },
        destroy: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmCombobox');

            if (_plugin) {
                _plugin.htmlElements.wrapper.remove();
            }
            $this.data('insmCombobox', null);
            return $this;
        }
    };

    $.insmCombobox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmCombobox');
            return null;
        }
    };
})(jQuery);
