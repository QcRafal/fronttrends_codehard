
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.scoreboard = function(req, res) {
	res.render('scoreboard', { title: 'OyaHero Scoreboard' });
};

exports.admin = function(req, res) {
	res.render('admin', { title: 'OyaHero Admin' });
}