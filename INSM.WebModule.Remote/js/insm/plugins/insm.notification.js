/*
* INSM Tablesorter
* This file contain the INSM Notification function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmNotification(note);
*
* File dependencies:
* jQuery 1.6.1
* insm.notification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    // _note:
    // type
    // text
    // duration
    $.insmNotificationOld = function (_note) {
        // Global variables
        var _target = _note.target;
        var _container;
        var _notificationTypes = [
            'successful',
            'information',
            'warning',
            'error',
            'load',
            'unauthorized'
        ];
        var _notificationBackgroundFlash = {
            successful: '#9e9',
            information: '#bdf',
            warning: '#fc7',
            error: '#e67',
            load: '#bdf',
            unauthorized: '#fc7'
        };
        var _defaultValues = {
            duration: 5000
        }

        if (typeof _note.type == 'undefined') {
            _note.type = 'information';
        }

        if ($.inArray(_note.type, _notificationTypes) < 0) {
            $.error('Notification type \'' + _note.type + '\' unknown in plugin insmNotification');
        }

        if ($('#insmNotificationContainer').length == 0) {
            if ($('#insmNotificationContainerAutoCreated').length == 0) {
                _container = $('<div id="insmNotificationContainerAutoCreated" />');
                _container.appendTo('body');
            } else {
                _container = $('#insmNotificationContainerAutoCreated');
            }
        }
        else {
            _container = $('#insmNotificationContainer');
        }

        setDefault(_note);
        var noteDiv = $('<div class="notification" />');

        prepare(noteDiv);
        handleNotificationContainer();
        var handle = {
            update: function update(_noteUpdate) {
                // Set default values on _note
                setDefault(_noteUpdate);
                handleNotificationContainer();
                if ($.inArray(_noteUpdate.type, _notificationTypes) < 0) {
                    $.error('Notification type \'' + _noteUpdate.type + '\' unknown in plugin insmNotification');
                    _noteUpdate.type = _note.type;
                }

                noteDiv.stop(true)
                    .text(_noteUpdate.text)
                    .removeClass(_note.type)
                    .addClass(_noteUpdate.type)
                    .css({
                        backgroundColor: _notificationBackgroundFlash[_noteUpdate.type]
                    })
                    .animate({
                        opacity: 1
                    }, 200)
                    .animate({
                        backgroundColor: '#fff'
                    }, 2000);

                // Update _note to _noteUpdate if we're changing again
                _note = _noteUpdate;
                if (_noteUpdate.duration < 0) {
                    noteDiv.remove();

                } else if (_noteUpdate.duration > 0) {
                    noteDiv.delay(_noteUpdate.duration - 2000)
                        .animate({
                            height: '0px',
                            padding: '0px',
                            margin: '0px'
                        }, function () {
                            $(this).remove();
                            handleNotificationContainer();
                        });
                }
            }
        }

        return handle;

        function prepare(noteDiv) {
            // Set width if requested
            setWidth(noteDiv);

            // Show note
            showNote(noteDiv);

            if (_note.duration > 0) {
                noteDiv.delay(_note.duration - 2000)
                    .animate({
                        height: '0px',
                        padding: '0px',
                        margin: '0px'
                    }, function () {
                        $(this).remove();
                        handleNotificationContainer();
                    });
            }

            return;
        }

        function setDefault(note) {
            if (typeof note.duration != 'number') {
                note.duration = _defaultValues.duration;
            }
        }

        function setWidth(note) {
            if (typeof _note.width == 'number') {
                note.css({
                    width: _note.width + 'px'
                });
            }
            else if (typeof _note.width == 'string') {
                note.css({
                    width: _note.width
                });
            }
        }

        function showNote(note) {
            note.append(
                    $('<span/>').text(_note.text)
                )
                .addClass(_note.type)
                .css({
                    backgroundColor: _notificationBackgroundFlash[_note.type]
                })
                .animate({
                    opacity: 1
                }, 200)
                .animate({
                    backgroundColor: '#fff'
                }, 2000)
                .prependTo(_container);
        }

        function handleNotificationContainer() {
            if ($('#insmNotificationContainerAutoCreated').length != 0 && $('#insmNotificationContainer').length != 0) {
                $($('#insmNotificationContainerAutoCreated').children()).appendTo('#insmNotificationContainer');
                $('#insmNotificationContainerAutoCreated').remove();
                _container = $('#insmNotificationContainer');
            }
        }
    };
})(jQuery);