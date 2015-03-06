/*
* INSM Deployment
* This file contains the INSM Deployment plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmDeployment(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Deployment',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        views: {
                            container: $('<div />').addClass('content'),
                            deployment: {
                                container: $('<div />'),
                                input: $('<div />'),
                                button: $('<button />'),
                                loadingDiv: $('<div />')
                            },
                            loading: {
                                container: $('<div />')
                            },
                            summary: {
                                container: $('<div />'),
                                text: $('<p />'),
                                tables: $('<div/>'),
                                button: $('<button />')
                            }
                        }
                    },
                    data: {
                        deploymentValue: []
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    permissions: {

                    }
                };
                $this.data('insmDeployment', _plugin);
            }

            $this.insmDeployment('render');

            return $this;
        },
        render: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmDeployment('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init HTML
            $this.addClass('deployment').fadeIn();
            $this.empty();

            if (_plugin.settings.header) {
                $this.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }

            $this.append(
                _plugin.htmlElements.views.container.append(
                    _plugin.htmlElements.views.deployment.container.append(
                        _plugin.htmlElements.views.deployment.input,
                        _plugin.htmlElements.views.deployment.button,
                        _plugin.htmlElements.views.deployment.loadingDiv
                    ),
                    _plugin.htmlElements.views.loading.container,
                    _plugin.htmlElements.views.summary.container.append(
                        _plugin.htmlElements.views.summary.text,
                        _plugin.htmlElements.views.summary.tables.addClass('summary-table'),
                        _plugin.htmlElements.views.summary.button
                    )
                )
            );

            // Register on hashChange
            $.insmHashChange({
                applicationName: _plugin.settings.applicationName
            });
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var deployment = hash[_plugin.settings.applicationName];
                    if (deployment) {
                        if (deployment.view) {
                            switch (deployment.view.toLowerCase()) {
                                case 'deployment':
                                    $this.insmDeployment('renderDeploymentView');
                                    break;
                                case 'loading':
                                    $this.insmDeployment('renderLoadingView');
                                    break;
                                case 'summary':
                                    $this.insmDeployment('renderSummaryView');
                                    break;
                                default:
                                    $this.insmDeployment('renderDeploymentView');
                                    break;
                            }
                        }
                        else {
                            hash[_plugin.settings.applicationName].view = 'deployment';
                            $.insmHashChange('updateHash', hash);
                        }
                    }
                    else {
                        $this.insmDeployment('renderDeploymentView');
                    }
                }
            });

            //var hash = $.insmHashChange('get');
            //if (hash[_plugin.settings.applicationName]) {
            //    $.insmHashChange('updateHash', hash);
            //} else {
            //    $this.insmDeployment('renderDeploymentView');
            //}

            $this.insmDeployment('resize');

            return $this;
        },
        renderDeploymentView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            _plugin.htmlElements.views.container.children().hide();
            _plugin.htmlElements.views.deployment.container.fadeIn();

            _plugin.htmlElements.views.deployment.input.hide();
            _plugin.htmlElements.views.deployment.button.hide();
            _plugin.htmlElements.views.deployment.loadingDiv.insmLoader();

            // Get targets
            $.ajax({
                url: _plugin.settings.apiUrl + '/gettargets/',
                success: function (targets) {
                    _plugin.htmlElements.views.deployment.input.fadeIn();
                    _plugin.htmlElements.views.deployment.button.fadeIn();
                    _plugin.htmlElements.views.deployment.loadingDiv.insmLoader('destroy');
                    _plugin.htmlElements.views.deployment.input.insmInputDeployment('destroy').insmInputDeployment({
                        targets: targets
                    });
                    _plugin.htmlElements.views.deployment.input.insmInputDeployment('edit');

                    _plugin.htmlElements.views.deployment.button.text('Deploy').unbind('click').click(function () {
                        if (_plugin.htmlElements.views.deployment.input.insmInputDeployment('validate')) {
                            _plugin.data.deploymentValue = _plugin.htmlElements.views.deployment.input.insmInputDeployment('getValue');

                            var hash = $.insmHashChange('get');
                            if (hash[_plugin.settings.applicationName]) {
                                hash[_plugin.settings.applicationName].view = 'loading';
                                $.insmHashChange('updateHash', hash);
                            } else {
                                $this.insmDeployment('renderLoadingView');
                            }
                        }
                    });
                }
            });



            return $this;
        },
        renderLoadingView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            var deploymentLookup = [];

            $.each(_plugin.data.deploymentValue, function (index, value) {
                if (value != null) {
                    $.each(value.playerIds, function (playerIdIndex, playerId) {
                        deploymentLookup.push({
                            playerId: playerId,
                            targetId: value.targetId
                        })
                    });
                }
            });

            _plugin.htmlElements.views.container.children().hide();

            _plugin.htmlElements.views.loading.container.fadeIn().insmLoader('destroy').insmLoader({
                text: 'Deployment in progress (0 / ' + deploymentLookup.length + ')'
            });

            var currentIndex = 0;

            function deployNextPlayer() {
                $.ajax({
                    url: _plugin.settings.apiUrl + '/deployplayer/',
                    dataType: 'json',
                    data: {
                        upid: deploymentLookup[currentIndex].playerId,
                        targetId: deploymentLookup[currentIndex].targetId
                    },
                    success: function () {
                        currentIndex++;
                        _plugin.htmlElements.views.loading.container.insmLoader('update', {
                            text: 'Deployment in progress (' + currentIndex + ' / ' + deploymentLookup.length + ')'
                        });

                        if (currentIndex < deploymentLookup.length) {
                            deployNextPlayer();
                        }
                        else {
                            var hash = $.insmHashChange('get');
                            if (hash[_plugin.settings.applicationName]) {
                                hash[_plugin.settings.applicationName].view = 'summary';
                                $.insmHashChange('updateHash', hash);
                            } else {
                                $this.insmDeployment('renderSummaryView');
                            }
                        }
                    }
                });
            }

            deployNextPlayer();

            return $this;
        },
        renderSummaryView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');


            _plugin.htmlElements.views.container.children().hide();
            _plugin.htmlElements.views.summary.container.fadeIn();


            _plugin.htmlElements.views.summary.tables.empty();

            $.each(_plugin.data.deploymentValue, function (index, value) {
                var thead = $('<thead />');
                var tbody = $('<tbody />');
                var table = $('<table />').append(
                    thead,
                    tbody
                );

                thead.append(
                    $('<tr />').append(
                        $('<th />').text(value.targetTitle)
                    )
                );
                $.each(value.playerIds, function (index2, playerId) {
                    tbody.append(
                        $('<tr />').append(
                            $('<td />').text(playerId)
                        )
                    );
                });

                _plugin.htmlElements.views.summary.tables.append(table);
            });



            _plugin.htmlElements.views.summary.text.text('You have successfully finished deployment of the following players');

            _plugin.htmlElements.views.summary.button.text('New Deployment').unbind('click').click(function () {
                // Reset deployment value
                _plugin.data.deploymentValue = [];
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    hash[_plugin.settings.applicationName].view = 'deployment';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmDeployment('renderDeploymentView');
                }
            });

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');
            if (_plugin) {
                var totalHeight = $this.height();
                //var headerHeight = _plugin.htmlElements.header.outerHeight(true);
                //_plugin.htmlElements.content.container.css({
                //    height: parseInt(totalHeight - headerHeight) + 'px'
                //});

            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            _plugin.subscriptions.start = function () {
                // Subscribe on region tree
            };

            $this.insmDeployment('stopSubscriptions');
            $this.insmDeployment('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                // Stop subscription of region tree
            };

            return $this;
        },
        
        onClose: function (options) {
            options.success();
        },

        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDeployment');

            $this.insmDeployment('stopSubscriptions');
            $this.data('insmDeployment', null).empty();

            return $this;
        }
    };

    $.fn.insmDeployment = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDeployment');
        }
    };

})(jQuery);