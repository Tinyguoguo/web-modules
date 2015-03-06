/*
* INSM Region Picker List
* This file contain the INSM Region Picker List plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmRegionPickerList(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPickerList');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        regions: [],
                        selectedRegion: {},
                        applicationName: 'regionPickerList',
                        onSelect: function () {
                            throw new Error('On select not implemented');
                        }
                    }, options),
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    htmlElements: {
                        controls: {
                            container: $('<div />').addClass('controls'),
                            back: $('<a />').addClass('back').text('Back'),
                            choose: $('<a />').addClass('choose').text('Choose'),
                            title: $('<h3 />')
                        },
                        content: {
                            container: $('<div />'),
                            list: $('<ul />')
                        }
                    },
                    data: {
                        position: []
                    }
                };
                $this.data('insmRegionPickerList', _plugin);
            }

            // Init html
            $this.empty().append(
                _plugin.htmlElements.controls.container.append(
                    _plugin.htmlElements.controls.back,
                    _plugin.htmlElements.controls.choose,
                    $('<div />').addClass('clear'),
                    _plugin.htmlElements.controls.title
                ),
                _plugin.htmlElements.content.container.append(
                    _plugin.htmlElements.content.list
                )
            ).addClass('regionPickerList');
            

            $this.insmRegionPickerList('renderList');

            _plugin.htmlElements.controls.choose.click(function () {
                _plugin.settings.onSelect(_plugin.settings.selectedRegion);
            });


            _plugin.htmlElements.controls.back.click(function () {
                _plugin.data.position.pop();
                $this.insmRegionPickerList('renderList');
            })

            $(window).resize(function () {
                $this.insmRegionPickerList('resize');
            });

            $this.insmRegionPickerList('resize');

            return $this;
        },
        renderList: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPickerList');

            _plugin.htmlElements.content.list.hide();

            var tmpRegionList = $.extend(true, {}, _plugin.settings.regions);

            for (var i = 0; i < _plugin.data.position.length; i++) {
                $.each(tmpRegionList, function (index, region) {
                    if (region.name == _plugin.data.position[i]) {
                        tmpRegionList = region.children;
                    }
                });
            }
            if (_plugin.data.position.length == 0) {
                _plugin.htmlElements.controls.title.hide().text('');
                _plugin.htmlElements.controls.choose.hide();
                _plugin.htmlElements.controls.back.hide();
            }
            else {
                _plugin.htmlElements.controls.title.fadeIn().text(
                    _plugin.data.position[_plugin.data.position.length-1]
                );
                _plugin.htmlElements.controls.choose.fadeIn();
                _plugin.htmlElements.controls.back.fadeIn();
            }
            _plugin.htmlElements.content.list.empty();
            if (tmpRegionList.length == 0) {
                _plugin.htmlElements.content.list.append(
                    $('<li />').addClass('info').text('No more regions in this location')
                );
            }

            $.each(tmpRegionList, function(index, region) {
                _plugin.htmlElements.content.list.append(
                    $('<li />').addClass('is-clickable').text(region.name).click(function () {
                        _plugin.settings.selectedRegion = region;
                        _plugin.data.position.push(region.name);
                        $this.insmRegionPickerList('renderList');
                    })
                );
            });

            _plugin.htmlElements.content.list.fadeIn();

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPickerList');

            if (_plugin) {
                var target = $this.insmUtilities('size');
                var controlsHeight = _plugin.htmlElements.controls.container.outerHeight(true);
                var contentMargin = _plugin.htmlElements.content.container.innerHeight() - _plugin.htmlElements.content.container.height();

                //_plugin.htmlElements.content.container.css({
                //    height: parseInt(target.height - controlsHeight - contentMargin - 4) + 'px'
                //});
            }
            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPickerList');

            if (_plugin) {
                $this.empty();
                $this.data('insmRegionPickerList', '');
            }
            return $this;
        }
    };

    $.fn.insmRegionPickerList = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRegionPickerList');
        }
    };
})(jQuery);
