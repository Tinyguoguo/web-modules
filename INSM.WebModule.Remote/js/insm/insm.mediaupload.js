/*
* INSM Media Upload
* This file contain the INSM Media Upload function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmMediaUpload(settings);
* 'identifier' must be an input[type=file]
*
* File dependencies:
* jQuery 1.6.1
* GetUrlParam 2.1
* insm.framework
* insm.utilities
* insm.tooltip
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            return this.each(function () {
                // Global vars
                var $this = $(this);
                var _plugin = $this.data('insmMediaUpload');

                // If the plugin hasn't been initialized yet
                if (!_plugin) {
                    _plugin = {
                        data: {
                            regionId: 0,
                            contentDirectoryName: 'Files',
                            contentDirectoryId: 0,
                            active: false,
                            content: null
                        },
                        callbacks: {
                            onUpload: function () {

                            },
                            onUploadError: function (message) {
                                $.insmNotification({
                                    type: 'error',
                                    text: message
                                });
                            }
                        },
                        settings: {

                        }
                    };
                    $this.data('insmMediaUpload', _plugin);
                }

                if (typeof options.framework == 'object') {
                    _plugin.framework = options.framework;
                }
                else {
                    // Validate params
                    if (options.ams == "") {
                        $this.load('html/readme.html');
                        return $this;
                    }

                    if (options.ams) {
                        _plugin.framework = new insmFramework({
                            ams: options.ams,
                            app: 'Media Upload' + (manifest.version ? manifest.version : 'Unknown'),
                            version: (manifest.version ? manifest.version : 'Unknown'),
                            session: options.session
                        });
                    }
                    else {
                        $.insmNotification({
                            type: 'error',
                            text: 'No API peer specified'
                        });
                        return $this;
                    }
                }

                if (typeof options.regionId != 'undefined') {
                    _plugin.data.regionId = options.regionId;
                }
                if (typeof options.contentDirectoryId != 'undefined') {
                    _plugin.data.contentDirectoryId = options.contentDirectoryId;
                }
                if (typeof options.active != 'undefined') {
                    _plugin.data.active = options.active;
                }

                // Callbacks
                if (typeof options.callbacks == 'object') {
                    if (typeof options.callbacks.onUpload != 'undefined') {
                        _plugin.callbacks.onUpload = options.callbacks.onUpload;
                    }
                }

                //                if (!$this.is(':input[type="file"]')) {
                //                    $.insmNotification({
                //                        type: 'error',
                //                        text: 'Invalid HTML element. Must be an input with type "file".'
                //                    });
                //                    return $this;
                //                }

                initialize();

                return $this;

                function initialize() {
                    var deferred = new $.Deferred();

                    initListeners();

                    deferred.resolve();

                    return deferred;
                }

                function initListeners() {
                    var popupwindow = $this;

                    $this.click(function () {
                        _plugin.data.content = $('<div />').css({ 'padding': '20px', backgroundColor: '#fff' }).append(
                            $('<h2 />').text('Upload file: ')
                        ).append(
                            $('<input type="file" />').css({ border: '1px solid black', fontSize: '11px', padding: '6px', margin: '3px' }).change(function () {
                                popupwindow.insmPopup('update', {
                                    backdropClickClose: false,
                                    showCloseButton: false
                                });
                                if (_plugin.data.contentDirectoryId > 0) {
                                    var inputField = $(this);

                                    var progressBar = $('<div />').css('min-width', '300px').insmProgressBar();
                                    inputField.after(progressBar);
                                   // var parent = inputField.parent();
                                    var iframe = $('<iframe name="insm-mediaupload-iframe" id="insm-mediaupload-iframe" style="display: block"></iframe>').css({
                                        display: 'none'
                                    }).appendTo('body').append(
                                        $('<html />').append(
                                            $('<head />').append('<meta http-equiv="X-UA-Compatible" content="IE=9">')
                                        )
                                    );

                                    var form = $(document.createElement('form')).css({
                                        display: 'none'
                                    }).appendTo('body').append(inputField.attr('name', 'inputfile'));

                                    var trackingId = new Date().getTime();
                                    form.attr("action", _plugin.framework.settings.protocol + '://' + _plugin.framework.settings.ams + '/Files.aspx?format=json&trackingid=' + trackingId + '&filename=' + fileFromPath(inputField.val()) + '&contentDirectoryId=' + _plugin.data.contentDirectoryId + '&method=uploadfile&active=' + _plugin.data.active + '&session=' + _plugin.framework.settings.session);
                                    form.attr("method", "POST");
                                    form.attr("enctype", "multipart/form-data");
                                    form.attr("encoding", "application/x-www-form-urlencoded");
                                    form.attr("target", "insm-mediaupload-iframe");
                                    form.submit();


                                    function updateProgress() {
                                        var url = _plugin.framework.settings.protocol + '://' + _plugin.framework.settings.ams + '/Track.aspx?format=json&trackingid=' + trackingId + '&session=' + _plugin.framework.settings.session;
                                        $.ajax({
                                            url: url,
                                            dataType: 'jsonp',
                                            error: function (message) {
                                                $.insmNotification({
                                                    type: 'error',
                                                    text: message
                                                });
                                            },
                                            success: function (data) {
                                                if (data.Status == 'OK') {
                                                    if (data.Result) {
                                                        switch (data.Result.Status) {
                                                            case 'InProgress':
                                                                progressBar.insmProgressBar('update', {
                                                                    text: data.Result.ProgressMessage,
                                                                    progress: data.Result.Progress,
                                                                    animationDuration: 1000
                                                                });
                                                                setTimeout(function() {
                                                                    updateProgress();
                                                                }, 1000);
                                                                break;
                                                            case 'NotStarted':
                                                                //progressBar.addClass('progressbar indeterminate').text('Uploading');
                                                                progressBar.insmProgressBar('update', {
                                                                    text: 'Uploading'
                                                                });
                                                                setTimeout(function () {
                                                                    updateProgress();
                                                                }, 2000);
                                                                break;
                                                            case 'OK':
                                                                iframe.remove();
                                                                form.remove();
                                                                inputField.val('');
                                                                popupwindow.insmPopup('close');
                                                                if (typeof _plugin.callbacks.onUpload == 'function') {
                                                                    _plugin.callbacks.onUpload();
                                                                }
                                                                break;
                                                            default:
                                                                iframe.remove();
                                                                form.remove();
                                                                inputField.val('');
                                                                popupwindow.insmPopup('close');
                                                                if (typeof _plugin.callbacks.onUploadError == 'function') {
                                                                    _plugin.callbacks.onUploadError(data.Result.Result.Message);
                                                                }
                                                                break;
                                                        }
                                                    }
                                                }
                                                else if (data.Status == 'Error') {

                                                    setTimeout(function () {
                                                        updateProgress();
                                                    }, 5000);

                                                    return;
                                                }
                                            }
                                        });
                                    }

                                    updateProgress();
                                }
                                else {
                                    $.insmNotification({
                                        type: 'error',
                                        text: 'No content directory'
                                    });
                                    $(this).val('');
                                    $this.insmPopup('close');
                                }

                                return false;
                            })
                        );

                        popupwindow.insmPopup(
                            {
                                content: _plugin.data.content,
                                backdropClickClose: true,
                                showCloseButton: true,
                                autoOpen: false
                            }
                        );
                        popupwindow.insmPopup('open');
                    });
                    // Open up popup
                    return;
                }

                function fileFromPath(file) {
                    return file.replace(/.*(\/|\\)/, "");
                }
            });
        }
    };

    $.fn.insmMediaUpload = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmMediaUpload');
            return null;
        }
    };
})(jQuery);
