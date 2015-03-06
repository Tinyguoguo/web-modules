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
                        apiUrl: '',
                        applicationName: '',
                        version: '',
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
                        sslFlag: false
                    }
                };
                $this.data('insmFramework', _plugin);
            }

            if (location.protocol.match('^https')) {
                _plugin.data.sslFlag = true;
            }

            if (!_plugin.settings.apiUrl || !_plugin.settings.applicationName || !_plugin.settings.version) {
                throw new Error('INSM Framework not initialized correctly');
            }

            if (!!window.localStorage && typeof (Storage) !== "undefined" && !_plugin.settings.session) {
                _plugin.settings.session = localStorage.insmFrameworkSession;
                if (!_plugin.settings.session) {
                    _plugin.settings.session = '';
                }
            }

            $.insmFramework('currentUser', {
                success: function (user) {
                    _plugin.settings.user = user;

                    $.insmFramework('regionTree', {
                        success: function (regionTree) {
                            _plugin.settings.user.regionTree = regionTree;
                            _plugin.data.initialized.resolve();
                        },
                        denied: function () {

                        }
                    });
                }
            });

            return $this;
        },
        loggedIn: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if ($.isEmptyObject(_plugin.settings.user)) {
                return false;
            }
            else {
                return true;
            }
        },
        getUser: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            return _plugin.settings.user;
        },
        setUser: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            _plugin.settings.user.regionTree = options.regionTree;

            return $this;
        },
        initialized: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            if (!_plugin) {
                throw new Error('INSM Framework not initialized.');
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
                app: _plugin.settings.applicationName
            };
            if (_plugin.settings.session) {
                data.session = _plugin.settings.session;
            }

            $.ajax({
                url: _plugin.settings.apiUrl + '/Ping.aspx',
                data: data,
                dataType: 'jsonp',
                timeout: _plugin.settings.timeout,
                error: function (message) {
                    options.success = function () { };
                    throw new Error(message.statusText);
                },
                success: function (data) {
                    options.success(data);
                }
            });

            return $this;
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
                apiUrl: _plugin.settings.apiUrl,
                application: {
                    name: _plugin.settings.applicationName,
                    version: _plugin.settings.version
                }
            };
        },
        userDecode: function(user) {
            var prettyUser = {
                name: user.Username,
                admin: user.Admin,
                domain: user.Domain,
                email: user.Email,
                givenName: user.GivenName,
                surname: user.Surname
            };
            return prettyUser;
        },
        currentUser: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            options.success(_plugin.settings.user);

            return $this;
        },
        users: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: options.success,
                denied: options.denied,
                error: options.error
            };

            if (options.user) {
                data.selectUser = options.user;
            }

            $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Users.aspx',
                data: data
            });

            return $this;
        },
        getPlayers: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (players) {
                    var playerList = [];
                    // Parse the players
                    $.each(players, function (id, player) {
                        player = $.insmFramework('playerDecode', player);
                        playerList.push(player);
                    });
                    options.success(playerList);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getPlayers', options);
                },
                view: 'playerlist'
            };
            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Diagnostics.aspx',
                data: data
            });
        },
        getPlayer: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (player) {
                    // Parse the player
                    player = $.insmFramework('playerDecode', player);
                    $.insmFramework('getPlayers', {
                        success: function (players) {
                            $.each(players, function (index, p) {
                                if (p.upid == player.upid) {
                                    $.extend(player, p);
                                }
                            });
                            options.success(player);
                        }
                    });
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getPlayer', options);
                },
                upid: options.upid
            };
            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Properties.aspx',
                data: data
            });
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
        playerEncode: function (prettyPlayer) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var objectType = {};
            var player = {};

            if (prettyPlayer.Status) {
                objectType = 'full';
            }

            switch (objectType) {
                case 'full':
                    player.UniquePlayerId = prettyPlayer.id;
                    player.UniquePlayerId = prettyPlayer.upid;
                    player.Status.State = prettyPlayer.state;
                    player.Status.Message = prettyPlayer.message;
                    player.IPAddress = prettyPlayer.ipAddress;
                    player.SystemInfo.ComputerName = prettyPlayer.computerName;
                    player.SystemInfo.Peer = prettyPlayer.peer;
                    player.SystemInfo.OS = prettyPlayer.operatingSystem;
                    player.SystemInfo.Version = prettyPlayer.version;

                    break;
                default:
                    player.UPId = prettyPlayer.id;
                    player.UPId = prettyPlayer.upid;
                    player.Name = prettyPlayer.name;
                    player.State = prettyPlayer.state;
                    player.Message = prettyPlayer.message;
                    player.Version = prettyPlayer.version;

                    break;
            }

            return player;
        },
        amsSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                role: 'ams',
                success: function (settings) {
                    options.success(settings);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('amsSettings', options);
                }
            };

            if (options.key) {
                data.key = options.key;
            }

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/AppSettings.aspx',
                data: data
            });
        },
        getAssets: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                regionId: options.regionId,
                depth: 100,
                method: (options.local ? 'get' : 'getEffective'),
                success: function (dataset) {
                    var assetList = [];

                    if (typeof dataset.Items !== 'object') {
                        throw new Error('Dataset items is not an object.');
                    }

                    // Parse the assets
                    $.each(dataset.Items, function (id, item) {
                        // Validate that the item is a dataset that can be parsed as an asset
                        if (typeof item.DataSet === 'undefined') {
                            return true;
                        }
                        var dataset = item.DataSet;

                        if (!$.insmFramework('datasetIsValidAsset', {
                            dataset: dataset
                        })) {
                            return true;
                        }
                        
                        // The item can is a dataset that be parsed as an asset

                        // Decode
                        dataset = $.insmFramework('datasetDecode', dataset);
                        // Create asset
                        var asset = $.insmFramework('datasetToAsset', dataset);
                        assetList.push($.extend(true, {}, asset));
                    });

                    options.success(assetList);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getAssets', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Dataset.aspx',
                data: data
            });
        },
        datasetIsValidAsset: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var isValidAsset = true;

            // Default to no template
            if (!options.dataset.Items['Template']) {
                options.dataset.Items['Template'] = {
                    Type: 'Text',
                    Value: ''
                };
            }

            // Parse the asset
            var assetParameters = ['Content', 'Template'];
            for (var i = 0; i < assetParameters.length; i++) {
                if (typeof options.dataset.Items[assetParameters[i]] === 'undefined') {
                    isValidAsset = false;
                }
            }

            if (isValidAsset) {
                if (options.dataset.Items['Content'].Type !== 'DataSet') {
                    isValidAsset = false;
                }
                else if ($.inArray(options.dataset.Items['Template'].Type, ['Text', 'Archive', 'MediaFile']) === -1) {
                    isValidAsset = false;
                }
            }

            return isValidAsset;
        },
        getAsset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (typeof options.invalid !== 'function') {
                options.invalid = function () {

                };
            }

            var data = {
                DataSetId: options.assetId,
                depth: 100,
                invalid: options.invalid,
                success: function (dataset) {
                    if (!$.insmFramework('datasetIsValidAsset', {
                        dataset: dataset
                    })) {
                        throw new Error('Dataset with id "' + options.assetId + '" is not a valid asset');
                    }

                    // Decode
                    dataset = $.insmFramework('datasetDecode', dataset);

                    // Create asset
                    var asset = $.insmFramework('datasetToAsset', dataset);
                    options.success($.extend(true, {}, asset));
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getAsset', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Dataset.aspx',
                data: data
            });
        },
        datasetToAsset: function (dataset) {
            var asset = $.extend(true, {
                children: {},
                content: {
                    children: {}
                },
                defaultContent: false,
                duration: 10,
                orientation: 'Any',
                playUntilFinished: false,
                schedule: [],
                state: 'Available',
                template: {},
                assetType: {
                    type: 'string',
                    value: ''
                },
                url: {
                    thumbnail: '',
                    preview: ''
                },
                weight: 1
            }, dataset);
                        
            // TODO Add preview and thumbnail urls
            asset.url = {
                thumbnail: '',
                preview: ''
            };

            if (asset.children.Active && asset.children.Active.value == false) {
                asset.state = 'Unavailable';
            }
            else {
                asset.state = 'Available';
            }
            delete asset.children.Active;

            var childTransformationTable = {
                Content: 'content',
                DefaultContent: 'defaultContent',
                Duration: 'duration',
                Orientation: 'orientation',
                PlayUntilFinished: 'playUntilFinished',
                Schedule: 'schedule',
                Template: 'template',
                AssetType: 'assetType',
                Weight: 'weight'
            };

            $.each(childTransformationTable, function (datasetKey, assetKey) {
                if (typeof dataset.children[datasetKey] !== 'undefined') {
                    asset[assetKey] = dataset.children[datasetKey];
                    delete asset.children[datasetKey];
                }
            });

            if ($.isEmptyObject(asset.content)) {
                asset.content.children = {};
            }
            $.each(asset.content.children, function (key, obj) {
                if (typeof obj === 'object' && typeof obj.type !== 'undefined' && obj.type === 'dataset') {
                    asset.content.children[key] = $.insmFramework('datasetToAsset', obj);
                }
            });


            if (typeof asset.schedule.value === 'string') {
                asset.schedule = JSON.parse(asset.schedule.value);
                if (typeof asset.schedule === 'string') {
                    asset.schedule = JSON.parse(asset.schedule);
                }
            }
            
            return $.extend({}, asset);
        },
        assetToDataset: function (asset) {
            if (asset.type !== 'dataset') {
                throw new Error('Object provided cannot be interpreted as an asset.');
            }


            var dataset = $.extend(true, {
                children: {
                    Active: {
                        type: 'Boolean',
                        value: true
                    }
                }
            }, asset);
            
            if (asset.state !== 'Available') {
                dataset.children.Active.value = false;
            }
            delete dataset.state;
            
            dataset.schedule = {
                type: 'string',
                value: JSON.stringify(asset.schedule)
            };

            var childTransformationTable = {
                Content: 'content',
                DefaultContent: 'defaultContent',
                Duration: 'duration',
                Orientation: 'orientation',
                PlayUntilFinished: 'playUntilFinished',
                Schedule: 'schedule',
                Template: 'template',
                AssetType: 'assetType',
                Weight: 'weight'
            };
            // Move asset.X to dataset.children.X
            $.each(childTransformationTable, function (datasetKey, assetKey) {
                if (typeof dataset[assetKey] !== 'undefined') {
                    dataset.children[datasetKey] = dataset[assetKey];
                    delete dataset[assetKey];
                }
            });
            
            return dataset;
        },
        savePlayer: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var player = $.insmFramework('playerEncode', options.player);

            var data = {
                method: 'merge',
                value: JSON.stringify(player),
                success: function (data) {
                    options.success();
                },
                invalid: options.invalid,
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('savePlayer', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Player.aspx',
                data: data
            });
        },
        saveFile: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var file = $.insmFramework('fileEncode', options.file);
            var data = {
                method: 'mergeFile',
                value: JSON.stringify(file),
                success: function () {
                    options.success();
                },
                invalid: options.invalid,
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('saveFile', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        saveAsset: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            
            // Reformat to platform asset structure
            // We should edit a copy of the object and not the reference

            options.asset = $.extend(true, {}, options.asset);

            var dataset = $.insmFramework('assetToDataset', options.asset);
            dataset = $.insmFramework('datasetEncode', dataset);
            
            var data = {
                method: 'set',
                datasetId: dataset.Id,
                removeAllReferences: false,
                recursive: true,
                value: JSON.stringify(dataset),
                success: function () {
                    options.success();
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('saveAsset', options);
                }
            };

            if (!dataset.Id) {
                delete data.datasetId;
                data.regionId = options.regionId;
                data.datasetItemKey = $.insmUtilities('generateGuid');
                data.datasetItemType = 'DataSet';
            }

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Dataset.aspx',
                data: data
            });
        },
        datasetDecode: function (dataset) {
            var prettyDataset = {
                id: dataset.Id,
                name: dataset.Name,
                creator: dataset.Creator,
                creationDate: dataset.CreationDate,
                modifier: dataset.Modifier,
                modificationDate: dataset.ModificationDate,
                type: 'dataset',
                children: {}
            };

            dataset = $.extend({
                Items: {}
            }, dataset);

            var attributesTranslation = {
                Cols: 'cols',
                Rows: 'rows',
                Type: 'type',
                Min: 'min',
                Max: 'max',
                Name: 'name',
                FileName: 'fileName',
                FilePath: 'filePath',
                Size: 'size',
                Ref: 'ref',
                Order: 'order',
                Id: 'id',
                Highlight: 'highlight',
                Visible: 'visible',
                TypeGroup: 'typeGroup',
                ListItems: 'listItems',   //Pipe (|) separated list of items for DataSetItemType Selection
                Dimension: 'dimension',
                Folder: 'folder',
                Readonly: 'readOnly',
                ShowInPreview: 'showInPreview',
                MaxWidth: 'maxWidth',
                MaxHeight: 'maxHeight'
            };

            $.each(dataset.Items, function (key, item) {
                switch (item.Type) {
                    case 'DataSet':
                        if (item.DataSet) {
                            prettyDataset.children[key] = $.insmFramework('datasetDecode', item.DataSet);
                        }
                        else {
                            // Empty dataset
                            prettyDataset.children[key] = {};
                        }
                        break;
                    case 'Boolean':
                        prettyDataset.children[key] = {
                            type: 'boolean',
                            value: (item.Value === 'True' ? true : false)
                        };
                        break;
                    case 'Text':
                    case 'Numeric':
                        prettyDataset.children[key] = {
                            type: 'string',
                            value: item.Value
                        };
                        break;
                    case 'Image':
                    case 'Movie':
                    case 'MediaFile':
                        prettyDataset.children[key] = {
                            type: 'file',
                            id: item.FileId
                        };
                        break;
                    case 'Archive':
                        prettyDataset.children[key] = {
                            type: 'archive',
                            id: item.FileId
                        };
                        break;
                    default:
                        throw new Error('Unknown dataset type "' + item.Type + '"');
                        break;
                }

                prettyDataset.children[key].attributes = {};
                if(item.Attributes){
                    $.each(attributesTranslation, function (platformName, jsName) {
                        if (item.Attributes[platformName]) {
                            prettyDataset.children[key].attributes[jsName] = item.Attributes[platformName];
                        }
                    });
                }
            });
            return prettyDataset;
        },
        datasetEncode: function (obj) {
            var dataset = {
                Id: obj.id,
                Name: obj.name,
                Creator: obj.creator,
                CreationDate: obj.creationDate,
                Modifier: obj.modifier,
                ModificationDate: obj.modificationDate,
                Type: 'DataSet',
                Items: {}
            };

            if (typeof obj.children !== 'undefined') {
                $.each(obj.children, function (key, child) {
                    dataset.Items[key] = parseChild(child);
                });
            }

            function parseChild(obj) {
                var child = {};
                switch (typeof obj) {
                    case "boolean":
                        child = {
                            Type: 'Boolean',
                            Value: obj
                        }
                        break;
                    case "object":
                        if (obj.type) {
                            switch (obj.type.toLowerCase()) {
                                case 'dataset':
                                    if (typeof obj.name !== 'undefined') {
                                        child = {
                                            Type: 'DataSet',
                                            DataSetId: obj.id,
                                            Value: null,
                                            DataSet: $.insmFramework('datasetEncode', obj)
                                        }
                                    }
                                    else {
                                        child = {
                                            Type: 'DataSet',
                                            DataSetId: obj.id,
                                            Value: null
                                        }
                                    }
                                    break;
                                case "file":
                                case "mediafile":
                                    child = {
                                        Type: 'MediaFile',
                                        FileId: obj.id
                                    }
                                    break;
                                case "archive":
                                    child = {
                                        Type: 'Archive',
                                        FileId: obj.id
                                    }
                                    break;
                                case "string":
                                case "text":
                                    child = {
                                        Type: 'Text',
                                        Value: obj.value
                                    }
                                    break;
                                case "boolean":
                                    child = {
                                        Type: 'Boolean',
                                        Value: obj.value
                                    }
                                    break;
                                default:
                                    throw new Error('Dataset type "' + obj.type + '" has not been implemented');
                                    break;
                            }
                        }
                        else {
                            $.each(obj, function (key, subChild) {
                                if (key == 'children') {
                                    key = 'Items';
                                    child[key] = parseChild(subChild);
                                    child.Type = 'DataSet';
                                    child.Name = $.insmUtilities('generateGuid');
                                }
                                else {
                                    child[key] = parseChild(subChild);
                                }
                            });
                        }
                        break;
                    case 'undefined':
                        throw new Error('Dataset child is undefined');
                        break;
                    default:
                        child = {
                            Type: 'Text',
                            Value: obj.toString()
                        }
                }

                return child;
            };

            return dataset;
        },
        getFileImageUrls: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            return {
                thumbnail: _plugin.settings.apiUrl + '/Files.aspx?method=getThumbnail&fileid=' + options.id + '&session=' + _plugin.settings.session,
                preview: _plugin.settings.apiUrl + '/Files.aspx?method=getPreview&fileid=' + options.id + '&session=' + _plugin.settings.session,
                original: _plugin.settings.apiUrl + '/Files.aspx?method=downloadFile&fileid=' + options.id + '&session=' + _plugin.settings.session
            };
        },
        deleteDataset: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (!options.id) {
                throw new Error();
            }

            var data = {
                method: 'remove',
                removeAllReferences: true,
                dataSetId: options.id,
                recursive: false,
                success: function () {
                    options.success();
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('deleteDataset', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Dataset.aspx',
                data: data
            });
        },
        deleteFile: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            
            if (!options.id) {
                throw new Error();
            }

            var data = {
                method: 'deletefile',
                fileId: options.id,
                success: function () {
                    options.success();
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('deleteFile', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        getFile: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                method: 'getFilesInfo',
                fileIds: options.id,
                success: function (file) {
                    file = file.MediaFiles[0];

                    file = $.insmFramework('fileDecode', file);

                    options.success(file);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getFile', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        getTemplateData: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                method: 'getTemplateData',
                fileId: options.id,
                success: function (templateData) {
                    templateData.Template.Id = options.id;
                    options.success({
                        content: $.insmFramework('datasetDecode', templateData.Content),
                        manifest: $.insmFramework('datasetDecode', templateData.Manifest),
                        template: $.insmFramework('datasetDecode', templateData.Template)
                    });
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getTemplateData', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        getLocalFiles: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                method: 'getFilesInfo',
                success: function (files) {
                    var fileList = [];
                    $.each(files.MediaFiles, function (id, file) {
                        fileList.push($.insmFramework('fileDecode', file));
                    });

                    options.success(fileList);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getFile', options);
                }
            };

            if (options.directoryId) {
                data.contentDirectoryId = options.directoryId;
            }
            else if (options.regionId && options.directoryName) {
                data.regionId = options.regionId;
                data.contentDirectoryName = options.directoryName;
            }

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        getFiles: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                method: 'getEffectiveFilesInfo',
                success: function (files) {
                    var fileList = [];
                    $.each(files.MediaFiles, function (id, file) {
                        fileList.push($.insmFramework('fileDecode', file));
                    });

                    options.success(fileList);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getFile', options);
                }
            };

            if (options.directoryId) {
                data.contentDirectoryId = options.directoryId;
            }
            else if (options.regionId && options.directoryName) {
                data.regionId = options.regionId;
                data.contentDirectoryName = options.directoryName;
            }

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Files.aspx',
                data: data
            });
        },
        fileDecode: function (file) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            
            var fileState;
            
            if (file.Attributes.Active === 'False') {
                fileState = 'Unavailable';
            }
            else {
                fileState = 'Available';
            }

            //var endDate = new Date(file.Attributes.EndDate);
            //if (endDate instanceof Date) {
            //    var today = new Date();
            //    if (today > endDate) {
            //        fileState = 'Expired';
            //    }
            //}

            var startDate = null;
            var endDate = null;
            
            if (file.Attributes.StartDate) {
                startDate = file.Attributes.StartDate.split('T')[0];
            }
            if (file.Attributes.EndDate) {
                endDate = file.Attributes.EndDate.split('T')[0];
            }

            var prettyFile = {
                name: file.Name,
                tags: file.Tags,
                mimeType: file.MimeType,
                id: file.Id,
                creator: file.Creator,
                creationDate: file.CreationDate,
                modifier: file.Modifier,
                modificationDate: file.ModificationDate,
                size: file.Length,
                directoryId: file.ContentDirectoryId,
                state: fileState,
                startDate: startDate,
                endDate: endDate,
                type: file.FileTypeGroup,
                url: {
                    thumbnail: _plugin.settings.apiUrl + '/Files.aspx?method=getThumbnail&type=image&fileid=' + file.Id + '&session=' + _plugin.settings.session,
                    preview: _plugin.settings.apiUrl + '/Files.aspx?method=getPreview&type=image&fileid=' + file.Id + '&session=' + _plugin.settings.session,
                    original: _plugin.settings.apiUrl + '/Files.aspx?method=downloadFile&type=image&fileid=' + file.Id + '&session=' + _plugin.settings.session
                }
            };

            if (file.Attributes.Duration) {
                prettyFile.duration = file.Attributes.Duration;
            }

            // Resolution
            var resolution = ['',''];
            if (file.Attributes.Resolution) {
                resolution = file.Attributes.Resolution.split('x');
            }

            prettyFile.resolution = {
                height: resolution[1],
                width: resolution[0]
            };

            // Orientation
            prettyFile.orientation = '';
            if (file.Attributes.Orientation) {
                prettyFile.orientation = file.Attributes.Orientation;
            }

                        
            return prettyFile;
        },
        fileEncode: function (prettyFile) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var file = {
                Attributes: {}
            };

            if (prettyFile.state == 'Unavailable') {
                file.Attributes.Active = 'False';
            }

            else {
                file.Attributes.Active = 'True';
            }

            if (typeof prettyFile.startDate !== 'undefined') {
                file.Attributes.StartDate = prettyFile.startDate;
            }

            if (typeof prettyFile.endDate !== 'undefined') {
                file.Attributes.EndDate = prettyFile.endDate;
            }

            if (typeof prettyFile.name !== 'undefined') {
                file.Name = prettyFile.name;
            }

            if (typeof prettyFile.tags !== 'undefined') {
                file.Tags = prettyFile.tags;
            }

            if (typeof prettyFile.mimeType !== 'undefined') {
                file.MimeType = prettyFile.mimeType;
            }

            if (typeof prettyFile.id !== 'undefined') {
                file.Id = prettyFile.id;
            }

            if (typeof prettyFile.directoryId !== 'undefined') {
                file.ContentDirectoryId = prettyFile.directoryId;
            }

            return file;
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
                src: _plugin.settings.apiUrl + '/Screenshot.aspx' + '?' + $.param(params)
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

            var screenshot = $('<img />', {
                src: _plugin.settings.apiUrl + '/Screenview.aspx' + '?' + $.param(params)
            });

            return screenshot;
        },
        pause: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'templateCommand:pause',
                success: function () {

                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('pause', options);
                }
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: data
            });
        },
        resume: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'templateCommand:resume',
                success: function () {

                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('resume', options);
                }
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: data
            });
        },
        next: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'templateCommand:next',
                success: function () {

                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('next', options);
                }
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: data
            });
        },
        previous: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'templateCommand:previous',
                success: function () {

                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('previous', options);
                }
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: data
            });
        },
        getAvailablePlaylists: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data;
            var timeoutTimer = parseInt(new Date().getTime() + 10000);

            data = {
                command: 'templateCommand:getAvailablePlaylists',
                success: function (result) {
                    if (result) {
                        options.success(result);
                    }
                    else {
                        if (timeoutTimer > parseInt(new Date().getTime())) {
                            return $.insmFramework('ajax', {
                                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                                data: $.extend(true, {}, data)
                            });
                        }
                        else {
                            options.error();
                            return false;
                        }
                    }
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getAvailablePlaylists', options);
                },
                error: function () {
                    
                }
            };

            if (typeof options.error == 'function') {
                data.error = options.error;
            }

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: $.extend(true, {}, data)
            });
        },
        getActivePlaylist: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data;

            data = {
                command: 'templateCommand:getActivePlaylist',
                success: function (result) {
                    //GetCommandInfo                    
                    if (result) {
                        options.success(result);
                    }
                    else {
                        return $.insmFramework('ajax', {
                            url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                            data: $.extend(true, {}, data)
                        });
                    }
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('getActivePlaylist', options);
                },
                error: function () {
                    
                }
            };

            if (typeof options.error == 'function') {
                data.error = options.error;
            }

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;
            
            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: $.extend(true, {}, data)
            });
        },
        changePlaylist: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var data = {
                command: 'templateCommand:playTemporaryPlaylist',
                success: options.success,
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('changePlaylist', options);
                },
                error: function () {

                }
            };

            if (typeof options.error == 'function') {
                data.error = options.error;
            }

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            if (!options.playlist) {
                throw new Error('Missing parameter "playlist".');
            }
            data.value = options.playlist;

            return $.insmFramework('ajax', {
                url: (options.playerIp ? (_plugin.data.sslFlag ? 'https://' : 'http://') + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
                data: $.extend(true, {}, data)
            });
        },
        getPlayingChannel: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'getPlayingChannels',
                success: function (data) {
                    options.success(data);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('changeChannel', options);
                },
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Command.aspx',
                data: data
            });
        },
        changeChannel: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                command: 'changeChannel',
                success: options.success,
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('changeChannel', options);
                },
            };

            if (!options.playerId) {
                throw new Error('Missing parameter "playerId".');
            }
            data.upid = options.playerId;
            if (!options.channel) {
                throw new Error('Missing parameter "channel".');
            }
            data.value = options.channel;

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Command.aspx',
                data: data
            });
        },
        systemData: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (systemData) {
                    options.success(systemData);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('systemData', options);
                },
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Tuning.aspx',
                data: data
            });
        },
        regionTree: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: function (regionTree) {
                    regionTree = $.insmFramework('regionTreeDecode', regionTree);
                    options.success(regionTree);
                },
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('regionTree', options);
                }
            };

            return $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl + '/Diagnostics.aspx',
                data: data
            });
        },
        regionTreeDecode: function (region, ignoreAccess) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (ignoreAccess) {
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
                            return $.insmFramework('regionTreeDecode', region.Regions[0]);
                        }
                    }
                    else {
                        return $.insmFramework('regionTreeDecode', region.Regions[0]);
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
        regionDecode: function(region) {
            var prettyRegion = region;
            
            return prettyRegion;
        },
        moduleSettings: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {
                success: options.success,
                method: 'get',
                name: '_',
                denied: function () {
                    // Just do it again and we should land in the success callback next time
                    $.insmFramework('moduleSettings', options);
                },
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
                url: _plugin.settings.apiUrl + '/ModuleSettings.aspx',
                data: data
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
                url: _plugin.settings.apiUrl + '/Statistics.aspx',
                data: options
            });

            return $this;
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
                denied: options.data.denied,
                invalid: options.data.invalid,
                warning: options.data.warning,
                error: options.data.error
            };

            if (!callbacks.success || !callbacks.denied) {
                throw new Error('Required callbacks not defined');
            }

            var restartOptions = $.extend({}, options);
            // Retry callback
            callbacks.retry = function (message) {
                if (confirm('The server was unable to process your request: "' + message + '" Retry?')) {
                    $.insmFramework('ajax', restartOptions);
                }
            };

            delete options.data.success;
            delete options.data.denied;
            delete options.data.invalid;
            delete options.data.warning;
            delete options.data.error;

            var urlLength = JSON.stringify(options.data).length + options.url.length;
            if (urlLength > 1000) {
                var trackingId = new Date().getTime();
                $.extend(options.data, {
                    trackingId: trackingId
                });

                var iframe = $('<iframe name="guid' + _guid + '" ></iframe>').css({
                    display: 'none'
                }).appendTo('body').append(
                    $('<html />').append(
                        $('<head />').append('<meta http-equiv="X-UA-Compatible" content="IE=9">')
                    )
                );

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
                form.remove();

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
                        _plugin.settings.user.name = data.User;
                        $.insmFramework('callback', {
                            result: data,
                            params: callbacks
                        });
                    },
                    error: function (data) {
                        $.insmFramework('callback', {
                            result: data,
                            params: callbacks
                        });
                    }
                });
            }
        },
        uploadFile: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var deferred = $.Deferred();

            options.fileInputElement.removeAttr('onchange');
            
            var iframeBody = $('<body />');
            var iframe = $('<iframe name="insm-mediaupload-iframe" id="insm-mediaupload-iframe" style="display: block"></iframe>').css({
                display: 'none'
            }).appendTo($('body').eq(0)).append(
                $('<html />').append(
                    $('<head />').append('<meta http-equiv="X-UA-Compatible" content="IE=Edge">'),
                    iframeBody
                )
            );
            //options.fileInputElement = $('<input type="text" value="test" />');
            var form = $(document.createElement('form')).css({
                display: 'none'
            }).appendTo(iframeBody);

            var properties = $.insmFramework('fileEncode', options.properties);

            var trackId = new Date().getTime();
            form.attr("action", _plugin.settings.apiUrl + '/Files.aspx?format=json&trackingid=' + trackId + '&fileName=' + properties.Name + '&regionId=' + options.regionId + '&contentDirectoryName=' + options.directoryName + '&method=uploadfile&value=' + JSON.stringify(properties) + '&session=' + _plugin.settings.session);
            form.attr("method", "POST");
            form.attr("enctype", "multipart/form-data");
            form.attr("encoding", "application/x-www-form-urlencoded");
            form.attr("target", "insm-mediaupload-iframe");
            form.append(options.fileInputElement.attr('name', 'inputfile'));
            setTimeout(function () {
                form.submit();
            }, 0);

            return $.insmFramework('trackProgress', {
                progress: options.progress,
                done: options.done,
                retry: options.retry,
                trackId: trackId,
                iframe: iframe,
                form: form
            });
        },
        trackProgress: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var deferred = $.Deferred();

            $.ajax({
                url: _plugin.settings.apiUrl + '/Track.aspx',
                data: {
                    trackingId: options.trackId,
                    session: _plugin.settings.session
                },
                dataType: 'jsonp',
                success: function (data) {
                    if (data.Status == 'OK') {
                        if (data.Result) {
                            switch (data.Result.Status) {
                                case 'InProgress':
                                    options.progress(data.Result.Progress);
                                    $.insmFramework('trackProgress', options);
                                    break;
                                case 'NotStarted':
                                    options.progress(0);
                                    $.insmFramework('trackProgress', options);
                                    break;
                                case 'OK':
                                    options.iframe.remove();
                                    options.form.remove();
                                    options.done();
                                    deferred.resolve();
                                    break;
                                case 'Error':
                                    if (data.Result.Result.StatusCode === 400) {
                                        options.retry(data.Result.Result.Message);
                                    }
                                    else {
                                        throw new Error(data.Result.Result.Message);
                                    }
                                default:

                                    break;
                            }
                        }
                    }
                    else if (data.Status == 'Denied') {
                        // TODO
                        // Find out why this happens now and then?
                        throw new Error('Response status is denied but should probably not be. Message: ' + data.Message);
                    }
                    else {
                        throw new Error(data.Message);
                    }
                }
            });

            return deferred;
        },
        track: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var deferred = $.Deferred();

            $.ajax({
                url: _plugin.settings.apiUrl + '/Track.aspx',
                data: {
                    trackingId: options.trackId,
                    session: _plugin.settings.session
                },
                dataType: 'jsonp',
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
                error: function (message) {
                    options.error(message);
                },
                timeout: function () {
                    options.timeout();
                }
            });

            return deferred;
        },
        callback: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var requiredCallbacks = ['success', 'denied'];
            $.each(requiredCallbacks, function (index, callback) {
                if (typeof options.params[callback] != 'function') {
                    throw new Error('No ' + callback + ' callback defined in INSM framework');
                }
            });

            if (!_plugin.data.target) {
                _plugin.data.type = options.result.Type;
                _plugin.data.target = options.result.Target;
                _plugin.data.version = options.result.Version;
            }

            if (!_plugin.settings.session) {
                _plugin.settings.session = options.result.Session;
            }

            if (options.result.VersionId) {
                _plugin.data.versionId = options.result.VersionId;
            }
            if (options.result) {
                if (typeof options.result.Status !== 'undefined') {
                    switch (options.result.Status.toLowerCase()) {
                        case 'ok': // Status OK
                            options.params.success(options.result.Result);
                            break;
                        case 100: // Status timeout
                        case 101: // Status deadlock
                        case 102: // Status communication failure
                        case 103: // Status overload
                            options.params.retry(options.result.Message);
                        case 202:// Status unsufficient access
                            if (typeof options.params.unauthorized === 'function') {
                                options.params.unauthorized(options.result.Message);
                            }
                            else {
                                throw new Error('Unauthorized callback missing. Message: "' + options.result.Message + '"');
                            }
                            break;
                        case 300: // Status invalid arguments
                        case 400: // Status content error
                            if (typeof options.params.invalid === 'function') {
                                options.params.invalid(options.result.Message);
                            }
                            else {
                                throw new Error('Invalid callback missing. Message: "' + options.result.Message + '"');
                            }
                            break;
                        case 'error': // Status system failure
                            if (options.params.error) {
                                options.params.error(options.result.Message);
                            }
                            else {
                                throw new Error(options.result.Message);
                            }
                            break;
                        case 'denied': // Status not logged in
                            // Login and call the denied callback afterwards
                            _plugin.data.type = options.result.Type;
                            _plugin.data.target = options.result.Target;
                            _plugin.data.version = options.result.Version;
                            _plugin.data.versionId = options.result.VersionId;
                            
                            $.insmFramework('login', {
                                success: function () {
                                    options.params.denied();
                                }
                            });
                            break;
                        default:
                            throw new Error('Status code "' + options.result.StatusCode + '" (' + options.result.Status+ ') callback is not implemented');
                    }
                } else {
                    throw new Error('Status code "' + options.result.StatusCode + '" not recognised');
                }
            }
            else {
                throw new Error('Result not set in API result');
            }
        },
        login: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            if (_plugin.data.loginFlag && _plugin.data.loginDeferred.state() === 'pending') {
                return _plugin.data.loginDeferred;
            } else {
                _plugin.data.loginDeferred = new $.Deferred();
                _plugin.data.loginFlag = true;
            }
            //$.when($.insmFramework('initialized')).done(function () {
                var usernameInput = $('<input class="username" type="text" name="username" />').val(_plugin.settings.user.name || '');
                var passwordInput = $('<input class="password" type="password" name="password" />');
                var loginButton = $('<button />').text('Login');
                var submitButton = $('<input class="hidden" type="submit" />');
                var loginForm = $('<div />').addClass('inputFields').append(
                    $('<div />').addClass('row').append(
                        $('<label />').text('Username'),
                        usernameInput
                    ),
                    $('<div />').addClass('row').append(
                        $('<label />').text('Password'),
                        passwordInput
                    )
                );
                var loginFormPopup = $.insmPopup({
                    content: $('<div class="insmLoginForm" />').append(
                        $('<div />').addClass('header').append(
                            $('<div />').addClass('logo'),
                            $('<h2 />').text('Login'),
                            $('<h3 />').text(_plugin.data.type + ' ' + _plugin.data.target + ' ' + _plugin.data.version)
                        ),
                        loginForm,
                        $('<div />').addClass('footer').append(
                            submitButton,
                            loginButton,
                            $('<h5 />').text(_plugin.settings.applicationName + ' ' + _plugin.settings.version)
                        )
                    ),
                    showCloseButton: false,
                    backdropTransparency: false
                });

                usernameInput.keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        loginButton.trigger('click');
                        return false;
                    }
                    return true;
                });
                passwordInput.keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        loginButton.trigger('click');
                        return false;
                    }
                    return true;
                });

                loginButton.click(function () {
                    if (!loginButton.is(':disabled')) {
                        loginButton.attr('disabled', 'disabled');
                        usernameInput.attr('disabled', 'disabled');
                        passwordInput.attr('disabled', 'disabled');
                        submitButton.trigger('click');

                        var username = usernameInput.val();
                        var password = passwordInput.val();

                        var data = {
                            username: username,
                            password: password,
                            app: _plugin.settings.app
                        };
                        if (_plugin.settings.session) {
                            data.session = _plugin.settings.session;
                        }

                        $.ajax({
                            url: _plugin.settings.apiUrl + '/Login.aspx',
                            data: data,
                            dataType: 'jsonp',
                            timeout: _plugin.settings.timeout,
                            success: function (data) {
                                // TODO
                                // Switch which should handle OK, Error, Warning, Denied, etc.
                                switch (data.Status.toLowerCase()) {
                                    case 'ok':
                                        if (data.Result) {
                                            _plugin.settings.user = {
                                                name: data.Result.Username
                                            };
                                        }
                                        else {
                                            _plugin.settings.user = {
                                                name: data.User
                                            };
                                        }

                                        _plugin.settings.session = data.Session;
                                        if (!!window.localStorage && typeof (Storage) !== "undefined") {
                                            localStorage.insmFrameworkSession = data.Session;
                                        }

                                    
                                        // Fetch the user's region tree
                                        $.insmFramework('regionTree', {
                                            success: function (regionTree) {
                                                _plugin.settings.user.regionTree = regionTree;

                                                _plugin.data.loginDeferred.resolve();
                                                loginFormPopup.insmPopup('close');
                                                options.success(data);
                                            }
                                        });

                                        break;
                                    case 'denied':
                                        //$.insmNotification({
                                        //    type: 'unauthorized',
                                        //    text: 'Invalid credentials'
                                        //});

                                        //loginForm.find('a.login').removeClass('disabled');
                                        //loginForm.find('input.password').removeAttr('disabled');
                                        //$('#insm-login-form input.password').val('');
                                        //if (_plugin.settings.username) {
                                        //    $('#insm-login-form input.password').focus();
                                        //}
                                        //else {
                                        //    loginForm.find('input.username').removeAttr('disabled').focus().val('');
                                        //}


                                        usernameInput.insmHighlight({
                                            type: 'error'
                                        }).removeAttr('disabled');
                                        passwordInput.insmHighlight({
                                            type: 'error'
                                        }).val('').removeAttr('disabled');
                                        loginButton.removeAttr('disabled');
                                        passwordInput.focus();
                                        $.insmNotification({
                                            type: 'error',
                                            message: 'Wrong credentials, please try again.'
                                        });
                                        break;
                                    default:
                                        throw new Error('Login response status "' + data.Status + '" not implemented.');
                                        break;
                                }
                                if (data.Status == "OK") {

                                } else {

                                }
                            },
                            error: function (message) {
                                throw new Error(message);
                            }
                        });
                    }
                });

                if (_plugin.settings.user.name) {
                    passwordInput.focus();
                }
                else {
                    usernameInput.focus();
                }
                _plugin.data.loginDeferred.always(function () {
                    _plugin.data.loginFlag = false;
                });
            //});

            return _plugin.data.loginDeferred;
        },
        logout: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            
            var logoutDeferred = $.insmFramework('ajax', {
                url: _plugin.settings.apiUrl+ '/Login.aspx',
                data: {
                    logout: 'true',
                    success: function () {
                        _plugin.data.user = {};
                        delete _plugin.settings.session;
                        if (!!window.localStorage && typeof (Storage) !== "undefined") {
                            delete localStorage.insmFrameworkSession;
                        }
                        options.success();
                    },
                    denied: function () {

                    }
                }
            });

            return logoutDeferred;
        },
        getSession: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            return _plugin.settings.session;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            $this.data('insmFramework', null);

            return $this;
        },
        convert: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            var url = _plugin.settings.apiUrl + '/Convert.aspx?session=' + _plugin.settings.session + '&app=' + _plugin.settings.app;
            $('<form action="' + url + '" method="post"><input name="mimetype" value="' + options.mimetype + '" /><input name="formkeys" value="table" /><textarea name="table">' + options.data + '</textarea><input type="text" name="filename" value="' + options.filename + '" /></form>')
                .appendTo('body')
                .submit()
                .remove();
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
        getEntityVersion: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            return _plugin.data.versionId;
        },

        properties: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var parameters = {
                session: _plugin.settings.session,
                regionId: options.regionId
            };

            $.ajax({
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Properties.aspx',
                dataType: 'jsonp',
                data: parameters,
                success: function (data) {
                    $.insmFramework('callback', {
                        result: data,
                        params: options
                    });
                },
                error: function () {
                    // TODO: Implement
                },
                timeout: function () {
                    // TODO: Implement
                }
            });

            return $this;
        },
        files: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');
            $.insmFramework('ajax', {
                url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Files.aspx',
                data: options
            });

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
        players: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFramework');

            var data = {};

            if (options.id) {
                data.upid = options.id
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

            //$.ajax({
            //    url: _plugin.settings.protocol + '://' + _plugin.settings.ams + '/Properties.aspx',
            //    dataType: 'jsonp',
            //    data: parameters,
            //    success: function (data) {
            //        $.insmFramework('callback', {
            //            result: data,
            //            params: options
            //        });
            //    },
            //    error: function () {
            //        // TODO: Implement
            //    },
            //    timeout: function () {
            //        // TODO: Implement
            //    }
            //});

            return $this;
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
            }

            $.each(['name', 'intervalStart', 'intervalEnd', 'dailyIntervalStart', 'dailyIntervalEnd', 'retries', 'success', 'error', 'denied', 'rebootWhenFinished', 'description', 'fileId'], function (index, value) {
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
                }
            });
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

    //$.insmFramework = function (method) {
    //    return $('html').insmFramework.apply(this, arguments);
    //};
})(jQuery);
