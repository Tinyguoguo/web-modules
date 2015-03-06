/*
* INSM Pagination
* This file contain the INSM Pagination function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPagination(settings);
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
            var $this = $(this);
            var _plugin = $this.data('insmPagination');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        firstButton: $('<button />').addClass('first').click(function () {
                            if (_plugin.settings.offset > 0) {
                                _plugin.settings.offset = 0;

                                _plugin.settings.onChange({
                                    start: _plugin.settings.offset,
                                    end: _plugin.settings.offset + _plugin.settings.limit
                                });
                            }
                        }),
                        lastButton: $('<button />').addClass('last').click(function () {
                            var lastPageNumberOfRows = _plugin.settings.items % _plugin.settings.limit;
                            if (lastPageNumberOfRows == 0) {
                                lastPageNumberOfRows = _plugin.settings.limit;
                            }
                            if (_plugin.settings.offset != _plugin.settings.items - lastPageNumberOfRows) {
                                _plugin.settings.offset = _plugin.settings.items - lastPageNumberOfRows;

                                _plugin.settings.onChange({
                                    start: _plugin.settings.offset,
                                    end: _plugin.settings.offset + _plugin.settings.limit
                                });
                            }
                        }),
                        prevButton: $('<button />').addClass('previous').click(function () {
                            if(_plugin.settings.offset > 0) {
                                _plugin.settings.offset -= _plugin.settings.limit;

                                _plugin.settings.onChange({
                                    start: _plugin.settings.offset,
                                    end: _plugin.settings.offset + _plugin.settings.limit
                                });
                            }
                        }),
                        nextButton: $('<button />').addClass('next').click(function () {
                            if(_plugin.settings.offset + _plugin.settings.limit < _plugin.settings.items) {
                                _plugin.settings.offset += _plugin.settings.limit;

                                _plugin.settings.onChange({
                                    start: _plugin.settings.offset,
                                    end: _plugin.settings.offset + _plugin.settings.limit
                                });
                            }
                        }),
                        pages: $('<div />').addClass('pages')
                    },
                    settings: $.extend({
                        limit: 10,
                        offset: 0,
                        items: 0,
                        onChange: function () {

                        }
                    }, options)
                };
                $this.data('insmPagination', _plugin);
            }

            // Insert html
            $this.append(
                _plugin.htmlElements.firstButton,
                _plugin.htmlElements.prevButton,
                _plugin.htmlElements.pages,
                _plugin.htmlElements.nextButton,
                _plugin.htmlElements.lastButton
            ).addClass('insmPagination');
            
            $this.insmPagination('render');

            return $this;
        },
        render: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPagination');

            var pages = Math.ceil(_plugin.settings.items / _plugin.settings.limit);
            if (pages == 0) {
                pages = 1;
            }
            
            _plugin.htmlElements.pages.empty();
            var currentPage = Math.ceil(_plugin.settings.offset / _plugin.settings.limit) + 1;
            if (currentPage == 0) {
                currentPage = 1;
            }
            var startPage = currentPage - 2;
            var endPage = currentPage + 2;

            if (startPage < 1) {
                startPage = 1;
                endPage = 5;
            }
            if (endPage > pages) {
                endPage = pages;
                if (startPage > endPage - 4) {
                    startPage = endPage - 4;
                    if (startPage < 1) {
                        startPage = 1;
                    }
                }
            }

            for (var i = startPage; i <= endPage; i++) {
                _plugin.htmlElements.pages.append(
                    function () {
                        var pageLink = $('<a />').attr('data-page', i).text(i);
                        if (i == currentPage) {
                            pageLink.addClass('is-selected');
                        }
                        else {
                            pageLink.click(function () {
                                _plugin.settings.offset = (pageLink.attr('data-page')-1) * _plugin.settings.limit;

                                _plugin.settings.onChange({
                                    start: _plugin.settings.offset,
                                    end: _plugin.settings.offset + _plugin.settings.limit
                                });
                            });
                        }
                        return pageLink;
                    }
                );
            }

            return $this;
        },
        update: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmPagination');

            if (!_plugin) {
                throw new Error('INSM Pagination not initialized');
            }

            if (options) {
                if (parseInt(options.limit) > 0) {
                    _plugin.settings.limit = options.limit;
                }
                if (parseInt(options.offset) > 0) {
                    _plugin.settings.offset = options.offset;
                }
                if (typeof options.items !== 'undefined') {
                    _plugin.settings.items = options.items;
                }
            }

            //_plugin.settings.offset = (_plugin.settings.currentPage - 1) * _plugin.settings.limit;

            if (_plugin.settings.offset >= _plugin.settings.items) {
                _plugin.settings.offset = 0;
            }

            $this.insmPagination('render');

            return $this;
        }
    };

    $.fn.insmPagination = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPagination');
        }
    };
})(jQuery);