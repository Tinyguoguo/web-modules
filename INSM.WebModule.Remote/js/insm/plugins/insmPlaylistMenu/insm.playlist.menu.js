/// <reference path="../insmEnums.js" />


var MenuViewUIManager = {
    version: "0.0.1",

    options: {
        menuItems: [{ "name": "menu1", "type": "type1" }, { "name": "menu2", "type": "type2" }],
        onMenuItemClick: null,
        setMenuItemDisabled: null
    },

    _init: function () {
        contextObject_menu = this;
        rootUI_Menu = this.element;

        //TODO: $.each html is not converted as per feedback
        var menuHtml = '<table id="menuTbl" class="container insm-playlist-menu-table"><tr><td class="first-td"></td><td class="second-td">';
        $.each(this.options.menuItems, function (data, items) {
            if (items.name == "") {
                menuHtml += '<hr/>';
            } else {
                menuHtml += '<span data-role="menuItem" data-name="' + items.name + '" data-type="' + items.type + '">' + items.name + '</span><br />';
            }
        });

        menuHtml += '</td></tr></table>';

        $('#menuspan').css("position", "absolute");
        $('#menuspan').append(menuHtml);
        $("#menuspan").offset({ left: rootUI_Menu.offset().left, top: rootUI_Menu.offset().top + rootUI_Menu.height() + 20 });

        if (this.options.setMenuItemDisabled != null) {
            $.each(this.options.setMenuItemDisabled.split(','), function (index, value) {
                $(".second-td").find('span[data-name*="' + value + '"]').addClass('disabledSpan');
            });
        }

        $("span[data-role*='menuItem']").on("mouseover", function () {
            var color = $(this).css("background-color");
            if (!$(this).hasClass('disabledSpan')) {
                $(this).css("background-color", '#d6eaf3');
                $(this).css("border", 'thin solid #96d9f9');
                $(this).bind("mouseout", function () {
                    $(this).css("background-color", color);
                    $(this).css("border", 'thin solid #ededed');
                });
            }
        });

        $("span[data-role*='menuItem']").on("click", function (e) {
            if (!$(this).hasClass('disabledSpan')) {
                $('.container').remove();
                var enumValue = Menutype[$(e.currentTarget).attr("data-type")];
                contextObject_menu._trigger("onMenuItemClick", null, enumValue);

            } else {
                return false;
            }
        });

        $(document).mouseup(function (e) {
            var container = $('.container');
            if ((!container.is(e.target)
                && container.has(e.target).length === 0)) {
                container.remove();
            }
        });
    },

    _create: function () {
    },

    _destroy: function () {
        rootUI_Menu.empty();
    },
};

(function ($, undefined) {
    var contextObject_menu, rootUI_Menu;
    $.widget("insm.menu", MenuViewUIManager);
})(jQuery);
