var _timeOptionPlugin = {};
var contextObject_timeOptionsUI, rootUI_timeOptionsUI;
var weekdays;
TimeOptionsUIManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        mediaId: null,
        mediaType: null,
        timeOptionsData: null,
    },

    //Create this plugin
    _create: function () {
        contextObject_timeOptionsUI = this;
        rootUI_timeOptionsUI = this.element;
    },

    // Initilization of plugin
    _init: function () {
        contextObject_timeOptionsUI = this;
        rootUI_timeOptionsUI = this.element;
        this._setTimeOptionHtml();
    },
    _setTimeOptionHtml: function () {
        //html for time option
        _timeOptionPlugin.htmlElements = {
            timeOptions: {
                outerContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-container'),
                mainContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-mainContainer'),
                timeOptionContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-timeOptionContainer'),
                messageContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-messageContainer'),
                messageContent: $('<div/>').addClass('insm-playlist-manager-timeoptions-messageContent').html('The first time option that is valid is the one used during playback, from top to bottom. Use the "Move up and down" buttons to change the order of which they are chosen.'),
                addButton: $('<input type="button" value="Add new"/>').addClass('insm-playlist-manager-timeoptions-button-add'),
                moveUpButton: $('<input type="button" value="Move up"/>').addClass('insm-playlist-manager-timeoptions-button-add'),
                moveDownButton: $('<input type="button" value="Move down"/>').addClass('insm-playlist-manager-timeoptions-button-add'),
                innerContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-innerContainer'),
                noTimeOption: {
                    container: $('<div/>').addClass('insm-playlist-manager-timeoptions-noTimeOption-container'),
                    content: $('<span/>').text('Will always be played since no specific times have been selected').addClass('insm-playlist-manager-timeoptions-noTimeOption-content'),
                },
                upperContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-upperContainer'),
                upperElement1: {
                    container: $('<div/>').addClass('insm-playlist-manager-timeoptions-upperContainer-element'),
                    allHours: {
                        input: $('<br/><input type="radio" name="hour" value="all">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('All hours').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    selectedHours: {
                        input: $('<input type="radio" name="hour" value="selected">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('Selected hours').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    startEndContainer: $('<div/>'),
                    start: {
                        label: $('<span/>').text('Start:').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        spinner: {
                            container: $('<span/>'),
                            content: $('<input type="text" size="10"/>').addClass('insm-playlist-manager-timeoptions-timeSpinner startSpinner ').attr('id', 'startSpinner')
                        }
                    },
                    end: {
                        label: $('<br/><br/><span/>').text('End:').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        spinner: {
                            container: $('<span/>'),
                            content: $('<input type="text" size="10"/>').addClass('insm-playlist-manager-timeoptions-timeSpinner endSpinner').attr('id', 'endSpinner')
                        }
                    }
                },
                upperElement2: {
                    container: $('<div/>').addClass('insm-playlist-manager-timeoptions-upperContainer-element'),
                    allDates: {
                        input: $('<br/><input type="radio" name="date" value="All">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('All dates').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    selectedDates: {
                        input: $('<input type="radio" name="date" value="selected">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('Selected dates').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    startEndContainer: $('<div/>'),
                    start: {
                        label: $('<span/>').text('Start:').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        datePicker: $('<input type="text"/>'),
                        image: $('<img/>').attr('src', 'css/insm/plugins/insmTimeOptionsUI/calender.JPG').attr('id', 'startDateImg').addClass('insm-playlist-manager-timeoptions-datepicker-image '),
                        datePickerContainer: $('<div/>').attr('id', 'startDatepicker'),
                    },
                    end: {
                        label: $('<br/><br/><span/>').text('End:').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        datePicker: $('<input type="text"/>'),
                        image: $('<img/>').attr('src', 'css/insm/plugins/insmTimeOptionsUI/calender.JPG').attr('id', 'endDateImg').addClass('insm-playlist-manager-timeoptions-datepicker-image '),
                        datePickerContainer: $('<div/>').attr('id', 'endDatepicker'),
                    },
                    noEndDate: {
                        input: $('<br/><br/><input type="checkbox"/>').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/>').text('no end date').addClass('insm-playlist-manager-timeoptions-input-label'),
                    }
                },
                upperElement3: {
                    container: $('<div/>').addClass('insm-playlist-manager-timeoptions-upperContainer-element'),
                    allWeekdays: {
                        input: $('<br/><input type="radio" name="day" value="All">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('All Weekdays').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    selectedWeekdays: {
                        input: $('<input type="radio" name="day" value="selected">').addClass('insm-playlist-manager-timeoptions-input-radio'),
                        label: $('<span/><br/><br/>').text('Selected Weekdays').addClass('insm-playlist-manager-timeoptions-input-label'),
                    },
                    weekDaysContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-weekDays-container')
                },
                lowerContainer: $('<div/>').addClass('insm-playlist-manager-timeoptions-lowerContainer'),

            }
        };

        //set html
        rootUI_timeOptionsUI.append(_timeOptionPlugin.htmlElements.timeOptions.outerContainer
            .append(_timeOptionPlugin.htmlElements.timeOptions.mainContainer
                .append(_timeOptionPlugin.htmlElements.timeOptions.timeOptionContainer
                    .append(_timeOptionPlugin.htmlElements.timeOptions.addButton)
                    .append(_timeOptionPlugin.htmlElements.timeOptions.moveUpButton)
                    .append(_timeOptionPlugin.htmlElements.timeOptions.moveDownButton)
                    .append(_timeOptionPlugin.htmlElements.timeOptions.innerContainer
                        .append(_timeOptionPlugin.htmlElements.timeOptions.noTimeOption.container
                            .append(_timeOptionPlugin.htmlElements.timeOptions.noTimeOption.content))
                        .append(_timeOptionPlugin.htmlElements.timeOptions.upperContainer
                            .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.container
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.allHours.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.allHours.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.selectedHours.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.selectedHours.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.startEndContainer
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.label)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container
                                        .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content))
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.label)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container
                                        .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content))))
                            .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.container
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.allDates.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.allDates.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.selectedDates.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.selectedDates.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.startEndContainer
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.label)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.image)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.label)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.image)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input)
                                    .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.label)))
                            .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.container
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.allWeekdays.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.allWeekdays.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.selectedWeekdays.input)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.selectedWeekdays.label)
                                .append(_timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer)))
                        .append(_timeOptionPlugin.htmlElements.timeOptions.lowerContainer)))
                .append(_timeOptionPlugin.htmlElements.timeOptions.messageContainer
                    .append(_timeOptionPlugin.htmlElements.timeOptions.messageContent))));
        //set time spinner 
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.timeEntry({ spinnerImage: 'js/insm/plugins/insmTimeSpinner/spinner.JPG' });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container.clock({
            opName: "start",
            onChangeTime: function (e, data) {
                var startVal;
                var endVal;
                if (data.flag == "start") {
                    $.data(document, "currentSelectedTimeOption").startTime = data.timeVal;
                    startVal = data.timeVal;
                    $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal(startVal, $.data(document, "currentSelectedTimeOption").endTime));
                }
                else if (data.flag == "end") {
                    $.data(document, "currentSelectedTimeOption").endTime = data.timeVal;
                    endVal = data.timeVal;
                    $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal($.data(document, "currentSelectedTimeOption").startTime, endVal));
                }
            }
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.timeEntry({ spinnerImage: 'js/insm/plugins/insmTimeSpinner/spinner.JPG' });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container.clock({
            opName: "end",
            onChangeTime: function (e, data) {
                var startVal;
                var endVal;
                if (data.flag == "start") {
                    $.data(document, "currentSelectedTimeOption").startTime = data.timeVal;
                    startVal = data.timeVal;
                    $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal(startVal, $.data(document, "currentSelectedTimeOption").endTime));
                }
                else if (data.flag == "end") {
                    $.data(document, "currentSelectedTimeOption").endTime = data.timeVal;
                    endVal = data.timeVal;
                    $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal($.data(document, "currentSelectedTimeOption").startTime, endVal));
                }
            }
        });
        //set date picker
        var startDatepicker = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.dateEntry({ spinnerImage: '' });
        $(startDatepicker[0]).css('min-width', '70px').css('margin-left', '4px').css('width','70px');
        var endDatepicker = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.dateEntry({ spinnerImage: '' });
        endDatepicker.change(function () {
            var sDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val());
            var eDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val());
            if (eDate < sDate) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val());
            }
            contextObject_timeOptionsUI._isTodayWithinRange();
            contextObject_timeOptionsUI._isTodayWithinRangeForRHS()
        });

        $(endDatepicker[0]).css('min-width', '70px').css('margin-left', '4px').css('width', '70px');
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer.datepicker({
            dateFormat: 'mm/dd/yy',
            onSelect: function (date) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer.hide();
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val(date);
                $.data(document, "currentSelectedTimeOption").endDate = date;
                $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($.data(document, "currentSelectedTimeOption").startDate, date, $.data(document, "currentSelectedTimeOption").noEndDate));

                var sDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val());
                var eDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val());

                contextObject_timeOptionsUI._isTodayWithinRange();
                contextObject_timeOptionsUI._isTodayWithinRangeForRHS();
            },
        }).css('position', 'absolute').hide();

        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer.datepicker({
            dateFormat: 'mm/dd/yy',
            onSelect: function (date) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer.hide();
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val(date);
                $.data(document, "currentSelectedTimeOption").startDate = date;
                if ($.data(document, "currentSelectedTimeOption").endDate < date) {
                    $.data(document, "currentSelectedTimeOption").endDate = date;
                    _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val(date);
                }
                $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal(date, $.data(document, "currentSelectedTimeOption").endDate, $.data(document, "currentSelectedTimeOption").noEndDate));
                if (_timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.prop("checked") == true) {
                    endDatepicker.datepicker("option", "disabled", true).css('opacity', '0.5');

                } else {
                    endDatepicker.datepicker("option", "disabled", false).css('opacity', '1');
                }

                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer.datepicker("option", "minDate", date);
                //alert('Here');

                var sDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val());
                var eDate = new Date(_timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val());

                contextObject_timeOptionsUI._isTodayWithinRange();
                contextObject_timeOptionsUI._isTodayWithinRangeForRHS();
            },
        }).css('position', 'absolute').hide();

        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.image.click(function () {
            var handler = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer.show();
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer.offset({ left: handler.offset().left, top: handler.offset().top + handler.height() + 16 });

            $(document).mouseup(function (e) {
                var container = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePickerContainer;
                if ((!container.is(e.target)
                    && container.has(e.target).length === 0)) {
                    container.hide();
                }
            });
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.image.click(function () {
            endDatepicker.datepicker("option", "disabled", false).css('opacity', '1');
            var handler = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer.show();

            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer.offset({ left: handler.offset().left, top: handler.offset().top + handler.height() + 16 });
            $(document).mouseup(function (e) {
                var container = _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePickerContainer;
                if ((!container.is(e.target)
                    && container.has(e.target).length === 0)) {
                    container.hide();
                }
                if (_timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.prop("checked") == true) {
                    endDatepicker.datepicker("option", "disabled", true).css('opacity', '0.5');

                } else {
                    endDatepicker.datepicker("option", "disabled", false).css('opacity', '1');
                }
            });
        });
        //set weekdays


        weekdays = _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.weekDays({
            onSelectDays: function (e, data) {
                $.data(document, "currentSelectedTimeOption").selectedDays = data.arr;
                $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dayVal").html(contextObject_timeOptionsUI._setSelectedWeekdays(data.arr));

            }
        });
        contextObject_timeOptionsUI._renderTimeOptionLowerHtml($.data(document, "currentMediaItem")[0].timeOptionsData.timeOptions);
        //object to store values
        var timeOptions = [];
        if ($.data(document, "currentMediaItem")[0].timeOptionsData.timeOptions.length > 0) {
            $.each($.data(document, "currentMediaItem")[0].timeOptionsData.timeOptions, function (index, item) {
                timeOptions.push(item);
            });
        }

        //mute option functionality 
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.click(function () {
            if ($((_timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input)[2]).prop("checked") == true) {
                $.data(document, "currentSelectedTimeOption").noEndDate = true;
                endDatepicker.datepicker("option", "disabled", true).css('opacity', '0.5');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.image.css('opacity', '0.5');
                $('#endDateImg').hide();
            } else {
                $.data(document, "currentSelectedTimeOption").noEndDate = false;
                endDatepicker.datepicker("option", "disabled", false).css('opacity', '1');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.image.css('opacity', '1');
                $('#endDateImg').show();
            }

            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($.data(document, "currentSelectedTimeOption").startDate, $.data(document, "currentSelectedTimeOption").endDate, $.data(document, "currentSelectedTimeOption").noEndDate));

        });

        //add button click event 
        _timeOptionPlugin.htmlElements.timeOptions.addButton.click(function () {
            //create new timeOption obj to add in array
            var timeOption = {
                timeOptionId: Math.uuid(),
                showAllWeekDays: true,
                showAllDates: true,
                showAllHours: true,
                startTime: null,
                endTime: null,
                startDate: null,
                endDate: null,
                noEndDate: false,
                selectedDays: []
            };
            //volume object for movie, music file and music stream media types
            if (contextObject_timeOptionsUI.options.mediaType == Menutype.MOVIE || contextObject_timeOptionsUI.options.mediaType == Menutype.MUSICFILE || contextObject_timeOptionsUI.options.mediaType == Menutype.MUSIC_STREAM_FILE) {
                var volume = {
                    relatedID: timeOption.timeOptionId,
                    isDefaultVolume: true,
                    volume: 1,
                    isMute: false
                };
                timeOption.volume = volume;
                //Set indicator Here
                var indicatorUI = $.data(document, 'indicatorLocation');
                indicatorUI.css("display", '');
                indicatorUI.find('div').css("display", '');
                if (timeOptions.length == 0) {
                    indicatorUI.find('div').addClass('insm-playlist-manager-thumbnail-greenIndicator');
                    indicatorUI.find('span').text('');
                } else {
                    indicatorUI.find('div').addClass('insm-playlist-manager-thumbnail-greenIndicator');
                }
            }
            //add new time option object in array
            timeOptions.push(timeOption);


            //add new time option html
            contextObject_timeOptionsUI._renderTimeOptionLowerHtml(timeOptions);
        });

        //move up button click event

        _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.click(function () {
            var currIndex = $.data(document, "timeOptionsData").indexOf($.data(document, "currentSelectedTimeOption"));
            var index = $.data(document, "timeOptionsData").indexOf($.data(document, "timeOptionsData")[currIndex - 1]);
            //render data
            var tmp = $.data(document, "timeOptionsData")[currIndex];
            $.data(document, "timeOptionsData")[currIndex] = $.data(document, "timeOptionsData")[currIndex - 1];
            $.data(document, "timeOptionsData")[currIndex - 1] = tmp;
            contextObject_timeOptionsUI._renderTimeOptionLowerHtml($.data(document, "timeOptionsData"));

            //select data
            var idToSelect = $.data(document, "timeOptionsData")[index].timeOptionId;
            contextObject_timeOptionsUI._selectTimeOption(idToSelect);
        });

        //move down button click event

        _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.click(function () {
            var currIndex = $.data(document, "timeOptionsData").indexOf($.data(document, "currentSelectedTimeOption"));
            var index = $.data(document, "timeOptionsData").indexOf($.data(document, "timeOptionsData")[currIndex + 1]);
            //render data
            var tmp = $.data(document, "timeOptionsData")[currIndex];
            $.data(document, "timeOptionsData")[currIndex] = $.data(document, "timeOptionsData")[currIndex + 1];
            $.data(document, "timeOptionsData")[currIndex + 1] = tmp;
            contextObject_timeOptionsUI._renderTimeOptionLowerHtml($.data(document, "timeOptionsData"));

            //select data
            var idToSelect = $.data(document, "timeOptionsData")[index].timeOptionId;
            contextObject_timeOptionsUI._selectTimeOption(idToSelect);


        });

        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.allHours.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllHours = true;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.startEndContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html("Play all hours");
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.timeEntry('disable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.timeEntry('disable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container.clock("unBindClick");
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container.clock("unBindClick");


        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.selectedHours.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllHours = false;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.startEndContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal($.data(document, "currentSelectedTimeOption").startTime, $.data(document, "currentSelectedTimeOption").endTime));
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.timeEntry('enable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.timeEntry('enable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container.clock("bindClick");
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container.clock("bindClick");
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.bind('change paste keyup', function () {
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal($(this).val(), $.data(document, "currentSelectedTimeOption").endTime));
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.on('blur', function () {
            $.data(document, "currentSelectedTimeOption").startTime = $(this).val();
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.bind('change paste keyup', function () {
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal($.data(document, "currentSelectedTimeOption").startTime, $(this).val()));
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.on('blur', function () {
            $.data(document, "currentSelectedTimeOption").endTime = $(this).val();
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.allDates.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllDates = true;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.startEndContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html("Play all dates");
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.dateEntry('disable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.dateEntry('disable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.attr('disabled', true);
            $('.insm-playlist-manager-timeoptions-datepicker-image').hide();
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.selectedDates.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllDates = false;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.startEndContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($.data(document, "currentSelectedTimeOption").startDate, $.data(document, "currentSelectedTimeOption").endDate, $.data(document, "currentSelectedTimeOption").noEndDate));
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.dateEntry('enable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.dateEntry('enable');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.attr('disabled', false);
            $('.insm-playlist-manager-timeoptions-datepicker-image').show();

        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.bind('change paste keyup', function () {
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($(this).val(), $.data(document, "currentSelectedTimeOption").endDate, $.data(document, "currentSelectedTimeOption").noEndDate));
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.on('blur', function () {
            $.data(document, "currentSelectedTimeOption").startDate = $(this).val();
            if ($.data(document, "currentSelectedTimeOption").endDate < $(this).val()) {
                $.data(document, "currentSelectedTimeOption").endDate = $(this).val();
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val($(this).val());
            }
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($(this).val(), $.data(document, "currentSelectedTimeOption").endDate, $.data(document, "currentSelectedTimeOption").noEndDate));
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.bind('change paste keyup', function () {
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dateVal").html(contextObject_timeOptionsUI._setStartEndDateVal($.data(document, "currentSelectedTimeOption").startDate, $(this).val(), $.data(document, "currentSelectedTimeOption").noEndDate));
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.on('blur', function () {
            $.data(document, "currentSelectedTimeOption").endDate = $(this).val();
        });

        _timeOptionPlugin.htmlElements.timeOptions.upperElement3.allWeekdays.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllWeekDays = true;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dayVal").html("Play all weekdays");
            _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.weekDays("disabledWeekdays");
        });
        _timeOptionPlugin.htmlElements.timeOptions.upperElement3.selectedWeekdays.input.click(function () {
            $.data(document, "currentSelectedTimeOption").showAllWeekDays = false;
            _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
            _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.weekDays("enabledWeekdays");
            $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#dayVal").html(contextObject_timeOptionsUI._setSelectedWeekdays($.data(document, "currentSelectedTimeOption").selectedDays));

        });

        //get time option data 
        $.data(document, "timeOptionsData", timeOptions);

    },
    _renderTimeOptionLowerHtml: function (timeOptionsData) {
        var currentMediaType = contextObject_timeOptionsUI.options.mediaType;
        if (currentMediaType == Menutype.IMAGE || currentMediaType == Menutype.FLASH || currentMediaType == Menutype.WEB_PAGE || currentMediaType == Menutype.NEWS_FEED || currentMediaType == Menutype.INFORMATION || currentMediaType == Menutype.PLAYLIST) {
            _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.hide();
            _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.hide();
        } else if (currentMediaType == Menutype.MOVIE || currentMediaType == Menutype.MUSICFILE || currentMediaType == Menutype.MUSIC_STREAM_FILE) {
            _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.show();
            _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.show();
        }
        _timeOptionPlugin.htmlElements.timeOptions.messageContainer.hide();
        if (timeOptionsData.length < 1) {
            _timeOptionPlugin.htmlElements.timeOptions.innerContainer.addClass('insm-playlist-manager-timeoptions-addBorder');
            _timeOptionPlugin.htmlElements.timeOptions.upperContainer.hide();
            _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.hide();
            _timeOptionPlugin.htmlElements.timeOptions.noTimeOption.container.show();
            _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.attr('disabled', 'disabled');
            _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.attr('disabled', 'disabled');
        } else {
            _timeOptionPlugin.htmlElements.timeOptions.noTimeOption.container.hide();
            _timeOptionPlugin.htmlElements.timeOptions.innerContainer.removeClass('insm-playlist-manager-timeoptions-addBorder');
            _timeOptionPlugin.htmlElements.timeOptions.upperContainer.slideDown();
            _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.slideDown();
            if (currentMediaType == Menutype.MOVIE || currentMediaType == Menutype.MUSICFILE || currentMediaType == Menutype.MUSIC_STREAM_FILE) {
                _timeOptionPlugin.htmlElements.timeOptions.messageContainer.show();
            }
            _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.empty();
            $.each(timeOptionsData, function (index, timeOption) {
                var timeOptionHtml = '<div class="timeOptionRow" data-timeoption="y" data-guid="' + timeOption.timeOptionId + '" style="width:99%;height:7%;background-color:#fff;margin-left:3px;margin-top:3px;">' +
                       '<div style="width:100%;height:90%">' +
                       '<div style="float:left;width:33%;margin-top:10px;" id="hourVal"></div>' +
                       '<div style="float:left;width:33%;margin-top:10px;" id="dateVal"></div>' +
                       '<div style="float:left;width:25%;margin-top:10px;" id="dayVal"></div>' +
                       '<div style="float:left;width:4%;margin-top:5px;" class="volumeTimeOption" data-guid="' + timeOption.timeOptionId + '" ></div>' +
                       '<div style="float:right;width:4%" id="rmv"><img class="rmvTimeOption" data-guid="' + timeOption.timeOptionId + '"   src="css/insm/plugins/insmTimeOptionsUI/removeBtn.gif"/></div>' +
                       '</div>' +
                       '<hr/>' +
                       '</div>';
                _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.append(timeOptionHtml);
                $(".volumeTimeOption").css('display', 'none');
                if (currentMediaType == Menutype.MOVIE || currentMediaType == Menutype.MUSICFILE || currentMediaType == Menutype.MUSIC_STREAM_FILE) {
                    $(".volumeTimeOption").css('display', 'inline');
                    $('.volumeTimeOption[data-guid="' + timeOption.timeOptionId + '"]').interactiveVolumeBar(
                        {
                            GUID: timeOption.timeOptionId,
                            data: timeOption.volume,
                            onIndicatorState: function (e,data) {
                                //working for left hand side commenting
                                console.log($.data(document, "timeOptionsData"));
                                contextObject_timeOptionsUI._isTodayWithinRangeForRHS();
                            },
                            onClose: function (e, data) {
                                if (data.hasOwnProperty("relatedID")) {

                                }
                            }
                        });

                }
                contextObject_timeOptionsUI._setTimeOptionData(timeOption);
            });
            _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.each(function () {
                $(this).children().removeClass('insm-playlist-manager-timeoptions-select-div');
            });
            $('.timeOptionRow[data-guid="' + timeOptionsData[timeOptionsData.length - 1].timeOptionId + '"]').addClass('insm-playlist-manager-timeoptions-select-div');
            $.data(document, "currentSelectedTimeOption", timeOptionsData[timeOptionsData.length - 1]);
            contextObject_timeOptionsUI._setUpperTimeOptionsData(timeOptionsData[timeOptionsData.length - 1]);

            //move up move down butoon disable
            if (timeOptionsData.length > 1) {
                _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.removeAttr('disabled', 'disabled');
                _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.attr('disabled', 'disabled');
            } else if (timeOptionsData.length <= 1) {
                _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.attr('disabled', 'disabled');
                _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.attr('disabled', 'disabled');
            }
            //time oprtion row click event 
            $('.timeOptionRow').click(function (e) {
                var currentTimeOptionId = $(this).attr('data-guid');
                contextObject_timeOptionsUI._selectTimeOption(currentTimeOptionId);
            });

            //remove time option from grid
            $('.rmvTimeOption').click(function () {
                var currentTimeOptionId = $(this).attr('data-guid');
                var currentTimeOption = $.grep($.data(document, "timeOptionsData"), function (e) {
                    return e.timeOptionId == currentTimeOptionId;
                });
                var i = $.data(document, "timeOptionsData").indexOf(currentTimeOption[0]);
                $.data(document, "timeOptionsData").splice(i, 1);
                if ($.data(document, "timeOptionsData").length == 0) {
                    var indicatorUI = $.data(document, 'indicatorLocation');
                    var indicator = indicatorUI.find('div');
                    indicator.removeClass('insm-playlist-manager-thumbnail-greenIndicator');
                    indicator.css('display', 'none');

                }
                contextObject_timeOptionsUI._renderTimeOptionLowerHtml($.data(document, "timeOptionsData"));
                //Set Indicator
                contextObject_timeOptionsUI._isTodayWithinRange();
                contextObject_timeOptionsUI._isTodayWithinRangeForRHS();
            });
        }
    },

    _setTimeOptionData: function (timeOption) {
        var hourVal;
        var dateVal;
        var dayVal;

        if (timeOption.showAllHours == true) {
            hourVal = 'Play all hours';
        } else {
            var startTimeVal = timeOption.startTime;
            var endTimeVal = timeOption.endTime;
            if (startTimeVal == null)
                startTimeVal = "8:00AM";
            if (endTimeVal == null)
                endTimeVal = "5:00PM";
            hourVal = contextObject_timeOptionsUI._convertTimeFormat(startTimeVal) + '-' + contextObject_timeOptionsUI._convertTimeFormat(endTimeVal);
        }
        if (timeOption.showAllDates == true) {
            dateVal = 'Play all dates';
        } else {
            dateVal = contextObject_timeOptionsUI._setStartEndDateVal(timeOption.startDate, timeOption.endDate, timeOption.noEndDate);
        }
        if (timeOption.showAllWeekDays == true) {
            dayVal = 'Play all weekdays';
        } else {
            dayVal = contextObject_timeOptionsUI._setSelectedWeekdays(timeOption.selectedDays);
        }

        $('.timeOptionRow[data-guid="' + timeOption.timeOptionId + '"]').find("#hourVal").html(hourVal);
        $('.timeOptionRow[data-guid="' + timeOption.timeOptionId + '"]').find("#dateVal").html(dateVal);
        $('.timeOptionRow[data-guid="' + timeOption.timeOptionId + '"]').find("#dayVal").html(dayVal);

    },
    _setUpperTimeOptionsData: function (currentTimeOption) {
        if (currentTimeOption != undefined) {
            if (currentTimeOption.showAllHours == true) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.allHours.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.startEndContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.timeEntry('disable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.timeEntry('disable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container.clock("unBindClick");
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container.clock("unBindClick");

            } else {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.selectedHours.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.startEndContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.timeEntry('enable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.timeEntry('enable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.container.clock("bindClick");
                _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.container.clock("bindClick");

            }
            if (currentTimeOption.showAllDates == true) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.allDates.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.startEndContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.dateEntry('disable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.dateEntry('disable');
                $('.insm-playlist-manager-timeoptions-datepicker-image').hide();
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.attr('disabled', true);

            } else {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.selectedDates.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.startEndContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.dateEntry('enable');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.dateEntry('enable');
                $('.insm-playlist-manager-timeoptions-datepicker-image').show();
                _timeOptionPlugin.htmlElements.timeOptions.upperElement2.noEndDate.input.attr('disabled', false);
            }
            if (currentTimeOption.showAllWeekDays == true) {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.allWeekdays.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.addClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.weekDays("disabledWeekdays");
            } else {
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.selectedWeekdays.input.prop("checked", true);
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.removeClass('insm-playlist-manager-timeoptions-opacity-div');
                _timeOptionPlugin.htmlElements.timeOptions.upperElement3.weekDaysContainer.weekDays("enabledWeekdays");
            }
            var startTimeVal = currentTimeOption.startTime;
            var endTimeVal = currentTimeOption.endTime;
            var startDateVal = currentTimeOption.startDate;
            var endDateVal = currentTimeOption.endDate;
            if (startTimeVal == null)
                startTimeVal = "08:00AM";
            if (endTimeVal == null)
                endTimeVal = "05:00PM";
            if (startDateVal == null)
                startDateVal = contextObject_timeOptionsUI._getFormattedDate(new Date());
            if (endDateVal == null)
                endDateVal = contextObject_timeOptionsUI._getFormattedDate(new Date());

            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.start.spinner.content.val(startTimeVal);
            _timeOptionPlugin.htmlElements.timeOptions.upperElement1.end.spinner.content.val(endTimeVal);
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.start.datePicker.val(startDateVal);
            _timeOptionPlugin.htmlElements.timeOptions.upperElement2.end.datePicker.val(endDateVal);
            //set here clicked num of chekboxes
            weekdays.weekDays("selectWeekdays", currentTimeOption.selectedDays);

        }

    },

    _selectTimeOption: function (timeOptionId) {
        _timeOptionPlugin.htmlElements.timeOptions.lowerContainer.each(function () {
            $(this).children().removeClass('insm-playlist-manager-timeoptions-select-div');
        });
        $('.timeOptionRow[data-guid="' + timeOptionId + '"]').addClass('insm-playlist-manager-timeoptions-select-div');

        var selectedTimeOption = $.grep($.data(document, "timeOptionsData"), function (e) {
            return e.timeOptionId == timeOptionId;
        });
        $.data(document, "currentSelectedTimeOption", selectedTimeOption[0]);
        contextObject_timeOptionsUI._setUpperTimeOptionsData(selectedTimeOption[0]);


        //move up move down button disable
        if ($.data(document, "timeOptionsData").length > 1) {
            if (timeOptionId == $.data(document, "timeOptionsData")[0].timeOptionId) {
                _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.attr('disabled', 'disabled');
            } else {
                _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.removeAttr('disabled', 'disabled');
            }
            if (timeOptionId == $.data(document, "timeOptionsData")[$.data(document, "timeOptionsData").length - 1].timeOptionId) {
                _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.attr('disabled', 'disabled');
            } else {
                _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.removeAttr('disabled', 'disabled');
            }
        } else {
            _timeOptionPlugin.htmlElements.timeOptions.moveUpButton.attr('disabled', 'disabled');
            _timeOptionPlugin.htmlElements.timeOptions.moveDownButton.attr('disabled', 'disabled');
        }

    },
    _setSelectedWeekdays: function (weekDaysArray) {
        var outputStr = "";
        $.each(weekDaysArray, function (index, item) {
            if (item.length > 1) {
                outputStr += item[0].name + '-' + item[item.length - 1].name;
            } else {
                outputStr += item[0].name;
            }
            if (item == weekDaysArray[weekDaysArray.length - 1]) {
                outputStr += "";
            } else {
                outputStr += ",";
            }
        });
        return outputStr;
    },
    _setStartEndDateVal: function (startDate, endDate, noEndDate) {
        var dateVal;
        if (noEndDate == true)
            dateVal = startDate + ' - ' + '*';
        else {
            var startDateVal = startDate;
            var endDateVal = endDate;

            if (startDateVal == null)
                startDateVal = contextObject_timeOptionsUI._getFormattedDate(new Date());
            if (endDateVal == null)
                endDateVal = contextObject_timeOptionsUI._getFormattedDate(new Date());
            dateVal = startDateVal + ' - ' + endDateVal;
        }
        return dateVal;
    },
    _setStartEndHourVal: function (startTimeVal, endTimeVal) {

        if (startTimeVal == null) {
            startTimeVal = "08:00";
        } else {
            startTimeVal = contextObject_timeOptionsUI._convertTimeFormat(startTimeVal);
        }

        if (endTimeVal == null) {
            endTimeVal = "05:00";
        } else {
            endTimeVal = contextObject_timeOptionsUI._convertTimeFormat(endTimeVal);
        }

        return startTimeVal + '-' + endTimeVal;
    },
    _getFormattedDate: function (date) {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return month + '/' + day + '/' + year;
    },
    _convertTimeFormat: function (time) {
        var hrs = Number(time.match(/^(\d+)/)[1]);
        var mnts = Number(time.match(/:(\d+)/)[1]);
        var format = time.slice(-2);
        if (format == "PM" && hrs < 12) hrs = hrs + 12;
        if (format == "AM" && hrs == 12) hrs = hrs - 12;
        var hours = hrs.toString();
        var minutes = mnts.toString();
        if (hrs < 10) hours = "0" + hours;
        if (mnts < 10) minutes = "0" + minutes;

        var result = hours + ":" + minutes;
        return result;

    },
    setClockValue: function (timeVal, flag) {
        var startVal = $.data(document, "currentSelectedTimeOption").startTime;
        var endVal = $.data(document, "currentSelectedTimeOption").endTime;
        if (flag == "start") {
            startVal = timeVal;
        }
        else if (flag == "end") {
            endVal = timeVal;
        }
        $('.timeOptionRow[data-guid="' + $.data(document, "currentSelectedTimeOption").timeOptionId + '"]').find("#hourVal").html(contextObject_timeOptionsUI._setStartEndHourVal(startVal, endVal));
    },

    //Central date function i.e define weather Perticular date is withing given range for Right Hand Side
    _isTodayWithinRangeForRHS: function () {
        var result = false;
        var indicatorUI = $.data(document, 'rightHandIndicator');
        var indicator = indicatorUI;
        if (!contextObject_timeOptionsUI._isAnyVolumeSetAsCustom()) {
            indicator.removeClass('insm-playlist-manager-thumbnail-blankIndicator');
            if (contextObject_timeOptionsUI._isWithinRangeRHS()) {
                indicator.removeClass('insm-playlist-manager-thumbnail-orangeIndicator');
                indicator.addClass('insm-playlist-manager-thumbnail-greenIndicator');
                indicator.attr('title', 'A custom volume setting is set in time options.It is active now');
            } else {
                indicator.removeClass('insm-playlist-manager-thumbnail-greenIndicator');
                indicator.addClass('insm-playlist-manager-thumbnail-orangeIndicator');
                indicator.attr('title', 'A custom volume setting is set in time options.It is not active now');
            }
        } else {
            indicator.removeClass('insm-playlist-manager-thumbnail-orangeIndicator');
            indicator.removeClass('insm-playlist-manager-thumbnail-greenIndicator');
            indicator.addClass('insm-playlist-manager-thumbnail-blankIndicator');
        }
    },

    //This function is check that if any node has set custome mode
    _isAnyVolumeSetAsCustom: function () {
        var result = false;
        for (var i = 0; i < $.data(document, "timeOptionsData").length; i++) {
            result = $.data(document, "timeOptionsData")[i].volume.isDefaultVolume;
            if (!result) {
                break;
            }
        }
        return result;
    },

    //Check for if any date is within range for today
    _isWithinRangeRHS: function () {
        var result = false;
        for (var i = 0; i < $.data(document, "timeOptionsData").length; i++) {
            var item = $.data(document, "timeOptionsData")[i];
            if (!item.volume.isDefaultVolume) {
                result = contextObject_timeOptionsUI._checkTodayWithinRange(item.startDate, item.endDate);
                if (result) {
                    break;
                }
            }
        }
        return result;
    },

    _isWithinRange: function () {
        var result = false;
        for (var i = 0; i < $.data(document, "timeOptionsData").length; i++) {
            result = contextObject_timeOptionsUI._checkTodayWithinRange($.data(document, "timeOptionsData")[i].startDate, $.data(document, "timeOptionsData")[i].endDate);
            if (result) {
                break;
            }
        }
        return result;
    },

    //Central date function i.e define weather Perticular date is withing given range
    _isTodayWithinRange: function () {
        var result = false;
        for (var i = 0; i < $.data(document, "timeOptionsData").length; i++) {
            result = contextObject_timeOptionsUI._checkTodayWithinRange($.data(document, "timeOptionsData")[i].startDate, $.data(document, "timeOptionsData")[i].endDate);
            if (result) {
                break;
            }
        }
        //Set Perticular Indicator
        var indicatorUI = $.data(document, 'indicatorLocation');
        if (indicatorUI != undefined) {
            var indicator = indicatorUI.find('div');
            if (result) {
                indicator.removeClass('insm-playlist-manager-thumbnail-orangeIndicator')
                indicator.addClass('insm-playlist-manager-thumbnail-greenIndicator')
            } else {
                indicator.removeClass('insm-playlist-manager-thumbnail-greenIndicator')
                indicator.addClass('insm-playlist-manager-thumbnail-orangeIndicator')
            }
            return result;
        }
    },

    //Utility Function for date range
    _checkTodayWithinRange: function (sDate, eDate) {
        startDate = (sDate == null ? new Date() : new Date(sDate));
        endDate = (eDate == null ? new Date() : new Date(eDate));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        var from = startDate, result;
        var to = endDate;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today >= from) {
            if (today <= to) {
                result = true;
            } else {
                result = false;
            }
        } else {
            result = false;
        }
        return result;
    },


    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_timeOptionsUI.empty();
    },

};

(function ($, undefined) {
    var indicatorUI;
    $.widget("insm.timeOptionsUI", TimeOptionsUIManager);
})(jQuery);