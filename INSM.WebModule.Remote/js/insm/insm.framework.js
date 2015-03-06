/*
* INSM Framework
* This file contain the INSM Framework function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFramework(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var _guid = 0;
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        ams: '',
                        app: '',
                        version: '',
                        protocol: 'http',
                        links: {},
                        session: '',
                        timeout: 20000,
                        username: '',
                        user: {}
                    }, options),
                    data: {
                        type: '',
                        target: '',
                        version: '',
                        versionId: 0,
                        initialized: new $.Deferred(),
                        loginFlag: false,
                        loginDeferred: new $.Deferred(),
                        timestamp: null
                    }
                };
                $this.data('insmFramework', _plugin);
            }

            if (!_plugin.settings.ams || !_plugin.settings.app || !_plugin.settings.version) {
                throw 'INSM Framework not initialized correctly';
            }

            var session = urlDecode($(document).getUrlParam('session'));
            if (session) {
                _plugin.settings.session = session;
            }
            else if (typeof (Storage) !== "undefined" && typeof sessionStorage != 'undefined' && !_plugin.settings.session) {
                _plugin.settings.session = sessionStorage.insmFrameworkSession;
                if (!_plugin.settings.session) {
                    _plugin.settings.session = '';
                }
            }
            
            $.insmFramework('ping', {
                success: function (data) {
                    _plugin.settings.session = data.Session;
                    if (typeof (Storage) !== "undefined" && typeof sessionStorage != 'undefined') {
                        sessionStorage.insmFrameworkSession = data.Session;
                    }
                    _plugin.data.type = data.Type;
                    _plugin.data.target = data.Target;
                    _plugin.data.version = data.Version;
                    _plugin.data.versionId = data.VersionId;
                    _plugin.settings.username = data.User;
                    _plugin.data.initialized.resolve();

                    var isHosted = urlDecode($(document).getUrlParam('ishosted'));

                    if (isHosted !== 'true') {
                        $('#insm-version').html('\
                            <p class="information">' +
                                        _plugin.settings.app + ' ' + _plugin.settings.version + '<br />' +
                                        _plugin.data.target + ' ' + _plugin.data.type + ' ' + _plugin.data.version + '<br />' +
                                    '</p>' +
                                    '<div class="logoutButton"></div>\
                        ');
                        if (data.User != null && data.User != "") {
                            $('#insm-version .logoutButton').html('<a class="button logout">Logout ' + data.User + '</a>');
                        }

                        $('#insm-version a.logout').click(function () {
                            $.insmFramework('logout');
                        });
                    }
                }
            });

            return $this;
        },
        downloadCurrentUser: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (data) {
                    var user = $.insmFramework('userDecode', data);

                    if (!user.name) {
                        throw new Error('Invalid user response from API.');
                    }
                    else {
                        options.success(user);
                    }
                },
                denied: function () {
                    $.insmFramework('downloadCurrentUser', options);
                },
                method: 'getCurrentUser'
            };

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol+'://'+_plugin.settings.ams + '/Users.aspx',
                data: data
            });

            return $this;
        },
        userDecode: function (user) {
            var prettyUser = {
                name: user.Username,
                admin: user.Admin,
                domain: user.Domain,
                email: user.Email,
                givenName: user.GivenName,
                surname: user.Surname,
                groups: []

            };
            $.each(user.Groups, function (index, group) {
                var groupCopy = {
                    name: group.Name,
                    admin: group.Admin
                }
                prettyUser.groups.push(groupCopy);
            });
            return prettyUser;
        },
        getSystemInformation: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (typeof _plugin == 'undefined') {
                return {
                    type: 'N/A',
                    target: 'N/A',
                    version: 'N/A',
                    apiUrl: 'N/A',
                    application: {
                        name: 'N/A',
                        version: 'N/A'
                    }
                };
            }

            return {
                type: _plugin.data.type,
                target: _plugin.data.target,
                version: _plugin.data.version,
                apiUrl: _plugin.settings.protocol+'://'+_plugin.settings.ams,
                application: {
                    name: _plugin.settings.app,
                    version: _plugin.settings.version
                }
            };
        },
        getSession: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            return _plugin.settings.session;
        },
        getInstoremediaVersion: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            return _plugin.data.version;
        },
        initialized: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'initialized check called before framework init'
                });
                return new $.Deferred();
            }
            return _plugin.data.initialized;
        },
        isInitialized: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (_plugin) {
                return true;
            }
            return false;
        },
        user: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (_plugin.settings.user) {
                return _plugin.settings.user;
            }
            else {
                return null;
            }
        },
        getDeprecatedFramework: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (!_plugin) {
                $.insmNotification({
                    type: 'warning',
                    text: 'call to getDepricatedFramework before insmFramework init'
                });
                return null;
            }
            return new insmFramework({
                ams: _plugin.settings.ams,
                app: _plugin.settings.app,
                ssl: _plugin.settings.protocol == 'http' ? false : true,
                links: _plugin.settings.links,
                session: _plugin.settings.session
            });
        },
        logout: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var logoutDeferred = $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Login.aspx',
                data: {
                    logout: 'true',
                    app: urlEncode(_plugin.settings.app),
                    session: (_plugin.settings.session != null && _plugin.settings.session != '' ? _plugin.settings.session : '')
                },
                dataType: 'jsonp',
                success: function (data) {
                    $.insmFramework('login', {
                        logout: true,
                        type: data.Type,
                        target: data.Target,
                        version: data.Version
                        //success: options.success
                    });
                    return;
                }
            });

            return logoutDeferred;
        },
        getTimestamp: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            return _plugin.data.timestamp;
        },
        login: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            // TODO: Refactor

            //checkLogin will just call the Login.aspx to verify the session
            // so use this.login with checkLogin first and if your denied callback is run do a regular login call.
            // As of 2013-02-27 a good example of this exists in the insmMenu plugin.
            if (options.checkLogin) {
                return $.ajax({
                    url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Login.aspx?' + 'app=' + _plugin.settings.app + (_plugin.settings.session != null && _plugin.settings.session != '' ? '&session=' + _plugin.settings.session : ''),
                    dataType: 'jsonp',
                    timeout: _plugin.settings.timeout,
                    success: function (data) {
                        if (data.Status == "OK") {
                            options.callbacks.success(data);
                        } else if (data.Status == "Error") {
                            options.callbacks.error(data.Message);
                        } else {
                            options.callbacks.denied(data);
                        }
                    }
                });
            }
            if (_plugin.data.loginFlag && _plugin.data.loginDeferred.state() == 'pending') {
                return _plugin.data.loginDeferred;
            } else {
                _plugin.data.loginDeferred = new $.Deferred();
                _plugin.data.loginFlag = true;
            }

            $.when(_plugin.data.initialized).done(function () {
                if (typeof options != 'object') {
                    $.insmNotification({
                        type: 'information',
                        text: 'No AMS information when calling framework.login'
                    });
                    options = null;
                }

                var header = $('<div />').addClass('header');
                var submitButton = $('<input type="submit" class="hidden" />');
                var loginButton = $('<a class="button login" />').text('Login');
                var loginForm = $('<div class="insm-overlay" />')
                                .appendTo('body')
                                .append(
                                    $('<div class="insm-popupbox login-popup" />')
                                    .append(
                                        header.append(
                                            $('<h2 />').text('Login')
                                        ),
                                        $('<form id="insm-login-form" action="" method="POST" />').append(
                                            $('<table class="vertical no-border" />').append(
                                                $('<tr />').append(
                                                    $('<th />').text('Username'),
                                                    function () {
                                                        if (_plugin.settings.username) {
                                                            return $('<td />').append($('<input class="username" type="text" name="username" disabled="disabled" value="' + _plugin.settings.username + '" />'));
                                                        }
                                                        else {
                                                            return $('<td />').append($('<input class="username" type="text" name="username" />'));
                                                        }
                                                    }()
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Password'),
                                                    $('<td />').append($('<input class="password" type="password" name="password" />'))
                                                ),
                                                $('<tr />').append(
                                                    $('<th />'),
                                                    $('<td />').append(
                                                        submitButton,
                                                        loginButton
                                                    )
                                                )
                                            )
                                        )
                                    )
                                );
                var subtitle = $('<div class="subtitle align_center" />').html('&nbsp');
                header.append(subtitle);
                if (typeof amsInfo !== 'undefined' && amsInfo != null) {
                    subtitle.text(amsInfo.type + ' ' + amsInfo.target + ' ' + amsInfo.version);
                }

                if (options != null) {
                    loginForm.find('h2').after('<div class="subtitle align_center">' + _plugin.data.type + ' ' + _plugin.data.target + ' ' + _plugin.data.version + '</div>');
                }

                loginForm.find('input[type="text"]').keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        loginButton.trigger('click');
                        return false;
                    }
                    return true;
                });

                loginForm.find('input[type="password"]').keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        loginForm.find('a.login').trigger('click');
                        return false;
                    }
                    return true;
                });

                loginButton.click(function () {
                    if (!$(this).hasClass('disabled')) {
                        $(this).addClass('disabled');
                        loginForm.find('input.username').attr('disabled', 'disabled');
                        loginForm.find('input.password').attr('disabled', 'disabled');
                        $('#insm-login-form').submit();
                    }
                });

                if (_plugin.settings.username) {
                    $('#insm-login-form input.password').focus();
                }
                else {
                    $('#insm-login-form input.username').focus();
                }

                loginForm.find('#insm-login-form').submit(function (e) {
                    e.preventDefault();
                    var username = urlEncode($('#insm-login-form input.username').val());

                    $.ajax({
                        url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Login.aspx?username=' + username + '&password=' + urlEncode($('#insm-login-form input.password').val()) + '&app=' + _plugin.settings.app + (_plugin.settings.session != null && _plugin.settings.session != '' ? '&session=' + _plugin.settings.session : ''),
                        dataType: 'jsonp',
                        timeout: _plugin.settings.timeout,
                        error: function (jqXHR, textStatus, errorThrown) {
                            $.insmNotification({
                                type: 'error',
                                text: 'Server not available: ' + textStatus
                            });

                            loginForm.find('a.login').removeClass('disabled');
                            loginForm.find('input.password').removeAttr('disabled');
                            if (_plugin.settings.username) {
                                $('#insm-login-form input.password').focus();
                            }
                            else {
                                loginForm.find('input.username').removeAttr('disabled').focus().val('');
                            }
                        },
                        success: function (data) {
                            if (data.Status == "OK") {
                                if (data.Result) {
                                    _plugin.settings.user = data.Result;
                                }
                                else {
                                    _plugin.settings.user = {
                                        name: data.User
                                    };
                                }
                                _plugin.settings.session = data.Session;
                                loginForm.remove();
                                _plugin.data.loginDeferred.resolve();
                                $('#insm-version .logoutButton').html($('<a />').addClass('button logout').text('Logout ' + data.User).click(function () {
                                    $.insmFramework('logout');
                                }));
                                if (typeof options.success === 'function') {
                                    options.success();
                                }
                            }
                            else if (data.Status == "Denied") {
                                $.insmNotification({
                                    type: 'unauthorized',
                                    text: 'Invalid credentials'
                                });

                                loginForm.find('a.login').removeClass('disabled');
                                loginForm.find('input.password').removeAttr('disabled');
                                $('#insm-login-form input.password').val('');
                                if (_plugin.settings.username) {
                                    $('#insm-login-form input.password').focus();
                                }
                                else {
                                    loginForm.find('input.username').removeAttr('disabled').focus().val('');
                                }

                                $('#insm-login-form input')
                                                .stop(true)
                                                .css({
                                                    borderTopColor: '#f00',
                                                    borderRightColor: '#f00',
                                                    borderBottomColor: '#f00',
                                                    borderLeftColor: '#f00'
                                                })
                                                .animate({
                                                    borderTopColor: '#000',
                                                    borderRightColor: '#000',
                                                    borderBottomColor: '#000',
                                                    borderLeftColor: '#000'
                                                }, 5000);
                            } else {                               

                                loginForm.find('a.login').removeClass('disabled');
                                loginForm.find('input.password').removeAttr('disabled');
                                if (_plugin.settings.username) {
                                    $('#insm-login-form input.password').focus();
                                }
                                else {
                                    loginForm.find('input.username').removeAttr('disabled').focus().val('');
                                }
                            }
                        }
                    });
                });

                _plugin.data.loginDeferred.always(function () {
                    _plugin.data.loginFlag = false;
                });
            });

            return _plugin.data.loginDeferred;
        },
        getEntityVersion: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            return _plugin.data.versionId;
        },
        ping: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options.denied) {
                options.denied = function () {
                    // ping can never be denied.
                };
            }
            if (!options.error) {
                options.error = function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                };
            }

            data = {
                format: 'json',
                app: _plugin.settings.app
            };
            if (_plugin.settings.session) {
                data.session = _plugin.settings.session;
            }

            var not = $.insmNotification({
                text: 'Checking server availability',
                type: 'load',
                duration: 0
            });

            $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Ping.aspx',
                data: data,
                dataType: 'jsonp',
                timeout: _plugin.settings.timeout,
                error: function (jqXHR, textStatus, errorThrown) {
                    not.update({
                        type: 'error',
                        text: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                    });
                },
                success: function (data) {
                    not.update({
                        type: 'successful',
                        text: 'Server is available.',
                        duration: -1
                    });
                    if (data.User) {
                        not = $.insmNotification({
                            text: 'Checking user access',
                            type: 'load',
                            duration: 0
                        });
                        $.insmFramework('users', {
                            selectUser: data.User.toLowerCase(),
                            success: function (user) {
                                not.update({
                                    type: 'successful',
                                    text: 'User is available.',
                                    duration: -1
                                });
                                if (user.Username) {
                                    _plugin.settings.user = user;
                                }
                                else if (user.Users && user.Users[0]) {
                                    _plugin.settings.user = user.Users[0];
                                }
                                else {
                                    $.insmNotification({
                                        type: 'error',
                                        text: 'Error when fetching user data'
                                    });
                                    return null;
                                }
                                $.insmFramework('callback', {
                                    result: data,
                                    params: options,
                                    mode: 'full'
                                });
                            },
                            denied: function () {
                                not.update({
                                    type: 'successful',
                                    text: 'User is available.',
                                    duration: -1
                                });
                                _plugin.settings.user = {};
                                $.insmFramework('callback', {
                                    result: data,
                                    params: options,
                                    mode: 'full'
                                });
                            },
                            error: function (message) {
                                $.insmNotification({
                                    type: 'error',
                                    text: message
                                });
                            }
                        });
                    }
                    else {
                        $.insmFramework('callback', {
                            result: data,
                            params: options,
                            mode: 'full'
                        });
                    }
                }
            });

            return $this;
        },
        callback: function (options) {
            if (!options.mode) {
                options.mode = 'result';
            }
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            //success and denied are requred callbacks. But should error be one?
            var requriedCallbacks = ['success', 'error', 'denied'];
            $.each(requriedCallbacks, function (index, callback) {
                if (typeof options.params[callback] != 'function') {
                    throw new Error('No ' + callback + ' callback defined in INSM framework');
                }
            });

            if (options.result && options.result.VersionId) {
                _plugin.data.versionId = options.result.VersionId;
            }

            if (options.result) {
                if (options.result.Status) {
                    switch (options.result.Status) {
                        case 'OK':
                            if (options.mode == 'full') {
                                options.params.success(options.result);
                            } else {
                                options.params.success(options.result.Result);
                            }
                            break;
                        case 'Error':
                            if (options.result.Message == "Connection failed") { //clarify connection failed as it is a regular failure.
                                options.params.error("Server error. Please contact administrator (Connection failed)");
                            } else {
                                options.params.error(options.result.Message);
                            }
                            break;
                        case 'Denied':
                            options.params.denied(options.result);
                            break;
                        default:
                            $.insmNotification({
                                type: 'error',
                                text: 'Status "' + options.result.Status + '" callback is not implemented in INSM Framework'
                            });
                    }
                } else {
                    $.insmNotification({
                        type: 'error',
                        text: 'Status not defined in INSM Framework Callback: ' + options.result.Status
                    });
                }
            }
            else {
                $.insmNotification({
                    type: 'error',
                    text: 'Result not defined in INSM Framework Callback'
                });
            }
        },
        properties: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var parameters = {
                session: _plugin.settings.session,
                regionId: options.regionId
            };

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Properties.aspx',
                data: options
            });

            return $this;
        },
        reloadUserCache: function(options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (_plugin) {
                $.insmFramework('ajax', {
                    url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Users.aspx?invalidatecache=true',
                    data: options
                });
            }

            return $this;
        },
        files: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (_plugin) {
                $.insmFramework('ajax', {
                    url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Files.aspx',
                    data: options
                });
            }

            return $this;
        },
        region: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Region.aspx',
                data: options
            });

            return $this;
        },
        statistics: function (options) {
            if (!options.filter || !options.type) {
                throw new Error("Missing parameter filter and type");
            }
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Statistics.aspx',
                data: options
            });

            return $this;
        },
        players: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            if (options.id) {
                data.upid = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            data.method = options.method;
            data.appSettings = options.appSettings;
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Player.aspx',
                data: data
            });

            return $this;
        },
        playlog: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options.upid) {
                throw 'UPID not provided';
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Playlog.aspx',
                data: options
            });

            return $this;
        },
        rebootPlayer: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            options.command = 'reboot';

            if (!options.upid) {
                throw 'UPID not provided';
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Command.aspx',
                data: options
            });

            return $this;
        },
        moduleSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                success: options.success,
                denied: options.denied,
                error: options.error,
                method: 'get',
                name: '_'
            };

            if (options.key) {
                data.key = options.key;
            }
            if (options.namespace) {
                data.name = options.namespace;
            }
            if (options.value) {
                data.value = options.value;
                data.method = 'set';
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/ModuleSettings.aspx',
                data: data
            });

            return $this;
        },
        users: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Users.aspx',
                data: options
            });

            return $this;
        },
        access: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            return $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Access.aspx',
                data: options
            });
        },
        player: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            if (options.upid) {
                data.upid = options.upid;
            }
            if (options.success) {
                data.success = options.success;
            }
            if (options.error) {
                data.error = options.error;
            }
            if (options.denied) {
                data.denied = options.denied;
            }
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Properties.aspx',
                data: data
            });

            return $this;
        },
        layouts: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Layouts.aspx',
                data: options
            });

            return $this;
        },
        channels: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Channels.aspx',
                data: options
            });

            return $this;
        },
        amsSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                role: 'ams'
            };

            if (options.key) {
                data.key = options.key;
            }
            if (options.success) {
                data.success = options.success;
            }
            if (options.error) {
                data.error = options.error;
            }
            if (options.denied) {
                data.denied = options.denied;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/AppSettings.aspx',
                data: data
            });

            return $this;
        },
        playerSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                role: 'site'
            };

            if (options.id) {
                data.upid = options.id;
            }
            else {
                throw 'Parameter id not provided in method playerSettings';
            }
            if (options.success) {
                data.success = options.success;
            }
            if (options.error) {
                data.error = options.error;
            }
            if (options.denied) {
                data.denied = options.denied;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/AppSettings.aspx',
                data: data
            });

            return $this;
        },
        regionSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                role: 'site'
            };


            if (options.id) {
                data.regionId = options.id;
            }
            else {
                throw 'Parameter id not provided in method regionSettings';
            }
            if (options.success) {
                data.success = options.success;
            }
            if (options.error) {
                data.error = options.error;
            }
            if (options.denied) {
                data.denied = options.denied;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/AppSettings.aspx',
                data: data
            });

            return $this;
        },
        track: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var deferred = $.Deferred();
            $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Track.aspx',
                data: {
                    trackingId: options.trackId,
                    session: _plugin.settings.session
                },
                dataType: 'jsonp',
                timeout: _plugin.settings.timeout,
                success: function (data) {
                    if (data.Status == 'OK') {
                        if (data.Result) {
                            switch (data.Result.Status) {
                                case 'InProgress':
                                    setTimeout(function () {
                                        $.insmFramework('track', options);
                                    }, 1000);
                                    break;
                                case 'NotStarted':
                                    setTimeout(function () {
                                        $.insmFramework('track', options);
                                    }, 2000);
                                    break;
                                case 'OK':
                                    _plugin.data.timestamp = data.Timestamp;
                                    $.insmFramework('callback', {
                                        result: data.Result.Result,
                                        params: options.data
                                    });
                                    options.iframe.remove();
                                    deferred.resolve();
                                    break;
                                case 'Error':
                                    $.insmFramework('callback', {
                                        result: data.Result.Result,
                                        params: options.data
                                    });
                                    options.iframe.remove();
                                    deferred.resolve();
                                    break;
                                default:

                                    break;
                            }
                        }
                    }
                    else if (data.Status == 'Error') {
                        $.insmFramework('callback', {
                            result: data.Result.Result,
                            params: options.data
                        });
                        return;
                    }
                    else if (data.Status == 'Denied') {
                        $.insmFramework('callback', {
                            result: data,
                            params: options.data
                        });
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $.insmFramework('callback', {
                        result: {
                            Status: 'Error',
                            Message: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                        },
                        params: options.data
                    });
                }
            });

            return deferred;
        },
        ajax: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');


            $.extend(options.data, {
                session: _plugin.settings.session,
                format: 'json'
            });


            var callbacks = {
                success: options.data.success,
                error: options.data.error,
                denied: options.data.denied
            };

            if (!callbacks.success || !callbacks.error || !callbacks.denied) {
                $.insmNotification({
                    type: 'error',
                    text: 'Required callbacks not defined'
                });
                return $this;
            }

            delete options.data.success;
            delete options.data.error;
            delete options.data.denied;

            var urlLength = JSON.stringify(options.data).length + options.url.length;

            if (urlLength > 1000) {
                var trackingId = new Date().getTime();
                $.extend(options.data, {
                    trackingId: trackingId
                });

                var iframe = $('<iframe name="guid' + _guid + '" ></iframe>').css({
                    display: 'none'
                }).appendTo('body');
                
                
                // Removed because it did not work in IE8. Not sure if it was needed for something else.
                /*.append(
                    $('<html />').append(
                        $('<head />').append('<meta http-equiv="X-UA-Compatible" content="IE=9">')
                    )
                );*/

                var form = $(document.createElement('form')).css({
                    display: 'none'
                }).appendTo('body');

                // TODO: Add track ID.
                form.attr("action", options.url);
                form.attr("method", "POST");
                form.attr("enctype", "multipart/form-data");
                form.attr("encoding", "application/x-www-form-urlencoded");
                form.attr("target", "guid" + _guid++);
                $.each(options.data, function (key, value) {
                    form.append($('<input name="' + key + '" />').val(value));
                });

                form.submit();

                return $.insmFramework('track', {
                    trackId: trackingId,
                    data: callbacks,
                    iframe: iframe
                });
            }
            else {
                return $.ajax({
                    type: 'GET',
                    dataType: 'jsonp',
                    url: options.url,
                    data: options.data,
                    success: function (data) {
                        _plugin.data.timestamp = data.Timestamp;
                        $.insmFramework('callback', {
                            result: data,
                            params: callbacks
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $.insmFramework('callback', {
                            result: {
                                Status: 'Error',
                                Message: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                            },
                            params: callbacks
                        });
                    }
                });
            }
        },
        getDataset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            data.method = 'get';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.datasetId = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Dataset.aspx',
                data: data
            });

            return $this;
        },
        getEffectiveRegionDataset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');



            data.method = 'getEffective';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.regionId = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Dataset.aspx',
                data: data
            });

            return $this;
        },
        getScreenshot: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var params = {
                upid: options.upid,
                height: 48,
                session: _plugin.settings.session
            };

            var screenshot = $('<img />', {
                src: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Screenshot.aspx' + '?' + $.param(params)
            });

            return screenshot;
        },
        getLiveview: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var params = {
                upid: options.upid,
                height: 480,
                session: _plugin.settings.session
            };

            var screenshot = new Image();
            screenshot.src = _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Screenview.aspx' + '?' + $.param(params);
            return $(screenshot);
        },
        getEffectivePlayerDataset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            data.method = 'getEffective';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.UPId = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Dataset.aspx',
                data: data
            });

            return $this;
        },
        dataset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Dataset.aspx',
                data: options
            });
            return $this;
        },
        regionTree: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Diagnostics.aspx',
                data: options
            });
        },
        regionTreeNew: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (regionTree) {
                    regionTree = $.insmFramework('regionTreeDecode', regionTree, true);
                    options.success(regionTree);
                },
                denied: options.denied,
                error: options.error
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Diagnostics.aspx',
                data: data
            });
        },
        regionTreeDecode: function (region, ignoreAccess) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (ignoreAccess === true) {
                ignoreAccess = true;
            }
            else {
                ignoreAccess = false;
            }

            if (region == null) {
                return {};
            }

            if (!ignoreAccess) {
                if (!_plugin.settings.user.admin) {
                    if (region.AccessRights && region.AccessRights[_plugin.settings.user.name]) {
                        if ($.inArray(region.AccessRights[_plugin.settings.user.name].Content, ['Read', 'Write']) == -1) {
                            if (region.Regions[0]) {
                                return $.insmFramework('regionTreeDecode', region.Regions[0]);
                            }
                            else {
                                return {};
                            }
                        }
                    }
                    else {
                        if (region.Regions[0]) {
                            return $.insmFramework('regionTreeDecode', region.Regions[0]);
                        }
                        else {
                            return {};
                        }
                    }
                }
            }

            var prettyRegionTree = {
                name: region.Name,
                id: region.Id,
                tags: region.Tags,
                state: region.State,
                description: region.Description,
                children: [],
                players: {}
            }

            if (region.Regions) {
                $.each(region.Regions, function (childRegionIndex, childRegion) {
                    prettyRegionTree.children.push($.insmFramework('regionTreeDecode', childRegion, true));
                });
            }

            if (region.Players) {
                $.each(region.Players, function (playerIndex, player) {
                    prettyRegionTree.players[player.Id] = $.insmFramework('playerDecode', player);
                });
            }

            return prettyRegionTree;
        },
        regionDecode: function (region) {
            var prettyRegion = region;

            return prettyRegion;
        },
        playerDecode: function (player) {
            var prettyPlayer = {};
            var objectType = '';

            if (player.Status) {
                objectType = 'full';
            }

            switch (objectType) {
                case 'full':
                    prettyPlayer.id = player.UniquePlayerId;
                    prettyPlayer.upid = player.UniquePlayerId;
                    prettyPlayer.state = player.Status.State;
                    prettyPlayer.message = player.Status.Message;
                    prettyPlayer.ipAddress = player.IPAddress;
                    prettyPlayer.computerName = player.SystemInfo.ComputerName;
                    prettyPlayer.peer = player.SystemInfo.Peer;
                    prettyPlayer.operatingSystem = player.SystemInfo.OS;
                    prettyPlayer.version = player.SystemInfo.Version;

                    break;
                default:
                    prettyPlayer.id = player.UPId;
                    prettyPlayer.upid = player.UPId;
                    prettyPlayer.name = player.Name;
                    prettyPlayer.state = player.State;
                    prettyPlayer.message = player.Message;
                    prettyPlayer.version = player.Version;
                    prettyPlayer.description = player.Description;
                    prettyPlayer.ipAddress = player.IP;
                    prettyPlayer.port = parseInt(player.Port) || 80;

                    break;
            }

            // Format stuff better
            // Workaround since the server can't handle error states
            if (prettyPlayer.state === 'Error') {
                if (prettyPlayer.message.substring(0, 7) === 'Offline') {
                    prettyPlayer.state = 'Offline';
                }
            }

            if (prettyPlayer.state === 'Unset') {
                prettyPlayer.state = 'Unkonwn';
            }
            if (prettyPlayer.version) {
                prettyPlayer.version = prettyPlayer.version.substring(0, 3) + '.' + prettyPlayer.version.substring(11, 15);
            }
            else {
                prettyPlayer.version = 'Unknown';
            }

            return prettyPlayer;
        },
        getPluginData: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options.id) {
                throw 'plugin id not provided';
            }
            var requestParams = {
                method: 'GetPluginData',
                fileId: options.id,
                success: options.success,
                denied: options.denied,
                error: options.error
            };

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Files.aspx',
                data: requestParams
            });
        },
        getFilesInfo: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            options.Method = 'getFilesInfo';

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Files.aspx',
                data: options
            });
        },
        getMaintenanceTasks: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }
            if (!options.Method) {
                options.Method = 'get';
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: options
            });
        },
        updateMaintenanceTask: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }

            var data = {
                method: 'set',
                success: options.success,
                denied: options.denied,
                error: options.error
            };

            $.each(['name', 'intervalStart', 'intervalEnd', 'dailyIntervalStart', 'dailyIntervalEnd', 'maxRetries', 'success', 'error', 'denied', 'rebootWhenFinished', 'description', 'fileId'], function (index, value) {
                if (typeof options[value] !== 'undefined') {
                    data[value] = options[value];
                }
                else {
                    throw new Error('Missing required parameter: ' + value);
                }
            });

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: data
            });
        },
        removeMaintenanceTask: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }

            options.Method = 'remove';
            if (parseInt(options.id) < 1) {
                $.insmNotification({
                    text: 'Invalid task id: ' + options.id,
                    type: 'error'
                });
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: options
            });
        },
        assignPlayersToMaintenanceTask: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }

            var data = {};
            data.Method = 'addPlayer';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if ($.isArray(options.playerIds)) {
                data.upids = options.playerIds.join(',');
            }
            else if (typeof options.playerIds === 'string') {
                data.upids = options.playerIds;
            }
            else {
                throw new Error('Invalid format on parameter playerIds, has to be array or string');
            }

            if (!options.id) {
                throw new Error('Parameter id not provided');
            }
            else {
                if (parseInt(options.id) < 1) {
                    throw new Error('Invalid task id: ' + options.id);
                }
                data.id = options.id;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: data
            });
        },
        unassignPlayersFromMaintenanceTask: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }

            data.Method = 'removePlayer';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if ($.isArray(options.playerIds)) {
                data.upids = options.playerIds.join(',');
            }
            else if (typeof options.playerIds === 'string') {
                data.upids = options.playerIds;
            }
            else {
                throw 'Invalid format on parameter playerIds, has to be array or string';
            }

            if (!options.id) {
                throw 'Parameter id not provided';
            }
            else {
                if (parseInt(options.id) < 1) {
                    throw 'Invalid task id: ' + options.id;
                }
                data.id = options.id;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: data
            });
        },
        getMaintenanceTaskExecutions: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options) {
                options = {};
            }

            data.Method = 'getExecutions';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (!options.id) {
                throw 'Parameter id not provided';
            }
            else {
                if (parseInt(options.id) < 1) {
                    throw 'Invalid task id: ' + options.id;
                }
                data.id = options.id;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Maintenance.aspx',
                data: data
            });
        },
        directory: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            data.method = 'getDirectoryInfo';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.regionId) {
                data.regionId = options.regionId;
            }
            else {
                throw new Error('Parameter regionId not provided');
            }

            if (options.name) {
                data.contentDirectoryName = options.name;
            }
            else {
                throw new Error('Parameter name not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Files.aspx',
                data: data
            });
        },
        activityCheck: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            data.method = 'get';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.id = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            if (options.type) {
                data.type = options.type;
            }
            else {
                throw new Error('Parameter type not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Activity.aspx',
                data: data
            });
        },
        activityAdd: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {};

            data.method = 'set';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.id = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            if (options.type) {
                data.type = options.type;
            }
            else {
                throw new Error('Parameter type not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Activity.aspx',
                data: data
            });
        },
        getModuleSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: options.success,
                method: 'get',
                name: '_',
                denied: function () {
                    $.insmFramework('login', {
                        success: function () {
                            $.insmFramework('getModuleSettings', options);
                        }
                    });
                },
                error: function (message) {
                    throw new Error(message);
                }
            };

            if (options.key) {
                data.key = options.key;
            }
            if (options.namespace) {
                data.name = options.namespace;
            }
            if (options.value) {
                data.value = options.value;
                data.method = 'set';
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/ModuleSettings.aspx',
                data: data
            });

            return $this;
        },
        activityRemove: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            data.method = 'remove';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (options.id) {
                data.id = options.id;
            }
            else {
                throw new Error('Parameter id not provided');
            }

            if (options.type) {
                data.type = options.type;
            }
            else {
                throw new Error('Parameter type not provided');
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Activity.aspx',
                data: data
            });
        },
        getPlaylist: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            data.method = 'get';
            data.success = options.success;
            data.error = options.error;
            data.denied = options.denied;

            if (!options.id) {
                throw new Error('Parameter id not provided');
            }
            else {
                data.playlistId = options.id;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Playlist.aspx',
                data: data
            });
        },
        screenviewUrl: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var upid = options.upid;
            var view_id = options.view_id;
            var height = options.height;
            var viewIdCorrected = (typeof view_id != 'undefined' ? '&view=' + view_id : '');
            return _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Screenview.aspx?upid=' + upid + viewIdCorrected + (_plugin.settings.session ? '&session=' + _plugin.settings.session : '') + (height ? '&height=' + height : '') + '&app=' + _plugin.settings.app;
        },
        screenshotUrl: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var upid = options.upid;
            var display = options.display;
            var height = options.height;
            var totaldisplayheight = options.totaldisplayheight;
            
            if (display) {
                return _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Screenshot.aspx?totaldisplayheight=' + totaldisplayheight + '&cropx=' + display.X + '&cropy=' + display.Y + '&cropwidth=' + display.W + '&cropheight=' + display.H + '&upid=' + upid + (typeof height != 'undefined' ? '&height=' + height : '') + (typeof width != 'undefined' ? '&width=' + width : '') + '&cachefix=' + new Date().getTime() + (_plugin.settings.session ? '&session=' + _plugin.settings.session : '') + '&app=' + _plugin.settings.app;
            } else {
                return _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Screenshot.aspx?view=' + (typeof display != 'undefined' ? display : '0') + '&upid=' + upid + (typeof height != 'undefined' ? '&height=' + height : '') + (typeof width != 'undefined' ? '&width=' + width : '') + '&cachefix=' + new Date().getTime() + (_plugin.settings.session ? '&session=' + _plugin.settings.session : '') + '&app=' + _plugin.settings.app;
            }
        },
        activity: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            parameters = {
                session: _plugin.settings.session,
                id: options.id,
                type: options.type,
                method: options.method
            };

            callbacks = {
                success: options.success,
                error: options.error,
                denied: options.denied
            };

            return $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Activity.aspx',
                dataType: 'jsonp',
                data: parameters,
                success: function (data) {
                    $.insmFramework('callback', {
                        result: data,
                        params: callbacks
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $.insmFramework('callback', {
                        result: {
                            Status: 'Error',
                            Message: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                        },
                        params: callbacks
                    });
                }
            });
        },
        schedule: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (options.method == 'get') {
                if (!options.from) {
                    date = new Date();
                    options.from = printDate(date, "Y-m-d");
                }

                if (!options.to) {
                    date = new Date();
                    date.setDate(date.getDate() + 1);
                    options.to = printDate(date, "Y-m-d");
                }
            }

            parameters = {
                session: _plugin.settings.session,
                channelid: options.channelId,
                scheduleitemid: options.scheduleItemId,
                regionid: options.regionId,
                isrecurring: options.isRecurring,
                method: options.method,
                from: options.from,
                to: options.to,
                playlistid: options.playlistId
            };

            parameters = clearEmptyValues(parameters);

            callbacks = {
                success: options.success,
                error: options.error,
                denied: options.denied
            };

            return $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Schedule.aspx',
                dataType: 'jsonp',
                data: parameters,
                success: function (data) {
                    $.insmFramework('callback', {
                        result: data,
                        params: callbacks
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $.insmFramework('callback', {
                        result: {
                            Status: 'Error',
                            Message: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                        },
                        params: callbacks
                    });
                }
            });
        },
        playlist: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            parameters = {
                session: _plugin.settings.session,
                playlistId: options.playlistId,
                datasetId: options.datasetId,
                contentDirectoryId: options.contentDirectoryId,
                layoutId: options.layoutId,
                name: options.name,
                tags: options.tags,
                versionGroupId: options.versionGroupId,
                version: options.version,
                category: options.category,
                description: options.description,
                method: options.method,
                mediafileid: options.mediaFileId
            };

            parameters = clearEmptyValues(parameters);

            callbacks = {
                success: options.success,
                error: options.error,
                denied: options.denied
            };

            return $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Playlist.aspx',
                dataType: 'jsonp',
                data: parameters,
                success: function (data) {
                    $.insmFramework('callback', {
                        result: data,
                        params: callbacks
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $.insmFramework('callback', {
                        result: {
                            Status: 'Error',
                            Message: 'No server responding on ' + _plugin.settings.protocol + '://' + _plugin.settings.ams
                        },
                        params: callbacks
                    });
                }
            });
        },
        convert: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var url = _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Convert.aspx?session=' + _plugin.settings.session + '&app=' + _plugin.settings.app;
            $('<form action="' + url + '" method="post"><input name="mimetype" value="' + options.mimetype + '" /><input name="formkeys" value="table" /><textarea name="table">' + options.data + '</textarea><input type="text" name="filename" value="' + options.filename + '" /></form>')
                .appendTo('body')
                .submit()
                .remove();
        },
        currentUser: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (data) {
                    options.success();
                },
                denied: function () {
                    options.denied();
                },
                error: function (data) {
                    throw new Error(data.Message);
                },
                method: 'getCurrentUser'
            };

            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Users.aspx',
                data: data
            });

            return $this;
        }
    };

    $.insmFramework = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFramework');
        }
        return null;
    };
})(jQuery);


