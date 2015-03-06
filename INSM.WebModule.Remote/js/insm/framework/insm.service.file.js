/*
* INSM Service File
* This file contain the INSM Service File function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServiceFile(settings);
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
    var _guid = 0;
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 5000,
                        local: true
                    }, options),
                    objects: {
                        localRegions: {},
                        regions: {},
                        files: {}
                    },
                    subscribers: {
                        regions: {},
                        localRegions: {},
                        files: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServiceFile', _plugin);
            }

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            if (options.fileId) {
                if (!_plugin.subscribers.files[options.fileId]) {
                    _plugin.subscribers.files[options.fileId] = {};
                }

                // Register to a certain file
                if (!_plugin.subscribers.files[options.fileId][options.subscriber]) {
                    _plugin.subscribers.files[options.fileId][options.subscriber] = {
                        update: options.update,
                        remove: options.remove
                    }

                    // Send the file to the new subscriber
                    if (_plugin.objects.files[options.fileId]) {
                        options.reset();
                        options.update(_plugin.objects.files[options.fileId]);
                    }
                }
                else {
                    //throw new Error('Subscriber "' + options.subscriber + '" already registered to file with id "' + options.fileId + '"');
                }
            }   
            else if (options.regionId) {
                if (!options.directoryName) {
                    throw new Error('Directory name not provided');
                }
                if (!options.local) {
                    // Get aggregated files from root to this region
                    if (!_plugin.subscribers.regions[options.regionId]) {
                        _plugin.subscribers.regions[options.regionId] = {};
                    }

                    if (!_plugin.subscribers.regions[options.regionId][options.directoryName]) {
                        _plugin.subscribers.regions[options.regionId][options.directoryName] = {};
                    }

                    if (!_plugin.subscribers.regions[options.regionId][options.directoryName][options.subscriber]) {
                        _plugin.subscribers.regions[options.regionId][options.directoryName][options.subscriber] = {
                            update: options.update,
                            remove: options.remove
                        };

                        if (!_plugin.objects.regions[options.regionId]) {
                            _plugin.objects.regions[options.regionId] = {};
                        }
                        if (!_plugin.objects.regions[options.regionId][options.directoryName]) {
                            _plugin.objects.regions[options.regionId][options.directoryName] = {};
                        }
                        options.reset();
                        if (!$.isEmptyObject(_plugin.objects.regions[options.regionId][options.directoryName])) {
                            options.update(_plugin.objects.regions[options.regionId][options.directoryName]);
                        }
                    }
                }
                else {
                    // Get files from only this region
                    if (!_plugin.subscribers.localRegions[options.regionId]) {
                        _plugin.subscribers.localRegions[options.regionId] = {};
                    }

                    if (!_plugin.subscribers.localRegions[options.regionId][options.directoryName]) {
                        _plugin.subscribers.localRegions[options.regionId][options.directoryName] = {};
                    }

                    if (!_plugin.subscribers.localRegions[options.regionId][options.directoryName][options.subscriber]) {
                        _plugin.subscribers.localRegions[options.regionId][options.directoryName][options.subscriber] = {
                            update: options.update,
                            remove: options.remove
                        };

                        if (!_plugin.objects.localRegions[options.regionId]) {
                            _plugin.objects.localRegions[options.regionId] = {};
                        }
                        if (!_plugin.objects.localRegions[options.regionId][options.directoryName]) {
                            _plugin.objects.localRegions[options.regionId][options.directoryName] = {};
                        }
                        options.reset();
                        if (!$.isEmptyObject(_plugin.objects.localRegions[options.regionId][options.directoryName])) {
                            options.update(_plugin.objects.localRegions[options.regionId][options.directoryName]);
                        }
                    }
                }
            }
            else {
                // TODO
                // Register to a content directory
                
                throw new Error('INSM Service File missing input parameters?');
            }

            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServiceFile('update');

            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');
            
            if (options.fileId) {
                if (_plugin.subscribers.files[options.fileId]) {
                    // Unregister to a certain file
                    if (_plugin.subscribers.files[options.fileId][options.subscriber]) {
                        delete _plugin.subscribers.files[options.fileId][options.subscriber];
                        if ($.isEmptyObject(_plugin.subscribers.files[options.fileId])) {
                            delete _plugin.subscribers.files[options.fileId];
                        }
                    }
                }
            }
            else if (options.regionId) {
                if (!options.directoryName) {
                    throw new Error('Directory name not provided');
                }
                if (!options.local) {
                    if (_plugin.subscribers.regions[options.regionId]) {
                        if (_plugin.subscribers.regions[options.regionId][options.directoryName]) {
                            if (_plugin.subscribers.regions[options.regionId][options.directoryName][options.subscriber]) {

                                delete _plugin.subscribers.regions[options.regionId][options.directoryName][options.subscriber];
                                if ($.isEmptyObject(_plugin.subscribers.regions[options.regionId][options.directoryName])) {
                                    delete _plugin.subscribers.regions[options.regionId][options.directoryName]
                                    if ($.isEmptyObject(_plugin.subscribers.regions[options.regionId])) {
                                        delete _plugin.subscribers.regions[options.regionId]
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (_plugin.subscribers.localRegions[options.regionId]) {
                            if (_plugin.subscribers.localRegions[options.regionId][options.directoryName]) {
                                if (_plugin.subscribers.localRegions[options.regionId][options.directoryName][options.subscriber]) {

                                    delete _plugin.subscribers.localRegions[options.regionId][options.directoryName][options.subscriber];
                                    if ($.isEmptyObject(_plugin.subscribers.localRegions[options.regionId][options.directoryName])) {
                                        delete _plugin.subscribers.localRegions[options.regionId][options.directoryName]
                                        if ($.isEmptyObject(_plugin.subscribers.localRegions[options.regionId])) {
                                            delete _plugin.subscribers.localRegions[options.regionId]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return $this;
        },
        'delete': function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            if (_plugin.objects.files[options.fileId]) {
                $.insmFramework('deleteFile', {
                    id: options.fileId,
                    success: function () {
                        if (_plugin.subscribers.files[options.fileId]) {
                            $.each(_plugin.subscribers.files[options.fileId], function (subscriberKey, subscriber) {
                                subscriber.remove(options.fileId);
                            });
                            delete _plugin.objects.files[options.fileId];
                            options.success();
                        }
                        else {
                            throw new Error('Failed to remove file in File Service');
                        }
                    }
                });
            }


            return $this;

        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            var deferredList = [];

            if (!$.isEmptyObject(_plugin.subscribers.files)) {
                // If subscribers for files exist we should use getFile(id)
                var fileIds = [];
                $.each(_plugin.subscribers.files, function (id, subscribers) {
                    fileIds.push(id);
                });
                
                var index = 0;
 
                function fetchFile() {
                    if (fileIds[index]) {
                        deferredList.push($.insmFramework('getFile', {
                            id: fileIds[index],
                            success: function (file) {
                                $.each(file, function (property, value) {
                                    if (_plugin.subscribers.files[file.id]) {
                                        if (!_plugin.objects.files[file.id]) {
                                            _plugin.objects.files[file.id] = file;
                                            $.each(_plugin.subscribers.files[file.id], function (subscriberKey, subscriber) {
                                                subscriber.update(_plugin.objects.files[file.id]);
                                            });
                                        }
                                        else if (!_.isEqual(_plugin.objects.files[file.id][property], file[property])) {
                                            _plugin.objects.files[file.id] = file;
                                            $.each(_plugin.subscribers.files[file.id], function (subscriberKey, subscriber) {
                                                subscriber.update(_plugin.objects.files[file.id]);
                                            });
                                        }
                                    }
                                });
                                index++;
                                fetchFile();
                            }
                        }));
                    }
                    else {
                    }
                }

                fetchFile();
            }

            if (!$.isEmptyObject(_plugin.subscribers.regions)) {
                $.each(_plugin.subscribers.regions, function (regionId, directories) {
                    $.each(directories, function (directoryName, subscribers) {
                        // Fetch the files for this directory
                        deferredList.push($.insmFramework('getFiles', {
                            regionId: regionId,
                            directoryName: directoryName,
                            success: function (files) {                                
                                var filesToBeUpdated = [];
                                var filesToBeRemoved = [];
                                
                                $.each(_plugin.objects.regions[regionId][directoryName], function (id, file) {
                                    filesToBeRemoved.push(parseInt(id));
                                });
                                
                                $.each(files, function (index, file) {
                                    if (filesToBeRemoved.indexOf(file.id) >= 0) {
                                        // Do not delete this file
                                        filesToBeRemoved.splice(filesToBeRemoved.indexOf(file.id), 1);
                                    }
                                    if ($this.insmServiceFile('hasUpdate', {
                                        file: file
                                    })) {
                                        _plugin.objects.regions[regionId][directoryName][file.id] = file;
                                        _plugin.objects.files[file.id] = file;
                                        filesToBeUpdated.push(file);
                                    }
                                });

                                // Send updated files to subscribers
                                $.each(subscribers, function (name, subscriber) {
                                    if (!_plugin.subscribers.regions[regionId][directoryName][name]) {
                                        return;
                                    }
                                    var copy = [];
                                    $.each(filesToBeUpdated, function (index, file) {
                                        copy.push($.extend(true, {}, file));
                                    });
                                    subscriber.update(copy);
                                });

                                // Send removed file ids
                                $.each(filesToBeRemoved, function (index, fileId) {
                                    $.each(subscribers, function (name, subscriber) {
                                        subscriber.remove(fileId);
                                    });
                                    
                                    delete _plugin.objects.regions[regionId][directoryName][fileId];
                                    delete _plugin.objects[fileId];
                                });
                            }
                        }));
                    });
                });
            }

            if (!$.isEmptyObject(_plugin.subscribers.localRegions)) {
                $.each(_plugin.subscribers.localRegions, function (regionId, directories) {
                    $.each(directories, function (directoryName, subscribers) {

                        // Fetch the files for this directory
                        deferredList.push($.insmFramework('getLocalFiles', {
                            regionId: regionId,
                            directoryName: directoryName,
                            success: function (files) {
                                var filesToBeUpdated = [];
                                var filesToBeRemoved = [];

                                $.each(_plugin.objects.localRegions[regionId][directoryName], function (id, file) {
                                    filesToBeRemoved.push(parseInt(id));
                                });

                                $.each(files, function (index, file) {
                                    if (filesToBeRemoved.indexOf(file.id) >= 0) {
                                        // Do not delete this file
                                        filesToBeRemoved.splice(filesToBeRemoved.indexOf(file.id), 1);
                                    }
                                    var hasUpdate = false;
                                    if (typeof _plugin.objects.localRegions[regionId][directoryName][file.id] === 'undefined') {
                                        hasUpdate = true;
                                    }
                                    else {
                                        $.each(file, function (parameter, value) {
                                            if (typeof _plugin.objects.localRegions[regionId][directoryName][file.id][parameter] === 'undefined') {
                                                hasUpdate = true;
                                            }
                                            if (!_.isEqual(_plugin.objects.localRegions[regionId][directoryName][file.id][parameter], value)) {
                                                hasUpdate = true;
                                            }
                                        });
                                    }

                                    if (hasUpdate) {
                                        _plugin.objects.localRegions[regionId][directoryName][file.id] = file;
                                        _plugin.objects.files[file.id] = file;
                                        filesToBeUpdated.push(file);
                                    }
                                });

                                // Send updated files to subscribers
                                $.each(subscribers, function (name, subscriber) {
                                    if (!_plugin.subscribers.localRegions[regionId][directoryName][name]) {
                                        return;
                                    }
                                    var copy = [];
                                    $.each(filesToBeUpdated, function (index, file) {
                                        copy.push($.extend(true, {}, file));
                                    });
                                    subscriber.update(copy);
                                });

                                // Send removed file ids
                                $.each(filesToBeRemoved, function (index, fileId) {
                                    $.each(subscribers, function (name, subscriber) {
                                        subscriber.remove(fileId);
                                    });

                                    delete _plugin.objects.localRegions[regionId][directoryName][fileId];
                                    delete _plugin.objects[fileId];
                                });
                            }
                        }));
                    });
                });
            }

            $.when.apply(null, deferredList).done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers)) {
                        $this.insmServiceFile('update');
                    }
                }, _plugin.settings.updateInterval);
            });
            

            return $this;
        },
        save: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            if (typeof options.file.id === 'undefined') {
                throw new Error('File ID missing on save');
            }

            var file = $.extend(true, {}, _plugin.objects.files[options.file.id], options.file);
            
            $.insmFramework('saveFile', {
                file: file,
                success: function () {
                    options.success();
                },
                invalid: options.invalid
            });

            return $this;
        },
        hasUpdate: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            var hasUpdate = false;

            if (typeof _plugin.objects.files[options.file.id] === 'undefined') {
                hasUpdate = true;
            }
            else {
                $.each(options.file, function (parameter, value) {
                    if (typeof _plugin.objects.files[options.file.id][parameter] === 'undefined') {
                        hasUpdate = true;
                    }
                    if (!_.isEqual(_plugin.objects.files[options.file.id][parameter], value)) {
                        hasUpdate = true;
                    }
                });
            }

            return hasUpdate;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            if (_plugin) {
                $this.data('insmServiceFile', null);
            }

            return $this;
        }
    };

    $.insmServiceFile = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServiceFile');
        }
        return null;
    };

    $.fn.insmServiceFile = function (method) {
        return $.insmServiceFile.apply(this, arguments);
    };
})(jQuery);

