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
                        prevButton: $('<a />').addClass('button').text('<').click(function () {
                            if (_plugin.data.currentPage > 1) {
                                _plugin.data.currentPage--;
                                $this.insmPagination('update');
                            }
                        }),
                        nextButton: $('<a />').addClass('button').text('>').click(function () {
                            if (_plugin.data.currentPage < parseInt(_plugin.data.records / _plugin.data.limit) + 1) {
                                _plugin.data.currentPage++;
                                $this.insmPagination('update');
                            }
                        }),
                        pages: $('<div />').addClass('pages')
                    },
                    data: $.extend({
                        limit: 10,
                        offset: 0,
                        records: 0,
                        currentPage: 1,
                        onChange: function () {

                        }
                    }, options)
                };
                $this.data('insmPagination', _plugin);
            }

            // Listeners
            $this.append(
                _plugin.htmlElements.prevButton
            ).append(
                _plugin.htmlElements.pages
            ).append(
                _plugin.htmlElements.nextButton
            );

            //$this.insmPagination('update', {
            //    limit: _plugin.data.limit,
            //    offset: _plugin.data.offset,
            //    records: _plugin.data.records
            //});

            return $this;
        },
        update: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmPagination');

            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Pagination not initialized'
                });
            }

            if (options) {
                if (options.limit) {
                    _plugin.data.limit = options.limit;
                }
                if (options.offset) {
                    _plugin.data.offset = options.offset;
                }
                if (options.records) {
                    _plugin.data.records = options.records;
                }
            }

            _plugin.data.offset = (_plugin.data.currentPage - 1) * _plugin.data.limit;

            var pages = Math.ceil(_plugin.data.records / _plugin.data.limit);

            _plugin.htmlElements.pages.empty();

            for (var i = 1; i <= pages; i++) {
                _plugin.htmlElements.pages.append(
                    function () {
                        var pageLink = $('<a />').addClass('button').attr('data-page', i).text(i);
                        if (_plugin.data.currentPage == i) {
                            pageLink.addClass('selected');
                        }
                        else {
                            pageLink.click(function () {
                                _plugin.data.currentPage = pageLink.attr('data-page');
                                $this.insmPagination('update');
                            });
                        }
                        return pageLink;
                    }
                );
            }

            _plugin.data.onChange({
                start: _plugin.data.offset,
                end: _plugin.data.offset + _plugin.data.limit
            });

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