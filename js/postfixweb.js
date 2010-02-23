Ext.namespace('RubixConsulting');

RubixConsulting.user = function() {
	// private variables
	var loginWindow, user, viewport, west, center, infoPanel;
	var domainGrid, addUserWindow, resetPasswordWindow;
	var removeDomainBtn, domainPermMask, userGrid, siteAdminGrid;
	var addUserBtn, removeUserBtn, saveUserBtn, revertUserBtn, resetPassBtn;
	var addUserUsername, addUserDomain, addDomainBtn, addDomainDomain;
	var resetPassPassword, userMask, addDomainWindow, saveSiteAdminBtn;
	var domainPermCombo, saveDomainPermBtn, domainPermGrid;
	var localAliasGrid, addLocalAliasBtn, removeLocalAliasBtn;
	var revertLocalAliasesBtn, saveLocalAliasesBtn, addLocalAliasWindow;
	var addLocalAliasName, addLocalAliasDestination, bulkAddLocalAliasBtn;
	var bulkAddLocalAliasWindow, localAliasMask, revertSiteAdminBtn;
	var domainListMask, passwordMask, aliasesGrid, addAliasBtn;
	var removeAliasBtn, revertAliasesBtn, saveAliasesBtn;
	var addManageForwardBtn, removeManageForwardBtn, revertManageForwardsBtn;
	var saveManageForwardsBtn, addManageForwardWindow, addManageForwardEmail;
	var manageForwardsGrid, manageForwardMask, addAliasWindow;
	var aliasMask, addLocalForwardWindow, addLocalForwardBtn, removeLocalForwardBtn;
	var revertLocalForwardsBtn, saveLocalForwardsBtn, addLocalForwardUsername;
	var addLocalForwardDomain, addLocalForwardDestination, localForwardMask;
	var bulkAddLocalForwardBtn, bulkAddLocalForwardWindow, bulkAddLocalForwardArea;
	var addCatchAllBtn, removeCatchAllBtn, revertCatchAllsBtn, saveCatchAllBtn;
	var saveCatchAllBtn, addCatchAllWindow, addCatchAllDomain, addCatchAllDestination;
	var catchAllMask, forwardGrid, addForwardBtn, removeForwardBtn, revertForwardsBtn;
	var saveForwardsBtn, addForwardWindow, addForwardDestination, cookie;
	var forwardMask, addManageForwardDestination, revertDomainPermBtn;
	var webmailPanel, webmailMask, namePanel, nameMask, mailLogGrid;
	var logSummaryMask, statsMask, logSummaryCombo, loginCookie, tailTimer;
	var autoReplyEnabled, autoReplyFieldSet, autoReplyLoaded, autoReplyMask, autoReplyPanel;

	var priorities = [
		'Emergency',
		'Alert',
		'Critical',
		'Error',
		'Warning',
		'Notice',
		'Info',
		'Debug'
	]

	var domainSm        = new Ext.grid.CheckboxSelectionModel();
	var userSm          = new Ext.grid.CheckboxSelectionModel();
	var localAliasSm    = new Ext.grid.CheckboxSelectionModel();
	var aliasSm         = new Ext.grid.CheckboxSelectionModel();
	var manageForwardSm = new Ext.grid.CheckboxSelectionModel();
	var localForwardSm  = new Ext.grid.CheckboxSelectionModel();
	var catchAllSm      = new Ext.grid.CheckboxSelectionModel();
	var forwardSm       = new Ext.grid.CheckboxSelectionModel();

	var domainsLoaded        = false;
	var usersLoaded          = false;
	var domainPermsLoaded    = false;
	var siteAdminLoaded      = false;
	var localAliasesLoaded   = false;
	var aliasesLoaded        = false;
	var manageForwardsLoaded = false;
	var localForwardsLoaded  = false;
	var catchAllLoaded       = false;
	var forwardsLoaded       = false;
	var webmailLoaded        = false;
	var nameLoaded           = false;
	var logSummaryLoaded     = false;
	var loginInProgress      = false;

	var timeout = 300000;
	Ext.Ajax.timeout = timeout;

	var removedUsers          = new Array();
	var removedLocalAliases   = new Array();
	var removedManageForwards = new Array();
	var removedAliases        = new Array();
	var removedLocalForwards  = new Array();
	var removedCatchAlls      = new Array();
	var removedForwards       = new Array();

	var domainRecord = Ext.data.Record.create([
		{name: 'domain_id', type: 'int'},
		{name: 'domain',    type: 'string'}
	]);

	var userRecord = Ext.data.Record.create([
		{name: 'user_id',  type: 'int'},
		{name: 'username', type: 'string'},
		{name: 'domain',   type: 'string'},
		{name: 'email',    type: 'string'},
		{name: 'name',     type: 'string'},
		{name: 'role_id',  type: 'int'},
		{name: 'name',     type: 'string'},
		{name: 'active',   type: 'boolean'}
	]);

	var domainPermRecord = Ext.data.Record.create([
		{name: 'user_id', type: 'int'},
		{name: 'email',   type: 'string'},
		{name: 'domain',  type: 'string'},
		{name: 'admin',   type: 'boolean'}
	]);

	var siteAdminRecord = Ext.data.Record.create([
		{name: 'user_id',    type: 'int'},
		{name: 'email',      type: 'string'},
		{name: 'domain',     type: 'string'},
		{name: 'site_admin', type: 'boolean'}
	]);

	var localAliasRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'name',        type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'forwards',    type: 'int'},
		{name: 'active',      type: 'boolean'}
	]);

	var forwardRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'email',       type: 'string'},
		{name: 'domain',      type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'active',      type: 'boolean'}
	]);

	var localForwardRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'email',       type: 'string'},
		{name: 'domain',      type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'aliases',     type: 'int'},
		{name: 'active',      type: 'boolean'}
	]);

	var aliasRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'email',       type: 'string'},
		{name: 'domain',      type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'active',      type: 'boolean'}
	]);

	var catchAllRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'domain',      type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'active',      type: 'boolean'}
	]);

	var logFileRecord = Ext.data.Record.create([
		{name: 'file', type: 'string'}
	]);

	var mailLogRecord = Ext.data.Record.create([
		{name: 'id',          type: 'int'                          },
		{name: 'priority_id', type: 'int'                          },
		{name: 'pid',         type: 'int'                          },
		{name: 'service',     type: 'string'                       },
		{name: 'message',     type: 'string'                       },
		{name: 'time',        type: 'date', dateFormat: 'timestamp'}
	]);

	var mailLogStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/log.php',
			timeout: timeout
		}),
		root: 'log',
		fields: mailLogRecord
	});

	var logSummaryStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/logSummary.php',
			timeout: timeout
		}),
		root: 'files',
		totalProperty: 'numFiles',
		fields: logFileRecord
	});

	var forwardStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/forwards.php',
			timeout: timeout
		}),
		root: 'forwards',
		fields: forwardRecord
	});

	var catchAllStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/catchAll.php',
			timeout: timeout
		}),
		root: 'catchalls',
		fields: catchAllRecord
	});

	var siteAdminStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/siteAdmins.php',
			timeout: timeout
		}),
		root: 'admins',
		fields: siteAdminRecord
	});

	var domainPermStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/domainPerms.php',
			timeout: timeout
		}),
		root: 'domains',
		fields: domainPermRecord
	});

	var domainListStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/domains.php',
			timeout: timeout
		}),
		root: 'domains',
		fields: domainRecord
	});

	var userStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/users.php',
			timeout: timeout
		}),
		root: 'users',
		fields: userRecord
	});

	var localForwardStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/localForwards.php',
			timeout: timeout
		}),
		root: 'forwards',
		fields: localForwardRecord
	});

	var manageForwardStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/manageForwards.php',
			timeout: timeout
		}),
		root: 'forwards',
		fields: forwardRecord
	});

	var aliasStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/aliases.php',
			timeout: timeout
		}),
		root: 'aliases',
		fields: aliasRecord
	});

	var localAliasStore = new Ext.data.JsonStore({
		proxy: new Ext.data.HttpProxy({
			url: 'data/localAliases.php',
			timeout: timeout
		}),
		root: 'aliases',
		fields: localAliasRecord
	});

	// private functions
	function boolEditor(label, name, width) {
		return new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: ['value', 'display'],
				data: [
					[false, 'No'],
					[true, 'Yes']
				]
			}),
			fieldLabel: label,
			hiddenName: name,
			width: width,
			displayField: 'display',
			valueField: 'value',
			mode: 'local',
			forceSelection: true,
			typeAhead: true,
			triggerAction: 'all',
			allowBlank: false,
			selectOnFocus: true,
			lazyRender: true,
			value: false
		});
	}

	var boolRenderer = function(value, meta, record, row, col, store) {
		if(value) {
			return 'Yes';
		}
		return 'No';
	}

	var getUserInfo = function() {
		Ext.Ajax.request({
			url: 'data/userInfo.php',
			success: parseUserInfo,
			failure: ajaxFailure
		});
	}

	var formFailure = function(form, action) {
		if(form.url == 'data/changePass.php') {
			passwordMask.hide();
		} else if(form.url == 'data/users.php') {
			userMask.hide();
		} else if(form.url == 'data/manageForwards.php') {
			manageForwardMask.hide();
		} else if(form.url == 'data/aliases.php') {
			aliasMask.hide();
		} else if(form.url == 'data/localForwards.php') {
			localForwardMask.hide();
		} else if(form.url == 'data/domains.php') {
			domainListMask.hide();
		} else if(form.url == 'data/localAliases.php') {
			localAliasMask.hide();
		} else if(form.url == 'data/catchAll.php') {
			catchAllMask.hide();
		} else if(form.url == 'data/forwards.php') {
			forwardMask.hide();
		} else if(form.url == 'data/name.php') {
			nameMask.hide();
		}
		if(action && action.response && action.response.statusText && (action.response.statusText != 'OK')) {
			if(action.response.statusText == 'Forbidden: Not logged in') {
				completeLogout();
			} else {
				showError(action.response.statusText);
			}
		} else {
			showError('Please correct the underlined items');
		}
	}

	var ajaxFailure = function(response, options) {
		if(options && options.url == 'data/userInfo.php') {
			showLogin();
		} else {
			var msg = 'Unknown Error';
			if(response && response.statusText) {
				msg = response.statusText;
			}
			if(msg == 'Forbidden: Not logged in') {
				completeLogout();
			} else {
				showError(msg);
			}
		}
	}

	var showPortal = function() {
		viewport = new Ext.Viewport({
			layout: 'border',
			items: [
				west = new Ext.tree.TreePanel({
					title: 'Tools',
					autoScroll: true,
					region: 'west',
					rootVisible: false,
					split: true,
					width: 180,
					minSize: 75,
					maxSize: 300,
					collapsible: true,
					id: 'west-panel',
					lines: false,
					buttonAlign: 'center',
					root: new Ext.tree.AsyncTreeNode({
						id: 'tools-root'
					}),
					loader: new Ext.tree.TreeLoader({
						url: 'data/tree.php'
					}),
					buttons: [{
						text: 'Logout',
						handler: logoutDialog
					}]
				}), center = new Ext.Panel({
					title: document.title,
					region: 'center',
					layout: 'card',
					margins: '5 0 0 0',
					id: 'center-panel',
					items: [
						infoPanel = new Ext.Panel({
							id: 'user-info-panel',
							layout: 'table',
							defaults: {
								bodyStyle: 'padding-bottom:5px;padding-right:10px'
							},
								bodyStyle: 'padding:15px',
							layoutConfig: {
								columns: 4
							},
							autoScroll: true,
							border: false,
							items: [
								{
									html: '<div style="text-align: center;"><img src="img/logo.png" /></div>',
									cellCls: 'alignTop',
									border: false,
									colspan: 4
								},{
									html: '<b>Name</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.name,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Email Address</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.email,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Role</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.longrole,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Forwards</b>',
									cellCls: 'alignTop',
									border: false
								},{
									cellCls: 'alignTop',
									id: 'info-forwards',
									html: 'Loading...',
									border: false
								},{
									html: '<b>Aliases</b>',
									cellCls: 'alignTop',
									border: false
								},{
									cellCls: 'alignTop',
									id: 'info-aliases',
									html: 'Loading...',
									border: false
								}
							]
						}),
						new Ext.form.FormPanel({
							url: 'data/changePass.php',
							timeout: timeout,
							monitorValid: true,
							autoScroll: true,
							labelWidth: 125,
							width: 318,
							id: 'change-password-panel',
							border: false,
							layoutConfig: {
								labelSeparator: ''
							},
							defaultType: 'textfield',
							bodyStyle: 'padding:15px',
							defaults: {
								width: 150,
								msgTarget: 'side'
							},
							items: [{
								fieldLabel: 'Old Password',
								name: 'oldpass',
								id: 'oldpass',
								allowBlank: false,
								inputType: 'password'
							}, new Ext.ux.PasswordMeter({
								fieldLabel: 'New Password',
								name: 'newpass',
								id: 'newpass',
								allowBlank: false,
								inputType: 'password',
								validator: validPass,
								invalidText: 'Password does not meet requirements',
								minLength: 8
							}),{
								fieldLabel: 'Repeat New Password',
								name: 'repnewpass',
								id: 'repnewpass',
								allowBlank: false,
								inputType: 'password',
								validator: validRepPass,
								invalidText: 'Passwords do not match'
							}],
							buttons: [
								{
									text: 'Reset Form',
									handler: resetChangePassword
								},{
									text: 'Change Password',
									formBind: true,
									handler: changePassword
								}
							]
						}),
						mailLogGrid = new Ext.grid.GridPanel({
							border: false,
							id: 'mail-log-panel',
							autoScroll: true,
							loadMask: true,
							tbar: [
								tailLogChk = new Ext.form.Checkbox({
									boxLabel:'Watch Log',
									handler: tailLog
								})
							],
							autoExpandColumn: 'message',
							store: mailLogStore,
							cm: new Ext.grid.ColumnModel([{
								header:    'ID',
								sortable:  true,
								dataIndex: 'id',
								id:        'id',
								width:     50
							},{
								header:    'Time',
								sortable:  true,
								dataIndex: 'time',
								id:        'time',
								renderer:  Ext.util.Format.dateRenderer('n/d g:i:s A'),
								width:     110
							},{
								header:    'Priority',
								sortable:  true,
								dataIndex: 'priority_id',
								id:        'priority',
								renderer:  priorityRenderer,
								width:     65
							},{
								header:    'Service',
								sortable:  true,
								dataIndex: 'service',
								id:        'service',
								width:     90
							},{
								header:    'Message',
								sortable:  true,
								dataIndex: 'message',
								id:        'message',
								renderer:  wrapCell,
								width:     false
							},{
								header:    'PID',
								sortable:  true,
								dataIndex: 'pid',
								id:        'pid',
								width:     50
							}])
						}),
						domainGrid = new Ext.grid.GridPanel({
							border: false,
							id: 'manage-domains-panel',
							autoScroll: true,
							loadMask: true,
							tbar: [
								addDomainBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: addDomain
								}),
								removeDomainBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedDomains,
									disabled: true
								})
							],
							store: domainListStore,
							sm: domainSm,
							cm: new Ext.grid.ColumnModel([
								domainSm, {
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									id: 'domain',
									width: 200
								}
							]),
							iconCls: 'icon-grid'
						}),
						userGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-users-panel',
							autoScroll: true,
							autoExpandColumn: 'name',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addUserBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddUserWindow
								}),
								resetPassBtn = new Ext.Toolbar.Button({
									text: 'Reset Password',
									handler: resetPassword,
									disabled: true
								}),
								removeUserBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedUsers,
									disabled: true
								}),
								revertUserBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertUsers,
									disabled: true
								}),
								saveUserBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveUsers,
									disabled: true
								})
							],
							store: userStore,
							sm: userSm,
							cm: new Ext.grid.ColumnModel([
								userSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									width: 150,
									id: 'domain',
									editor: false
								},{
									header: 'Name',
									sortable: true,
									dataIndex: 'name',
									id: 'name',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						domainPermGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-domain-permissions-panel',
							autoScroll: true,
							autoExpandColumn: null,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								{xtype: 'tbtext', text: 'Domain'},
								domainPermCombo = new Ext.form.ComboBox({
									store: domainListStore,
									displayField: 'domain',
									valueField: 'domain_id',
									forceSelection: true,
									typeAhead: true,
									minChars: 1,
									editable: true,
									width: 175,
									hiddenName: 'domain',
									triggerAction: 'all',
									queryParam: 'query',
									allQuery: 'all',
									emptyText: 'Choose a domain'
								}),
								saveDomainPermBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveDomainPerms,
									disabled: true
								}),
								revertDomainPermBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertDomainAdmins,
									disabled: true
								})
							],
							store: domainPermStore,
							cm: new Ext.grid.ColumnModel([
								{
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									id: 'email',
									width: 200,
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									id: 'domain',
									width: 150,
									editor: false
								},{
									header: 'Administrator',
									sortable: true,
									dataIndex: 'admin',
									id: 'admin',
									width: 100,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						siteAdminGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-site-administrators-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								revertSiteAdminBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertSiteAdmins,
									disabled: true
								}),
								saveSiteAdminBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveSiteAdmins,
									disabled: true
								})
							],
							store: siteAdminStore,
							cm: new Ext.grid.ColumnModel([
								{
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									width: 150,
									id: 'domain',
									editor: false
								},{
									header: 'Site Administrator',
									sortable: true,
									dataIndex: 'site_admin',
									id: 'site_admin',
									width: 100,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						localAliasGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-local-aliases-panel',
							autoScroll: true,
							autoExpandColumn: 'destination',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddLocalAliasWindow
								}),
								bulkAddLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Bulk Add',
									handler: showBulkAddLocalAliasWindow
								}),
								removeLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedLocalAliases,
									disabled: true
								}),
								revertLocalAliasesBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertLocalAliases,
									disabled: true
								}),
								saveLocalAliasesBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveLocalAliases,
									disabled: true
								})
							],
							store: localAliasStore,
							sm: localAliasSm,
							cm: new Ext.grid.ColumnModel([
								localAliasSm, {
									header: 'Name',
									sortable: true,
									dataIndex: 'name',
									width: 200,
									id: 'name',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Virtual Forwards',
									sortable: true,
									dataIndex: 'forwards',
									id: 'forwards',
									editor: false,
									align: 'right',
									width: 100
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						aliasesGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-aliases-panel',
							autoScroll: true,
							autoExpandColumn: 'destination',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addAliasBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddAliasWindow
								}),
								removeAliasBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedAliases,
									disabled: true
								}),
								revertAliasesBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertAliases,
									disabled: true
								}),
								saveAliasesBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveAliases,
									disabled: true
								})
							],
							store: aliasStore,
							sm: aliasSm,
							cm: new Ext.grid.ColumnModel([
								aliasSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									width: 150,
									id: 'domain',
									editor: false
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									editor: false
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						manageForwardsGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-forwards-panel',
							autoScroll: true,
							autoExpandColumn: 'destination',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addManageForwardBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddManageForwardWindow
								}),
								removeManageForwardBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedManageForwards,
									disabled: true
								}),
								revertManageForwardsBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertManageForwards,
									disabled: true
								}),
								saveManageForwardsBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveManageForwards,
									disabled: true
								})
							],
							store: manageForwardStore,
							sm: manageForwardSm,
							cm: new Ext.grid.ColumnModel([
								manageForwardSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									width: 150,
									id: 'domain',
									editor: false
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						localForwardsGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'manage-local-forwards-panel',
							autoScroll: true,
							autoExpandColumn: 'destination',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addLocalForwardBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddLocalForwardWindow
								}),
								bulkAddLocalForwardBtn = new Ext.Toolbar.Button({
									text: 'Bulk Add',
									handler: showBulkAddLocalForwardWindow
								}),
								removeLocalForwardBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedLocalForwards,
									disabled: true
								}),
								revertLocalForwardsBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertLocalForwards,
									disabled: true
								}),
								saveLocalForwardsBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveLocalForwards,
									disabled: true
								})
							],
							store: localForwardStore,
							sm: localForwardSm,
							cm: new Ext.grid.ColumnModel([
								localForwardSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 275,
									id: 'email',
									editor: false
								},{
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									width: 150,
									id: 'domain',
									editor: false
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									width: 100,
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Local Aliases',
									sortable: true,
									dataIndex: 'aliases',
									id: 'aliases',
									editor: false,
									align: 'right',
									width: 75
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						catchAllGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'catchall-addresses-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addCatchAllBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddCatchAllWindow
								}),
								removeCatchAllBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedCatchAlls,
									disabled: true
								}),
								revertCatchAllsBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertCatchAlls,
									disabled: true
								}),
								saveCatchAllBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveCatchAll,
									disabled: true
								})
							],
							store: catchAllStore,
							sm: catchAllSm,
							cm: new Ext.grid.ColumnModel([
								catchAllSm, {
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									id: 'domain',
									width: 150,
									editor: false
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									width: 200,
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						forwardGrid = new Ext.grid.EditorGridPanel({
							border: false,
							id: 'forwards-panel',
							autoScroll: true,
							autoExpandColumn: false,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addForwardBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: addForward
								}),
								removeForwardBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedForwards,
									disabled: true
								}),
								revertForwardsBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertForwards,
									disabled: true
								}),
								saveForwardsBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveForwards,
									disabled: true
								})
							],
							store: forwardStore,
							sm: forwardSm,
							cm: new Ext.grid.ColumnModel([
								forwardSm, {
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									width: 200,
									editor: new Ext.form.TextField({
										allowBlank: false
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						webmailPanel = new Ext.Panel({
							id: 'webmail-panel',
							layout: 'fit',
							border: false,
							items: [{
								border: false,
								header: false,
								xtype: 'iframepanel',
								id: 'rubixWebmailDiv',
								loadMask: true,
								defaultSrc: 'about:blank'
							}]
						}),
						namePanel = new Ext.form.FormPanel({
							url: 'data/name.php',
							timeout: timeout,
							monitorValid: true,
							autoScroll: true,
							labelWidth: 50,
							border: false,
							id: 'name-panel',
							layoutConfig: {
								labelSeparator: ''
							},
							defaultType: 'textfield',
							bodyStyle: 'padding:15px',
							defaults: {
								width: 150,
								msgTarget: 'side'
							},
							items: [{
								fieldLabel: 'Name',
								name: 'name',
								id: 'name-field',
								allowBlank: false
							}],
							buttons: [
								{
									text: 'Reset Form',
									handler: resetNameForm
								},{
									text: 'Change Name',
									formBind: true,
									handler: changeName
								}
							]
						}),
						autoReplyPanel = new Ext.form.FormPanel({
							url: 'data/autoReply.php',
							timeout: timeout,
							monitorValid: true,
							autoScroll: true,
							labelWidth: 75,
							border: false,
							id: 'auto-reply-panel',
							defaultType: 'textfield',
							bodyStyle: 'padding:15px',
							defaults: {
								msgTarget: 'side'
							},
							items: [
								autoReplyEnabled = new Ext.form.Checkbox({
									boxLabel:'Enabled',
									name: 'active'
								}),
								autoReplyFieldSet = new Ext.form.FieldSet({
									layoutConfig: {
										labelSeparator: ''
									},
									border: false,
									hidden: true,
									bodyStyle: 'padding: 0px',
									cls: 'no-padding',
									items: [
										new Ext.form.DateField({
											fieldLabel: 'First day',
											name: 'begins',
											allowBlank: false
										}),
										new Ext.form.DateField({
											fieldLabel: 'Ends',
											name: 'ends'
										}),
										new Ext.form.TextArea({
											fieldLabel: 'Message',
											name: 'message',
											width: 400,
											height: 250,
											allowBlank: false
										})
									]
								})
							],
							buttons: [
								{
									text: 'Reset Form',
									handler: resetAutoReply
								},{
									text: 'Save',
									formBind: true,
									handler: saveAutoReply
								}
							]
						}),
						new Ext.Panel({
							id: 'log-summary-panel',
							border: false,
							autoScroll: true,
							html: '<div id="logSummaryContents"></div>',
							tbar: [
								{xtype: 'tbtext', text: 'File'},
								logSummaryCombo = new Ext.form.ComboBox({
									store: logSummaryStore,
									displayField: 'file',
									valueField: 'file',
									forceSelection: true,
									typeAhead: true,
									minChars: 1,
									editable: true,
									hiddenName: 'file',
									triggerAction: 'all',
									queryParam: 'query',
									allQuery: 'all',
									emptyText: 'Choose a file',
									pageSize: 14
								})
							]
						}),
						new Ext.Panel({
							id: 'last-day-stats-panel',
							border: false,
							autoScroll: true,
							html: '<div id="lastdayStatsContents"></div>'
						}),
						new Ext.Panel({
							id: 'last-week-stats-panel',
							border: false,
							autoScroll: true,
							html: '<div id="lastweekStatsContents"></div>'
						}),
						new Ext.Panel({
							id: 'last-month-stats-panel',
							border: false,
							autoScroll: true,
							html: '<div id="lastmonthStatsContents"></div>'
						}),
						new Ext.Panel({
							id: 'last-year-stats-panel',
							border: false,
							autoScroll: true,
							html: '<div id="lastyearStatsContents"></div>'
						})
					]
				})
			]
		});
		if(user.domain_admin) {
			infoPanel.add({
				html: '<b>You Administer</b>',
				cellCls: 'alignTop',
				border: false
			});
			infoPanel.add({
				id: 'you-administer',
				html: 'Loading...',
				cellCls: 'alignTop',
				border: false
			});
		}
		infoPanel.on('show', updateUserInfoPage);
		west.on('load', function(node) {
			if(node.id != 'tools-root') {
				return;
			}
			new Ext.util.DelayedTask(function() {
				west.getNodeById('user-info').select();
			}, this).delay(0);
		}, this);
		west.getSelectionModel().on('selectionchange', clickTree, this);
		aliasStore.on('update', function(store, record, operation) {
			saveAliasesBtn.enable();
			revertAliasesBtn.enable();
		}, this);
		localAliasStore.on('update', function(store, record, operation) {
			saveLocalAliasesBtn.enable();
			revertLocalAliasesBtn.enable();
		}, this);
		userStore.on('update', function(store, record, operation) {
			saveUserBtn.enable();
			revertUserBtn.enable();
		}, this);
		domainPermStore.on('update', function(store, record, operation) {
			saveDomainPermBtn.enable();
			revertDomainPermBtn.enable();
		}, this);
		siteAdminStore.on('update', function(store, record, operation) {
			saveSiteAdminBtn.enable();
			revertSiteAdminBtn.enable();
		}, this);
		manageForwardStore.on('update', function(store, record, operation) {
			saveManageForwardsBtn.enable();
			revertManageForwardsBtn.enable();
		}, this);
		localForwardStore.on('update', function(store, record, operation) {
			saveLocalForwardsBtn.enable();
			revertLocalForwardsBtn.enable();
		}, this);
		catchAllStore.on('update', function(store, record, operation) {
			saveCatchAllBtn.enable();
			revertCatchAllsBtn.enable();
		}, this);
		forwardStore.on('update', function(store, record, operation) {
			saveForwardsBtn.enable();
			revertForwardsBtn.enable();
		}, this);
		mailLogGrid.getView().getRowClass = function(row, index) {
			return 'log_row_'+priorityRenderer(row.data.priority_id);
		}
		localForwardStore.on( 'loadexception', loadException, this);
		domainListStore.on(   'loadexception', loadException, this);
		userStore.on(         'loadexception', loadException, this);
		domainPermStore.on(   'loadexception', loadException, this);
		siteAdminStore.on(    'loadexception', loadException, this);
		localAliasStore.on(   'loadexception', loadException, this);
		manageForwardStore.on('loadexception', loadException, this);
		catchAllStore.on(     'loadexception', loadException, this);
		forwardStore.on(      'loadexception', loadException, this);
		mailLogStore.on(      'loadexception', loadException, this);
		domainSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
		userSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		forwardSm.on('selectionchange', function(selectionmodel) {
			if(forwardSm.getCount() > 0) {
				removeForwardBtn.enable();
			} else {
				removeForwardBtn.disable();
			}
		}, this);
		catchAllSm.on('selectionchange', function(selectionmodel) {
			if(catchAllSm.getCount() > 0) {
				removeCatchAllBtn.enable();
			} else {
				removeCatchAllBtn.disable();
			}
		}, this);
		aliasSm.on('selectionchange', function(selectionmodel) {
			if(aliasSm.getCount() > 0) {
				removeAliasBtn.enable();
			} else {
				removeAliasBtn.disable();
			}
		}, this);
		localAliasSm.on('selectionchange', function(selectionmodel) {
			if(localAliasSm.getCount() > 0) {
				removeLocalAliasBtn.enable();
			} else {
				removeLocalAliasBtn.disable();
			}
		}, this);
		localForwardSm.on('selectionchange', function(selectionmodel) {
			if(localForwardSm.getCount() > 0) {
				removeLocalForwardBtn.enable();
			} else {
				removeLocalForwardBtn.disable();
			}
		}, this);
		manageForwardSm.on('selectionchange', function(selectionmodel) {
			if(manageForwardSm.getCount() > 0) {
				removeManageForwardBtn.enable();
			} else {
				removeManageForwardBtn.disable();
			}
		}, this);
		domainSm.on('selectionchange', function(selectionmodel) {
			if(domainSm.getCount() > 0) {
				removeDomainBtn.enable();
			} else {
				removeDomainBtn.disable();
			}
		}, this);
		userSm.on('selectionchange', function(selectionmodel) {
			if(userSm.getCount() > 0) {
				removeUserBtn.enable();
			} else {
				removeUserBtn.disable();
			}
			if(userSm.getCount() == 1) {
				resetPassBtn.enable();
			} else {
				resetPassBtn.disable();
			}
		}, this);
		domainGrid.on('beforeedit', function(e) {
			if(e.record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
		domainPermGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		userGrid.on('beforeedit', function(e) {
			if((e.record.get('email') == user.email) && (e.column == 4)) {
				return false;
			}
			return true;
		}, this);
		siteAdminGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		domainPermCombo.on('select', loadDomainPerms, this);
		logSummaryCombo.on('select', loadLogSummary,  this);
		autoReplyEnabled.on('check', checkAutoReplyEnabled, this);
		enablePage();
	}

	var checkAutoReplyEnabled = function(checkbox, checked) {
		if(checked) {
			autoReplyFieldSet.show();
		} else {
			autoReplyFieldSet.hide();
			autoReplyPanel.getForm().reset();
		}
	}

	var priorityRenderer = function(id) {
		return priorities[id];
	}

	var wrapCell = function(text) {
		return '<div style="white-space: normal">'+text+'</div>';
	}

	var loadException = function(item, options, response, error) {
		var msg = 'Unknown Error';
		if(response && response.statusText) {
			msg = response.statusText;
		}
		if(msg == 'Forbidden: Not logged in') {
			completeLogout();
		} else {
			showError(msg);
		}
	}

	var addForward = function() {
		if(!addForwardWindow) {
			addForwardWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 380,
				height: 150,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new forward...',
				modal: true,
				items: [{
					id: 'add-forward-form',
					layout: 'form',
					url: 'data/forwards.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddForwardWindow
					},{
						text: 'Add',
						formBind: true,
						handler: doAddForward
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addForwardDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 200,
							name: 'destination',
							vtype: 'email'
						}),
						boolEditor('Active', 'active', 200)
					]
				}]
			});
		}
		addForwardWindow.show(addForwardBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addForwardDestination.focus();
		}, this).delay(700);
	}

	var addDomain = function() {
		if(!addDomainWindow) {
			addDomainWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 120,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new domain...',
				modal: true,
				items: [{
					id: 'add-domain-form',
					layout: 'form',
					url: 'data/domains.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddDomainWindow
					},{
						text: 'Add Domain',
						formBind: true,
						handler: doAddDomain
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addDomainDomain = new Ext.form.TextField({
							fieldLabel: 'Domain Name',
							name: 'domain',
							allowBlank: false,
							width: 175
						})
					]
				}]
			});
		}
		addDomainWindow.show(addDomainBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addDomainDomain.focus();
		}, this).delay(700);
	}

	var doAddForward = function() {
		forwardMask = new Ext.LoadMask(forwardGrid.getEl(), {msg: 'Adding forward...'});
		forwardMask.show();
		Ext.getCmp('add-forward-form').getForm().submit({
			success: addForwardSuccess,
			failure: formFailure
		});
	}

	var doAddDomain = function() {
		domainListMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Adding new domain...'});
		domainListMask.show();
		Ext.getCmp('add-domain-form').getForm().submit({
			success: addDomainSuccess,
			failure: formFailure
		});
	}

	var showResetPasswordWindow = function() {
		if(!resetPasswordWindow) {
			resetPasswordWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 200,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Reset password...',
				modal: true,
				items: [{
					id: 'reset-password-form',
					layout: 'form',
					url: 'data/users.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'resetPassword'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideResetPasswordWindow
					},{
						text: 'Reset Password',
						formBind: true,
						handler: doResetPassword
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="reset-password-email-address">username@domain</div>',
							cls: 'x-form-item'
						},
						resetPassPassword = new Ext.ux.PasswordMeter({
							fieldLabel: 'New Password',
							name: 'password',
							id: 'reset-password-password',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validResetPass,
							invalidText: 'Password does not meet requirements',
							minLength: 8
						}),
						new Ext.form.TextField({
							fieldLabel: 'Repeat Password',
							name: 'reppassword',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validResetRepPass,
							invalidText: 'Passwords do not match'
						})
					]
				}]
			});
		}
		resetPasswordWindow.show(resetPassBtn.getEl());
		new Ext.util.DelayedTask(function() {
			resetPassPassword.focus();
		}, this).delay(700);
		Ext.get('reset-password-email-address').update(userSm.getSelections()[0].get('email'));
	}

	var showBulkAddLocalForwardWindow = function() {
		if(!bulkAddLocalForwardWindow) {
			bulkAddLocalForwardWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 630,
				height: 300,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Bulk add new local forwards...',
				modal: true,
				items: [{
					id: 'bulk-add-local-forward-form',
					layout: 'form',
					url: 'data/localForwards.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'bulk-add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideBulkAddLocalForwardWindow
					},{
						text: 'Add',
						formBind: true,
						handler: bulkAddLocalForward
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						{
							html: '<label class="x-form-item-label" style="width: 103px">Instructions</label><div style="padding-top: 4px;" id="add-email-address">Use standard /etc/aliases format.<br />All bulk added local forwards will be active by default.</div>',
							cls: 'x-form-item'
						},
						bulkAddLocalForwardArea = new Ext.form.TextArea({
							fieldLabel: 'Local Forwards',
							allowBlank: false,
							width: 450,
							height: 150,
							name: 'local-forwards'
						})
					]
				}]
			});
		}
		bulkAddLocalForwardWindow.show(bulkAddLocalForwardBtn.getEl());
		new Ext.util.DelayedTask(function() {
			bulkAddLocalForwardArea.focus();
		}, this).delay(700);
	}

	var showBulkAddLocalAliasWindow = function() {
		if(!bulkAddLocalAliasWindow) {
			bulkAddLocalAliasWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 630,
				height: 300,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Bulk add new local aliases...',
				modal: true,
				items: [{
					id: 'bulk-add-local-alias-form',
					layout: 'form',
					url: 'data/localAliases.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'bulk-add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideBulkAddLocalAliasWindow
					},{
						text: 'Add',
						formBind: true,
						handler: bulkAddLocalAlias
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						{
							html: '<label class="x-form-item-label" style="width: 103px">Instructions</label><div style="padding-top: 4px;" id="add-email-address">Use standard /etc/aliases format.<br />All bulk added local aliases will be active by default.</div>',
							cls: 'x-form-item'
						},
						bulkAddLocalAliasArea = new Ext.form.TextArea({
							fieldLabel: 'Local Aliases',
							allowBlank: false,
							width: 450,
							height: 150,
							name: 'local-aliases'
						})
					]
				}]
			});
		}
		bulkAddLocalAliasWindow.show(bulkAddLocalAliasBtn.getEl());
		new Ext.util.DelayedTask(function() {
			bulkAddLocalAliasArea.focus();
		}, this).delay(700);
	}

	var showAddLocalForwardWindow = function() {
		if(!addLocalForwardWindow) {
			addLocalForwardWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 380,
				height: 230,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new local forward...',
				modal: true,
				items: [{
					id: 'add-local-forward-form',
					layout: 'form',
					url: 'data/localForwards.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddLocalForwardWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addNewLocalForward
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addLocalForwardUsername = new Ext.form.TextField({
							fieldLabel: 'Username',
							allowBlank: false,
							width: 200,
							name: 'username'
						}),
						addLocalForwardDomain = new Ext.form.ComboBox({
							store: domainListStore,
							fieldLabel: 'Domain',
							displayField: 'domain',
							valueField: 'domain_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							width: 200,
							hiddenName: 'domain',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="add-local-forward-address">username@domain</div>',
							cls: 'x-form-item'
						},
						addLocalForwardDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 200,
							name: 'destination'
						}),
						boolEditor('Active', 'active', 200)
					]
				}]
			});
			addLocalForwardUsername.on('change', updateAddLocalForwardEmail, this);
			addLocalForwardDomain.on('change', updateAddLocalForwardEmail, this);
		}
		addLocalForwardWindow.show(addLocalForwardBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addLocalForwardUsername.focus();
		}, this).delay(700);
	}

	var showAddCatchAllWindow = function() {
		if(!addCatchAllWindow) {
			addCatchAllWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 380,
				height: 175,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new catch all forward...',
				modal: true,
				items: [{
					id: 'add-catchall-form',
					layout: 'form',
					url: 'data/catchAll.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddCatchAllWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addNewCatchAll
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addCatchAllDomain = new Ext.form.ComboBox({
							store: domainListStore,
							fieldLabel: 'Domain',
							displayField: 'domain',
							valueField: 'domain_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							width: 200,
							hiddenName: 'domain',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						addCatchAllDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 200,
							name: 'destination',
							vtype: 'email'
						}),
						boolEditor('Active', 'active', 200)
					]
				}]
			});
		}
		addCatchAllWindow.show(addCatchAllBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addCatchAllDomain.focus();
		}, this).delay(700);
	}

	var showAddAliasWindow = function() {
		if(!addAliasWindow) {
			addAliasWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 380,
				height: 230,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new alias...',
				modal: true,
				items: [{
					id: 'add-alias-form',
					layout: 'form',
					url: 'data/aliases.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddAliasWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addNewAlias
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addAliasUsername = new Ext.form.TextField({
							fieldLabel: 'Username',
							allowBlank: false,
							width: 200,
							name: 'username'
						}),
						addAliasDomain = new Ext.form.ComboBox({
							store: domainListStore,
							fieldLabel: 'Domain',
							displayField: 'domain',
							valueField: 'domain_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							width: 200,
							hiddenName: 'domain',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="add-alias-address">username@domain</div>',
							cls: 'x-form-item'
						},
						addAliasEmail = new Ext.form.ComboBox({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 200,
							store: userStore,
							displayField: 'email',
							valueField: 'user_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							hiddenName: 'destination',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						boolEditor('Active', 'active', 200)
					]
				}]
			});
			addAliasUsername.on('change', updateAddAliasEmail, this);
			addAliasDomain.on('change', updateAddAliasEmail, this);
		}
		addAliasWindow.show(addAliasBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addAliasUsername.focus();
		}, this).delay(700);
	}

	var showAddManageForwardWindow = function() {
		if(!addManageForwardWindow) {
			addManageForwardWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 380,
				height: 170,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new forward...',
				modal: true,
				items: [{
					id: 'add-manage-forward-form',
					layout: 'form',
					url: 'data/manageForwards.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddManageForwardWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addManageForward
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addManageForwardEmail = new Ext.form.ComboBox({
							fieldLabel: 'Email',
							allowBlank: false,
							width: 200,
							store: userStore,
							displayField: 'email',
							valueField: 'user_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							hiddenName: 'email',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						addManageForwardDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 200,
							name: 'destination',
							vtype: 'email'
						}),
						boolEditor('Active', 'active', 200)
					]
				}]
			});
		}
		addManageForwardWindow.show(addManageForwardBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addManageForwardEmail.focus();
		}, this).delay(700);
	}

	var showAddLocalAliasWindow = function() {
		if(!addLocalAliasWindow) {
			addLocalAliasWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 170,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new local alias...',
				modal: true,
				items: [{
					id: 'add-local-alias-form',
					layout: 'form',
					url: 'data/localAliases.php',
					timeout: timeout,
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddLocalAliasWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addLocalAlias
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addLocalAliasName = new Ext.form.TextField({
							fieldLabel: 'Name',
							allowBlank: false,
							width: 175,
							name: 'name'
						}),
						addLocalAliasDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 175,
							name: 'destination'
						}),
						boolEditor('Active', 'active', 175)
					]
				}]
			});
		}
		addLocalAliasWindow.show(addLocalAliasBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addLocalAliasName.focus();
		}, this).delay(700);
	}

	var showAddUserWindow = function() {
		if(!addUserWindow) {
			addUserWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 295,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new user...',
				modal: true,
				items: [{
					id: 'add-user-form',
					layout: 'form',
					timeout: timeout,
					url: 'data/users.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddUserWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addNewUser
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addUserUsername = new Ext.form.TextField({
							fieldLabel: 'Username',
							allowBlank: false,
							width: 175,
							name: 'username'
						}),
						addUserDomain = new Ext.form.ComboBox({
							store: domainListStore,
							fieldLabel: 'Domain',
							displayField: 'domain',
							valueField: 'domain_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							width: 175,
							hiddenName: 'domain',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="add-email-address">username@domain</div>',
							cls: 'x-form-item'
						},
						new Ext.ux.PasswordMeter({
							fieldLabel: 'Password',
							name: 'password',
							id: 'add-user-password',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validAddPass,
							invalidText: 'Password does not meet requirements',
							minLength: 8
						}),
						new Ext.form.TextField({
							fieldLabel: 'Repeat Password',
							name: 'reppassword',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validAddRepPass,
							invalidText: 'Passwords do not match'
						}),
						new Ext.form.TextField({
							fieldLabel: 'Full Name',
							name: 'name',
							width: 175
						}),
						boolEditor('Active', 'active', 175)
					]
				}]
			});
			addUserUsername.on('change', updateAddUserEmail, this);
			addUserDomain.on('change', updateAddUserEmail, this);
		}
		addUserWindow.show(addUserBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addUserUsername.focus();
		}, this).delay(700);
	}

	var updateAddLocalForwardEmail = function(field, newval, oldval) {
		Ext.get('add-local-forward-address').update(addLocalForwardUsername.getValue()+'@'+addLocalForwardDomain.getEl().getValue());
	}

	var updateAddAliasEmail = function(field, newval, oldval) {
		Ext.get('add-alias-address').update(addAliasUsername.getValue()+'@'+addAliasDomain.getEl().getValue());
	}

	var updateAddUserEmail = function(field, newval, oldval) {
		Ext.get('add-email-address').update(addUserUsername.getValue()+'@'+addUserDomain.getEl().getValue());
	}

	var hideBulkAddLocalForwardWindow = function() {
		if(bulkAddLocalForwardWindow) {
			Ext.getCmp('bulk-add-local-forward-form').getForm().reset();
			bulkAddLocalForwardWindow.hide(addLocalForwardBtn.getEl());
		}
	}

	var hideBulkAddLocalAliasWindow = function() {
		if(bulkAddLocalAliasWindow) {
			Ext.getCmp('bulk-add-local-alias-form').getForm().reset();
			bulkAddLocalAliasWindow.hide(addLocalAliasBtn.getEl());
		}
	}

	var hideAddForwardWindow = function() {
		Ext.getCmp('add-forward-form').getForm().reset();
		addForwardWindow.hide(addForwardBtn.getEl());
	}

	var hideAddManageForwardWindow = function() {
		Ext.getCmp('add-manage-forward-form').getForm().reset();
		addManageForwardWindow.hide(addManageForwardBtn.getEl());
	}

	var hideAddLocalAliasWindow = function() {
		if(addLocalAliasWindow) {
			Ext.getCmp('add-local-alias-form').getForm().reset();
			addLocalAliasWindow.hide(addLocalAliasBtn.getEl());
		}
	}

	var hideAddDomainWindow = function() {
		Ext.getCmp('add-domain-form').getForm().reset();
		addDomainWindow.hide(addDomainBtn.getEl());
	}

	var hideResetPasswordWindow = function() {
		Ext.getCmp('reset-password-form').getForm().reset();
		Ext.get('reset-password-email-address').update('username@domain');
		resetPasswordWindow.hide(resetPassBtn.getEl());
	}

	var hideAddLocalForwardWindow = function() {
		if(addLocalForwardWindow) {
			Ext.getCmp('add-local-forward-form').getForm().reset();
			Ext.get('add-local-forward-address').update('username@domain');
			addLocalForwardWindow.hide(addLocalForwardBtn.getEl());
		}
	}

	var hideAddCatchAllWindow = function() {
		Ext.getCmp('add-catchall-form').getForm().reset();
		addCatchAllWindow.hide(addCatchAllBtn.getEl());
	}

	var hideAddAliasWindow = function() {
		Ext.getCmp('add-alias-form').getForm().reset();
		Ext.get('add-alias-address').update('username@domain');
		addAliasWindow.hide(addAliasBtn.getEl());
	}

	var hideAddUserWindow = function() {
		Ext.getCmp('add-user-form').getForm().reset();
		Ext.get('add-email-address').update('username@domain');
		addUserWindow.hide(addUserBtn.getEl());
	}

	var doResetPassword = function() {
		userMask = new Ext.LoadMask(userGrid.getEl(), {msg: 'Resetting password...'});
		userMask.show();
		Ext.getCmp('reset-password-form').getForm().submit({
			success: resetPasswordSuccess,
			failure: formFailure,
			params: {
				user: userSm.getSelections()[0].get('email')
			}
		});
	}

	var bulkAddLocalForward = function() {
		localForwardMask = new Ext.LoadMask(localForwardsGrid.getEl(), {msg: 'Bulk adding local forwards...'});
		localForwardMask.show();
		Ext.getCmp('bulk-add-local-forward-form').getForm().submit({
			success: addLocalForwardSuccess,
			failure: formFailure
		});
	}

	var bulkAddLocalAlias = function() {
		localAliasMask = new Ext.LoadMask(localAliasGrid.getEl(), {msg: 'Bulk adding local aliases...'});
		localAliasMask.show();
		Ext.getCmp('bulk-add-local-alias-form').getForm().submit({
			success: addLocalAliasSuccess,
			failure: formFailure
		});
	}

	var addManageForward = function() {
		manageForwardMask = new Ext.LoadMask(manageForwardsGrid.getEl(), {msg: 'Adding forward...'});
		manageForwardMask.show();
		Ext.getCmp('add-manage-forward-form').getForm().submit({
			success: addManageForwardSuccess,
			failure: formFailure
		});
	}

	var addLocalAlias = function() {
		localAliasMask = new Ext.LoadMask(localAliasGrid.getEl(), {msg: 'Adding local alias...'});
		localAliasMask.show();
		Ext.getCmp('add-local-alias-form').getForm().submit({
			success: addLocalAliasSuccess,
			failure: formFailure
		});
	}

	var addNewLocalForward = function() {
		localForwardMask = new Ext.LoadMask(localForwardsGrid.getEl(), {msg: 'Adding new local forward...'});
		localForwardMask.show();
		Ext.getCmp('add-local-forward-form').getForm().submit({
			success: addLocalForwardSuccess,
			failure: formFailure
		});
	}

	var addNewCatchAll = function() {
		catchAllMask =  new Ext.LoadMask(catchAllGrid.getEl(), {msg: 'Adding new catch all forward...'});
		catchAllMask.show();
		Ext.getCmp('add-catchall-form').getForm().submit({
			success: addCatchAllSuccess,
			failure: formFailure
		});
	}

	var addNewAlias = function() {
		aliasMask = new Ext.LoadMask(aliasesGrid.getEl(), {msg: 'Adding new alias...'});
		aliasMask.show();
		Ext.getCmp('add-alias-form').getForm().submit({
			success: addAliasSuccess,
			failure: formFailure
		});
	}

	var addNewUser = function() {
		userMask = new Ext.LoadMask(userGrid.getEl(), {msg: 'Adding new user...'});
		userMask.show();
		Ext.getCmp('add-user-form').getForm().submit({
			success: addUserSuccess,
			failure: formFailure
		});
	}

	var removeDomainsSuccess = function(form, action) {
		domainListStore.commitChanges();
		getUserInfo();
		domainListMask.hide();
	}

	var addDomainSuccess = function(form, action) {
		hideAddDomainWindow();
		getUserInfo();
		domainListMask.hide();
		loadDomains();
	}

	var resetPasswordSuccess = function(form, action) {
		hideResetPasswordWindow();
		userMask.hide();
		showInfo('Password reset', 'Password was reset successfully');
	}

	var addForwardSuccess = function(form, action) {
		hideAddForwardWindow();
		saveForwardsBtn.disable();
		revertForwardsBtn.disable();
		forwardMask.hide();
		loadForwards();
	}

	var addManageForwardSuccess = function(form, action) {
		hideAddManageForwardWindow();
		saveManageForwardsBtn.disable();
		revertManageForwardsBtn.disable();
		manageForwardMask.hide();
		loadManageForwards();
	}

	var addLocalAliasSuccess = function(form, action) {
		hideAddLocalAliasWindow();
		hideBulkAddLocalAliasWindow();
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
		localAliasMask.hide();
		loadLocalAliases();
	}

	var addLocalForwardSuccess = function(form, action) {
		hideAddLocalForwardWindow();
		hideBulkAddLocalForwardWindow();
		saveLocalForwardsBtn.disable();
		revertLocalForwardsBtn.disable();
		localForwardMask.hide();
		loadLocalForwards();
	}

	var addCatchAllSuccess = function(form, action) {
		hideAddCatchAllWindow();
		saveCatchAllBtn.disable();
		revertCatchAllsBtn.disable();
		catchAllMask.hide();
		loadCatchAlls();
	}

	var addAliasSuccess = function(form, action) {
		hideAddAliasWindow();
		saveAliasesBtn.disable();
		revertAliasesBtn.disable();
		aliasMask.hide();
		loadAliases();
	}

	var addUserSuccess = function(form, action) {
		hideAddUserWindow();
		saveUserBtn.disable();
		revertUserBtn.disable();
		userMask.hide();
		loadUsers();
	}

	var removeSelectedForwards = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove forwards?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected forwards?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedForwards();
				}
			}
		});
	}

	var removeSelectedDomains = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove domains?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these domains?</td></tr>'+
			     '<tr><td>All associated email address, aliases and forwarders will also be deleted.</td></tr>'+
			     '<tr><td>All other domain changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedDomains();
				}
			}
		});
	}

	var removeSelectedCatchAlls = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove catch alls?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected catch alls?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedCatchAlls();
				}
			}
		});
	}

	var removeSelectedAliases = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove aliases?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected aliases?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedAliases();
				}
			}
		});
	}

	var removeSelectedLocalForwards = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove forwards?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected local forwards?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedLocalForwards();
				}
			}
		});
	}

	var removeSelectedManageForwards = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove forwards?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected forwards?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedManageForwards();
				}
			}
		});
	}

	var removeSelectedLocalAliases = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove local aliases?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove the selected local aliases?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedLocalAliases();
				}
			}
		});
	}

	var removeSelectedUsers = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove Users?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these users?</td></tr>'+
			     '<tr><td>All associated aliases and forwarders will also be deleted.</td></tr>'+
			     '<tr><td>All stored email will also be deleted.</td></tr>'+
			     '<tr><td>All other user changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedUsers();
				}
			}
		});
	}

	var resetPassword = function() {
		var selected = userSm.getSelections();
		if(selected.length == 0) {
			showError('No user selected');
		} else if(selected.length > 1) {
			showError('Please select only one user before attempting to reset password');
		} else if(selected.length == 1) {
			showResetPasswordWindow();
		}
	}

	var doRemoveSelectedCatchAlls = function() {
		catchAllMask =  new Ext.LoadMask(catchAllGrid.getEl(), {msg: 'Removing catch all forwards...'});
		catchAllMask.show();
		var selected = catchAllSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedCatchAlls.push(selected[i].get('alias_id'));
			selected[i].commit();
			catchAllStore.remove(selected[i]);
		}
		saveCatchAll();
	}

	var doRemoveSelectedAliases = function() {
		aliasMask = new Ext.LoadMask(aliasesGrid.getEl(), {msg: 'Removing aliases...'});
		aliasMask.show();
		var selected = aliasSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedAliases.push(selected[i].get('alias_id'));
			selected[i].commit();
			aliasStore.remove(selected[i]);
		}
		saveAliases();
	}

	var doRemoveSelectedLocalForwards = function() {
		localForwardMask = new Ext.LoadMask(localForwardsGrid.getEl(), {msg: 'Removing local forwards...'});
		localForwardMask.show();
		var selected = localForwardSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedLocalForwards.push(selected[i].get('alias_id'));
			selected[i].commit();
			localForwardStore.remove(selected[i]);
		}
		saveLocalForwards();
	}

	var doRemoveSelectedForwards = function() {
		forwardMask = new Ext.LoadMask(forwardGrid.getEl(), {msg: 'Removing forwards...'});
		forwardMask.show();
		var selected = forwardSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedForwards.push(selected[i].get('alias_id'));
			selected[i].commit();
			forwardStore.remove(selected[i]);
		}
		saveForwards();
	}

	var doRemoveSelectedManageForwards = function() {
		manageForwardMask = new Ext.LoadMask(manageForwardsGrid.getEl(), {msg: 'Removing forwards...'});
		manageForwardMask.show();
		var selected = manageForwardSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedManageForwards.push(selected[i].get('alias_id'));
			selected[i].commit();
			manageForwardStore.remove(selected[i]);
		}
		saveManageForwards();
	}

	var doRemoveSelectedLocalAliases = function() {
		localAliasMask = new Ext.LoadMask(localAliasGrid.getEl(), {msg: 'Removing local aliases...'});
		localAliasMask.show();
		var selected = localAliasSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedLocalAliases.push(selected[i].get('alias_id'));
			selected[i].commit();
			localAliasStore.remove(selected[i]);
		}
		saveLocalAliases();
	}

	var doRemoveSelectedUsers = function() {
		var selected = userSm.getSelections();
		var removed = 0;
		for(var i = 0; i < selected.length; i++) {
			if(user.email == selected[i].get('email')) {
				showError('Can not delete email:<br />'+user.email+'<br />It will delete your account');
				continue;
			}
			removed++;
			removedUsers.push(selected[i].get('user_id'));
			selected[i].commit();
			userStore.remove(selected[i]);
		}
		if(removed > 0) {
			saveUsers();
		}
	}

	var doRemoveSelectedDomains = function() {
		var selected = domainSm.getSelections();
		var removeDomains = new Array();
		for(var i = 0; i < selected.length; i++) {
			removeDomains.push(selected[i].get('domain_id'));
			selected[i].commit();
			domainListStore.remove(selected[i]);
		}
		if(removeDomains.length == 0) {
			return;
		}
		domainListMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Removing domains...'});
		domainListMask.show();
		Ext.Ajax.request({
			url: 'data/domains.php',
			success: removeDomainsSuccess,
			failure: ajaxFailure,
			params: {
				mode: 'remove',
				domains: removeDomains.join(',')
			}
		});
	}

	var saveDomainPerms = function() {
		var modifiedDomains = new Array();
		var modified = domainPermStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedDomains.push({
				user_id: modified[i].get('user_id'),
				admin:   modified[i].get('admin')
			});
		}
		domainPermMask = new Ext.LoadMask(domainPermGrid.getEl(), {msg: 'Saving domain administrators...'});
		domainPermMask.show();
		Ext.Ajax.request({
			url: 'data/domainPerms.php',
			success: completeSaveDomainPerms,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedDomains),
				domain: domainPermCombo.getValue()
			}
		});
	}

	var saveSiteAdmins = function() {
		var modifiedUsers = new Array();
		var modified = siteAdminStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedUsers.push({
				user_id: modified[i].get('user_id'),
				site_admin: modified[i].get('site_admin')
			});
		}
		siteAdminMask = new Ext.LoadMask(siteAdminGrid.getEl(), {msg: 'Saving site administrators...'});
		siteAdminMask.show();
		Ext.Ajax.request({
			url: 'data/siteAdmins.php',
			success: completeSaveSiteAdmins,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedUsers)
			}
		});
	}

	var saveCatchAll = function() {
		var modifiedCatchAlls = new Array();
		var modified = catchAllStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedCatchAlls.push({
				alias_id:    modified[i].get('alias_id'),
				destination: modified[i].get('destination'),
				active:      modified[i].get('active')
			});
		}
		catchAllMask =  new Ext.LoadMask(catchAllGrid.getEl(), {msg: 'Saving catch all forwards...'});
		catchAllMask.show();
		Ext.Ajax.request({
			url: 'data/catchAll.php',
			success: completeSaveCatchAlls,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedCatchAlls),
				remove: removedCatchAlls.join(',')
			}
		});
	}

	var saveAliases = function() {
		var modifiedAliases = new Array();
		var modified = aliasStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedAliases.push({
				alias_id: modified[i].get('alias_id'),
				active:   modified[i].get('active')
			});
		}
		aliasMask = new Ext.LoadMask(aliasesGrid.getEl(), {msg: 'Saving aliases...'});
		aliasMask.show();
		Ext.Ajax.request({
			url: 'data/aliases.php',
			success: completeSaveAliases,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedAliases),
				remove: removedAliases.join(',')
			}
		});
	}

	var saveLocalForwards = function() {
		var modifiedLocalForwards = new Array();
		var modified = localForwardStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedLocalForwards.push({
				alias_id:    modified[i].get('alias_id'),
				destination: modified[i].get('destination'),
				active:      modified[i].get('active')
			});
		}
		localForwardMask = new Ext.LoadMask(localForwardsGrid.getEl(), {msg: 'Saving local forwards...'});
		localForwardMask.show();
		Ext.Ajax.request({
			url: 'data/localForwards.php',
			success: completeSaveLocalForwards,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedLocalForwards),
				remove: removedLocalForwards.join(',')
			}
		});
	}

	var saveForwards = function() {
		var modifiedForwards = new Array();
		var modified = forwardStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedForwards.push({
				alias_id:    modified[i].get('alias_id'),
				destination: modified[i].get('destination'),
				active:      modified[i].get('active')
			});
		}
		forwardMask = new Ext.LoadMask(forwardGrid.getEl(), {msg: 'Saving forwards...'});
		forwardMask.show();
		Ext.Ajax.request({
			url: 'data/forwards.php',
			success: completeSaveForwards,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedForwards),
				remove: removedForwards.join(',')
			}
		});
	}

	var saveManageForwards = function() {
		var modifiedManageForwards = new Array();
		var modified = manageForwardStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedManageForwards.push({
				alias_id:    modified[i].get('alias_id'),
				destination: modified[i].get('destination'),
				active:      modified[i].get('active')
			});
		}
		manageForwardMask = new Ext.LoadMask(manageForwardsGrid.getEl(), {msg: 'Saving forwards...'});
		manageForwardMask.show();
		Ext.Ajax.request({
			url: 'data/manageForwards.php',
			success: completeSaveManageForwards,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedManageForwards),
				remove: removedManageForwards.join(',')
			}
		});
	}

	var saveLocalAliases = function() {
		var modifiedLocalAliases = new Array();
		var modified = localAliasStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedLocalAliases.push({
				alias_id:    modified[i].get('alias_id'),
				name:        modified[i].get('name'),
				destination: modified[i].get('destination'),
				active:      modified[i].get('active')
			});
		}
		localAliasMask = new Ext.LoadMask(localAliasGrid.getEl(), {msg: 'Saving local aliases...'});
		localAliasMask.show();
		Ext.Ajax.request({
			url: 'data/localAliases.php',
			success: completeSaveLocalAliases,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedLocalAliases),
				remove: removedLocalAliases.join(',')
			}
		});
	}

	var saveUsers = function() {
		var modifiedUsers = new Array();
		var modified = userStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			modifiedUsers.push({
				user_id: modified[i].get('user_id'),
				name:    modified[i].get('name'),
				active:  modified[i].get('active')
			});
		}
		userMask = new Ext.LoadMask(userGrid.getEl(), {msg: 'Saving users...'});
		userMask.show();
		Ext.Ajax.request({
			url: 'data/users.php',
			success: completeSaveUsers,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedUsers),
				remove: removedUsers.join(',')
			}
		});
	}

	var completeSaveDomainPerms = function() {
		domainPermStore.commitChanges();
		saveDomainPermBtn.disable();
		revertDomainPermBtn.disable();
		domainPermMask.hide();
	}

	var completeSaveSiteAdmins = function() {
		siteAdminStore.commitChanges();
		saveSiteAdminBtn.disable();
		revertSiteAdminBtn.disable();
		siteAdminMask.hide();
	}

	var completeSaveCatchAlls = function() {
		catchAllStore.commitChanges();
		removedCatchAlls = new Array();
		saveCatchAllBtn.disable();
		revertCatchAllsBtn.disable();
		catchAllMask.hide();
	}

	var completeSaveAliases = function() {
		aliasStore.commitChanges();
		removedAliases = new Array();
		saveAliasesBtn.disable();
		revertAliasesBtn.disable();
		aliasMask.hide();
	}

	var completeSaveLocalForwards = function() {
		localForwardStore.commitChanges();
		removedLocalForwards = new Array();
		saveLocalForwardsBtn.disable();
		revertLocalForwardsBtn.disable();
		localForwardMask.hide();
		loadLocalForwards();
	}

	var completeSaveForwards = function() {
		forwardStore.commitChanges();
		removedForwards = new Array();
		saveForwardsBtn.disable();
		revertForwardsBtn.disable();
		forwardMask.hide();
	}

	var completeSaveManageForwards = function() {
		manageForwardStore.commitChanges();
		removedManageForwards = new Array();
		saveManageForwardsBtn.disable();
		revertManageForwardsBtn.disable();
		manageForwardMask.hide();
	}

	var completeSaveLocalAliases = function() {
		localAliasStore.commitChanges();
		removedLocalAliases = new Array();
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
		localAliasMask.hide();
		loadLocalAliases();
	}

	var completeSaveUsers = function() {
		userStore.commitChanges();
		removedUsers = new Array();
		userMask.hide();
	}

	var revertForwards = function() {
		forwardStore.rejectChanges();
		saveForwardsBtn.disable();
		revertForwardsBtn.disable();
	}

	var revertCatchAlls = function() {
		catchAllStore.rejectChanges();
		saveCatchAllBtn.disable();
		revertCatchAllsBtn.disable();
	}

	var revertAliases = function() {
		aliasStore.rejectChanges();
		saveAliasesBtn.disable();
		revertAliasesBtn.disable();
	}

	var revertLocalForwards = function() {
		localForwardStore.rejectChanges();
		saveLocalForwardsBtn.disable();
		revertLocalForwardsBtn.disable();
	}

	var revertManageForwards = function() {
		manageForwardStore.rejectChanges();
		saveManageForwardsBtn.disable();
		revertManageForwardsBtn.disable();
	}

	var revertLocalAliases = function() {
		localAliasStore.rejectChanges();
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
	}

	var revertDomainAdmins = function() {
		domainPermStore.rejectChanges();
		saveDomainPermBtn.disable();
		revertDomainPermBtn.disable();
	}

	var revertSiteAdmins = function() {
		siteAdminStore.rejectChanges();
		saveSiteAdminBtn.disable();
		revertSiteAdminBtn.disable();
	}

	var revertUsers = function() {
		userStore.rejectChanges();
		saveUserBtn.disable();
		revertUserBtn.disable();
	}

	var validPass = function(pass) {
		// TODO: do some better validation here
		var oldpass = Ext.get('oldpass');
		if(oldpass) {
			oldval = oldpass.getValue();
			if(oldval == pass) {
				return false;
			}
		}
		return true;
	}

	var validAddPass = function(pass) {
		// TODO: do some better validation here
		return true;
	}

	var validResetPass = function(pass) {
		// TODO: do some better validation here
		return true;
	}

	var validRepPass = function(reppass) {
		var newpass = Ext.get('newpass');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var validResetRepPass = function(reppass) {
		var newpass = Ext.get('reset-password-password');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var validAddRepPass = function(reppass) {
		var newpass = Ext.get('add-user-password');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var clickTree = function(selectionmodel, node) {
		if(!node.leaf) {
			return;
		}
		center.getLayout().setActiveItem(node.id+'-panel');
		center.setTitle(node.text);
		if((node.id == 'manage-domains') && (!domainsLoaded)) {
			loadDomains();
		} else if((node.id == 'manage-users') && (!usersLoaded)) {
			loadUsers();
		} else if((node.id == 'manage-site-administrators') && (!siteAdminLoaded)) {
			loadSiteAdmins();
		} else if((node.id == 'manage-local-aliases') && (!localAliasesLoaded)) {
			loadLocalAliases();
		} else if((node.id == 'manage-forwards') && (!manageForwardsLoaded)) {
			loadManageForwards();
		} else if((node.id == 'manage-aliases') && (!aliasesLoaded)) {
			loadAliases();
		} else if((node.id == 'manage-local-forwards') && (!localForwardsLoaded)) {
			loadLocalForwards();
		} else if((node.id == 'catchall-addresses') && (!catchAllLoaded)) {
			loadCatchAlls();
		} else if((node.id == 'forwards') && (!forwardsLoaded)) {
			loadForwards();
		} else if((node.id == 'webmail') && (!webmailLoaded)) {
			loadWebmail();
		} else if((node.id == 'name') && (!nameLoaded)) {
			loadName();
		} else if((node.id == 'log-summary') && (!logSummaryLoaded)) {
			loadLogSummary();
		} else if((node.id == 'auto-reply') && (!autoReplyLoaded)) {
			loadAutoReply();
		} else if(node.id == 'last-day-stats') {
			loadStats('day');
		} else if(node.id == 'last-week-stats') {
			loadStats('week');
		} else if(node.id == 'last-month-stats') {
			loadStats('month');
		} else if(node.id == 'last-year-stats') {
			loadStats('year');
		} else if(node.id == 'mail-log') {
			loadMailLog();
		}
	}

	var loadLogSummary = function() {
		logSummaryMask = new Ext.LoadMask(Ext.get('log-summary-panel'), {msg: 'Loading...'});
		logSummaryMask.show();
		file = logSummaryCombo.getValue();
		Ext.get('logSummaryContents').update();
		Ext.Ajax.request({
			params: {
				file: (file ? file : '')
			},
			url: 'data/logSummary.php',
			success: function(response, options) {
				Ext.get('logSummaryContents').update(response.responseText);
				logSummaryMask.hide();
				logSummaryLoaded = true;
			},
			failure: ajaxFailure,
			scope: this
		});
	}

	var loadStats = function(time) {
		statsMask = new Ext.LoadMask(Ext.get('last-'+time+'-stats-panel'), {msg: 'Loading...'});
		statsMask.show();
		Ext.get('last'+time+'StatsContents').update();
		Ext.Ajax.request({
			url: 'data/stats.php',
			params: {
				time: time
			},
			method: 'GET',
			success: function(response, options) {
				Ext.get('last'+options.params.time+'StatsContents').update(response.responseText);
				statsMask.hide();
			},
			failure: ajaxFailure,
			scope: this
		});
	}

	var webmailGetPass = function() {
		Ext.Ajax.request({
			url: 'data/getPass.php',
			success: completeLoadWebmail,
			failure: ajaxFailure,
			scope: this,
			params: {
				pass: cookie.get('pass')
			}
		});
	}

	var completeLoadWebmail = function(response, options) {
		var parsed = Ext.util.JSON.decode(response.responseText);
		Ext.Ajax.request({
			url: '../roundcube/',
			success: loadWebmailSuccess,
			failure: ajaxFailure,
			scope: this,
			params: {
				'_action': 'login',
				'_pass': parsed.pass,
				'_user': user.email
			}
		});
	}

	var loadWebmail = function() {
		webmailMask = new Ext.LoadMask(Ext.get('rubixWebmailDiv'), {msg: 'Loading...'});
		webmailMask.show();
		Ext.Ajax.request({
			url: '../roundcube/?_task=mail&_action=logout',
			success: webmailGetPass,
			scope: this,
			failure: ajaxFailure
		});
	}

	var webmailLogout = function() {
		Ext.Ajax.request({
			url: '../roundcube/?_task=mail&_action=logout'
		});
	}

	var loadWebmailSuccess = function(response, options) {
		webmailMask.hide();
		Ext.getCmp('rubixWebmailDiv').setSrc('../roundcube/');
		webmailLoaded = true;
	}

	var loadMailLog = function() {
		mailLogStore.removeAll();
		mailLogGrid.getView().focusEl.setStyle('top', '0px');
		tailLogChk.setValue(false);
		mailLogStore.load({
			params: {
				limit: 250
			},
			callback: mailLogLoaded,
			scope: this
		});
	}

	var tailLog = function(checkbox, checked) {
		if(!tailTimer) {
			tailTimer = new Ext.util.DelayedTask(getTail, this);
		}
		if(tailLogChk.getValue()) {
			getTail();
		} else {
			tailTimer.cancel();
		}
	}

	var mailLogUpdated = function(response, options) {
		var data = Ext.util.JSON.decode(response.responseText);
		if(!data.success) {
			return;
		}
		var rs = new Array();
		for(var i = 0; i < data.log.length; i++) {
			var r = new mailLogRecord(data.log[i]);
			var t = r.get('time');
			t = new Date.parseDate(t, 'U');
			r.set('time', t);
			r.commit();
			rs.push(r);
		}
		mailLogStore.add(rs);
		mailLogScrollToBottom();
		if(tailLogChk.getValue()) {
			tailTimer.delay(5000);
		}
	}

	var getTail = function() {
		if(center.getLayout().activeItem.id != 'mail-log-panel') {
			return;
		}
		var count  = mailLogStore.getCount() - 1;
		var lastId = mailLogStore.getAt(count).get('id');
		Ext.Ajax.request({
			url: 'data/log.php',
			params: {
				start: lastId
			},
			success: mailLogUpdated,
			failure: ajaxFailure,
			scope: this
		});
	}

	var mailLogLoaded = function(r, options, success) {
		if(!success) {
			return;
		}
		mailLogScrollToBottom();
	}

	var mailLogScrollToBottom = function() {
		mailLogGrid.getView().scroller.scroll('down', 9999999999, true);
	}

	var loadDomains = function() {
		domainListStore.removeAll();
		domainsLoaded = false;
		domainListStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					domainsLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadName = function() {
		nameLoaded = false;
		nameMask = new Ext.LoadMask(Ext.get('name-panel'), {msg: 'Loading...'});
		nameMask.show();
		namePanel.getForm().load({
			params: {
				mode: 'load'
			},
			success: function(form, action) {
				nameLoaded = true;
				nameMask.hide();
			},
			failure: formFailure
		});
	}

	var loadAutoReply = function() {
		autoReplyLoaded = false;
		autoReplyMask = new Ext.LoadMask(Ext.get('auto-reply-panel'), {msg: 'Loading...'});
		autoReplyMask.show();
		autoReplyPanel.getForm().load({
			params: {
				mode: 'load'
			},
			success: function(form, action) {
				autoReplyLoaded = true;
				autoReplyMask.hide();
			},
			failure: formFailure
		});
	}

	var loadForwards = function() {
		forwardStore.removeAll();
		forwardsLoaded = false;
		forwardStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					forwardsLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadManageForwards = function() {
		manageForwardStore.removeAll();
		manageForwardsLoaded = false;
		manageForwardStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					manageForwardsLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadAliases = function() {
		aliasStore.removeAll();
		aliasesLoaded = false;
		aliasStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					aliasesLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadLocalForwards = function() {
		localForwardStore.removeAll();
		localForwardsLoaded = false;
		localForwardStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					localForwardsLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadLocalAliases = function() {
		localAliasStore.removeAll();
		localAliasesLoaded = false;
		localAliasStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					localAliasesLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadUsers = function() {
		userStore.removeAll();
		usersLoaded = false;
		userStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					usersLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadSiteAdmins = function() {
		siteAdminStore.removeAll();
		siteAdminLoaded = false;
		siteAdminStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					siteAdminLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadCatchAlls = function() {
		catchAllStore.removeAll();
		catchAllLoaded = false;
		catchAllStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					catchAllLoaded = true;
					saveCatchAllBtn.disable();
				}
			},
			scope: this
		});
	}

	var loadDomainPerms = function() {
		domainPermStore.removeAll();
		domainPermsLoaded = false;
		domainPermStore.load({
			params: {
				mode: 'load',
				domain: domainPermCombo.getValue()
			},
			callback: function(r, options, success) {
				if(success) {
					domainPermsLoaded = true;
					saveDomainPermBtn.disable();
					revertDomainPermBtn.disable();
				}
			},
			scope: this
		});
	}

	var parseUserInfo = function(response, options) {
		var data = Ext.util.JSON.decode(response.responseText);
		if(!data.success) {
			showLogin();
		} else {
			user = data.user;
			if(loginWindow) {
				loginWindow.hide();
				resetLogin();
			}
			if(!viewport) {
				showPortal();
			} else {
				updateUserInfoPage();
			}
		}
	}

	var updateUserInfoPage = function() {
		if(user.domain_admin) {
			var youAdminDiv = Ext.get('you-administer');
			if(youAdminDiv) {
				youAdminDiv.update(user.admin_domains.join('<br />'));
			}
		}
		var forwards = 'None';
		if(user.forwards.length > 0) {
			forwards = user.forwards.join('<br />');
		}
		var aliases = 'None';
		if(user.aliases.length > 0) {
			aliases = user.aliases.join('<br />');
		}
		forwardsDiv = Ext.get('info-forwards');
		if(forwardsDiv) {
			forwardsDiv.update(forwards);
		}
		aliasesDiv = Ext.get('info-aliases');
		if(aliasesDiv) {
			aliasesDiv.update(aliases);
		}
	}

	var completeShowLogin = function() {
		var username = loginCookie.get('user', null);
		if(username) {
			Ext.getCmp('loginUser').setValue(username);
			Ext.getCmp('rememberMe').setValue(true);
			new Ext.util.DelayedTask(function() {
				Ext.getCmp('loginPass').focus();
			}, this).delay(700);
		} else {
			new Ext.util.DelayedTask(function() {
				Ext.getCmp('loginUser').focus();
			}, this).delay(700);
		}
		loginWindow.show();
	}

	var showLogin = function() {
		if(loginWindow) {
			completeShowLogin();
			return;
		}
		loginWindow = new Ext.Window({
			applyTo: 'login',
			layout: 'fit',
			width: 355,
			height: 320,
			closable: false,
			plain: false,
			resizable: false,
			title: 'Log in',
			items: [{
				layout: 'form',
				xtype: 'form',
				url: 'data/login.php',
				timeout: timeout,
				frame: true,
				monitorValid: true,
				id: 'loginForm',
				keys: [{
					key: Ext.EventObject.ENTER,
					fn: doLogin
				}],
				items: [{
					html: '<div style="text-align: center;"><img src="img/logo.png" /></div>'
				},{
					xtype: 'fieldset',
					autoHeight: true,
					title: 'User Information',
					labelWidth: 75,
					defaultType: 'textfield',
					defaults: {
						width: 205,
						msgTarget: 'side'
					},
					layoutConfig: {
						labelSeparator: ''
					},
					items: [{
						fieldLabel: 'Email Address',
						name: 'user',
						id: 'loginUser',
						allowBlank: false,
						vtype: 'email'
					},{
						fieldLabel: 'Password',
						name: 'pass',
						id: 'loginPass',
						allowBlank: false,
						inputType: 'password'
					},{
						boxLabel: 'Remember me',
						xtype: 'checkbox',
						id: 'rememberMe'
					}]
				}],
				buttons: [{
					text: 'Reset',
					handler: resetLogin
				},{
					text: 'Log In',
					formBind: true,
					handler: doLogin
				}]
			}]
		});
		completeShowLogin();
		enablePage();
	}

	var disablePage = function(msg, title) {
		Ext.Msg.wait(msg, title);
	}

	var enablePage = function() {
		Ext.Msg.hide();
	}

	var changeName = function() {
		nameMask = new Ext.LoadMask(Ext.get('name-panel'), {msg: 'Changing name...'});
		nameMask.show();
		Ext.getCmp('name-panel').getForm().submit({
			params: {
				mode: 'save'
			},
			success: changeNameSuccess,
			failure: formFailure
		});
	}

	var saveAutoReply = function() {
		autoReplyMask = new Ext.LoadMask(Ext.get('auto-reply-panel'), {msg: 'Saving...'});
		autoReplyMask.show();
		autoReplyPanel.getForm().submit({
			params: {
				mode: 'save'
			},
			success: saveAutoReplySuccess,
			failure: formFailure
		});
	}

	var changePassword = function() {
		passwordMask = new Ext.LoadMask(Ext.get('change-password-panel'), {msg: 'Changing password...'});
		passwordMask.show();
		Ext.getCmp('change-password-panel').getForm().submit({
			success: changePasswordSuccess,
			failure: formFailure
		});
	}

	var resetNameForm = function() {
		loadName();
	}

	var resetAutoReply = function() {
		autoReplyPanel.getForm().reset();
	}

	var resetChangePassword = function() {
		Ext.getCmp('change-password-panel').getForm().reset();
	}

	var changeNameSuccess = function(form, action) {
		loadName();
		showInfo('Name changed', 'Name changed successfully');
	}

	var saveAutoReplySuccess = function(form, action) {
		loadAutoReply();
		showInfo('Auto Reply Saved', 'Auto Reply saved successfully');
	}

	var changePasswordSuccess = function(form, action) {
		Ext.getCmp('change-password-panel').getForm().reset();
		passwordMask.hide();
		showInfo('Password changed', 'Password changed successfully');
	}

	var showInfo = function(title, msg) {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.INFO,
			title: title,
			msg: msg
		});
	}

	var showError = function(msg) {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR,
			title: 'Error',
			msg: msg
		});
	}

	var resetLogin = function() {
		Ext.getCmp('loginForm').getForm().reset();
	}

	var doLogin = function() {
		if(loginInProgress) {
			return;
		}
		loginInProgress = true;
		disablePage('Logging in...', 'Please wait');
		Ext.getCmp('loginForm').getForm().submit({
			success: loginSuccess,
			failure: loginFailure
		});
	}

	var loginSuccess = function(form, action) {
		loginInProgress = false;
		cookie.set('pass', action.result.pass);
		if(Ext.getCmp('rememberMe').getValue()) {
			loginCookie.set('user', Ext.getCmp('loginUser').getValue());
		} else {
			loginCookie.clear('user');
		}
		getUserInfo();
	}

	var loginFailure = function() {
		loginInProgress = false;
		showError('Invalid User Name and/or Password');
	}

	var logoutDialog = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Really logout?',
			msg: 'Do you really want to logout?',
			fn: function(btn) {
				if(btn == 'yes') {
					doLogout();
				}
			}
		});
	}

	var doLogout = function() {
		disablePage('Logging out...');
		webmailLogout();
		Ext.Ajax.request({
			url: 'data/logout.php',
			success: completeLogout,
			failure: ajaxFailure
		});
	}

	var completeLogout = function() {
		cookie.clear('pass');
		window.location.reload();
	}

	// public space
	return {
		// public properties

		// public methods
		init: function() {
			Ext.BLANK_IMAGE_URL = 'js/ext/resources/images/default/s.gif';
			Ext.QuickTips.init();
			Ext.override(Ext.layout.TableLayout, {
				onLayout: function(ct, target) {
					var cs = ct.items.items, len = cs.length, c, i;
					if(!this.table) {
						target.addClass('x-table-layout-ct');
						this.table = target.createChild({
								tag: 'table',
								cls: 'x-table-layout',
								cellspacing: 0,
								cn: {
									tag: 'tbody'
								}
							},
							null,
							true
						);
					}
					this.renderAll(ct, target);
				}
			});
			Ext.override(Ext.state.CookieProvider, {
				setCookie : function(name, value){
					document.cookie = "ys-"+name+"="+this.encodeValue(value)+
					((this.expires == null) ? "" : ("; expires="+((this.expires == 0) ? 0 : this.expires.toGMTString())))+
					((this.path == null) ? "" : ("; path="+this.path))+
					((this.domain == null) ? "" : ("; domain="+this.domain))+
					((this.secure == true) ? "; secure" : "");
				}
			});
			cookie = new Ext.state.CookieProvider({
				path: document.location.pathname,
				domain: document.location.hostname,
				expires: 0,
				secure: true
			});
			loginCookie = new Ext.state.CookieProvider({
				path: document.location.pathname,
				domain: document.location.hostname,
				expires: new Date(new Date().getTime()+(1000*60*60*24*7)),
				secure: true
			});
			getUserInfo();
		}
	};
}();

Ext.onReady(RubixConsulting.user.init, RubixConsulting.user);
