"use strict";
(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');

            _plugin = {
                settings: $.extend({
                    required: true,
                    type: 'MediaFile',
                    currentValue: {},
                    initObject: {},
                    mediaContentDirectory: 0,
                    onUpdate: function (newValue) { }
                }, options)
            };

            $this.data('insmInputMediaFile', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');
            var $table = $('<table/>');

            $this.insmInputMediaFile('getFileInfo').done(function (data) {
                data = fileFormat(data);
                $table.append(
                    $('<tr />').append(
                        $('<th />').text('Type'),
                        $('<td />').text(_plugin.settings.type)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Preview'),
                        $('<td />').append($this.insmInputMediaFile('getPreview'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Filename'),
                        $('<td />').text(data.filename)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Available'),
                        $('<td />').text(data.active)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Start date').insmTooltip({
                            container: $('html'),
                            text: 'Dates are inclusive and start and end at midnight (media player) time'
                        }),
                        $('<td />').text(printDate(data.startDate, 'Y-m-d'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('End date').insmTooltip({
                            container: $('html'),
                            text: 'Dates are inclusive and start and end at midnight (media player) time'
                        }),
                        $('<td />').text(printDate(data.endDate, 'Y-m-d'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Orientation'),
                        $('<td />').text(data.orientation)
                    )
                );
            }).fail(function (data) {
                $this.text(data);
            });

            $this.html($table);

            return $this;
        },
        getFileInfo: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');

            var def = $.Deferred();
            if (!_plugin.settings.currentValue) {
                def.resolveWith(this, [{}]);
                return def;
            }
            if ($.insmFileCache('get', _plugin.settings.currentValue)) {
                def.resolveWith(this, [$.insmFileCache('get', _plugin.settings.currentValue)]);
            }
            return def;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');
            var $table = $('<table />');
            var fileinfo = $('<span />').text("No " + _plugin.settings.type + " selected");
            var changebutton = $('<a class="button">Change ' + _plugin.settings.type + '</a>');
            var setMedia = function () {
                fileinfo.text('Loading file info.');
                $this.insmInputMediaFile('getFileInfo').done(function (data) {
                    data = fileFormat(data);

                    fileinfo.empty().append(
                        $('<tr />').append(
                            $('<th />').text('Preview'),
                            $('<td />').append($this.insmInputMediaFile('getPreview'))
                        ),
                        $('<tr />').append(
                            $('<th />').text('Filename'),
                            $('<td />').text(data.filename)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Available'),
                            $('<td />').text(data.active)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Start date'),
                            $('<td />').text(data.startDate)
                        ),
                        $('<tr />').append(
                            $('<th />').text('End date'),
                            $('<td />').text(data.endDate)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Orientation'),
                            $('<td />').text(data.orientation)
                        )
                    );
                }).fail(function (data) {
                    fileinfo.empty().text(data);
                });
            };

            if (_plugin.settings.currentValue) {
                setMedia();
            }

            changebutton.click(function () {
                $.insmFileBrowser({
                    framework: $.insmFramework('getDeprecatedFramework'),
                    mediaContentDirectoryId: _plugin.settings.mediaContentDirectory,
                    currentFileId: _plugin.settings.currentValue,
                    usePreview: true,
                    fileType: _plugin.settings.type,
                    onSelect: function (file) {
                        _plugin.settings.currentValue = file.Id;
                        setMedia();
                    },
                    filter: function (file) {
                        if (fileFormat(file).status == 'ok' || fileFormat(file).status == 'in future') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                });
            }).addClass('clickable');


            $table.append(
                    $('<tr />').append(
                        $('<td />').append(fileinfo),
                        $('<td />').append(changebutton)
                    )
                );
            
            $this.html($table);
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');

            return _plugin.settings.currentValue;
        },
        getThumbnail: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');
            if (!_plugin.settings.currentValue) {
                return $("<span>").html("No " + _plugin.settings.type + " selected");
            }
            var thumbnailUrl = $.insmFiles('getThumbnailUrl', {
                fileId: _plugin.settings.currentValue
            });

            return $('<img />').attr('src', thumbnailUrl);
        },
        getPreview: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');
            return $this.insmInputMediaFile('getThumbnail').insmPreviewWindow({
                fileId: _plugin.settings.currentValue
            }).addClass('clickable');
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputMediaFile');

            if (_plugin.settings.required === true && typeof $this.insmInputMediaFile("getValue") === 'undefined') {
                return false;
            } else {
                return true;
            }
        },
        destroy: function () { }
    };

    $.fn.insmInputMediaFile = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputMediaFile');
        }
    };
})(jQuery);