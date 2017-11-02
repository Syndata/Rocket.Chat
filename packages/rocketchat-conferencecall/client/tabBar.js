Meteor.startup(function() {
	Tracker.autorun(function() {
		const provider = RocketChat.conferenceCallProviders.getProvider(RocketChat.settings.get('ConferenceCall_Provider'));

		if (RocketChat.settings.get('ConferenceCall_Enabled')) {
			RocketChat.TabBar.addButton({
				groups: ['direct', 'group'],
				id: 'video',
				i18nTitle: 'Video Chat',
				icon: 'video',
				iconColor: 'red',
				template: provider.templateName,
				width: 600,
				order: 12
			});
		} else {
			RocketChat.TabBar.removeButton('video');
		}
	});

	Tracker.autorun(function() {
		if (RocketChat.settings.get('ConferenceCall_Enabled') && RocketChat.settings.get('ConferenceCall_Enable_Channels')) {
			RocketChat.TabBar.addGroup('video', ['channel']);
		} else {
			RocketChat.TabBar.removeGroup('video', ['channel']);
		}
	});

	Tracker.autorun(function() {
		if (RocketChat.settings.get('ConferenceCall_Enabled')) {
			// Load from the jitsi meet instance.
			if (typeof JitsiMeetExternalAPI === 'undefined') {
				const prefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
				$.getScript(`${ prefix }/packages/rocketchat_conferencecall-jitsi/client/public/external_api.js`);
			}

			// Compare current time to call started timeout.  If its past then call is probably over.
			if (Session.get('openedRoom')) {
				const rid = Session.get('openedRoom');

				const room = RocketChat.models.Rooms.findOne({_id: rid});
				const currentTime = new Date().getTime();
				const jitsiTimeout = new Date((room && room.jitsiTimeout) || currentTime).getTime();

				if (jitsiTimeout > currentTime) {
					RocketChat.TabBar.updateButton('video', { class: 'attention' });
				} else {
					RocketChat.TabBar.updateButton('video', { class: '' });
				}
			}
		}
	});
});
