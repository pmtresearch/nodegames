var ngc = require('nodegame-client');

module.exports = function(settings) {
  var stager = ngc.getStager();

  stager.init()
    .next('precache')
    .next('instructions')
    .next('quiz')
    .repeat('trustgame', settings.REPEAT)
    .next('questionnaire')
    .next('endgame')
    .gameover();

  return stager.getState();
}
