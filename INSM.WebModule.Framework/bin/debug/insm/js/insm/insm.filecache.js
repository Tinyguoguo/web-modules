(function ($) {
    var methods = {
        cache: function (folderId) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFileCache');
            //If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {};
                $this.data('insmFileCache', _plugin);
            }

            var def = $.Deferred();
            var not = $.insmNotification({
                text: 'Getting file information',
                type: 'load',
                duration: 0
            });

            $.insmFiles('getFilesInfo', {
                contentDirectoryId: folderId,
                type: 'getFilesInfo',
                success: function (data) {
                    not.update({
                        text: 'File information downloaded',
                        type: 'successful'
                    });
                    $.each(data.MediaFiles, function (index, file) {
                        _plugin[file.Id] = file;
                    });
                    def.resolve();
                },
                error: function (message) {
                    not.update({
                        text: message,
                        type: 'error'
                    });
                    def.reject();
                },
                denied: function () {
                    $.insmNotification({
                        text: 'Session expired, please refresh your browser',
                        type: 'error'
                    });
                    def.reject();
                }
            });
            return def;
        },
        get: function (fileId) {
            return $('html').data('insmFileCache')[fileId];
        }
    };

    $.insmFileCache = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFileCache');
        }
    };

})(jQuery);


(function ($) {
    var methods = {
        get: function (fileId) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmTemplateCache');
            if (!_plugin) {
                _plugin = {};
                $this.data('insmTemplateCache', _plugin);
            }
            if (!_plugin[fileId]) {
                throw new Error('Call to insmTemplateCache without first calling the cache method');
            } else {
                return $.extend(true, {}, _plugin[fileId]);
            }
            return def;
        },
        cache: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmTemplateCache');
            if (!_plugin) {
                _plugin = {};
                $this.data('insmTemplateCache', _plugin);
            }
            var def = $.Deferred();
            var not = $.insmNotification({
                type: 'load',
                text: 'Downloading template data (' + options.fileId + ')',
                duration: 0
            });
            $.insmFramework("files", {
                method: 'getTemplateData',
                fileId: options.fileId,
                format: 'json',
                success: function (data) {
                    not.update({
                        type: 'successful',
                        text: 'Downloaded template data.'
                    });
                    _plugin[options.fileId] = $.insmTemplateCache('parse', data, options.mediaContentDirectory);
                    def.resolveWith(this, [_plugin[options.fileId]]);
                },
                error: function (message) {
                    not.update({
                        text: message,
                        type: 'error'
                    });
                    def.rejectWith(this, [message]);
                },
                denied: function () {
                    not.update({
                        text: 'User was denied',
                        type: 'error'
                    });
                    def.rejectWith(this, ['denied']);
                }
            });
            return def;
        },
        parse: function (data, mediaContentDirectory) {
            var defaultAssetProperties = ['Orientation', 'Schedule', 'Active', 'DefaultContent', 'Duration', 'Name', 'Weight'];

            function inputStyleFromDatasetStype(object) {
                return {
                    type: object.Type,
                    currentValue: object.Value
                }
            }

            var ret = {
                properties: {},
                contentProperties: []
            }

            $.each(data.Content.Items, function (name, object) {
                ret.properties[name] = inputStyleFromDatasetStype(object);
                if ($.inArray(name.toLowerCase(), ["archive", "audio", "movie", "image", "mediafile"]) > -1) {
                    ret.properties[name].mediaContentDirectory = mediaContentDirectory;
                }
            });

            $.each(data.Template.Items, function (name, object) {
                if ($.inArray(name, defaultAssetProperties) == -1) {
                    ret.properties[name] = inputStyleFromDatasetStype(object);
                    ret.contentProperties.push(name);
                }
            });

            return ret;
        }
    };

    $.insmTemplateCache = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTemplateCache');
        }
        return null;
    };
})(jQuery);