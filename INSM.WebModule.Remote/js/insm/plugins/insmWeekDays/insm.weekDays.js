var weekDays = {
    version: "0.0.1",

    options: {
        onSelectDays: null
    },


    _init: function () {
        contextObject_weekDays = this;
        rootUI_weekDays = this.element;
        this._setWeekDaysHtml();
    },
    _setWeekDaysHtml: function () {
        var _plugin = {};

        _plugin.htmlElements = {
            weekDays: {
                mainContainer: $('<div/>').addClass('insm-playlist-manager-weekDays-mainDiv'),
                col1: {
                    container: $('<div/>').addClass('insm-playlist-manager-weekDays-subDiv'),
                    mon: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '1').attr('id', 'mon'),
                        label: $('<span/><br/>').text('Mon').addClass('insm-playlist-manager-weekDays-input-label')
                    },
                    thu: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '4').attr('id', 'thu'),
                        label: $('<span/><br/>').text('Thu').addClass('insm-playlist-manager-weekDays-input-label')
                    },
                    sun: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '7').attr('id', 'sun'),
                        label: $('<span/><br/>').text('Sun').addClass('insm-playlist-manager-weekDays-input-label')
                    }
                },
                col2: {
                    container: $('<div/>').addClass('insm-playlist-manager-weekDays-subDiv'),
                    tue: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '2').attr('id', 'tue'),
                        label: $('<span/><br/>').text('Tue').addClass('insm-playlist-manager-weekDays-input-label')
                    },
                    fri: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '5').attr('id', 'fri'),
                        label: $('<span/><br/>').text('Fri').addClass('insm-playlist-manager-weekDays-input-label')
                    }
                },
                col3: {
                    container: $('<div/>').addClass('insm-playlist-manager-weekDays-subDiv'),
                    wed: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '3').attr('id', 'wed'),
                        label: $('<span/><br/>').text('Wed').addClass('insm-playlist-manager-weekDays-input-label')
                    },
                    sat: {
                        input: $('<input type="checkbox"/>').attr('data-type', 'chk').attr('data-id', '6').attr('id', 'sat'),
                        label: $('<span/><br/>').text('Sat').addClass('insm-playlist-manager-weekDays-input-label')
                    }
                }
            }
        };
        rootUI_weekDays.append(_plugin.htmlElements.weekDays.mainContainer
                .append(_plugin.htmlElements.weekDays.col1.container
                .append(_plugin.htmlElements.weekDays.col1.mon.input)
                .append(_plugin.htmlElements.weekDays.col1.mon.label)
                .append(_plugin.htmlElements.weekDays.col1.thu.input)
                .append(_plugin.htmlElements.weekDays.col1.thu.label)
                .append(_plugin.htmlElements.weekDays.col1.sun.input)
                .append(_plugin.htmlElements.weekDays.col1.sun.label))
                .append(_plugin.htmlElements.weekDays.col2.container
                .append(_plugin.htmlElements.weekDays.col2.tue.input)
                .append(_plugin.htmlElements.weekDays.col2.tue.label)
                .append(_plugin.htmlElements.weekDays.col2.fri.input)
                .append(_plugin.htmlElements.weekDays.col2.fri.label))
                .append(_plugin.htmlElements.weekDays.col3.container
                .append(_plugin.htmlElements.weekDays.col3.wed.input)
                .append(_plugin.htmlElements.weekDays.col3.wed.label)
                .append(_plugin.htmlElements.weekDays.col3.sat.input)
                .append(_plugin.htmlElements.weekDays.col3.sat.label)));

        sourceArray = [];
        var partArray = [];
        var masterArray = [];

        prepareSourceArray();
        var id = setTimeout(function () {
            clearTimeout(id);
            $('input[data-type="chk"]').on('click', function (e) {
                masterArray = [];

                updateArray($(e.currentTarget).attr('data-id'), $(e.currentTarget).prop('checked'));
                $.each(sourceArray, function (index, item) {
                    if (item.checkstate == item.fixstate) {
                        partArray.push(item);
                    }
                    else {
                        if (partArray.length > 0) {
                            var targetArray = [];
                            targetArray = partArray;
                            masterArray.push(targetArray);
                            partArray = [];
                        }
                    }
                });
                var result = { arr: masterArray };
                contextObject_weekDays._trigger("onSelectDays", null, result);
            });

        }, 500);



        function prepareSourceArray() {
            sourceArray.push({ day: 1, checkstate: false, fixstate: true, name: "Mon" });
            sourceArray.push({ day: 2, checkstate: false, fixstate: true, name: "Tue" });
            sourceArray.push({ day: 3, checkstate: false, fixstate: true, name: "Wed" });
            sourceArray.push({ day: 4, checkstate: false, fixstate: true, name: "Thu" });
            sourceArray.push({ day: 5, checkstate: false, fixstate: true, name: "Fri" });
            sourceArray.push({ day: 6, checkstate: false, fixstate: true, name: "Sat" });
            sourceArray.push({ day: 7, checkstate: false, fixstate: true, name: "Sun" });
            sourceArray.push({ day: 8, checkstate: false, fixstate: true, name: "" }); //required
        }

        function updateArray(id, value) {
            $.each(sourceArray, function (index, item) {
                if (item.day == id) {
                    item.checkstate = value;
                }
            });
        }

    },
    disabledWeekdays: function () {
        $('input[data-type="chk"]').attr('disabled', true);
    },
    enabledWeekdays: function () {
        $('input[data-type="chk"]').attr('disabled', false);
    },
    selectWeekdays: function (weekdaysArray) {
        $('input[data-type="chk"]').prop('checked', false);
        $.each(sourceArray, function (index, item) {
            item.checkstate = false;
        });
        $.each(weekdaysArray, function (index, item) {
            if (item.length > 1) {
                $.each(item, function (e, data) {
                    $('input[data-id="' + data.day + '"]').prop('checked', true);
                });
            } else {
                $('input[data-id="' + item[0].day + '"]').prop('checked', true);
            }
        });
    },
    _create: function () {
        contextObject_weekDays = this;
        rootUI_weekDays = this.element;

    },
    _destroy: function () {
        rootUI_weekDays.empty();
    },


};

(function ($, undefined) {
    var contextObject_weekDays, rootUI_weekDays;
    var sourceArray = [];
    $.widget("insm.weekDays", weekDays);
})(jQuery);