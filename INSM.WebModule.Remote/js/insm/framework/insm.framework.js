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
					cache: {
						players: {}
					},
					locks: {
						getPlayers: {
							deferred: null,
							callbackArray: []
						}
					},
					data: {
						type: '',
						target: '',
						version: '',
						versionId: 0,
						initialized: new $.Deferred(),
						loginFlag: false,
						loginDeferred: new $.Deferred(),
						retryFlag: false
					}
				};
				$this.data('insmFramework', _plugin);
			}
			
			if (!_plugin.settings.apiUrl || !_plugin.settings.applicationName || !_plugin.settings.version) {
				throw new Error('INSM Framework not initialized correctly');
			}

			if (!_plugin.settings.apiUrl.indexOf('http://') == 0 && !_plugin.settings.apiUrl.indexOf('https://') == 0) {
				throw new Error('Invalid configuration. API URL has to start with "http://" or "https://".');
			}

			_plugin.settings.apiUrl = _plugin.settings.apiUrl.replace(/\/+$/, "");

			if (!!window.localStorage && typeof (Storage) !== "undefined" && !_plugin.settings.session) {
				_plugin.settings.session = localStorage.insmFrameworkSession;
				if (!_plugin.settings.session) {
					_plugin.settings.session = '';
				}
			}


			$.insmFramework('downloadCurrentUser', {
				success: function (user) {
					_plugin.settings.user = user;

					$.insmFramework('regionTree', {
						success: function (regionTree) {
							_plugin.settings.user.regionTree = regionTree;
							_plugin.data.initialized.resolve();
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
			$.each(user.Groups, function (index,group) {
				var groupCopy = {
					name: group.Name,
					admin: group.Admin
				}
				prettyUser.groups.push(groupCopy);
			});
			return prettyUser;
		},
		groupDecode: function (group) {
			
			var prettyGroup = {
				name: group.Name            
			};
			return prettyGroup;
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
				url: _plugin.settings.apiUrl + '/Users.aspx',
				data: data
			});

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


			if (_plugin.locks.getPlayers.deferred) {
				// We are already working on this.
				_plugin.locks.getPlayers.callbackArray.push(options.success);
				return _plugin.locks.getPlayers.deferred;
			}

			_plugin.locks.getPlayers.deferred = new $.Deferred();

			var data = {
				success: function (players) {
					_plugin.locks.getPlayers.callbackArray.push(options.success);
					var playerList = [];
					// Parse the players
					$.each(players, function (id, player) {
						player = $.insmFramework('playerDecode', player);
						playerList.push(player);
					});

					while (_plugin.locks.getPlayers.callbackArray.length > 0) {
						_plugin.locks.getPlayers.callbackArray[0](playerList);
						_plugin.locks.getPlayers.callbackArray.shift();
					}

					_plugin.locks.getPlayers.deferred.resolve();
					_plugin.locks.getPlayers.callbackArray = [];
					_plugin.locks.getPlayers.deferred = null;
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					_plugin.locks.getPlayers.deferred = null;
					$.insmFramework('getPlayers', options);
				},
				view: 'playerlist'
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Diagnostics.aspx',
				data: data
			});
		},
		getUnconfiguredPlayers: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method: 'getUnconfigured',
				success: function (result) {
					var playerList = [];
					$.each(result.Players, function (id, player) {
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
				url: _plugin.settings.apiUrl + '/Player.aspx',
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
					var parsePlayer = {};
					parsePlayer = $.insmFramework('playerDecode', player);
					$.insmFramework('getPlayerProperties', {
						playerId: parsePlayer.id,
						success: function (playerProperties) {
							$.extend(parsePlayer, playerProperties);
							$.insmFramework('getPlayers', {
								success: function (players) {
									var playerFound = false;
									$.each(players, function (index, p) {
										if (p.upid == parsePlayer.upid) {
											$.extend(parsePlayer, p);
											playerFound = true;
										}
									});
									if (playerFound) {
										options.success(parsePlayer);
									}
									else {
										options.unauthorized();
									}
								}
							});
						},
						error: function (message) {
						},
						
					});
				},
				invalid: options.invalid,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getPlayer', options);
				},
				upid: options.upid
			};

			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Player.aspx',
				data: data
			});
		},
		getPlayerProperties: function(options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (!options.playerId) {
				throw new Error('Required parameter upid');
			}

			var data = {
				success: function (player) {
					// Parse the player
					var parsePlayer = {};
					parsePlayer = $.insmFramework('playerDecode', player);
				   
					options.success(parsePlayer);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getPlayer', options);
				},
				upid: options.playerId
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Properties.aspx',
				data: data
			});
		},
		playerDecode: function (player) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var prettyPlayer = {};
			var objectType = '';

			if (player.Status) {
				objectType = 'properties';
			}
			else if (player.Type) {
				objectType = 'player'
			}

			switch (objectType) {
				case 'properties': // Objects from Properties.aspx
					prettyPlayer.id = player.UniquePlayerId;
					prettyPlayer.upid = player.UniquePlayerId;
					prettyPlayer.state = player.Status.State;
					prettyPlayer.eventId = player.Status.EventId;
					if (player.FulfilmentStatus) {
						prettyPlayer.fulfilmentState = player.FulfilmentStatus.State;
					}
					prettyPlayer.message = player.Status.Message;		
					prettyPlayer.samples = $.extend(true, {},player.Status.Samples);
					prettyPlayer.messageLog = $.extend(true, {}, player.Status.MessageLog.Log);
					prettyPlayer.ipAddress = player.IPAddress;
					prettyPlayer.computerName = player.SystemInfo.ComputerName;
					prettyPlayer.peer = player.SystemInfo.Peer;
					prettyPlayer.operatingSystem = player.SystemInfo.OS;
					prettyPlayer.version = player.SystemInfo.Version;
					prettyPlayer.monitoredProcesses = $.extend(true, {}, player.MonitoredProcesses);
					prettyPlayer.processes = $.extend(true, {}, player.Processes);
					prettyPlayer.playerViews = $.extend(true, {}, player.PlayerViews);
					prettyPlayer.eventLog = $.extend(true, {}, player.EventLog);
					prettyPlayer.plugins = $.extend(true, {}, player.Plugins);
					prettyPlayer.displayDevices = $.extend(true, {},player.DisplayDevices);
					prettyPlayer.downloadedFileIds = [];
					$.each(player.DownloadedFileIds, function (index, number) {
						prettyPlayer.downloadedFileIds.push(number);
					})
					prettyPlayer.monitors = $.extend(true, {}, player.Monitors);
					prettyPlayer.playerStatus = {
						state: player.PlayerStatus.State,
						message: player.PlayerStatus.Message,
						timestamp: player.PlayerStatus.Timestamp,
						eventId: player.PlayerStatus.EventId
					};
					prettyPlayer.status = {
						state: player.Status.State,
						message: player.Status.Message,
						timestamp: player.Status.Timestamp,
						eventId: player.Status.EventId
					};
					prettyPlayer.fulfilmentStatus = {
						state: player.FulfilmentStatus.State,
						message: player.FulfilmentStatus.Message,
						eventId: player.FulfilmentStatus.EventId
					};
					prettyPlayer.uptimeStatus = {
						state: player.UptimeStatus.State,
						message: player.UptimeStatus.Message,
						timestamp: player.UptimeStatus.Timestamp,
						eventId: player.UptimeStatus.EventId
						
					};
					prettyPlayer.onlineStatus = {
						state: player.OnlineStatus.State,
						message: player.OnlineStatus.Message,
						timestamp: player.OnlineStatus.Timestamp,
						eventId: player.OnlineStatus.EventId
					};
					prettyPlayer.contentStatus = {
						state: player.ContentStatus.State,
						message: player.ContentStatus.Message,
						timestamp: player.ContentStatus.Timestamp,
						eventId: player.ContentStatus.EventId

					};
					prettyPlayer.localStatus = {
						state: player.LocalStatus.State,
						message: player.LocalStatus.Message,
						timestamp: player.LocalStatus.Timestamp,
						eventId: player.LocalStatus.EventId
						
					};
					prettyPlayer.diskUsage = {
						current: player.DiskUsage.Current,
						lowerBound: player.DiskUsage.LowerBound,
						upperBound: player.DiskUsage.UpperBound,
					};
					prettyPlayer.memoryUsage = {
						current: player.MemoryUsage.Current,
						lowerBound: player.MemoryUsage.LowerBound,
						upperBound: player.MemoryUsage.UpperBound,
					};
					prettyPlayer.CPUUsage = {
						lowerBound: player.CPUUsage.LowerBound,
						samples: $.extend(true, {},player.CPUUsage.Samples)
					};
					prettyPlayer.networkUsage = {
						samples: $.extend(true, {},player.NetworkUsage.Samples),
						lowerBound: player.NetworkUsage.LowerBound,
						upperBound: player.NetworkUsage.UpperBound,
					};
					prettyPlayer.temperature = {
						lowerBound: player.Temperature.LowerBound,
						upperBound: player.Temperature.UpperBound,
						samples: $.extend(true, {}, player.Temperature.Samples)
					};
					prettyPlayer.systemInfo = {
						type: player.SystemInfo.Type,
						RCId: player.SystemInfo.RCId,
						lastUpdateOnServer: player.SystemInfo.LastUpdateOnServer,
						uptime: player.SystemInfo.Uptime,
						timeSkew: player.SystemInfo.TimeSkew,
						CPU: player.SystemInfo.CPU,
						lastUpdateOnPlayer: player.SystemInfo.LastUpdateOnPlayer

					};
					prettyPlayer.transfer = {
						version: player.Transfer.Version,
						onDemandStatus: {
							state: player.Transfer.OnDemandStatus.State,
							message: player.Transfer.OnDemandStatus.Message,
							eventId: player.Transfer.OnDemandStatus.EventId
						}
					};
					prettyPlayer.fileTransfer = player.FileTransfer;
					prettyPlayer.service = {
						keepAlive: {
							state: player.Service.KeepAlive.Status.State,
							message: player.Service.KeepAlive.Status.Message,
							timestamp: player.Service.KeepAlive.Status.Timestamp,
							eventId: player.Service.KeepAlive.Status.EventId

						},
						player: {
							state: player.Service.Player.Status.State,
							message: player.Service.Player.Status.Message,
							timestamp: player.Service.Player.Status.Timestamp,
							eventId: player.Service.Player.Status.EventId
						},
						transfer: {
							state: player.Service.Transfer.Status.State,
							message: player.Service.Transfer.Status.Message,
							timestamp: player.Service.Transfer.Status.Timestamp,
							eventId: player.Service.Transfer.Status.EventId
						},
						maintenance: {
							state: player.Service.Maintenance.Status.State,
							message: player.Service.Maintenance.Status.Message,
							timestamp: player.Service.Maintenance.Status.Timestamp,
							eventId: player.Service.Maintenance.Status.EventId
						},
						diagnostics: {
							state: player.Service.Diagnostics.Status.State,
							message: player.Service.Diagnostics.Status.Message,
							timestamp: player.Service.Diagnostics.Status.Timestamp,
							eventId: player.Service.Diagnostics.Status.EventId
						},
						report: {
							state: player.Service.Report.Status.State,
							message: player.Service.Report.Status.Message,
							timestamp: player.Service.Report.Status.Timestamp,
							eventId: player.Service.Report.Status.EventId
						},
						server: {
							state: player.Service.Server.Status.State,
							message: player.Service.Server.Status.Message,
							timestamp: player.Service.Server.Status.Timestamp,
							eventId: player.Service.Server.Status.EventId
						},
						web: {
							state: player.Service.Web.Status.State,
							message: player.Service.Web.Status.Message,
							timestamp: player.Service.Web.Status.Timestamp,
							eventId: player.Service.Web.Status.EventId
						}
					};
					break;
				case 'player': // Objects from Player.aspx
					prettyPlayer.id = player.UPId;
					prettyPlayer.upid = player.UPId;
					prettyPlayer.name = player.Name;
					prettyPlayer.version = player.Version;
					prettyPlayer.ipAddress = player.IPAddress;
					prettyPlayer.port = parseInt(player.Port) || 80;
					prettyPlayer.region = {
						id: player.RegionId
					}
					prettyPlayer.displayLayout = $.extend(true, {},player.DisplayLayout);
					prettyPlayer.channelLayout = $.extend(true, {},player.ChannelLayout);
					prettyPlayer.channels = player.Channels;
					/*prettyPlayer.screenLayout = {
						name: 'Landscape',
						resolution: {
							width: 1920,
							height: 1080
						},
						displayLayoutId: 1,
						channelLayoutId: 1,
						channelId: 1
					}*/

					break;
				default: // Objects from Diagnostics.aspx
					prettyPlayer.id = player.UPId;
					prettyPlayer.upid = player.UPId;
					prettyPlayer.name = player.Name;
					prettyPlayer.state = player.State;
					prettyPlayer.eventId = player.EventId;
					prettyPlayer.fulfilmentState = player.Fulfilment;
					prettyPlayer.message = player.Message || "";
					prettyPlayer.version = player.Version;
					prettyPlayer.description = player.Description;
					prettyPlayer.ipAddress = player.IP;
					prettyPlayer.port = parseInt(player.Port) || 80;
					if (player.RegionId) {
						prettyPlayer.region = {
							id: player.RegionId
						}
					}
					else {
						// We don't want this to happen...
						prettyPlayer.region = null;
					}

					// The screen layout should tell number of views and everything.
					prettyPlayer.displays = {};

					if (player.Displays) {
						$.each(player.Displays, function (index, display) {
							prettyPlayer.displays[index] = {
								width: display.W,
								height: display.H,
								offsetX: display.X,
								offsetY: display.Y
							};
						});
					}
					prettyPlayer.viewCount = 0;
					prettyPlayer.views = {};
					if (player.Channels) {
						$.each(player.Channels, function (index, view) {
							prettyPlayer.viewCount++;
							prettyPlayer.views[index] = {
								width: view.W,
								height: view.H,
								offsetX: view.X,
								offsetY: view.Y,
								channelName: view.Name
							};
						});
					}
					break;
			}

			// Format stuff better
			// Workaround since the server can't handle error states
			//if (prettyPlayer.state === 'Error') {
			//	if (prettyPlayer.message.substring(0, 7) === 'Offline') {
			//		prettyPlayer.state = 'Offline';
			//	}
			//}
			//if (prettyPlayer.state === 'Unset') {
			//	prettyPlayer.state = 'Unknown';
			//}
			//if (prettyPlayer.version) {
			//	prettyPlayer.version = prettyPlayer.version.substring(0, 3) + '.' + prettyPlayer.version.substring(11, 15);
			//}
			//else {
			//	prettyPlayer.version = 'Unknown';
			//}

			// Update cache
			if (!_plugin.cache.players[prettyPlayer.id]) {
				_plugin.cache.players[prettyPlayer.id] = {};
			}
			
			_plugin.cache.players[prettyPlayer.id] = $.extend(true, {}, _plugin.cache.players[prettyPlayer.id], prettyPlayer);

			//return $.extend(true,{},_plugin.cache.players[prettyPlayer.id]);
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
		tmpSavePlayer: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method: 'set',
				//value: JSON.stringify(player),
				id: options.id,
				upid: options.upid,
				name: options.name,
				description: options.description,
				regionid: options.regionid,
				displayLayoutId: options.displayLayoutId,
				channelLayoutId: options.channelLayoutId,
				channels: options.channels,
				success: function (data) {
					options.success();
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('tmpSavePlayer', options);
				}
			};

			$.each(data, function (key, value) {
				if (typeof value == 'undefined') {
					delete data.key;
				}
			});

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
		saveDatasetLinkInRegion: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// Reformat to platform asset structure
			// We should edit a copy of the object and not the reference
			options.dataset = $.extend(true, {}, options.dataset);
			var data = {
				method: 'SetItems',
				removeAllReferences: false,
				//recursive: true,
				value: options.dataset.value,
				regionId: options.dataset.regionId,
				datasetItemKey: options.dataset.itemKey,
				datasetItemType: "DataSet",
				success: function (receivedMessage) {
					options.success();
				},
				error: function (message) {
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('saveDatasetLinkInRegion', options);
				}
			};
			//if (!dataset.Id) {
			//	delete data.datasetId;
			//	data.regionId = options.regionId;
			//	data.datasetItemKey = $.insmUtilities('generateGuid');
			//	data.datasetItemType = 'DataSet';
			//}
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
		getPlayerDetails: function(options) {

			_framework = $.insmFramework('getDeprecatedFramework');
			_framework.player({
				id: node.id,
				error: function (message) {
					throw new Error(message);
				},
				denied: function (data) {
					downloadInfoNotificationHandle.update({
						type: 'unauthorized',
						text: $.insmLocalization('get', 'unauthorizedMessage'),
						duration: 0
					});
					$.insmFramework('login', {
						success: function () {
							$.insmViewHandlerOld('player-view').init(node).show();
							downloadInfoNotificationHandle.update({
								type: 'successful',
								text: $.insmLocalization('get', 'loginSuccessful')
							});
						}
					});
				},
				success: function (data) {
					player = data;
		
					var playerContainer = $('<div class="float_left" />');


					var datasetInfo = $('<div class="float_left" />').css({
						marginLeft: '80px'
					});

					$('#main-column .content')
						.empty()
						.append(playerContainer)
						.append(datasetInfo);

					playerContainer.append(
						$('<h2 />').text(player.Name)
					);

					var playerData = $('<div />');
					var playerDetails = $('<div />');
					playerContainer.append(
						playerDetails.insmPlayerDetails({
							framework: _framework,
							upid: player.UPId,
							onDownload: function (player) {
								_params.states.insmLoader('destroy').insmStatusBox({
									title: "",
									status: player.Status ? player.Status.State : 'Unknown',
									tooltip: 'Please check details in Player Information'
								});
								_params.fulfilmentStates.insmLoader('destroy').insmStatusBox({
									title: "",
									status: player.FulfilmentStatus ? player.FulfilmentStatus.State : 'Unknown',
									tooltip: 'Please check details in Player Information'
								});
							}
						})
					);

					playerDetails.insmPlayerDetails('getTabContainer').insmTabs('prepend', {
						tabs: {
							player: {
								title: 'Player',
								content: playerData
							}
						}
					}).insmTabs('select', {
						index: 0
					});

					playerData.append('\
									<h4>' + $.insmLocalization('get', 'preview') + '</h4>\
								');

					var screenshot = $('<div />').insmPlayerPreview({
						upid: player.UPId
					});

					playerData.append(
						$('<div />').addClass('preview').append(
							screenshot
						)
					);

					// TODO: Clean up (some of this is MnS specific)
					var physicalLocation = '';
					if (node.region) {
						physicalLocation = node.region.split('/');
						physicalLocation = physicalLocation[physicalLocation.length - 1];
					}

					var description = player.Description.split(';');

					var locationId = '';
					var businessDescription = '';
					var technicalDescription = '';

					if (description[0]) {
						locationId = description[0];
					}
					if (description[1]) {
						businessDescription = description[1];
					}
					if (description[2]) {
						technicalDescription = description[2];
					}

					// Make sure objects exist
					if (!player.DisplayLayout) {
						player.DisplayLayout = {
							Views: {}
						};
					} else if (!player.DisplayLayout.Views) {
						player.DisplayLayout.Views = {};
					}

					// Information
					playerData
						.append('<h4>' + $.insmLocalization('get', 'info') + '</h4>')
						.append(
							$('<table />')
								.addClass('no-border vertical')
								.append(
									$('<tr />')
										.append(
										$('<th />').text('Fulfilment State:'))
										.append($('<td />').append(_params.fulfilmentStates.insmLoader())),
									$('<tr />')
										.append($('<th />').text('State:'))
										.append($('<td />').append(_params.states.insmLoader()))

								)
								//.append(
								//    $('<tr />')
								//        .append($('<th />').text('State'))
								//        .append($('<td />').append(node.state))
								//).append(
								//    $('<tr />')
								//        .append($('<th />').text('Message'))
								//        .append($('<td />').append(node.message))
								//)
								.append(
									$('<tr />')
										.append($('<th />').text($.insmLocalization('get', 'ipAdress')))
										.append($('<td />').append((node.ip ? node.ip : '')))
								)
								.append(
									$('<tr />')
										.append($('<th />').text('Location in Region Tree'))
										.append($('<td />').append(node.region))
								)
								.append(
									$('<tr />')
										.append($('<th />').text('No of Screens'))
												.append($('<td />').append(getObjectKeyCount(player.DisplayLayout.Views)))
										)
								.append(
									$('<tr />')
										.append($('<th />').text('Physical Location'))
										.append($('<td />').append(physicalLocation))
								)
								.append(
									$('<tr />')
										.append($('<th />').text('Location ID'))
										.append($('<td />').append(locationId))
								)
								.append(
									$('<tr />')
										.append($('<th />').text('Business Description'))
										.append($('<td />').append(businessDescription))
								)
								.append(
									$('<tr />')
										.append($('<th />').text('Technical Description'))
										.append($('<td />').append(technicalDescription))
								)
						);

					// Channels
					playerData
						.append('<h4>' + $.insmLocalization('get', 'layouts') + '</h4>')
						.append(
							$('<table />')
								.addClass('no-border vertical')
								.append(
									$('<tr />')
										.append($('<th />').text($.insmLocalization('get', 'displayLayout')))
										.append($('<td />').append((player.DisplayLayout !== null && typeof player.DisplayLayout.Name !== 'undefined' ? player.DisplayLayout.Name : '')))
								)
								.append(
									$('<tr />')
										.append($('<th />').text($.insmLocalization('get', 'channelLayout')))
										.append($('<td />').append((player.ChannelLayout !== null && typeof player.ChannelLayout.Name !== 'undefined' ? player.ChannelLayout.Name : '')))
								)
						)
						.append('<h4>' + $.insmLocalization('get', 'channels') + '</h4>');
					var channelTable = $('<table />').addClass('vertical no-border channels');

					$.each(player.Channels, function (index, channel) {
						channelTable.append(
							$('<tr />').append(
								$('<th />').text('Frame ' + channel.ViewNr + ' Channel')
							).append(
								$('<td />').text(channel.Name)
							)
						);
					});
					playerData.append(channelTable);
					if (plugin_settings.regionDataset && player.RegionId) {
						var inheritedDatasetKeysTable = $('<table class="no-border vertical" />');
						datasetInfo.append(
							$('<h4 />').text($.insmLocalization('get', 'inheritedDatasetKeys'))
						).append(
							inheritedDatasetKeysTable
						);

						$.insmFramework('getEffectivePlayerDataset', {
							id: player.UPId,
							error: function (message) {
								throw new Error(message);
							},
							denied: function (data) {

							},
							success: function (data) {
								for (var i = 1; i < node.depth; i++) {
									if (plugin_settings.regionDatasetFields[i]) {
										$.each(plugin_settings.regionDatasetFields[i], function (name, field) {
											var inputValue = $.extend(true, {}, field);
											if (data.Items && data.Items[name]) {
												if (data.Items[name].Value[0] == '[' || data.Items[name].Value[0] == '{') {
													inputValue.currentValue = JSON.parse(data.Items[name].Value) || [];
												}
												else {
													if (data.Items[name].Value) {
														try {
															inputValue.currentValue = JSON.parse(data.Items[name].Value);
														}
														catch (e) {
															inputValue.currentValue = data.Items[name].Value;
														}
													}
												}
											}

											inheritedDatasetKeysTable.append(
												$('<tr />').append(
													$('<th />').text(name)
												).append(
													$('<td />').append(
														$('<div />').insmInput(inputValue).insmInput('view').attr('data-key', name).addClass('inputField')
													)
												)
											);
										});
									}
								}
								$('#main-column .control-panel').fadeIn();
								$('#main-column .content').fadeIn();
								downloadInfoNotificationHandle.update({
									type: 'successful',
									text: $.insmLocalization('get', 'successfullyDownloadedInformation'),
									duration: -1
								});
							}
						});
					}
					else {
						$('#main-column .control-panel').fadeIn();
						$('#main-column .content').fadeIn();
						downloadInfoNotificationHandle.update({
							type: 'successful',
							text: $.insmLocalization('get', 'successfullyDownloadedInformation'),
							duration: -1
						});
					}
				}
			});
		},
		datasetEncode: function (obj) {
			var dataset = {
				Id: obj.id,
				RegionId: obj.regionId,
				ContentDirectoryId: obj.contentDirectoryId,
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
					$.insmFramework('getFiles', options);
				}
			};

			if (options.directoryId) {
				data.contentDirectoryId = options.directoryId;
			}
			else if (options.regionId && options.directoryName) {
				data.regionId = options.regionId;
				data.contentDirectoryName = options.directoryName;
			}
			if (options.fileIds) {
				data.fileIds =options.fileIds
			}
			if (options.method) {
				data.method = options.method
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
		saveDataset: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');


			options.dataset = $.extend(true, {}, options.dataset);

			var dataset = $.insmFramework('datasetEncode', options.dataset);

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
					$.insmFramework('saveDataset', options);
				}
			};

			if (!dataset.Id) {
				delete data.datasetId;
				// if directory id -> save new to this directory
				// else...
				if (typeof options.regionId == "undefined" || typeof options.datasetItemKey == "undefined") {
					throw new Error('Required parameters missing when saving dataset.');
				}
				data.regionId = options.regionId;
				data.datasetItemKey = options.datasetItemKey;
				data.datasetItemType = 'DataSet';
			}
			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Dataset.aspx',
				data: data
			});
		},
		saveDatasetInDirectory: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			options.dataset = $.extend(true, {}, options.dataset);
			var dataset = $.insmFramework('datasetEncode', options.dataset);
			var data = {
				method: 'set',
				datasetId: dataset.Id,
				contentDirectoryId: dataset.ContentDirectoryId,
				removeAllReferences: false,
				recursive: true,
				value: JSON.stringify(dataset),
				success: function () {
					options.success();
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('saveDatasetInDirectory', options);
				},
				error:function(message) {

				}
			};
			if (!dataset.Id) {
				delete data.datasetId;
				// if directory id -> save new to this directory
				// else...
				//if (typeof dataset.ContentDirectoryId == "undefined") {
				//    throw new Error('Required parameters missing when saving dataset.');
				//}
				
				//data.contentDirectoryId = dataset.ContentDirectoryId;
				//data.datasetItemKey = options.datasetItemKey;
				//data.datasetItemType = 'DataSet';
			}
			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Dataset.aspx',
				data: data
			});
		},
		getRegionDataset: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (typeof options.success !== 'function') {
				throw new Error('Missing success callback function');
			}

			var data = {
				success: function (dataset) {
					dataset = $.insmFramework('datasetDecode', dataset);
					options.success(dataset);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getRegionDataset', options);
				},
				depth: 100
			};

			if (!options.regionId) {
				throw new Error('Missing paramter regionId');
			}
			data.regionId = options.regionId;

			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Dataset.aspx',
				data: data
			});
		},
		getDatasetsInDirectory: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (typeof options.success !== 'function') {
				throw new Error('Missing success callback function');
			}

			var data = {
				success: function (datasets) {

					var decodedDatasets = {};
					$.each(datasets, function (key, dataset) {
						dataset = $.insmFramework('datasetDecode', dataset);
						decodedDatasets[key] = dataset;
					});
					
					options.success(decodedDatasets);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getDatasetsInDirectory', options);
				},
				depth: 100
			};

			if (!options.directoryId) {
				throw new Error('Missing paramter directoryId');
			}
			data.contentDirectoryId = options.directoryId;

			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Dataset.aspx',
				data: data
			});
		},
		saveRegionDatasetItem: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (typeof options.success !== 'function') {
				throw new Error('Missing success callback function');
			}

			var data = {
				method: 'set',
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('saveRegionDatasetItem', options);
				}
			};

			if (!options.regionId) {
				throw new Error('Missing paramter regionId');
			}
			data.regionId = options.regionId;

			if (!options.key) {
				throw new Error('Missing paramter key');
			}
			data.datasetItemKey = options.key;

			if (typeof options.value !== 'string') {
				throw new Error('Missing paramter value');
			}
			data.value = options.value;

			data.datasetItemType = 'Text';
			if (options.dataType) {
				data.datasetItemType = options.dataType;
			}

			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Dataset.aspx',
				data: data
			});
		},
		getRegion: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getRegion', options);
				}
			};

			if (!options.regionId) {
				throw new Error('Missing paramter regionId');
			}
			data.regionId = options.regionId;

			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Region.aspx',
				data: data
			});
		},
		setRegion: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method: 'set',
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getRegion', options);
				}
			};

			if (!options.regionId) {
				throw new Error('Missing paramter regionId');
			}
			data.regionId = options.regionId;

			if (!options.pluginSettings) {
				throw new Error('Missing paramter pluginSettings');
			}
			data.pluginSettings = options.pluginSettings;

			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Region.aspx',
				data: data
			});
		},
		getPluginData: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			
			var data = {
				method: 'GetPluginData',
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getPluginData', options);
				}
			};

			if (!options.id) {
				throw new Error('Missing paramter id');
			}
			data.fileId = options.id;

			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		clonePlayer: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var data = {
				upid: '',
				command: 'clonePlayer',
				value: '',
				success: function(data) {
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('clonePlayer', options);
				},
				offline: options.offline
			};

			if (!options.sourcePlayerId) {
				throw new Error('Missing parameter "sourcePlayerId".');
			}
			data.value = options.sourcePlayerId;
			if (parseInt(options.duration) > 0) {
				data.value += '|' + options.duration;
			}

			if (!options.desinationPlayerId) {
				throw new Error('Missing parameter "destinationPlayerId".');
			}
			data.upid = options.desinationPlayerId;

			return $.insmFramework('playerCommand', {
				value: data.value,
				command: 'clonePlayer',
				playerId: data.upid,
				success: options.success,
				offline: options.offline
			});
		},
		restorePlayer: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				upid: '',
				command: 'restorePlayer',
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('restorePlayer', options);
				},
				offline:options.offline
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "sourcePlayerId".');
			}
			data.upid = options.playerId;
			if (parseInt(options.duration) > 0) {
				data.value += '|' + options.duration;
			}
			return $.insmFramework('playerCommand', {
				command: 'restorePlayer',
				playerId: data.upid,
				success: options.success,
				offline: options.offline
			});
		},

		pause: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}

			return $.insmFramework('playerCommand', {
				command: 'templateCommand:pause',
				success: options.success,
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
		},
		resume: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}

			return $.insmFramework('playerCommand', {
				command: 'templateCommand:resume',
				success: options.success,
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
		},
		next: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			
			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}

			return $.insmFramework('playerCommand', {
				command: 'templateCommand:next',
				success: options.success,
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
		},
		previous: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}

			return $.insmFramework('playerCommand', {
				command: 'templateCommand:previous',
				success: options.success,
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
		},
		getVolumeState: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var volumeStateDeferred = new $.Deferred();
			var returnValue = {
				volume: 100,
				isMuted: false
			}
			//var volumeDeferred = $.insmFramework('playerCommand', {
			//    command: 'getVolume',
			//    success: function (volume) {
			//        returnValue.volume = parseFloat(volume);
			//    },
			//    playerId: options.playerId,
			//    playerIp: options.playerIp
			//});

			//var isMutedDeferred = $.insmFramework('playerCommand', {
			//    command: 'isMuted',
			//    success: function (isMuted) {
			//        if (isMuted == "False") {
			//            isMuted = false;
			//        } else {
			//            isMuted = true;
			//        }
			//        returnValue.isMuted = isMuted;
			//    },
			//    playerId: options.playerId,
			//    playerIp: options.playerIp
			//});


			var volumeDeferred = new $.Deferred();

			$.insmFramework('playerCommand', {
				command: 'getvolume',
				success: function (volume) {

					returnValue.volume = Math.round(volume * 100);
					volumeDeferred.resolve();
				},
				offline: function () {
					volumeDeferred.reject();
				},
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});

			var isMutedDeferred = new $.Deferred();

			$.insmFramework('playerCommand', {
				command: 'isMuted',
				success: function (isMuted) {

					if (isMuted == "False") {
						isMuted = false;
					} else {
						isMuted = true;
					}
					returnValue.isMuted = isMuted;
					isMutedDeferred.resolve();
				},
				offline: function () {

					isMutedDeferred.reject();
				},
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
			$.when.apply($, [volumeDeferred, isMutedDeferred]).done(function () {

				options.success(returnValue);
				volumeStateDeferred.resolve();
			}).fail(function () {
				options.error();
				volumeStateDeferred.reject();
			});

			return volumeStateDeferred;
		},
		getPlayerName: function (options) {
			// Check if systeminfo type == player
			// Get name from diagnostics.aspx and return it.
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var systemInfo = $.insmFramework('getSystemInformation');
			if (systemInfo.type != 'Player') {
				throw new Error('This function only work when the system is a player');
			} else {
				var data = {
					success: function (result) {
					   
						var name = result.Players[0].Name
						options.success(name);
					},
					denied: function () {
						$.insmFramework('getPlayerName', options);
					},
				};

				return $.insmFramework('ajax', {
					url: _plugin.settings.apiUrl + '/Diagnostics.aspx',
					data: data
				});
			}
			// else throw error
		},
		setVolume: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				command: 'setVolume',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('setVolume', options);
				},
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;

			if (!options.value) {
				throw new Error('Missing parameter "value".');
			}
			data.value = options.value;

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
			});
		},
		mute: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				command: 'mute',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('mute', options);
				},
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
			});
		},
		unmute: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				command: 'unmute',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('unmute', options);
				},
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
			});
		},
		playerCommand: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var data = {
				view: options.view || 1,
				success: function (data) {
					if (options.playerIp || _plugin.data.type == 'Player') {
						options.success(data);
						return;
					}
					var date = new Date().getTime();
					//GetCommandInfo                                
					function getProgress() {
						var progressData = {
							view: options.view || 1,
							command: options.command,
							method: 'GetCommandInfo',
							upid: options.playerId,
							denied: function () {
								throw new Error('Denied while getting progress. Platform should authenticate this request successfully.');
							},
							success: function (data) {
								if (data[options.command + ':1']) {
									if (date + 20000 < new Date().getTime()) {
										options.offline();
									}
									else if ($.inArray(data[options.command + ':1'].State, ['Pending', 'InProgress']) >= 0) {
										setTimeout(function () {
											getProgress();
										}, 1000);
									} else {
										if ($.inArray(data[options.command + ':1'].State == 'Completed')) {
											// Get actual value and run success method
											var resultData = {
												view: options.view || 1,
												command: options.command,
												method: 'GetReturnValue',
												upid: options.playerId,
												denied: function () {
													throw new Error('Denied while getting progress. Platform should authenticate this request successfully.');
												},
												success: function (data) {
													options.success(data);
												}
											};
											$.insmFramework('ajax', {
												url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
												data: resultData
											});
										} else {
											throw new Error('Command info returned an invalid state: "' + data[options.command + ':1'].State + '"');
										}
									}
								} else {
									throw new Error('Command do not exist: '+options.command);
								}
							}
						};
						$.insmFramework('ajax', {
							url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
							data: progressData
						});
					}

					getProgress();
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('playerCommand', options);
				}
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;


			if (!options.command) {
				throw new Error('Missing parameter "command".');
			}
			data.command = options.command;

			if (options.value) {
				data.value = options.value;
			}

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
			});
		},
		getAvailablePlaylists: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (_plugin.cache.players[options.playerId].views[options.view || 1].playlists) {
				options.success(_plugin.cache.players[options.playerId].views[options.view || 1].playlists);
				return;
			}

			var data = {
				view: options.view || 1,
				command: 'templateCommand:getAvailablePlaylists',
				success: function (data) {
					// If on player the command is synchronous
					if (options.playerIp || _plugin.data.type == 'Player') {
						options.success(data);
						return;
					}
					var date = new Date().getTime();
					//GetCommandInfo
					function getProgress() {
						var progressData = {
							view: options.view || 1,
							command: 'templateCommand:getAvailablePlaylists',
							method: 'GetCommandInfo',
							upid: options.playerId,
							denied: function () {
								throw new Error('Denied while getting progress. Platform should authenticate this request successfully.');
							},
							success: function (data) {

								if (date + 10000 < new Date().getTime()) {
									options.error();
								}
								if (!data['templateCommand:getAvailablePlaylists:' + (options.view || 1)]) {
									setTimeout(function () {
										getProgress();
									}, 1000);
								}
								else if ($.inArray(data['templateCommand:getAvailablePlaylists:' + (options.view || 1)].State, ['Pending', 'InProgress']) >= 0) {
									setTimeout(function () {
										getProgress();
									}, 1000);
								}
								else {
									if ($.inArray(data['templateCommand:getAvailablePlaylists:' + (options.view || 1)].State == 'Completed')) {
										// Get actual value and run success method
										var resultData = {
											view: options.view || 1,
											command: 'templateCommand:getAvailablePlaylists',
											method: 'GetReturnValue',
											upid: options.playerId,
											denied: function () {
												throw new Error('Denied while getting progress. Platform should authenticate this request successfully.');
											},
											success: function (playlists) {
												_plugin.cache.players[options.playerId].views[options.view || 1].playlists = playlists;
												options.success(playlists);
											}
										};
										$.insmFramework('ajax', {
											url: _plugin.settings.apiUrl + '/Command.aspx',
											data: resultData
										});
									}
									else {
										throw new Error('Command info returned an invalid state: "' + data['templateCommand:getAvailablePlaylists:' + (options.view || 1)].State + '"');
									}
								}
							}
						};
						$.insmFramework('ajax', {
							url: _plugin.settings.apiUrl + '/Command.aspx',
							data: progressData
						});
					}

					getProgress();
				},
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getAvailablePlaylists', options);
				}
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
			});
		},
		getPlayoutState: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');


			return $.insmFramework('playerCommand', {
				command: 'templateCommand:getCurrentPlayoutState',
				success: options.success,
				playerId: options.playerId,
				playerIp: options.playerIp,
				view: options.view || 1
			});
		},
		changePlaylist: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var data = {
				view: options.view || 1,
				command: 'templateCommand:changePlaylist',
				success: options.success,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('changePlaylist', options);
				},
			};

			if (!options.playerId) {
				throw new Error('Missing parameter "playerId".');
			}
			data.upid = options.playerId;

			if (!options.playlist) {
				throw new Error('Missing parameter "playlist".');
			}
			data.value = options.playlist + '|' + (options.duration || 0) + '|' + (options.hideScreensaver || true);

			return $.insmFramework('ajax', {
				url: (options.playerIp ? 'http://' + options.playerIp : _plugin.settings.apiUrl) + '/Command.aspx',
				data: data
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
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				success: function (regionTree) {
					// TODO: Added by india. "rowdata" is probably supposed to be "rawData" which means they use the server structure of the code. This is bad.
					// If regionTreeDecode returns incomplete data it should be added in the regionTreeDecode method instead.
					if (options.rowdata == undefined) {
						regionTree = $.insmFramework('regionTreeDecode', regionTree);
						options.success(regionTree);
					} else {
						options.success(regionTree);
					}
				},
				denied: function () {
					$.insmFramework('regionTree', options);
				}
			};

			if (options.includePlayers == false) {
				data.includePlayers = false;
			}

			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Diagnostics.aspx',
				data: data
			});
		},
		regionTreeDecode: function (region, ignoreAccess,path) {            
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			if (!region) {
				return null;
			}
			if (!path) {
				path = [];
			}
			var prettyRegionTree = {
				name: region.Name,
				id: region.Id,
				tags: region.Tags,
				state: region.State,
				description: region.Description,
				children: [],
				players: {},
				path: []
			}
			$.each(path, function(index, item) {
				prettyRegionTree.path.push(item);
			});
			prettyRegionTree.path.push({
				name:prettyRegionTree.name,
				id:prettyRegionTree.id
			});
			if (region.Regions) {
				region.Regions.sort(function (a, b) {
					if (a.Name < b.Name) {
						return -1;
					}
					else if (a.Name > b.Name) {
						return 1;
					}
					else {
						return 0;
					}
				});
				$.each(region.Regions, function (childRegionIndex, childRegion) {
					prettyRegionTree.children.push($.insmFramework('regionTreeDecode', childRegion, true, prettyRegionTree.path));
				});
			}

			if (region.Players) {
				$.each(region.Players, function (playerIndex, player) {
					player.RegionId = prettyRegionTree.id;
					player.RegionPath = prettyRegionTree.path;
					prettyRegionTree.players[player.Id] = $.insmFramework('playerDecode', player);
					prettyRegionTree.players[player.Id].regionPath = prettyRegionTree.path;
				});
			}
			return prettyRegionTree;
		},
		regionDecode: function(region) {
			var prettyRegion = region;
			return prettyRegion;
		},
		getModuleSettings: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				success: options.success,
				regionId: options.regionId || 0,
				method: 'get',
				name: '_',
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getModuleSettings', options);
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
				url: _plugin.settings.apiUrl + '/ModuleSettings.aspx',
				data: data
			});

			return $this;
		},
		getGroups: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				success: function (result) {
					var groups = [];
					$.each(result.Groups, function (index, group) {
						if (!group.Admin) {
							groups.push($.insmFramework('groupDecode', group));
						}
					})
				 
					return options.success(groups);
				},
				format: 'json',
				method: 'get',
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getGroups', options);
				}
			};

			$.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Users.aspx',
				data: data
			});

			return $this;
		},
		getTimestamp: function () {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			return _plugin.data.timestamp;
		},
		getUsers: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var data = {
				success: function (result) {
					var users = [];
					$.each(result.Users, function (index, user) {
						if (!user.Admin) {
							users.push($.insmFramework('userDecode', user));
						}
					})
					return options.success(users);
				},
				format: 'json',
				method: 'get',
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('getUsers', options);
				}
			};
			$.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Users.aspx',
				data: data
			});
			return $this;
		},
		addGroup: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			//$.insmNotification({
			//    type: 'warning',
			//    message: 'Mockup data received'
			//});
			//options.success();
			//return $this;
			var data = {
				success: function (result) {
					return options.success();
				},
				method: 'AddGroup',
				Group: options.group,
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('addGroup', options);
				}
			};

			$.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Users.aspx',
				data: data
			});

			return $this;
		},
		setModuleSettings: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				success: options.success,
				regionId: options.regionId || 0,
				method: 'set',
				name: '_',
				denied: function () {
					// Just do it again and we should land in the success callback next time
					$.insmFramework('setModuleSettings', options);
				},
			};

			if (options.key) {
				data.key = options.key;
			}
			if (options.namespace) {
				data.name = options.namespace;
			}
			if (options.value) {
				data.value = JSON.stringify(options.value);
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

			var restartOptions = $.extend(true, {}, options);
			
			$.extend(options.data, {
				session: _plugin.settings.session,
				format: 'json'
			});
			
			if (options.data.session == null || options.data.session == 'null' || options.data.session == '') {
				delete options.data.session;
			}

			var callbacks = {
				success: options.data.success,
				denied: options.data.denied,
				invalid: options.data.invalid,
				warning: options.data.warning
			};

			if (!callbacks.success || !callbacks.denied) {
				throw new Error('Required callbacks not defined');
			}

			// Retry callback
			callbacks.retry = function (message) {
				if (!_plugin.data.retryFlag) {
					_plugin.data.retryFlag = true;
					$.insmNotification({
						type: 'warning',
						message: 'Communication with API was timed out: ' + message
					});
					setTimeout(function() {
						_plugin.data.retryFlag = false;
					}, 5000);
				}
				setTimeout(function () {
					$.insmFramework('ajax', restartOptions);
				}, 1000);
			};

			delete options.data.success;
			delete options.data.denied;
			delete options.data.invalid;
			delete options.data.warning;

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
				form.remove();

				return $.insmFramework('track', {
					trackId: trackingId,
					data: callbacks,
					iframe: iframe
				});
			}
			else {
				var timedOut = false;
				var timeoutHandle = setTimeout(function() {
					timedOut = true;
					callbacks.retry('The request took too long. Please check your connection.');
				}, 30000);

				return $.ajax({
					type: 'GET',
					dataType: 'jsonp',
					url: options.url,
					data: options.data,
					success: function (data) {
						_plugin.data.timestamp = data.Timestamp;
						if (!timedOut) {
							clearTimeout(timeoutHandle);
							$.insmFramework('callback', {
								result: data,
								params: callbacks
							});
						}
					},
					error: function (data) {
						if (!timedOut) {
							clearTimeout(timeoutHandle);
							$.insmFramework('callback', {
								result: data,
								params: callbacks
							});
						}
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
			form.attr("action", _plugin.settings.apiUrl + '/Files.aspx?format=json&trackingid=' + trackId + '&fileName=' + options.name + '&regionId=' + options.regionId + '&contentDirectoryName=' + options.directoryName + '&method=uploadfile&active=true&session=' + _plugin.settings.session);
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


			var timedOut = false;
			var timeoutHandle = setTimeout(function () {
				timedOut = true;
				callbacks.retry('The request took too long. Please check your connection.');
			}, 30000);

			var data = {
				trackingId: options.trackId,
				session: _plugin.settings.session
			};
			
			if (data.session == null || data.session == 'null' || data.session == '') {
				delete data.session;
			}

			$.ajax({
				url: _plugin.settings.apiUrl + '/Track.aspx',
				data: data,
				dataType: 'jsonp',
				success: function (data) {
					_plugin.data.timestamp = data.Timestamp;
					if (!timedOut) {
						clearTimeout(timeoutHandle);
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
					}

				},
				error: function (message) {
					if (!timedOut) {
						clearTimeout(timeoutHandle);
						options.error(message);
					}
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

			if (!_plugin.settings.session || _plugin.settings.session == 'null' || _plugin.settings.session == '') {
				_plugin.settings.session = options.result.Session;
			}

			if (options.result.VersionId) {
				_plugin.data.versionId = options.result.VersionId;
			}
			if (options.result) {
				if (typeof options.result.StatusCode === 'number' && options.result.StatusCode % 1 == 0) {
					switch (options.result.StatusCode) {
						case 0: // Status OK
							options.params.success(options.result.Result);
							break;
						case 50: // Status truncated
							options.params.success(options.result.Result);
							$.insmNotification({
								type: 'warning',
								message: options.result.Message
							});
							break;
						case 100: // Status timeout
						case 101: // Status deadlock
						case 102: // Status communication failure
						case 103: // Status overload
							options.params.retry(options.result.Message);
							break;
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
						case 500: // Status system failure
							throw new Error(options.result.Message);
							break;
						case 201: // Status unauthorized (has a windows user but has no login access to INSM)
						case 200: // Status not logged in
							// Login and call the denied callback afterwards
							_plugin.data.type = options.result.Type;
							_plugin.data.target = options.result.Target;
							_plugin.data.version = options.result.Version;
							_plugin.data.versionId = options.result.VersionId;

							$.insmLogin({
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
			
					var data = {
				username: options.username,
				password: options.password,
						app: _plugin.settings.app
					};

					if (_plugin.settings.session) {
						data.session = _plugin.settings.session;
					}

					if (data.session == null || data.session == 'null' || data.session == '') {
						delete data.session;
					}

					$.ajax({
						url: _plugin.settings.apiUrl + '/Login.aspx',
						data: data,
						dataType: 'jsonp',
						timeout: _plugin.settings.timeout,
						success: function (data) {
							_plugin.settings.session = data.Session;

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

								   
									if (_plugin.data.previousUsername && _plugin.data.previousUsername !== _plugin.settings.user.name) {
											
										// Fix the hashtag to only "#" and 
										$.insmHashChange('updateHash', {});
										window.location.reload();
										
										return;
									}
									if (!!window.localStorage && typeof (Storage) !== "undefined") {
										localStorage.insmFrameworkSession = data.Session;
									}

									$.insmFramework('downloadCurrentUser', {
										success: function (user) {
											_plugin.settings.user = user;

											$.insmFramework('regionTree', {
												success: function (regionTree) {
													_plugin.settings.user.regionTree = regionTree;
													
													if (options && typeof options.success == 'function') {                                                       
														options.success(data);
													}
												}
											});
										}
									});
									break;
								case 'denied':
							if (options && typeof options.denied == 'function') {
								options.denied();
							}
									break;
								default:
									throw new Error('Login response status "' + data.Status + '" not implemented.');
									break;
							}
						},
						error: function (message) {
							throw new Error(message);
						}
					});

			return _plugin.data.loginDeferred;
		},
		logout: function (options) {
			// Global vars
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			_plugin.data.previousUsername = _plugin.settings.user.name;
			var logoutDeferred = $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl+ '/Logout.aspx',
				data: {
					success: function () {
						// We never get here but if we do in the future we want to do the same as in the denied callback.
						_plugin.data.user = {};
						delete _plugin.settings.session;
						if (!!window.localStorage && typeof (Storage) !== "undefined") {
							delete localStorage.insmFrameworkSession;
						}
					},
					denied: function () {
						_plugin.data.user = {};
						delete _plugin.settings.session;
						if (!!window.localStorage && typeof (Storage) !== "undefined") {
							delete localStorage.insmFrameworkSession;
						}
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

			// TODO: Playlist Manager specific code in framework. Has to be fixed.
			_plugin.settings.app = 'Playlist+Manager';

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
		regionDirectory: function (options) {
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
				url: _plugin.settings.apiUrl + '/Files.aspx',
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
		},
		checkLatestVersionId:function(options){
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');
			var data = {
				method: 'GetLatestVersionId',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					$.insmFramework('checkLatestVersionId', options);
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/VersionUpdates.aspx',
				data: data
			});
		},
		insertModuleInformation: function () {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			$.insmFramework('ping', {
				success: function (data) {
					_plugin.settings.session = data.Session;
					if (typeof (Storage) !== "undefined") {
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
										_plugin.settings.applicationName + ' ' + _plugin.settings.version + '<br />' +
										_plugin.data.target + ' ' + _plugin.data.type + ' ' + _plugin.data.version + '<br />' +
									'</p>' +
									'<div class="logoutButton"></div>\
						');
						if (data.User != null && data.User != "") {
							$('#insm-version .logoutButton').html('<a class="button logout">Logout ' + data.User + '</a>');
						}

						$('#insm-version a.logout').click(function () {
							$.insmFramework('logout', {
								success: function () {
									$.insmLogin();
								}
							});
						});
					}
				}
			});

			return $this;
		},

		/*
		Description:REST CALL for Get Chanel List
		Parameters:Options
		Return:Resule in JSON format
		*/
		getChannelList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'get',
				app:'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Channels.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Get Play
		Parameters:Options
		Return:Resule in JSON format
		*/
		getPlayList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'getfilesinfo',
				contentdirectoryid: options.contentdirectoryid,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Get Schedule List
		Parameters:Options
		Return:Resule in JSON format
		*/
		getSchedule: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'DownloadInnerFile',
				fileId: options.fileId,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Get DataSetList
		Parameters:Options
		Return:Resule in JSON format
		*/
		getDataSetList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				datasetids: options.datasetids,
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};

			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/DataSet.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Remove Play
		Parameters:Options
		Return:Resule in JSON format
		*/
		RemovePlayList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method:'DeleteFile',
				fileId: options.fileId,
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Save PlayList
		Parameters:Options
		Return:Resule in JSON format
		*/
		PublishPlayList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method:'set',
				datasetid:options.datasetid,
				datasetitemkey: options.datasetitemkey,
				value: options.value,
				DataSetItemType: options.DataSetItemType,
				success: function (data) {
						options.success(data);
					},
				denied: function () {
					alert('error');
				}
			};
			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/DataSet.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Clear playlist in relation with region tree
		Parameters:Options
		Return:Resule in JSON format
		*/
		ClearPlayList: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method:'ClearItem',
				datasetid: options.datasetid,
				datasetitemkey: options.datasetitemkey,
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/DataSet.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Get Directory Information
		Parameters:Options
		Return:Resule in JSON format
		*/
		getDirectoryInformation: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method:'getdirectoryinfo',
				includesubdirectories:true,
				regionid: options.regionid,
				contentDirectoryName: options.contentDirectoryName,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},

		/*
		Description:REST CALL for Save Play List to Server
		Parameters:Options
		Return:Resule in JSON format
		*/
		savePlayListToServer: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var filename = options.filename;
			var directoryid = options.directoryid;
			var orientation = options.orientation;
			var resolution = options.resolution;
			var versionGroupId = options.versionGroupId;
			var app = 'Playlist+Manager';
			var session = $.insmFramework('getSession');
			var format = 'json';
			var uploadFileOffset = 0;
			var uploadFileSize;
			var xmldata = options.xmldata;
			uploadFileSize = xmldata.length;
			var gdata = _plugin.settings.apiUrl + "/Files.aspx?method=UploadFile&filename=" + filename + "&directoryid=" + directoryid + "&orientation=" + orientation + "&resolution=" + resolution + "&versionGroupId=" + versionGroupId + "&app=" + app + "&session=" + session + "&format=" + format + "&uploadFileOffset=" + uploadFileOffset + "&uploadFileSize=" + uploadFileSize + "";

			return $.ajax({
				type: "POST",
				url: gdata,
				data: xmldata,
				contentType: "text/xml",
				error: function (e) {

				},
				success: function (data) {
					options.success(data);
				}
			});
		},
		/*
		Description:REST CALL for Get Directory List for File Browser
		Parameters:Options
		Return:Resule in JSON format
		*/
		getDirectoryListForFileBrowser: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method: 'GetDirectoryInfo',
				contentDirectoryName: options.contentDirectoryName,
				includesubdirectories: true,
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
				},
		/*
		Description:REST CALL for Get file List for file browser
		Parameters:Options
		Return:Resule in JSON format
		*/
		getFileListForFileBrowser: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			var data = {
				method: 'getFilesInfo',
				contentDirectoryId: options.contentDirectoryId,
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Rename File
		Parameters:Options
		Return:Resule in JSON format
		*/
		updateFile: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'updateFile',
				FileId: options.FileId,
				name: options.name,
				startDate: null,
				endDate: null,
				active: true,
				app: 'File Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Rename Folder
		Parameters:Options
		Return:Resule in JSON format
		*/
		reNameFolder: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'UpdateDirectory',
				directoryid: options.directoryid,
				directoryname: options.directoryname,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for create Folder
		Parameters:Options
		Return:Resule in JSON format
		*/
		createFolder: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'CreateDirectory',
				ParentContentDirectoryId: options.ParentContentDirectoryId,
				ContentDirectoryName: options.ContentDirectoryName,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for Remove Folder
		Parameters:Options
		Return:Resule in JSON format
		*/
		removeFolder: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'DeleteDirectory',
				directoryid: options.directoryid,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for File information
		Parameters:Options
		Return:Resule in JSON format
		*/
		uploadFileInner: function (options) {
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
			form.attr("action", _plugin.settings.apiUrl + '/Files.aspx?format=json&trackingid=' + trackId + '&fileName=' + options.name + '&contentDirectoryId=' + options.contentDirectoryId + '&method=uploadfile&active=true&session=' + _plugin.settings.session);
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
		/*
		Description:REST CALL for Move File
		Parameters:Options
		Return:Resule in JSON format
		*/
		moveFiles: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'UpdateFile',
				fileId: options.fileId,
				contentdirectoryid: options.contentdirectoryid,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for download inner file
		Parameters:Options
		Return:Resule in JSON format
		*/
		downloadInnerFile: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'DownloadInnerFile',
				fileId: options.fileId,
				filename: options.filename,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for file information
		Parameters:Options
		Return:Resule in JSON format
		*/
		getFileInfo: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'getfileinfo',
				fileid: options.fileId,
				filename: options.filename,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for get movie preview
		Parameters:Options
		Return:Resule in JSON format
		*/
		getMoviePreview: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'GetPreview',
				filename: options.filename,
				app: 'Playlist+Manager',
				type: 'image',
				success: function (data) {
					options.success(data);
				},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
			});
		},
		/*
		Description:REST CALL for move folder
		Parameters:Options
		Return:Resule in JSON format
		*/
		moveFolder: function (options) {
			var $this = $('html').eq(0);
			var _plugin = $this.data('insmFramework');

			// TODO: Playlist Manager specific code in framework. Has to be fixed.

			var data = {
				method: 'UpdateDirectory',
				contentdirectoryid: options.contentdirectoryid,
				parentcontentdirectoryid: options.parentcontentdirectoryid,
				app: 'Playlist+Manager',
				success: function (data) {
					options.success(data);
		},
				denied: function () {
					alert('error');
				}
			};
			return $.insmFramework('ajax', {
				url: _plugin.settings.apiUrl + '/Files.aspx',
				data: data
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
