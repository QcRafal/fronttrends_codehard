

$(document).ready(function() {

	// fetch latest ones
	searchOyaHero();
	fetchWinners();
	
	var timedCallback;
	var currentRequest;
	$('input[name="usersearch"]').bind('keyup', function(e) {
		if (timedCallback) {
			if (currentRequest) {
				currentRequest.abort();
			}
			clearTimeout(timedCallback);
		}
		var email = $(this).val();
		timedCallback = setTimeout(function() {
			searchOyaHero(email);
			timedCallback = null;
		}, 300);
	});

	function registerParticipation(userId, didWin) {
		currentRequest = $.ajax({
			url: '/admin/api/savewin',
			type: 'POST',
			dataType: 'json',
			data: {
				userId: userId,
				didWin: didWin
			},
			success: function() {
				console.log("Success!");
				searchOyaHero($('input[name="usersearch"]').val());
			},
			error: function() {
				alert("Couldn't register the score");
			}
		});

	}
	function fetchWinners() {

		$.ajax({
			url: '/admin/api/codewinners',
			type: 'GET',
			dataType: 'json',
			success: function(data) {
				$(data).each(function() {
					var tr = $('<tr />')
						.append($('<td />').html(this.email))
						.append($('<td />').html(this.nickname));
					$('table.winners tbody').append(tr);
				});
			}
		});
	}
	function searchOyaHero(email) {
		var criteria = {};
		if (email) {
			criteria.email = email;
		}

		$('table.userlist tbody').html('');

		$.ajax({
			url: '/admin/api/codeheroes',
			type: 'POST',
			dataType: 'json',
			data: {
				query: {
					limit: 20,
					criteria: criteria
				}
			},
			success: function(data) {

				$(data).each(function() {
					// email, nickname, painGameScore, playedPainGame
					var userId = this._id;
					var actionEmail = this.email;

					var didWinBtn = $('<button />').html('Register win').click(function() {
						var res = confirm("Confirm you want to register WIN for " + actionEmail);
						if (res) {
							console.log("Register win for user: " + userId);
							registerParticipation(userId, true);
						} else {
							alert("No action taken");
						}
					});
					var didLooseBtn = $('<button />').html('Register loss').click(function() {
						var res = confirm("Confirm you want to register LOSS for " + actionEmail);
						if (res) {
							console.log("Register loss for user: " + userId);
							registerParticipation(userId, false);
						} else {
							alert("No action taken");
						}
					});

					var tr = $('<tr />')
						.append($('<td />').html(this.email))
						.append($('<td />').html(this.nickname))
						.append($('<td />').html(this.painGameScore))
						.append($('<td />').html(this.playedPainGame ? 'Yes' : 'No'))
						.append($('<td />').append(didWinBtn).append(didLooseBtn) )

					$('table.userlist tbody').append(tr);
				});
			}
		});

	}
});