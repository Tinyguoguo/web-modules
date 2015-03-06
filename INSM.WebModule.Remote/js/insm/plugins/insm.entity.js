/*
* INSM Entity Viewer
* This file contain the INSM Entity Viewer function.
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmEntityViewer(item, viewSettings, frameworkSettings);
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
    $.fn.insmEntityViewer = function (item, callback, settings) {

        var _target = $(this);
        var _framework = false;
        var _currentItem = item;
        var deferred = new $.Deferred();
        if (typeof settings == 'object') {
            if (typeof insmManifest == 'object') {
                settings.app = 'Entity Viewer ' + (insmManifest.version ? insmManifest.version : 'Unknown');
                settings.version = (insmManifest.version ? insmManifest.version : 'Unknown');
            }
            else {
                 //Manifest not set properly
            }
            
            $.insmFramework({
                ams: settings.ams,
                app: settings.app,
                version: settings.version,
                protocol: (settings.ssl ? 'https' : 'http'),
                links: settings.links,
                session: settings.session
            });

            $.insmFramework('initialized').done(function () {
                _framework = $.insmFramework('getDeprecatedFramework');
                deferred.resolve();
            });
        }

        deferred.done(function () {
            _target.html('\
            <h2>Entity</h2>\
            <div class="entity"></div>');

            // Allow navigation if framework is enabled
            if (_framework) {
                _target.prepend('\
                <div class="navigation">\
                    <a class="float_left insm-button prev disabled">< Newer</a>\
                    <a class="float_right insm-button next disabled">Older ></a>\
                    <div class="pages align_center"><a class="download">Download entity changelog</a></div>\
                </div>');

                _target.find('.navigation .pages .download').click(function () {
                    downloadHistory();
                });
            }

            if (typeof item == 'object') {
                if (typeof item.Entity == 'object') {
                     //Populate the .entity div
                    _target.find('h2').html(item.Entity.Type);
                    _target.children('.entity').html(printEntity(item));
                }
                else {
                     //Should contain id and type
                    _framework.versionHistory({
                        id: item.id,
                        entitytype: item.type,
                        success: function (itemres) {
                            _currentItem = itemres[0];
                            _target.find('h2').html(itemres[0].Entity.Type);
                            _target.children('.entity').html(printEntity(itemres[0]));
                            printHistoryEntries(itemres);
                            if (typeof callback == 'function') {
                                callback()
                            }
                        },
                        error: function (message) {
                            _framework.notification({
                                type: 'failed',
                                text: message
                            });
                        }
                    });
                }
            }

            $(document).unbind('keypress.entityNavigation');
            $(document).bind('keypress.entityNavigation', function (e) {
                if (e.keyCode == 37) {
                    _target.find('.navigation .prev').trigger('click');
                    return false;
                }
                else if (e.keyCode == 39) {
                    _target.find('.navigation .next').trigger('click');
                    return false;
                }
            });

             //Make all links with .entityLink clickable and open that entity in _target
            $('a.entityLink').live('click', function () {
                _target.insmEntityViewer({
                    id: $(this).attr('data-id'),
                    type: $(this).attr('data-type')
                }, callback, settings);
            });
        });

        function updatePagination() {
            var pageNumber = _target.find('.entity table.entity:visible').index();

            _target.find('.navigation .pages a').removeClass('selected').eq(pageNumber).addClass('selected');

            if (_target.find('.entity table.entity:visible').is(':first-child')) {
                _target.find('.navigation .prev').addClass('disabled');
            }
            else {
                _target.find('.navigation .prev').removeClass('disabled');
            }

            if (_target.find('.entity table.entity:visible').is(':last-child')) {
                _target.find('.navigation .next').addClass('disabled');
            }
            else {
                _target.find('.navigation .next').removeClass('disabled');
            }
        }

        function downloadHistory() {
            var entity = _currentItem.Entity;
            return _framework.versionHistory({
                id: entity.Id,
                entitytype: entity.Type,
                success: function (entries) {
                    printHistoryEntries(entries);
                },
                error: function (message) {
                    _framework.notification({
                        type: 'failed',
                        text: message
                    });
                }
            });
        }

        function printHistoryEntries(entries) {
            var i = 1;
            _target.find('.navigation .pages .download').remove();
            _target.children('.entity').html('');

            var selectedVersionId;

            _target.find('.navigation .pages').empty();
            $.each(entries, function () {
                _target.find('.navigation .pages').append('<a data-page="' + i++ + '">|</a>');
                _target.children('.entity').append(printEntity(this));

                if (_currentItem.Entity.VersionId == this.Entity.VersionId) {
                    selectedVersionId = _currentItem.Entity.VersionId;
                    _target.find('.navigation .pages a:last').addClass('selected');
                }
            });

            $.each(_target.find('.entity table.entity'), function () {
                if ($(this).attr('data-id') == selectedVersionId) {
                    $(this).show();
                }
                else {
                    $(this).hide();
                }
            });

            updatePagination();

            // When hovering on a certain page number
            _target.find('.navigation .pages a').hover(function () {
                _target.find('.entity table.entity').hide().eq($(this).attr('data-page') - 1).show();

                updatePagination();
            });


            _target.find('.navigation .prev').unbind('click').click(function () {
                if (!_target.find('.entity table.entity:visible').is(':first-child')) {
                    _target.find('.entity table.entity:visible').hide().prev().show();

                    updatePagination();
                }
            });

            _target.find('.navigation .next').unbind('click').click(function (e) {
                if (!_target.find('.entity table.entity:visible').is(':last-child')) {
                    _target.find('.entity table.entity:visible').hide().next().show();

                    updatePagination();
                }
            });
        }

        function printEntity(item) {
            var keys = {};
            keys.Id = item.Entity.Id;
            keys.Version = item.Entity.VersionId + ' [#' + item.Entity.Version + ']';
            keys.Action = item.Entity.Action;
            keys.Modified = new Date(item.Entity.ModificationDate).toString();
            keys['Modified by'] = item.Entity.Modifier;

            switch (item.Entity.Type) {
                case 'DataSet':
                    keys.Name = item.Entity.Name;
                    keys.Description = item.Entity.Description;
                    keys.Items = formatDatasetItems(item.Entity.Items);
                    break;
                case 'Playlist':
                    keys.Name = item.Entity.Name;
                    keys.Items = formatPlaylistItems(item.Entity.Items);
                    keys['Content Directory'] = '<a class="entityLink" data-id="' + item.References.ContentDirectory + '" data-type="ContentDirectory">' + item.References.ContentDirectory + '</a>';
                    break;
                case 'MediaFile':
                    keys.Name = item.Entity.Name;
                    keys.Filename = item.Entity.Filename;
                    keys['Original Filename'] = item.Entity.OriginalFilename;
                    keys.Checksum = item.Entity.Checksum;
                    keys['Size (bytes)'] = item.Entity.Length;
                    if (typeof item.References != 'undefined' && typeof item.References.ContentDirectory != 'undefined') {
                        keys['Content Directory'] = '<a class="entityLink" data-id="' + item.References.ContentDirectory + '" data-type="ContentDirectory">' + item.References.ContentDirectory + '</a>';
                    }
                    break;
                case 'ContentDirectory':
                    keys.Name = item.Entity.Name;
                    if (typeof item.References != 'undefined') {
                        if (typeof item.References.ContentDirectory != 'undefined') {
                            keys.Parent = '<a class="entityLink" data-id="' + item.References.ContentDirectory + '" data-type="ContentDirectory">' + item.References.ContentDirectory + '</a>';
                        }
                        if (typeof item.References.Region != 'undefined') {
                            keys.Region = '<a class="entityLink" data-id="' + item.References.Region + '" data-type="Region">' + item.References.Region + '</a>';
                        }
                    }
                    break;
                case 'Region':
                    keys.Name = item.Entity.Name;
                    keys.Description = (item.Entity.Description ? item.Entity.Description : '');
                    keys.OpeningHours = formatOpeningHours(item.Entity.OpeningHours);
                    if (typeof item.References != 'undefined' && typeof item.References.Region != 'undefined') {
                        keys['Parent Id'] = '<a class="entityLink" data-id="' + item.References.Region + '" data-type="Region">' + item.References.Region + '</a>';
                    }
                    break;
                case 'Site':
                    keys.Name = item.Entity.Name;
                    keys.UPId = item.Entity.UPId;
                    keys.Description = (item.Entity.Description ? item.Entity.Description : '');
                    keys.Channels = formatChannels(item.Entity.Channels);
                    keys.Settings = (item.Entity.Settings ? item.Entity.Settings : '');
                    if (typeof item.References != 'undefined' && typeof item.References.Region != 'undefined') {
                        keys['Region Id'] = '<a class="entityLink" data-id="' + item.References.Region + '" data-type="Region">' + item.References.Region + '</a>';
                    }
                    break;
                case 'Channel':
                    keys.Name = item.Entity.Name;
                    keys.Description = item.Entity.Description;
                    keys.Resolution = formatResolution(item.Entity.Resolution);
                    keys['Layout Id'] = '<a class="entityLink" data-id="' + item.Entity.LayoutId + '" data-type="Layout">' + item.Entity.LayoutId + '</a>';
                    break;
                case 'Layout':
                    keys.Name = item.Entity.Name;
                    keys.Description = (item.Entity.Description ? item.Entity.Description : '');
                    keys.Views = formatLayoutViews(item.Entity.Views);
                    break;
                case 'Recurrence':
                    keys.Pattern = formatRecurrencePattern(item.Entity.Pattern);
                    // TODO Uncomment when formatRecurrenceExceptions is implemented
                    // keys.Exceptions = formatRecurrenceExceptions(item.Entity.ExceptDates);
                    break;
                case 'ScheduleItem':
                    keys['Starts on'] = new Date(item.Entity.StartTime).toLocaleString();
                    keys['Ends by'] = new Date(item.Entity.EndTime).toLocaleString();
                    keys['Is Overriding'] = item.Entity.IsOverriding;
                    keys['Is Recurring'] = item.Entity.IsRecurring;
                    keys['Playlist Id'] = '<a class="entityLink" data-id="' + item.Entity.PlaylistId + '" data-type="Playlist">' + item.Entity.PlaylistId + '</a>';
                    if (typeof item.References != 'undefined') {
                        if (typeof item.References.Region != 'undefined') {
                            keys['Region Id'] = '<a class="entityLink" data-id="' + item.References.Region + '" data-type="Region">' + item.References.Region + '</a>';
                        }
                        if (typeof item.References.Channel != 'undefined') {
                            keys['Channel Id'] = '<a class="entityLink" data-id="' + item.References.Channel + '" data-type="Channel">' + item.References.Channel + '</a>';
                        }
                    }
                    break;
            }

            var output = '<table class="entity" data-id="' + item.Entity.VersionId + '">';

            $.each(keys, function (key, value) {
                output += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
            });
            output += '</table>';

            return output;
        }

        function formatPlaylistItems(items) {
            var output = '';
            $.each(items, function () {
                output += '<table>';
                output += '<tr><th>' + this.Nr + '</th><th>Layout Id</th><td>' + (typeof this.LayoutId != 'undefined' ? '<a class="entityLink" data-id="' + this.LayoutId + '" data-type="Layout">' + this.LayoutId + '</a>' : 'Not set') + '</td></tr>';
                output += '<tr><th></th><th>Parameter Id</th><td><a class="entityLink" data-id="' + this.ParameterDataSetId + '" data-type="DataSet">' + this.ParameterDataSetId + '</a></td></tr>';

                if (this.SubItems.length > 0) {
                    output += '<tr><th></th><th>Subitems</th><td>';
                    output += '<table>';
                    $.each(this.SubItems, function () {
                        var viewNrPrinted = false;
                        if (typeof this.FileId != 'undefined') {
                            output += '<tr><th>' + this.ViewNr + '</th><th>File Id</th><td><a class="entityLink" data-id="' + this.FileId + '" data-type="MediaFile">' + this.FileId + '</a></td></tr>';
                            viewNrPrinted = true
                        }
                        if (typeof this.ParameterDataSetId != 'undefined') {
                            output += '<tr><th>' + (!viewNrPrinted ? this.ViewNr : '') + '</th><th>Parameter Id</th><td><a class="entityLink" data-id="' + this.ParameterDataSetId + '" data-type="DataSet">' + this.ParameterDataSetId + '</a></td></tr>';
                            viewNrPrinted = true
                        }
                        if (typeof this.DataSetId != 'undefined') {
                            output += '<tr><th>' + (!viewNrPrinted ? this.ViewNr : '') + '</th><th>Dataset Id</th><td><a class="entityLink" data-id="' + this.DataSetId + '" data-type="DataSet">' + this.DataSetId + '</a></td></tr>';
                            viewNrPrinted = true
                        }
                    });
                    output += '</table>';
                    output += '</td></tr>';
                }

                output += '</table>';
            });
            return output;
        }

        function formatLayoutViews(views) {
            var output = '';
            $.each(views, function (index, view) {
                output += '<table>';
                output += '<tr><th>' + index + '</th><th>Resolution</th><td>' + formatResolution(view.Resolution) + '</td></tr>';
                output += '<tr><th></th><th>Position</th><td>' + view.X + 'x' + view.Y + '</td></tr>';
                output += '<tr><th></th><th>Positioning</th><td>' + view.Positioning + '</td></tr>';
                switch (view.Positioning) {
                    case 'Table':
                        output += '<tr><th></th><th>Column</th><td>' + view.Column + '</td></tr>';
                        output += '<tr><th></th><th>Row</th><td>' + view.Row + '</td></tr>';
                        break;
                    case 'Absolute':
                        output += '<tr><th></th><th>Z-index</th><td>' + view.ZIndex + '</td></tr>';
                        break;
                }
                output += '</table>';
            });

            return output;
        }

        function formatResolution(resolution) {
            return resolution.Width + 'x' + resolution.Height;
        }

        function formatOpeningHours(openingHours) {
            var output = '';
            output += '<table>';
            output += '<tr><th>Monday</th><td>' + openingHours.Monday.Start + ' - ' + openingHours.Monday.End + '</td></tr>';
            output += '<tr><th>Tuesday</th><td>' + openingHours.Tuesday.Start + ' - ' + openingHours.Tuesday.End + '</td></tr>';
            output += '<tr><th>Wednesday</th><td>' + openingHours.Wednesday.Start + ' - ' + openingHours.Wednesday.End + '</td></tr>';
            output += '<tr><th>Thursday</th><td>' + openingHours.Thursday.Start + ' - ' + openingHours.Thursday.End + '</td></tr>';
            output += '<tr><th>Friday</th><td>' + openingHours.Friday.Start + ' - ' + openingHours.Friday.End + '</td></tr>';
            output += '<tr><th>Saturday</th><td>' + openingHours.Saturday.Start + ' - ' + openingHours.Saturday.End + '</td></tr>';
            output += '<tr><th>Sunday</th><td>' + openingHours.Sunday.Start + ' - ' + openingHours.Sunday.End + '</td></tr>';
            output += '</table>';
            return output;
        }

        function formatDatasetItems(items) {
            var output = '';
            output += '<table>';
            $.each(items, function (index, item) {
                output += '<tr><th>' + index + '</th><th>Type</th><td>' + item.Type + '</td></tr>';
                switch (item.Type) {
                    case 'DataSet':
                        output += '<tr><th></th><th>Dataset Id</th><td><a class="entityLink" data-id="' + item.DataSetId + '" data-type="DataSet">' + item.DataSetId + '</a></td></tr>';
                        break;
                    case 'Archive':
                    case 'Audio':
                    case 'Clip':
                    case 'Image':
                    case 'MediaFile':
                    case 'Movie':
                        if (typeof item.FileId != 'undefined') {
                            output += '<tr><th></th><th>File Id</th><td><a class="entityLink" data-id="' + item.FileId + '" data-type="MediaFile">' + item.FileId + '</a></td></tr>';
                        }
                        output += '<tr><th></th><th>Name</th><td>' + item.Name + '</td></tr>';
                        output += '<tr><th></th><th>Value</th><td>' + item.Value + '</td></tr>';
                        break;
                    case 'Url':
                        output += '<tr><th></th><th>Link</th><td><a href="' + item.Value + '">' + item.Name + '</a></td></tr>';
                        break;
                    default:
                        output += '<tr><th></th><th>Name</th><td>' + item.Name + '</td></tr>';
                        output += '<tr><th></th><th>Value</th><td>' + item.Value + '</td></tr>';
                }
            });
            output += '</table>';
            return output;
        }

        function formatChannels(channels) {
            output = '';
            output += '<table>';
            $.each(channels, function (index, channel) {
                output += '<tr><th>' + index + '</th><td><a class="entityLink" data-id="' + channel.ChannelId + '" data-type="Channel">' + channel.ChannelId + '</a></td></tr>';
            });
            output += '</table>';
            return output;
        }

        function formatRecurrencePattern(pattern) {
            output = '';
            output += '<table>';
            output += '<tr><th>Starts on</th><td>' + new Date(pattern.StartsOn).toLocaleString() + '</td></tr>';
            output += '<tr><th>Ends by</th><td>' + new Date(pattern.EndsBy).toLocaleString() + '</td></tr>';
            output += '<tr><th>Frequency</th><td>' + pattern.Frequency + '</td></tr>';
            output += '<tr><th>Days in week</th><td>';
            $.each(pattern.DaysInWeek, function (index, day) {
                output += day + '<br />';
            });
            output += '</table>';
            return output;
        }

        function formatRecurrenceExceptions(exceptions) {
            // To be implemented when exceptions are fetched correctly in the platform
            output = '';
            return output;
        }
        return _target;
    };
})(jQuery);