/** END OF PLUGIN **/














































































































function insmFramework(params) {
    if (typeof params.links == 'undefined') {
        params.links = {};
    }
    this.settings = {
        defaultTarget: (typeof params.target != 'undefined' ? params.target.selector : 'html'),
        app: params.app,
        ams: params.ams,
        timeout: (params.timeout ? params.timeout : 20000),
        preferLocalAPI: (typeof params.preferLocalAPI != 'undefined' ? params.preferLocalAPI : false),
        localAPITimeout: (params.localAPITimeout ? params.localAPITimeout : 5000),
        session: (params.session ? params.session : ''),
        username: params.username,
        password: params.password,
        cacheExpiretime: (params.cacheExpiretime ? params.cacheExpiretime : 2 * 1000),
        links: params.links,
        protocol: 'http'
    };
    if (params.ssl == true) {
        this.settings.protocol = 'https';
    }

    $('body').on('click', '.insm-integration-link', $.proxy(function (event) {
        var integrationTag = $(event.currentTarget).data('insm_integration_tag');
        var integrationParameters = $(event.currentTarget).data('insm_integration_parameters');
        if (integrationTag) {
            if (this.settings.links[integrationTag]) {
                if (this.settings.links[integrationTag].url) {
                    var url = this.settings.links[integrationTag].url;
                    if (integrationParameters) {
                        if (url.indexOf('?') == -1) {
                            url += '?' + integrationParameters;
                        }
                        else {
                            url += '&' + integrationParameters;
                        }
                    }
                    if (this.settings.session) {
                        if (url.indexOf('?') == -1) {
                            url += '?' + "session=" + this.settings.session;
                        }
                        else {
                            url += '&' + "session=" + this.settings.session;
                        }
                    }
                    window.location = url;
                }
            }
        }
    }, this));

    // Should only be done once, but don't know how to implement it.
    $('body').on('mouseenter', '.insm-integration-link', $.proxy(function (event) {
        var integrationTag = $(event.currentTarget).data('insm_integration_tag');
        if (integrationTag) {
            if (this.settings.links[integrationTag]) {
                if (this.settings.links[integrationTag].url) {
                    $(event.target).addClass('cursor-pointer');

                }
            }
        }
    }, this));

    this.ping = function (params) {
        var data = {
            format: 'json',
            app: this.settings.app
        };
        if (this.settings.session) {
            data.session = this.settings.session;
        }

        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Ping.aspx',
            data: data,
            dataType: 'jsonp',
            framework: this,
            timeout: this.settings.timeout,
            success: function (data) {
                this.framework.standardCallback(data, params);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                this.framework.standardErrorCallback(data);
            }
        });

        return deferred;
    };

    if (typeof (Storage) !== "undefined" && typeof sessionStorage != 'undefined') {
        this.settings.session = sessionStorage.insmFrameworkSession;
        if (!this.settings.session) {
            this.settings.session = '';
        }
    }

    //this.ping({
    //    framework: this,
    //    session: this.settings.session,
    //    success: function (data) {
    //        this.framework.settings.session = data.Session;
    //        if (typeof (Storage) !== "undefined") {
    //            sessionStorage.insmFrameworkSession = data.Session;
    //        }
    //    },
    //    denied: function (data) {
    //        this.success(data);
    //    },
    //    error: function (message) {
    //        $.insmNotification({
    //            type: 'error',
    //            text: message
    //        });
    //    }
    //});

    // On a default installation of IE9, the "Display intranet sites in Compatibility View" is checked.
    // this means that lan sites run in compability mode, and as a result breaks the javascript. 
    // IE-9 ignores the  XU-A meta tag while this box is checked. Sending the XU-A in header 
    // should fix this. http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/acf1e236-715b-4feb-8132-f88e8b6652c5/
    // ... but for now, lets try to warn the user ...
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            var versionNumber = parseFloat(RegExp.$1);
        if (typeof document.documentMode == 'undefined') {
            var text1 = "You are running Internet Explorer but we can't identify your version of the brower. \n \n";
            text1 += " This site is tested to work with IE 9. If you are running a older browser, please consider changing.";
            alert(text1);
        } else if (((document.documentMode != versionNumber && versionNumber == "9") || document.documentMode == "7") && (document.documentMode != "10" && versionNumber != "9")) {
            // document.documentMode was introduced in IE 8. Therefore documentMode == 7 means it's running in quirks-mode or compatability view...
            var text2 = "It seems like you are running the browser in quirks mode (or similar). This site is not designed for that.\n\n";
            text2 += "If you are accessing this site through an intranet you should override the ‘local intranet’ setting ";
            text2 += "by un-checking ‘Display intranet sites in Compatibility View’ at Tools -> Compatibility View Settings.";
            text2 += " You access the \"Tools\" menu by pressing the alt-key.";
            alert(text2);
        }
    }


    var _playerIpLookup = {};
    var _globalLoginFlag = false;
    var _globalLoginDeferred = new $.Deferred();

    this.standardErrorCallback = function () {
        if (typeof params.error == 'function') {
            params.error('Failed to communicate with the AMS');
        } else {
            $.insmNotification({
                type: 'error',
                text: 'Failed to communicate with the AMS',
                duration: 0
            });
        }
    };

    // ReSharper disable DuplicatingLocalDeclaration
    this.standardSuccessCallbackHandle = function (params, data) {
        if (typeof settings == 'undefined') {
            settings = {

            };
        }
        // ReSharper restore DuplicatingLocalDeclaration
        if (settings.username != data.User) {
            settings.username = data.User;
            $("#insm-version .logout").text("Logout " + settings.username);
        }

        if (params) {
            if (data.Status == "Cache") {
                if (typeof params.cache == 'function') {
                    params.cache(data.timestamp);
                }
                if (typeof params.success == 'function') {
                    params.success(data.Result);
                }
            } else if (data.Status == "OK") {
                if (typeof params.success == 'function') {
                    params.success(data.Result);
                }
            } else if (data.Status == "Error") {
                if (typeof params.error == 'function') {
                    params.error(data.Message);
                }
            } else if (data.Status == "Denied") {
                if (typeof params.denied == 'function') {
                    params.denied(data);
                }
            }
        }
    };

    this.getView = function (params) {
        var deferred = $.ajax({
            url: 'html/view/' + params.view,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    this.tuning = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Tuning.aspx?format=json' + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app,
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });
        return deferred;
    };

    this.standardCallback = function (data, callback) {
        if (data.Status == 'OK') {
            if (typeof callback.success == 'function') {
                callback.success(data);
            } else {
                $.insmNotification({
                    type: 'warning',
                    text: 'No success callback defined'
                });
            }
        } else if (data.Status == 'Warning') {
            if (typeof callback.warning == 'function') {
                callback.warning(data);
            } else {
                $.insmNotification({
                    type: 'warning',
                    text: 'No warning callback defined'
                });
            }
        } else if (data.Status == 'Error') {
            if (typeof callback.error == 'function') {
                callback.error(data.Message);
            } else {
                $.insmNotification({
                    type: 'warning',
                    text: 'No error callback defined'
                });
            }
        } else if (data.Status == 'Denied') {
            if (typeof callback.denied == 'function') {
                callback.denied(data);
            } else {
                $.insmNotification({
                    type: 'warning',
                    text: 'No denied callback defined'
                });
            }
        }
    };

    /*
     * playerList(params)
     * 
     * params:
     *   regionId
     */
    this.playerList = function (params) {
        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            view: 'playerlist',
            regionid: params.regionId,
            method: params.method
        };

        paramData = clearEmptyValues(paramData);

        $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Diagnostics.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            timeout: this.settings.timeout,
            error: function (data) {
                this.framework.standardErrorCallback(data);
            },
            success: function (data) {
                this.framework.standardCallback(data, params);
            }
        });
    };

    this.regionTree = function (params) {
        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            view: params.view,
            regionid: params.rootId,
            includeplayers: params.includePlayers
        };

        paramData = clearEmptyValues(paramData);

        if (paramData.regionid == '1') {
            //server default to root region.
            delete paramData.regionid;
        }

        return $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Diagnostics.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            timeout: this.settings.timeout,
            error: function (data) {
                this.framework.standardErrorCallback(data);
            },
            success: function (data) {
                this.framework.standardCallback(data, params);
            }
        });
    };

    // This is not used anywhere but I think that the region parser should be here so that all get the same structure
    // It will also be alot easier to get upgrade the API with a different structure. Outside of this file there should be nothing API-specific.
    this.parseRegions = function (region) {
        var framework = this;
        region.title = region.name;
        region.children = [];
        delete region.name;
        if (typeof region.regions != 'undefined') {
            $.each(region.regions, function (index, value) {
                region.children.push(framework.parseRegions(value));
            });
            delete region.regions;
        }

        return region;
    };

    this.data = function (params) {

        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            regionid: params.regionid,
            recursive: params.recursive,
            method: (typeof params.method != 'undefined' ? params.method : 'get'),
            datasetid: params.datasetId,
            datasetitem: params.datasetitem,
            value: params.value
        };

        paramData = clearEmptyValues(paramData);
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Data.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };

    this.dataset = function (params) {
        var data = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            method: params.method,
            name: params.name,
            recursive: params.recursive,
            datasetid: params.datasetId,
            removeallreferences: params.removeAllReferences,
            datasetitemkey: params.datasetItemKey,
            datasetitemtype: params.datasetItemType,
            contentdirectoryid: params.contentDirectoryId,
            contentdirectoryname: params.contentDirectoryName,
            value: params.datasetItemValue,
            upid: params.upid,
            regionid: params.regionId,
            depth: params.depth
        };
        data = clearEmptyValues(data);

        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Dataset.aspx',
            dataType: 'jsonp',
            data: data,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };

    this.command = function (params) {
        var arr = [];

        $.each(params, function (key, value) {
            if (key != 'success') {
                arr.push(key + '=' + value);
            }
        });
        var str = arr.join('&');

        var url = this.settings.protocol + '://' + this.getHost(params.upid) + '/Command.aspx?format=json&' + str + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app;

        var deferred = $.ajax({
            url: url,
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    this.screenshotUrl = function (upid, display, width, height, totaldisplayheight) {
        if (display) {
            return this.settings.protocol + '://' + this.settings.ams + '/Screenshot.aspx?totaldisplayheight=' + totaldisplayheight + '&cropx=' + display.X + '&cropy=' + display.Y + '&cropwidth=' + display.W + '&cropheight=' + display.H + '&upid=' + upid + (typeof height != 'undefined' ? '&height=' + height : '') + (typeof width != 'undefined' ? '&width=' + width : '') + '&cachefix=' + new Date().getTime() + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app;
        } else {
            return this.settings.protocol + '://' + this.settings.ams + '/Screenshot.aspx?view=' + (typeof display != 'undefined' ? display : '0') + '&upid=' + upid + (typeof height != 'undefined' ? '&height=' + height : '') + (typeof width != 'undefined' ? '&width=' + width : '') + '&cachefix=' + new Date().getTime() + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app;
        }
    };

    this.users = function (params) {

        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            method: (typeof params.method != 'undefined' ? params.method : 'get')
        };

        paramData.selectUser = params.selectUser;
        paramData.regionid = params.regionid;
        paramData.givenname = params.givenname;
        paramData.surname = params.surname;
        paramData.email = params.email;
        paramData.password = params.password;
        paramData.principalname = params.principalname;
        paramData.accesslevel = params.accesslevel;
        paramData.accesstype = params.accesstype;
        paramData.group = params.group;

        paramData = clearEmptyValues(paramData);

        return $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Users.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

    };

    this.screenviewUrl = function (player_id, view_id, height) {
        var viewIdCorrected = (typeof view_id != 'undefined' ? '&view=' + view_id : '');
        return this.settings.protocol + '://' + this.getHost(player_id) + '/Screenview.aspx?upid=' + player_id + viewIdCorrected + (this.settings.session ? '&session=' + this.settings.session : '') + (height ? '&height=' + height : '') + '&app=' + this.settings.app;
    };

    this.region = function (params) {
        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            method: (typeof params.method != 'undefined' ? params.method : 'get')
        };

        paramData.recursiveopeninghours = params.recursiveOpeningHours;
        paramData.regionid = params.id;
        paramData.name = params.name;
        paramData.description = params.description;
        paramData.parentregionid = params.parentregionid;
        paramData.removeallreferences = params.removeAllReferences;

        //TODO: This has to be changed to something more friendly
        paramData.endFriday = params.endFriday;
        paramData.endMonday = params.endMonday;
        paramData.endSaturday = params.endSaturday;
        paramData.endSunday = params.endSunday;
        paramData.endThursday = params.endThursday;
        paramData.endTuesday = params.endTuesday;
        paramData.endWednesday = params.endWednesday;
        paramData.startFriday = params.startFriday;
        paramData.startMonday = params.startMonday;
        paramData.startSaturday = params.startSaturday;
        paramData.startSunday = params.startSunday;
        paramData.startThursday = params.startThursday;
        paramData.startTuesday = params.startTuesday;
        paramData.startWednesday = params.startWednesday;

        paramData = clearEmptyValues(paramData);

        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Region.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };


    this.timestampHasExpired = function (timestamp, millisecoundsToExpire) {
        var now = (new Date()).getTime();
        if (timestamp > now) {
            framework.notfication({
                type: "failed",
                text: " Just got a timestamp from the future, please be aware that this framework does not support alternate universes were time's running backwards!"
            });
            return true;
        } else if (now - timestamp > millisecoundsToExpire) {
            return true;
        } else {
            return false;
        }
    };

    this.player = function (params) {
        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session,
            method: (typeof params.method != 'undefined' ? params.method : 'get')
        };

        paramData.id = params.id;
        paramData.upid = params.upid;
        paramData.name = params.name;
        paramData.description = params.description;
        paramData.regionid = params.regionid;
        paramData.displayLayoutId = params.displayLayoutId;
        paramData.channelLayoutId = params.channelLayoutId;
        paramData.channels = params.channels;

        paramData = clearEmptyValues(paramData);

        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Player.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }

        }, this.settings.timeout);

        return deferred;
    };

    this.channels = function (params) {

        var deferred = new $.Deferred();
        // try if we can fetch from local storage
        var cacheOn = (typeof params.cacheOn == 'undefined' ? true : params.cacheOn);
        if (localStorage && !params.key && !params.upid && cacheOn) {
            var channelsData = localStorage.getItem("channelsData");
            if (channelsData && !this.clearCache) {
                data = JSON.parse(channelsData);
                data.Status = "Cache";
                if (!this.timestampHasExpired(data.timestamp, this.settings.cacheExpiretime)) {
                    this.standardSuccessCallbackHandle(params, data);
                    deferred.resolve();
                    return deferred;
                }
            }
        }

        var paramData = {
            format: 'json',
            app: this.settings.app,
            session: this.settings.session
        };

        paramData.key = params.key;
        paramData.upid = params.upid;

        paramData = clearEmptyValues(paramData);
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Channels.aspx',
            dataType: 'jsonp',
            data: paramData,
            framework: this,
            success: function (data) {
                // save for caching in local storage
                if (data.Status == 'OK') {
                    if (localStorage) {
                        // add a timestamp
                        data.timestamp = (new Date()).getTime();
                        localStorage.setItem("channelsData", JSON.stringify(data));
                    }
                }
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };

    this.layouts = function (params) {

        var deferred = new $.Deferred();

        var dataParams = {
            method: params.method,
            types: params.types
        }

        // try if we can fetch from local storage
        var cacheOn = (typeof params.cacheOn == 'undefined' ? true : params.cacheOn);
        if (localStorage && cacheOn) {
            var layoutsData = localStorage.getItem("layoutsData");
            if (layoutsData && !this.clearCache) {
                data = JSON.parse(layoutsData);
                data.Status = "Cache";
                if (!this.timestampHasExpired(data.timestamp, this.settings.cacheExpiretime)) {
                    this.standardSuccessCallbackHandle(params, data);
                    deferred.resolve();
                    return deferred;
                }
            }
        }

        deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Layouts.aspx?format=json' + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app,
            dataType: 'jsonp',
            framework: this,
            data: dataParams,
            success: function (data) {
                // save for caching in local storage
                if (data.Status == 'OK') {
                    if (localStorage) {
                        // add a timestamp
                        data.timestamp = (new Date()).getTime();
                        localStorage.setItem("layoutsData", JSON.stringify(data));
                    }
                }
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };

    this.appSettings = function (params) {
        /* default for appSettings is to only get the apps that is relevant for a site.
        to get stuff that is relevant for a server, set role: ams!
        */
        var role = "player";
        if (params.role == "ams") {
            role = "ams";
        }

        var deferred = new $.Deferred();
        var cacheOn = (typeof params.cacheOn == 'undefined' ? true : params.cacheOn);
        // try if we can fetch from local storage
        if (localStorage && cacheOn) {
            var appSettingsData = localStorage.getItem("appSettingsData" + role);
            if (appSettingsData && !this.clearCache) {
                data = JSON.parse(appSettingsData);
                data.Status = "Cache";
                if (!this.timestampHasExpired(data.timestamp, this.settings.cacheExpiretime)) {
                    this.standardSuccessCallbackHandle(params, data);
                    deferred.resolve();
                    return deferred;
                }
            }
        }

        deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/AppSettings.aspx?format=json' + "&role=" + role + (typeof params.upid != 'undefined' ? '&upid=' + params.upid : '') + (this.settings.session ? '&session=' + this.settings.session : '') + '&app=' + this.settings.app,
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                // save for caching in local storage
                if (data.Status == 'OK') {
                    if (localStorage) {
                        // add a timestamp
                        data.timestamp = (new Date()).getTime();
                        localStorage.setItem("appSettingsData" + role, JSON.stringify(data));
                    }
                }
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (deferred.state() != 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };

    this.getCssPosition = function (target) {
        if (target == "html") {
            return {
                width: $(target).outerWidth(),
                height: $(target).outerHeight(),
                top: $(target).position().top,
                left: $(target).position().left,
                position: "fixed"
            };
        } else {
            if ($(target).position() == $(target).offset()) {
                return {
                    width: $(target).outerWidth(),
                    height: $(target).outerHeight(),
                    top: $(target).position().top,
                    left: $(target).position().left,
                    position: "absolute"
                };
            } else {
                return {
                    width: $(target).outerWidth(),
                    height: $(target).outerHeight(),
                    position: "absolute"
                };
            }
        }
    };

    this.backdrop = function (settings) {
        if (typeof settings.target == 'undefined') {
            settings.target = this.settings.defaultTarget;
        }

        if (settings.action == 'add') {
            if ($(settings.target).children('.insm-backdrop').length == 0) {
                $(settings.target).append('<div class="insm-backdrop"></div>');
                var $backdrop = $(settings.target).children('.insm-backdrop');
                $backdrop.css(this.getCssPosition(settings.target));
                var that = this;
                $(window).resize(function () {
                    $backdrop.css(that.getCssPosition(settings.target));
                });
            }
        } else if (settings.action == 'remove') {
            $(settings.target).children('.insm-backdrop').remove();
        }
    };



    this.convert = function (settings) {
        var url = this.settings.protocol + '://' + this.settings.ams + '/Convert.aspx?session=' + this.settings.session + '&app=' + this.settings.app;
        $('<form action="' + url + '" method="post"><input name="mimetype" value="' + settings.mimetype + '" /><input name="formkeys" value="table" /><textarea name="table">' + settings.data + '</textarea><input type="text" name="filename" value="' + settings.filename + '" /></form>')
            .appendTo('body')
            .submit()
            .remove();
    };

    this.splashScreenItemIdCounter = 0;
    this.splashScreenItems = {};

    this.updateSplashScreen = function (target) {
        // The backdrop will know if it already exists in the target
        this.backdrop({
            action: 'add',
            target: target
        });

        // Remove old items
        $(target).children('.insm-backdrop').empty();

        if (getObjectKeyCount(this.splashScreenItems) > 0) {
            var splashHtml = '<div class="splashscreen-items">';
            var removeBackdrop = true;
            $.each(this.splashScreenItems, function (t, items) {
                if (t == target) {
                    $.each(items, function (id, item) {
                        removeBackdrop = false;
                        splashHtml += '<div data-id="' + id + '" class="item ' + item.type + '">' + item.text + '</div>';
                    });
                }
            });
            splashHtml += '</div>';
            $(target).children('.insm-backdrop').append(splashHtml);
            if (removeBackdrop) {
                this.backdrop({
                    action: 'remove',
                    target: target
                });
            }
        }
    };

    this.notification = function (settings) {

        // Settings == 'remove'
        //
        // settings:
        // type = load | successful | information | failed
        // deffered 

        // Arguments as text:
        // text 
        // success 
        // fail

        if (settings == 'remove') {
            $('#insm-notifier-container').remove();
        } else {
            if ($('#insm-notifier-container').length == 0) {
                $('html').append('<div id="insm-notifier-container"></div>');
            }

            // lets not add a new marker if its identical!
            var ignore = false;
            $('#insm-notifier-container .insm-note').each(function () {
                if ($(this).attr("success") == settings.success && $(this).attr("fail") == settings.fail && $(this).attr("text") == settings.text) {
                    ignore = true;
                    return false;
                }
                return true;
            });
            if (ignore) {
                return;
            }

            if (settings.type == 'load') {
                settings.text = (typeof settings.text != 'undefined' ? settings.text : 'Updating...');
                settings.success = (typeof settings.success != 'undefined' ? settings.success : 'Successful!');
                settings.fail = (typeof settings.fail != 'undefined' ? settings.fail : 'Failed!');
                $('#insm-notifier-container').append('<div success="' + settings.success + '" fail="' + settings.fail + '" text="' + settings.text + '" class="insm-note">' + settings.text + '<img class="float_right" src="gfx/icons/arrow_refresh.png" /></div>');
                var note = $('#insm-notifier-container .insm-note:last');
                if (typeof settings.deferred != 'undefined') {
                    $.when(settings.deferred).done(function () {
                        note.html(settings.success + ' <img class="float_right" src="gfx/icons/accept.png" />').delay(3000).animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
                        setTimeout(function () {
                            note.remove();
                        }, 4000);
                    }).fail(function () {
                        note.html(settings.fail + ' <img class="float_right" src="gfx/icons/delete.png" />').delay(3000).animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
                        setTimeout(function () {
                            note.remove();
                        }, 4000);
                    });
                } else {
                    note.delay(3000).slideUp();
                    setTimeout(function () {
                        note.remove();
                    }, 4000);
                }
            } else if (settings.type == 'successful') {
                $('#insm-notifier-container').append('<div class="insm-note" text="' + (typeof settings.text != undefined ? settings.text : 'Failed...') + '">' + (typeof settings.text != undefined ? settings.text : 'Successful!') + '<img class="float_right" src="gfx/icons/accept.png" /></div>');
                var note = $('#insm-notifier-container .insm-note:last');
                note.delay(3000).slideUp();
                setTimeout(function () {
                    note.remove();
                }, 6000);
            } else if (settings.type == 'information') {
                $('#insm-notifier-container').append('<div class="insm-note" text="' + (typeof settings.text != undefined ? settings.text : 'Failed...') + '">' + (typeof settings.text != undefined ? settings.text : '') + '<img class="float_right" src="gfx/icons/information.png" /></div>');
                var note = $('#insm-notifier-container .insm-note:last');
                note.delay(3000).slideUp();
                setTimeout(function () {
                    note.remove();
                }, 6000);
            } else if (settings.type == 'failed') {
                $('#insm-notifier-container').append('<div class="insm-note" text="' + (typeof settings.text != undefined ? settings.text : 'Failed...') + '">' + (typeof settings.text != undefined ? settings.text : 'Failed...') + '<img class="float_right" src="gfx/icons/delete.png" /></div>');
                var note = $('#insm-notifier-container .insm-note:last');
                note.delay(3000).slideUp();
                setTimeout(function () {
                    note.remove();
                }, 6000);
            }
        }
    };

    this.getHost = function (upid) {
        if (this.settings.preferLocalAPI && typeof _playerIpLookup[upid] != 'undefined') {
            return _playerIpLookup[upid] + ':81';
        } else {
            return this.settings.ams;
        }
    };

    this.populateIpLookup = function () {
        var deferred = $.Deferred();

        var framework = this;

        if (!getObjectKeyCount(_playerIpLookup)) {
            framework.notification({
                text: 'Preparing for local API connections...',
                type: 'load',
                success: 'Local API connections initialized!',
                deferred: deferred
            });

            this.diagnostics({
                view: 'playerlist',
                success: function (data) {
                    var deferredList = [];
                    var successful = 0;
                    var total = 0;
                    if (data.Status != 'Error') {
                        $.each(data.Result, function (player_id, player) {
                            total++;
                            // Ping the player and decide afterwards. Check that it has the correct UPID.
                            var url = this.settings.protocol + '://' + player.ip + ':81/Ping.aspx?format=json';
                            var jQueryCallbackRandom = new Date().getTime();
                            var request = $.ajax({
                                url: url,
                                dataType: 'jsonp',
                                timeout: this.settings.localAPITimeout,
                                jsonpCallback: "jQueryRandom_" + jQueryCallbackRandom,
                                success: function (data) {
                                    if (data.Status == 'OK' && player_id == data.UPId) {
                                        successful++;
                                        _playerIpLookup[player_id] = player.ip;
                                    } else if (player_id != data.UPId) {
                                        //TODO The upid:s do not match. Maybe this should be logged to the AMS?
                                    }
                                },
                                error: function (jqXHR, textStatus) {
                                    window["jQueryRandom_" + jQueryCallbackRandom] = function () {
                                        // Do nothing
                                    };
                                }
                            });
                            deferredList.push(request);
                        });
                    } else if (data.Status == 'Error') {
                        //TODO what?
                    }

                    $.when.apply(null, deferredList).always(function () {

                        framework.notification({
                            type: 'information',
                            text: successful + '/' + total + ' with direct connect.'
                        });

                        deferred.resolve();
                    });
                }
            });
        } else {
            deferred.resolve();
        }

        return deferred;
    };

    var popupBoxIdCounter = 0;

    this.popupBox = function (settings) {
        var popupbox = "";
        if (settings.action == 'remove') {
            $('#insm-popup-container').children('.insm-popupbox').each(function () {
                if ($(this).attr('data-id') == settings.popupId) {
                    $(this).remove();
                }
                if ($('#insm-popup-container .insm-popupbox').length == 0) {
                    $('#insm-popup-container').remove();
                }
            });
            return null;
        } else if (settings.action == 'add') {
            var framework = this;
            var popupboxId = popupBoxIdCounter++;

            if ($('#insm-popup-container').length == 0) {
                $('html').append('<div id="insm-popup-container"></div>');
            }

            if (settings.type == 'url') {
                $.ajax({
                    url: settings.url,
                    dataType: 'html',
                    success: function (html) {
                        popupbox = '<div class="insm-popupbox" data-id="' + popupboxId + '">' + html + '</div>';
                        $('#insm-popup-container').append(popupbox);

                        if (typeof settings.success == 'function') {
                            settings.success();
                        }
                    },
                    error: function (jqXHR, textStatus, message) {
                        framework.splashScreen({
                            target: target,
                            type: 'error',
                            text: 'Error: ' + message
                        });
                    }
                });
            }

            return popupboxId;
        }
        return null;
    };

    this.logout = function () {
        var framework = this;
        var logoutDeferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Login.aspx',
            data: {
                logout: 'true',
                app: urlEncode(this.settings.app),
                session: (this.settings.session != null && this.settings.session != '' ? this.settings.session : '')
            },
            dataType: 'jsonp',
            success: function (data) {
                //                window.location = window.location;
                framework.login({
                    type: data.Type,
                    target: data.Target,
                    version: data.Version
                });
                return;
                //                framework.settings.username = '';
                //                framework.settings.password = '';
                //                var authNotificationHandle = $.insmNotification({
                //                    type: 'unauthorized',
                //                    text: 'Authentication Required',
                //                    duration: 0
                //                });
                //                framework.login({
                //                    type: data.Type,
                //                    target: data.Target,
                //                    version: data.Version
                //                }).done(function () {
                //                    authNotificationHandle.update({
                //                        type: 'successfull',
                //                        text: 'Authentication successful'
                //                    });
                //                });
            }
        });

        return logoutDeferred;
    };

    //    this.logout = function (params) {
    //        $.ajax({
    //            url: this.settings.protocol + '://' + this.settings.ams + '/Login.aspx?logout=true',
    //            dataType: 'jsonp',
    //            framework: this,
    //            success: function (data) {
    //                this.framework.login();
    //            }
    //        });
    //        return;

    //        if (_loggingIn) {
    //            return new $.Deferred().reject();
    //        }
    //        else {
    //            _loggingIn = true;
    //        }

    //        if (typeof params != 'object') {
    //            params = {};
    //        }

    //        jQuery.support.cors = true;

    //        var deferred = $.Deferred();

    //        var framework = this;

    //        var popupboxId = framework.popupBox(
    //        {
    //            action: 'add',
    //            type: 'url',
    //            url: 'html/login.html',
    //            success: function () {
    //                $('#insm-login-form input.username').focus();
    //                framework.notification({
    //                    type: 'information',
    //                    text: 'Authentication requested by AMS'
    //                });
    //                $('#insm-login-form').submit(function (e) {
    //                    e.preventDefault();
    //                    framework.settings.username = urlDecode($('#insm-login-form input.username').val());
    //                    var login = $.Deferred();
    //                    $.ajax({
    //                        url: this.settings.protocol + '://' + framework.settings.ams + '/Login.aspx?username=' + urlDecode($('#insm-login-form input.username').val()) + '&password=' + urlDecode($('#insm-login-form input.password').val()) + '&app=' + framework.settings.app + (framework.settings.session != null && framework.settings.session != '' ? '&session=' + framework.settings.session : ''),
    //                        dataType: 'jsonp',
    //                        success: function (data) {
    //                            if (data.Status == "OK") {
    //                                framework.settings.username = data.User;
    //                                $("#insm-version a.logout").html("Logout " + settings.username);

    //                                framework.settings.session = data.Session;
    //                                login.resolve();

    //                                if (framework.settings.preferLocalAPI) {
    //                                    var d = framework.populateIpLookup();
    //                                    $.when(d).done(function () {
    //                                        deferred.resolve();
    //                                    });
    //                                }
    //                                else {
    //                                    deferred.resolve();
    //                                }
    //                                framework.popupBox({
    //                                    action: 'remove',
    //                                    popupId: popupboxId
    //                                });
    //                            }
    //                            else {
    //                                login.reject();
    //                            }
    //                        }
    //                    });

    //                    framework.notification({
    //                        type: 'load',
    //                        text: 'Authenticating...',
    //                        success: 'Authentication successful',
    //                        fail: 'Authentication failed',
    //                        deferred: login
    //                    });

    //                    login.done(function () {
    //                        framework.popupBox({
    //                            action: 'remove'
    //                        });
    //                    });

    //                    login.fail(function () {
    //                        // Add a red flash effect on borders?
    //                        $('#insm-login-form input.username').focus().val('');
    //                        $('#insm-login-form input.password').val('');
    //                    });

    //                    return false;
    //                });
    //            }
    //        }, $("html"), "login");

    //        deferred.always(function () {
    //            _loggingIn = false;
    //        });

    //        return deferred;
    //    }

    this.login = function (amsInfo) {
        var framework = this;

        //checkLogin will just call the Login.aspx to verify the session
        // so use this.login with checkLogin first and if your denied callback is run do a regular login call.
        // As of 2013-02-27 a good example of this exists in the insmMenu plugin.
        if (amsInfo.checkLogin) {
            return $.ajax({
                url: framework.settings.protocol + '://' + framework.settings.ams + '/Login.aspx?' + 'app=' + framework.settings.app + (framework.settings.session != null && framework.settings.session != '' ? '&session=' + framework.settings.session : ''),
                dataType: 'jsonp',
                timeout: framework.settings.timeout,
                success: function (data) {
                    if (data.Status == "OK") {
                        amsInfo.callbacks.success();
                    } else if (data.Status == "Error") {
                        amsInfo.callbacks.error(data.Message);
                    } else {
                        amsInfo.callbacks.denied(data);
                    }
                }
            });
        }
        if (_globalLoginFlag) {
            return _globalLoginDeferred;
        } else {
            _globalLoginDeferred = new $.Deferred();
            _globalLoginFlag = true;
        }

        if (typeof amsInfo != 'object') {
            $.insmNotification({
                type: 'information',
                text: 'No AMS information when calling framework.login'
            });
            amsInfo = null;
        }



        //        $.ajax({
        //            url: this.settings.protocol + '://' + this.settings.ams + '/Login.aspx',
        //            data: {
        //                app: urlEncode(this.settings.app),
        //                username: (typeof this.settings.username != 'undefined' && this.settings.username != '' ? this.settings.username : ''),
        //                session: (this.settings.session != null && this.settings.session != '' ? this.settings.session : ''),
        //                format: 'json'
        //            },
        //            dataType: 'jsonp',
        //            success: function (data) {
        //                if (data.Status == "Denied") {
        var header = $('<div />').addClass('header');
        var loginForm = $('<div class="insm-overlay" />')
                        .appendTo('body')
                        .append(
                            $('<div class="insm-popupbox login-popup" />')
                            .append(
                                header.append(
                                    $('<h2 />').text('Login')
                                ),
                                '<form id="insm-login-form" action="" method="POST">\
                                    <table class="vertical no-border">\
                                        <tr><th>Username</th><td><input class="username" type="text" name="username" /></td></tr>\
                                        <tr><th>Password</th><td><input class="password" type="password" name="password" /></td></tr>\
                                        <tr><td></td><td class="align_right"><input type="submit" class="hidden" /><a class="button login">Login</a></td></tr>\
                                    </table>\
                                </form>'
                        ));
        if (amsInfo != null) {
            header.append('<div class="subtitle align_center">' + amsInfo.type + ' ' + amsInfo.target + ' ' + amsInfo.version + '</div>');
        }

        loginForm.find('input[type="text"]').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                loginForm.find('a.login').trigger('click');
                return false;
            }
            return true;
        });

        loginForm.find('input[type="password"]').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                loginForm.find('a.login').trigger('click');
                return false;
            }
            return true;
        });

        loginForm.find('a.login').click(function () {
            if (!$(this).hasClass('disabled')) {
                $(this).addClass('disabled');
                loginForm.find('input.username').attr('disabled', 'disabled');
                loginForm.find('input.password').attr('disabled', 'disabled');
                $('#insm-login-form').submit();
            }
        });
        $('#insm-login-form input.username').focus();

        loginForm.find('#insm-login-form').submit(function (e) {
            e.preventDefault();
            framework.settings.username = urlEncode($('#insm-login-form input.username').val());
            $.ajax({
                url: framework.settings.protocol + '://' + framework.settings.ams + '/Login.aspx?username=' + framework.settings.username + '&password=' + urlEncode($('#insm-login-form input.password').val()) + '&app=' + framework.settings.app + (framework.settings.session != null && framework.settings.session != '' ? '&session=' + framework.settings.session : ''),
                dataType: 'jsonp',
                timeout: framework.settings.timeout,
                success: function (data) {
                    if (data.Status == "OK") {
                        framework.settings.username = data.User;

                        $("#insm-version a.logout").html("Logout " + framework.settings.username);
                        

                        framework.settings.session = data.Session;
                        _globalLoginDeferred.resolve();
                        loginForm.remove();
                        $('#insm-version .logoutButton').html('<a class="button logout">Logout ' + data.User + '</a>');
                        $('#insm-version .logoutButton a.logout').click(function () {
                            framework.logout();
                        });
                        if (typeof amsInfo.success == 'function') {
                            amsInfo.success(data);
                        }
                    } else {
                        $.insmNotification({
                            type: 'unauthorized',
                            text: 'Invalid credentials'
                        });

                        loginForm.find('a.login').removeClass('disabled');
                        loginForm.find('input.username').removeAttr('disabled');
                        loginForm.find('input.password').removeAttr('disabled');
                        $('#insm-login-form input.username').focus().val('');
                        $('#insm-login-form input.password').val('');
                        $('#insm-login-form input')
                                        .stop(true)
                                        .css({
                                            borderTopColor: '#f00',
                                            borderRightColor: '#f00',
                                            borderBottomColor: '#f00',
                                            borderLeftColor: '#f00'
                                        })
                                        .animate({
                                            borderTopColor: '#000',
                                            borderRightColor: '#000',
                                            borderBottomColor: '#000',
                                            borderLeftColor: '#000'
                                        }, 5000);
                    }
                },
                error: function () {
                    loginForm.find('a.login').removeClass('disabled');
                    loginForm.find('input.username').attr('disabled', '');
                    loginForm.find('input.password').attr('disabled', '');
                }
            });
        });
        //                }
        //                else if (data.Status == 'OK') {
        //                    framework.settings.session = data.Session;
        //                    _globalLoginDeferred.resolve();
        //                }
        //            }
        //        });

        _globalLoginDeferred.always(function () {
            _globalLoginFlag = false;
        });

        return _globalLoginDeferred;
    };

    this.search = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Search.aspx',
            data: {
                format: 'json',
                app: this.settings.app,
                session: this.settings.session,
                text: params.text,
                tags: params.tags,
                max: params.max,
                offset: params.offset,
                entitytype: params.entitytype
            },
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    this.versionHistory = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/VersionHistory.aspx',
            data: {
                format: 'json',
                app: this.settings.app,
                session: this.settings.session,
                max: params.max,
                offset: params.offset,
                type: params.entitytype,
                id: params.id
            },
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    this.history = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/History.aspx',
            data: {
                format: 'json',
                app: this.settings.app,
                session: this.settings.session,
                upid: params.upid,
                start: params.start
            },
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    this.check = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Check.aspx',
            data: {
                format: 'json',
                app: this.settings.app,
                session: this.settings.session
            },
            dataType: 'jsonp',
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        return deferred;
    };

    // Returns the file url
    this.files = function (action, parameters, callbacks) {
        switch (action) {
            // Returns the file url                                     
            case 'getUrl':
                var url = this.settings.protocol + '://' + this.settings.ams + '/Files.aspx?session=' + this.settings.session + '&fileid=' + parameters.fileId;
                return url;
            case 'uploadFile':
                break;
            case 'deleteFile':
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'deletefile',
                        fileid: parameters.fileId
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'getPreviewInfo':

                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'getPreviewInfo',
                        fileid: parameters.fileId
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'getdirectoryinfo':
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'getdirectoryinfo',
                        regionid: parameters.regionId,
                        contentdirectoryid: parameters.contentdirectoryid,
                        includesubdirectories: parameters.includesubdirectories
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'getfilesinfo':
                return $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'getfilesinfo',
                        contentdirectoryid: parameters.contentdirectoryid,
                        type: parameters.type
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });
            case 'getFileInfo':
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'getfileinfo',
                        fileid: parameters.fileId
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'getdownloadedfilesinfo':
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'getdownloadedfilesinfo',
                        upid: parameters.upid
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'getInnerFile':
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    data: {
                        format: 'json',
                        app: this.settings.app,
                        session: this.settings.session,
                        method: 'downloadinnerfile',
                        fileid: parameters.fileId,
                        filename: parameters.innerFileName
                    },
                    dataType: 'jsonp',
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            case 'updateFile':
                parameters.format = 'json';
                parameters.app = this.settings.app;
                parameters.session = this.settings.session;
                parameters.method = 'updateFile';
                var deferred = $.ajax({
                    url: this.settings.protocol + '://' + this.settings.ams + '/Files.aspx',
                    dataType: 'jsonp',
                    data: parameters,
                    framework: this,
                    success: function (data) {
                        this.framework.standardSuccessCallbackHandle(callbacks, data);
                    }
                });

                return deferred;
            default:
                $.insmNotification({
                    type: 'error',
                    text: 'Method "' + action + '" not recognised in INSM Framework Files'
                });
                break;
        }
        return null;
    };

    this.playlog = function (params) {
        var deferred = $.ajax({
            url: this.settings.protocol + '://' + this.settings.ams + '/Playlog.aspx',
            dataType: 'jsonp',
            data: {
                format: 'json',
                app: this.settings.app,
                session: this.settings.session,
                upid: params.upid
            },
            framework: this,
            success: function (data) {
                this.framework.standardSuccessCallbackHandle(params, data);
            }
        });

        setTimeout(function () {
            if (!deferred.state() == 'resolved') {
                if (typeof params.timeout == 'function') {
                    params.timeout();
                }
            }
        }, this.settings.timeout);

        return deferred;
    };
}
