

$(document).ready(function() {

	// fetch latest ones

	$('table.scores tbody').html('');

	getScores();

	var currentOffset = 0;
	var limit = 10;

	var startRefreshingScores = function() {
		getScores();
		setTimeout(startRefreshingScores, 5000);
	}
	startRefreshingScores();

	function getScores() {
		var criteria = {
			skip: currentOffset,
			limit: limit
		};
		
		$.ajax({
			url: '/api/scoreboard',
			type: 'POST',
			dataType: 'json',
			data: criteria,
			success: function(data) {
				var currentPage;
				var totalPages = Math.ceil(parseInt(data.totalUsers / limit));
				if ((data.totalUsers % limit) != 0) {
					totalPages++;
				}

				currentPage = currentOffset / limit + 1;
				if ((currentOffset + limit) >= data.totalUsers) {
					currentOffset = 0;
				} else {
					currentOffset = currentOffset + limit;
				}

				$('table.scores .pagination').html(['Page ', currentPage, ' of ', totalPages].join(''));
				$('table.scores tbody').html('');
				$(data.scores).each(function() {
					// email, nickname, painGameScore, playedPainGame
					var userId = this._id;
					var nickname = this.nickname;

					var tr = $('<tr />')
						.append($('<td />').html('&#10003;'))
						.append($('<td />').html(this.nickname));

					$('table.scores tbody').append(tr);
				});
			}
		});

	}
});