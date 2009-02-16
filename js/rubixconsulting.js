Ext.namespace('RubixConsulting');

RubixConsulting.user = function() {
	// private variables
	var loginWindow, user, viewport, west, center, infoPanel;
	var domainGrid, domainMask, addUserWindow;
	var removeDomainBtn, saveDomainBtn, revertDomainBtn;
	var addUserBtn, removeUserBtn, saveUserBtn, revertUserBtn, resetPassBtn;
	var addUserUsername, addUserDomain;

	var domainSm       = new Ext.grid.CheckboxSelectionModel();
	var userSm         = new Ext.grid.CheckboxSelectionModel();
	var domainsLoaded  = false;
	var usersLoaded    = false;
	var removedDomains = new Array();
	var removedUsers   = new Array();

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

	var domainStore = new Ext.data.JsonStore({
		url: 'data/domains.php',
		root: 'domains',
		fields: domainRecord
	});

	var domainListStore = new Ext.data.JsonStore({
		url: 'data/domains.php',
		root: 'domains',
		fields: domainRecord
	});

	var userStore = new Ext.data.JsonStore({
		url: 'data/users.php',
		root: 'users',
		fields: userRecord
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
		if(action && action.response && action.response.statusText && (action.response.statusText != 'OK')) {
			showError(action.response.statusText);
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
			showError(msg);
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
					width: 185,
					minSize: 75,
					maxSize: 300,
					collapsible: true,
					id: 'west-panel',
					lines: false,
					buttonAlign: 'center',
					root: new Ext.tree.AsyncTreeNode({}),
					loader: new Ext.tree.TreeLoader({
						url: 'data/tree.php',
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
					autoScroll: true,
					id: 'center-panel',
					defaults: {
						bodyStyle: 'padding:15px',
					},
					//bbar: new Ext.StatusBar({
					//	id: 'statusbar'
					//}),
					items: [
						infoPanel = new Ext.Panel({
							id: 'user-info-panel',
							layout: 'table',
							defaults: {
								bodyStyle: 'padding-bottom:5px;padding-right:10px'
							},
							layoutConfig: {
								columns: 2
							},
							autoScroll: true,
							border: false,
							items: [
								{
									html: '<div style="text-align: center;"><img src="/images/rubix_consulting_medium.png" /></div>',
									cellCls: 'alignTop',
									border: false,
									colspan: 2
								},{
									html: '<b>Email Address</b>',
									cellCls: 'alignTop',
									border: false,
									width: 120
								},{
									html: user.email,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Name</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.name,
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
								}
							]
						}),
						new Ext.Panel({
							frame: false,
							id: 'change-password-panel',
							layout: 'anchor',
							autoScroll: true,
							items: [
								new Ext.form.FormPanel({
									title: 'Change Your Password',
									url: 'data/changePass.php',
									monitorValid: true,
									autoHeight: true,
									labelWidth: 125,
									width: 318,
									id: 'change-password-form',
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
									buttons: [{
										text: 'Change Password',
										formBind: true,
										handler: changePassword
									}]
								})
							]
						}),
						new Ext.Panel({
							id: 'manage-domains-panel',
							layout: 'anchor',
							autoScroll: true,
							items: [
								domainGrid = new Ext.grid.EditorGridPanel({
									width: 325,
									title: 'Email Domains',
									border: true,
									id: 'domain-grid',
									autoHeight: true,
									loadMask: true,
									autoExpandColumn: 'domain',
									clicksToEdit: 1,
									style: 'padding-bottom:15px',
									tbar: [
										new Ext.Toolbar.Button({
											text: 'Add New',
											handler: addDomain
										}),
										removeDomainBtn = new Ext.Toolbar.Button({
											text: 'Remove Selected',
											handler: removeSelectedDomains,
											disabled: true
										}),
										revertDomainBtn = new Ext.Toolbar.Button({
											text: 'Revert Changes',
											handler: revertDomains,
											disabled: true
										}),
										saveDomainBtn = new Ext.Toolbar.Button({
											text: 'Save Changes',
											handler: saveDomains,
											disabled: true
										})
									],
									store: domainStore,
									sm: domainSm,
									cm: new Ext.grid.ColumnModel([
										domainSm, {
											header: 'Domain',
											sortable: true,
											dataIndex: 'domain',
											id: 'domain',
											editor: new Ext.form.TextField({
												allowBlank: false
											})
										}
									]),
									iconCls: 'icon-grid'
								}), {
									html: '<small><b>Note:</b> you will not be able to select, edit or delete your own domain, '+user.domain+'</small>',
									border: false
								}
							]
						}),
						new Ext.Panel({
							id: 'manage-users-panel',
							layout: 'anchor',
							autoScroll: true,
							items: [
								userGrid = new Ext.grid.EditorGridPanel({
									width: 420,
									title: 'Email Users',
									border: true,
									id: 'user-grid',
									autoHeight: true,
									loadMask: true,
									autoExpandColumn: 'email',
									clicksToEdit: 1,
									style: 'padding-bottom:15px',
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
											id: 'email',
											editor: false
										},{
											header: 'Name',
											sortable: true,
											dataIndex: 'name',
											id: 'name',
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
								}), {
									html: '<small><b>Note:</b> you will not be able to select, edit or delete your own user, '+user.email+'</small>',
									border: false
								}
							]
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
				html: user.admin_domains.join('<br />'),
				cellCls: 'alignTop',
				border: false
			});
		}
		infoPanel.doLayout();
		west.on('load', function(treeloader, node) {
			new Ext.util.DelayedTask(function() {
				west.getNodeById('user-info').select();
			}, this).delay(0);
		}, this);
		west.getSelectionModel().on('selectionchange', clickTree, this);
		domainStore.on('update', function(store, record, operation) {
			saveDomainBtn.enable();
			revertDomainBtn.enable();
		}, this);
		userStore.on('update', function(store, record, operation) {
			saveUserBtn.enable();
			revertUserBtn.enable();
		}, this);
		domainStore.on('loadexception', loadException, this);
		userStore.on('loadexception', loadException, this);
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
				resetPassBtn.enable();
			} else {
				removeUserBtn.disable();
				resetPassBtn.disable();
			}
		}, this);
		domainGrid.on('beforeedit', function(e) {
			if(e.record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
		userGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
	}

	var loadException = function(item, options, response, error) {
		var msg = 'Unknown Error';
		if(response && response.statusText) {
			msg = response.statusText;
		}
		showError(msg);
	}

	var addDomain = function() {
		domainGrid.stopEditing();
		domainStore.insert(0, new domainRecord({
			domain_id: 0,
			domain: ''
		}));
		domainGrid.startEditing(0, 1);
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
						new Ext.form.Label({
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="add-email-address>username@domain</div>',
							cls: 'x-form-item'
						}),
						new Ext.ux.PasswordMeter({
							fieldLabel: 'Password',
							name: 'password',
							id: 'add-user-password',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validNewPass,
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
		}, this).delay(500);
	}

	var updateAddUserEmail = function(field, newval, oldval) {
		Ext.get('add-email-address').update(addUserUsername.getValue()+'@'+addUserDomain.getEl().getValue());
	}

	var hideAddUserWindow = function() {
		Ext.getCmp('add-user-form').getForm().reset();
		Ext.get('add-email-address').update('username@domain');
		addUserWindow.hide(addUserBtn.getEl());
	}

	var addNewUser = function() {
		disablePage('Adding user...', 'Please wait');
		Ext.getCmp('add-user-form').getForm().submit({
			success: addUserSuccess,
			failure: formFailure
		});
	}

	var addUserSuccess = function(form, action) {
		hideAddUserWindow();
		revertUsers();
		showInfo('User added', 'User added successfully');
	}

	var removeSelectedDomains = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Removing Domains',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these domains?</td></tr>'+
			     '<tr><td>All associated email address, aliases and forwarders will be deleted.</td></tr>'+
			     '<tr><td>All other domain changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedDomains();
				}
			}
		});
	}

	var removeSelectedUsers = function() {
		// TODO
	}

	var resetPassword = function() {
		// TODO
	}

	var doRemoveSelectedDomains = function() {
		selected = domainSm.getSelections();
		var removed = 0;
		for(var i = 0; i < selected.length; i++) {
			if(user.domain == selected[i].get('domain')) {
				showError('Can not delete domain:<br />'+user.domain+'<br />It will delete your account');
				continue;
			}
			removed++;
			if(selected[i].get('domain_id') != 0) {
				removedDomains.push(selected[i].get('domain_id'));
			}
			selected[i].commit();
			domainStore.remove(selected[i]);
		}
		if(removed > 0) {
			saveDomains();
		}
	}

	var saveDomains = function() {
		var addedDomains = new Array();
		var modifiedDomains = new Array();
		var modified = domainStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			if(modified[i].get('domain_id') == 0) {
				addedDomains.push(modified[i].getChanges().domain);
			} else {
				modifiedDomains.push(modified[i].get('domain_id') + ':' + modified[i].getChanges().domain);
			}
		}
		domainMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Saving...'});
		domainMask.show();
		Ext.Ajax.request({
			url: 'data/domains.php',
			success: completeSaveDomains,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				add: addedDomains.join(','),
				update: modifiedDomains.join(','),
				remove: removedDomains.join(',')
			}
		});
	}

	var saveUsers = function() {
		// TODO
	}

	var completeSaveDomains = function() {
		domainMask.hide();
		domainStore.commitChanges();
		removedDomains = new Array();
		revertDomains();
	}

	var revertDomains = function() {
		saveDomainBtn.disable();
		revertDomainBtn.disable();
		loadDomains();
	}

	var revertUsers = function() {
		saveUserBtn.disable();
		revertUserBtn.disable();
		loadUsers();
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

	var validNewPass = function(pass) {
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
		center.getLayout().setActiveItem(node.id+'-panel');
		center.doLayout();
		if((node.id == 'manage-domains') && (!domainsLoaded)) {
			loadDomains();
		} else if((node.id == 'manage-users') && (!usersLoaded)) {
			loadUsers();
		}
	}

	var loadDomains = function() {
		domainStore.removeAll();
		domainsLoaded = false;
		domainStore.load({
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

	var parseUserInfo = function(response, options) {
		var data = Ext.util.JSON.decode(response.responseText);
		if(!data.success) {
			showLogin();
			return;
		} else {
			user = data.user;
			if(loginWindow) {
				loginWindow.hide();
				Ext.getCmp('loginForm').getForm().reset()
				enablePage();
			}
			showPortal();
		}
	}

	var showLogin = function() {
		if(loginWindow) {
			loginWindow.show();
			new Ext.util.DelayedTask(function() {
				Ext.getCmp('loginUser').focus();
			}, this).delay(0);
			return;
		}
		loginWindow = new Ext.Window({
			applyTo: 'login',
			layout: 'fit',
			width: 350,
			height: 300,
			closable: false,
			plain: false,
			resizable: false,
			title: 'Log In',
			items: [{
				layout: 'form',
				xtype: 'form',
				url: 'data/login.php',
				frame: true,
				monitorValid: true,
				id: 'loginForm',
				// TODO prevent enter on the submit button from double submitting
				//keys: [{
				//	key: Ext.EventObject.ENTER,
				//	fn: doLogin
				//}],
				items: [{
					html: '<div style="text-align: center;"><img src="/images/rubix_consulting_medium.png" /></div>'
				},{
					xtype: 'fieldset',
					autoHeight: true,
					title: 'User Information',
					labelWidth: 125,
					defaultType: 'textfield',
					defaults: {
						width: 150,
						msgTarget: 'side'
					},
					layoutConfig: {
						labelSeparator: ''
					},
					items: [{
						fieldLabel: 'User Name',
						name: 'user',
						id: 'loginUser',
						allowBlank: false
					},{
						fieldLabel: 'Password',
						name: 'pass',
						id: 'loginPass',
						allowBlank: false,
						inputType: 'password'
					}]
				}],
				buttons: [{
					text: 'Log In',
					formBind: true,
					handler: doLogin
				}]
			}]
		});
		loginWindow.show();
		new Ext.util.DelayedTask(function() {
			Ext.getCmp('loginUser').focus();
		}, this).delay(0);
	}

	var disablePage = function(msg, title) {
		Ext.Msg.wait(msg, title);
	}

	var enablePage = function() {
		Ext.Msg.hide();
	}

	var changePassword = function() {
		disablePage('Changing password...', 'Please wait');
		Ext.getCmp('change-password-form').getForm().submit({
			success: changePasswordSuccess,
			failure: formFailure
		});
	}

	var changePasswordSuccess = function(form, action) {
		Ext.getCmp('change-password-form').getForm().reset();
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

	var doLogin = function() {
		disablePage('Logging in...', 'Please wait');
		Ext.getCmp('loginForm').getForm().submit({
			success: completeLogin,
			failure: loginFailure
		});
	}

	var loginFailure = function() {
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
		Ext.Ajax.request({
			url: 'data/logout.php',
			success: completeLogout,
			failure: ajaxFailure
		});
	}

	var completeLogout = function() {
		viewport.destroy();
		user = null;
		// TODO clear all necessary variables here
		domainStore.removeAll();
		domainsLoaded = false;
		userStore.removeAll();
		usersLoaded = false;
		getUserInfo();
	}

	var completeLogin = function(form, action) {
		getUserInfo();
	}

	// public space
	return {
		// public properties

		// public methods
		init: function() {
			Ext.BLANK_IMAGE_URL = '/js/ext/resources/images/default/s.gif';
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
			getUserInfo();
		}
	};
}();

Ext.onReady(RubixConsulting.user.init, RubixConsulting.user);
