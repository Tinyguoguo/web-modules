/*
* INSM Tablesorter
* This file contain the INSM Tablesorter function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmTablesorter(settings);
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
    var _breadcrumbs = [];
    $.fn.insmBreadcrumbs = function (_action, _crumb) {
        var $this = this;

        // Action could be
        //  push
        //  pop
        //  clear
        switch (_action) {
            case 'push':
                _breadcrumbs.push(_crumb);
                update();
                break;
            case 'unshift':
                _breadcrumbs.unshift(_crumb);
                update();
                break;
            case 'pop':
                _breadcrumbs.pop();
                update();
                break;
            case 'clear':
                _breadcrumbs = [];
                break;
            case 'get':
                return _breadcrumbs;
            default:
                $.insmNotification({
                    type: 'error',
                    text: 'Action \'' + _action + '\' not recognised in INSM Breadcrumbs'
                });
                break;
        }


        function update() {
            var list = $('<ul class="insm-breadcrumbs" />');
            $.each(_breadcrumbs, function (index, crumb) {
                var item = $('<li />');
                var link = $('<a />').text(crumb.title).addClass(crumb.addClass);
                if (typeof crumb.onClick == 'function') {
                    link.click(function () {
                        crumb.onClick();
                    });
                }
                item.html(link);
                list.append(item);
            });
            $this.html(list);
        }
        return $this;
    };
})(jQuery);