var clock = {
    version: "0.0.1",

    options: {
        opName: null,
        onChangeTime: null,
    },

    _init: function () {
        contextObject_clock = this;
        rootUI_clock = this.element;
        rootUI_clock.attr('data-id', Math.uuid());
        this._setClockHtml();

    },

    _setClockHtml: function () {
        var _clockPlugin = {};
        _clockPlugin.htmlElements = {
            img: $('<img/>').attr('src', 'css/insm/plugins/insmClock/clock.JPG').attr('id', rootUI_clock.attr('data-id')).addClass('insm-playlist-timeOption-clock-option-img'),
            options: {
                container: $('<div/>').addClass('insm-playlist-timeOption-clock-option-div').attr('id', contextObject_clock.options.opName),
            }
        };
        rootUI_clock.after(_clockPlugin.htmlElements.img);
        _clockPlugin.htmlElements.img.click(function () {
            var handler = $('span[data-id*="' + $(this).attr('id') + '"]').find('input');
            var op = ["12:00AM", "12:30AM", "01:00AM", "01:30AM", "02:00AM", "02:30AM", "03:00AM", "03:30AM", "04:00AM", "04:30AM", "05:00AM", "05:30AM", "06:00AM", "06:30AM", "07:00AM", "07:30AM", "08:00AM", "08:30AM", "09:00AM", "09:30AM", "10:00AM", "10:30AM", "11:00AM", "11:30AM", "12:00PM", "12:30PM", "01:00PM", "01:30PM", "02:00PM", "02:30PM", "03:00PM", "03:30PM", "04:00PM", "04:30PM", "05:00PM", "05:30PM", "06:00PM", "06:30PM", "07:00PM", "07:30 PM", "08:00PM", "08:30PM", "09:00PM", "09:30PM", "10:00PM", "10:30PM", "11:00PM", "11:30PM"];
            _clockPlugin.htmlElements.img.after(_clockPlugin.htmlElements.options.container);
            _clockPlugin.htmlElements.options.container.offset({ left: handler.offset().left, top: handler.offset().top + handler.height() + 16 });

            $.each(op, function (index, item) {
                _clockPlugin.htmlElements.options.container.append('<div data-value=' + item + ' data-opName=' + contextObject_clock.options.opName + ' class="clockOp" style="margin-left:5px;width:90%;height:19%;border:1px solid white;background-color:white">' + item + '</div>');
            });

            $(".clockOp").on("click", function () {
                _clockPlugin.htmlElements.options.container.remove();
                var res = { timeVal: $(this).attr('data-value'), flag: $(this).parent().attr('id') };
                contextObject_clock._trigger("onChangeTime", null, res);
                handler.val($(this).attr('data-value'));
                //alert($(this).parent().attr('id'));

            });

            $(".clockOp").on("mouseover", function () {
                $(this).css("background-color", '#d6eaf3');
                $(this).css("border", '1px solid #96d9f9');
                $(this).bind("mouseout", function () {
                    $(this).css("background-color", '#fff');
                    $(this).css("border", '1px solid white');
                });

            });
            $(document).mouseup(function (e) {
                var container = $('.insm-playlist-timeOption-clock-option-div');
                if ((!container.is(e.target)
                    && container.has(e.target).length === 0)) {
                    container.remove();
                }
            });
        });
    },

    unBindClick: function () {
        $('.insm-playlist-timeOption-clock-option-img').css('display', 'none');
    },

    bindClick: function () {
        $('.insm-playlist-timeOption-clock-option-img').css('display', '');
    },

    _create: function () {
        contextObject_clock = this;
        rootUI_clock = this.element;

    },
    _destroy: function () {
        rootUI_clock.empty();
    },


};

(function ($, undefined) {
    var contextObject_clock, rootUI_clock;
    $.widget("insm.clock", clock);
})(jQuery);