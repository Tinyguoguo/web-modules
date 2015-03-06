var contextObject_fontStyleTool, rootUI_fontStyleTool;
FontStyleToolManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        role: null,
        bold: 0,
        italic: 0,
        shadow: 0,
        align: 1,
        styleOption: null,
        styleSelectedOption: null,
        sizeOption: null,
        sizeSelectedOption: null,
        selectedColor: null,
        currentColorValue: null
    },

    // Initilization of plugin
    _init: function () {
        contextObject_fontStyleTool = this;
        rootUI_fontStyleTool = this.element;
        $(rootUI_fontStyleTool).empty();
        
        this._setToolHtml();


    },
    _setToolHtml: function () {
        //html for content
        var _plugin = {};

        _plugin.htmlElements = {
            container: $('<div/>').addClass('styleTool').attr('data-role', this.options.role),
            style: $('<select/>').addClass('fontStyle').attr('data-role', this.options.role),
            size: $('<select/>').addClass('fontSize marginLeft'),
            bold: $('<input type="button">').addClass('bold imgBtn marginLeft').attr('data-value', this.options.bold),
            italic: $('<input type="button">').addClass('italic imgBtn marginLeft').attr('data-value', this.options.italic),
            shadow: $('<input type="button">').addClass('shadow imgBtn marginLeft').attr('data-value', this.options.shadow),
            align: {
                container: $('<span/>').attr('data-value', this.options.align).addClass('align marginLeft'),
                left: $('<input type="button">').addClass('left imgBtn').attr('data-value', this.options.left),
                center: $('<input type="button">').addClass('center imgBtn alignBtns').attr('data-value', this.options.center),
                right: $('<input type="button">').addClass('right imgBtn alignBtns').attr('data-value', this.options.right),
            },
            colorPicker: $('<span/>').attr('id', 'titleColorPicker').addClass("color")

        };

        rootUI_fontStyleTool.append(_plugin.htmlElements.container
                                    .append(_plugin.htmlElements.style)
                                    .append(_plugin.htmlElements.size)
                                    .append(_plugin.htmlElements.bold)
                                    .append(_plugin.htmlElements.italic)
                                    .append(_plugin.htmlElements.shadow)
                                    .append(_plugin.htmlElements.align.container
                                            .append(_plugin.htmlElements.align.left)
                                            .append(_plugin.htmlElements.align.center)
                                            .append(_plugin.htmlElements.align.right))
                                            .append(_plugin.htmlElements.colorPicker));

        // set color picker plugin
      _plugin.htmlElements.colorPicker.colorPicker({ role: contextObject_fontStyleTool.options.role, selectedcolor: contextObject_fontStyleTool.options.selectedColor, currentColorValue: contextObject_fontStyleTool.options.selectedColor });
        
        //set style options html
        $.each(contextObject_fontStyleTool.options.styleOption, function (index, items) {
            _plugin.htmlElements.style.append('<option>' + items.name + '</option>');
        });

        var id = setTimeout(function () {
            clearTimeout(id);
            contextObject_fontStyleTool._setDdlValue($('.fontStyle[data-role="'+contextObject_fontStyleTool.options.role+'"]'), contextObject_fontStyleTool.options.styleSelectedOption);
        }, 1000);
        
        //set size options html
        $.each(contextObject_fontStyleTool.options.sizeOption, function (index, items) {
            _plugin.htmlElements.size.append('<option>' + items.name + '</option>');
        });
        _plugin.htmlElements.style.val(contextObject_fontStyleTool.options.sizeSelectedOption);
        //set bold button html
        if (contextObject_fontStyleTool.options.bold == 0) {
            _plugin.htmlElements.bold.addClass('boldBtn');
        }
        else if (contextObject_fontStyleTool.options.bold == 1) {
            _plugin.htmlElements.bold.addClass('boldClickBtn');
        }
        //set italic button html 
        if (contextObject_fontStyleTool.options.italic == 0) {
            _plugin.htmlElements.italic.addClass('italicBtn');
        }
        else if (contextObject_fontStyleTool.options.italic == 1) {
            _plugin.htmlElements.italic.addClass('italicClickBtn');
        }
        //set shadow button html 
        if (contextObject_fontStyleTool.options.shadow == 0) {
            _plugin.htmlElements.shadow.addClass('shadowBtn');
        }
        else if (contextObject_fontStyleTool.options.shadow == 1) {
            _plugin.htmlElements.shadow.addClass('shadowClickBtn');
        }
        //set align button html
        if (contextObject_fontStyleTool.options.align == 0) {
            _plugin.htmlElements.align.left.addClass('leftClickBtn');
            _plugin.htmlElements.align.center.addClass('centerBtn');
            _plugin.htmlElements.align.right.addClass('rightBtn');
        }
        else if (contextObject_fontStyleTool.options.align == 1) {
            _plugin.htmlElements.align.left.addClass('leftBtn');
            _plugin.htmlElements.align.center.addClass('centerClickBtn');
            _plugin.htmlElements.align.right.addClass('rightBtn');
        }
        else if (contextObject_fontStyleTool.options.align == 2) {
            _plugin.htmlElements.align.left.addClass('leftBtn');
            _plugin.htmlElements.align.center.addClass('centerBtn');
            _plugin.htmlElements.align.right.addClass('rightClickBtn');
        }
        //bold button click event
        _plugin.htmlElements.bold.click(function () {
            if ($(this).attr('data-value') == 0) {
                $(this).attr('data-value', '1');
                $(this).removeClass('boldBtn').addClass('boldClickBtn');
            } else if ($(this).attr('data-value') == 1) {
                $(this).attr('data-value', '0');
                $(this).removeClass('boldClickBtn').addClass('boldBtn');
            }
        });

        //italic button click event 
        _plugin.htmlElements.italic.click(function () {
            if ($(this).attr('data-value') == 0) {
                $(this).attr('data-value', '1');
                $(this).removeClass('italicBtn').addClass('italicClickBtn');
            } else if ($(this).attr('data-value') == 1) {
                $(this).attr('data-value', '0');
                $(this).removeClass('italicClickBtn').addClass('italicBtn');
            }
        });

        //shadow button click event
        _plugin.htmlElements.shadow.click(function () {
            if ($(this).attr('data-value') == 0) {
                $(this).attr('data-value', '1');
                $(this).removeClass('shadowBtn').addClass('shadowClickBtn');
            } else if ($(this).attr('data-value') == 1) {
                $(this).attr('data-value', '0');
                $(this).removeClass('shadowClickBtn').addClass('shadowBtn');
            }
        });

        //left align button click event
        _plugin.htmlElements.align.left.click(function () {
            _plugin.htmlElements.align.left.removeClass('leftBtn').addClass('leftClickBtn');
            _plugin.htmlElements.align.center.removeClass('centerClickBtn').addClass('centerBtn');
            _plugin.htmlElements.align.right.removeClass('rightClickBtn').addClass('rightBtn');
            _plugin.htmlElements.align.container.attr('data-value', '0');
        });
        //center align button click event
        _plugin.htmlElements.align.center.click(function () {
            _plugin.htmlElements.align.left.removeClass('leftClickBtn').addClass('leftBtn');
            _plugin.htmlElements.align.center.removeClass('centerBtn').addClass('centerClickBtn');
            _plugin.htmlElements.align.right.removeClass('rightClickBtn').addClass('rightBtn');
            _plugin.htmlElements.align.container.attr('data-value', '1');
        });
        //right align button click event 
        _plugin.htmlElements.align.right.click(function () {
            _plugin.htmlElements.align.left.removeClass('leftClickBtn').addClass('leftBtn');
            _plugin.htmlElements.align.center.removeClass('centerClickBtn').addClass('centerBtn');
            _plugin.htmlElements.align.right.removeClass('rightBtn').addClass('rightClickBtn');
            _plugin.htmlElements.align.container.attr('data-value', '2');
        });


    },
    _setDdlValue: function ($element, value) {
      
        $element.find("option").filter(function () {
            return (($(this).val() == value) || ($(this).text() == value));
        }).prop('selected', true);
    },

    //Create this plugin
    _create: function () {
        contextObject_fontStyleTool = this;
        rootUI_fontStyleTool = this.element;
    },
    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_fontStyleTool.empty();
    },

};

(function ($, undefined) {
    $.widget("insm.fontStyleTool", FontStyleToolManager);
})(jQuery);