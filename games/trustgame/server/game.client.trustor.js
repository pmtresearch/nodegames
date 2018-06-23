module.exports = function(stager) {
// Load the respondent interface.
  node.on.data('TRUSTOR', function(msg) {
    console.log('RECEIVED TRUSTOR!');
    other = msg.data.other;
    node.set('ROLE', 'TRUSTOR');

    W.loadFrame('/trustgame/trustor.html', function() {
      var trustorContent = W.getElementById('trustorContent');
      var trustorErrors = W.getElementById('trustorErrors');

      var setUpTrustTimer = function() {
        var options = {
          milliseconds: node.env.timeout,
          timeup: function() {
            node.emit('TRUST_DONE', other, Math.floor(Math.random() * node.env.coins));
          }
        };

        node.game.timer.startTiming(options);

        node.env('auto', function() {
          node.timer.randomExec(function() {
            node.emit(
                'TRUST_DONE',
                other,
                Math.floor(Math.random() * node.env.coins)
            );
          }, 4000);
        });
      };

      node.on('TRUST_DONE', function(other, trustAmount) {
        console.log('Trusted trustee with ' + trustAmount);
        node.set('trustAmount', {
            amount: trustAmount,
            other: other
        });

        node.say('TRUST_DONE', other, trustAmount);

        trustorErrors.innerHTML = '';
        trustorContent.innerHTML = '<h3>Waiting for the trustee ... (gave ' +
          trustAmount + ')</h3>';

        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: node.env.timeout});
        node.game.timer.mainBox.hideBox();
      });

      setUpTrustTimer();
      trustorContent.innerHTML =
      '<h3>For how much money do you trust the other player for?</h3>' +
      '<input type="number" min="0" max="' + node.env.coins + '" id="trustAmount" />' +
      '<input type="button" value="Submit" id="trustWithMoney" class="btn" />';

      var trustWithMoney = W.getElementById('trustWithMoney');
      trustWithMoney.onclick = function() {
        var trustAmount = W.getElementById('trustAmount');
        if (!stager.isValidBid(trustAmount.value)) {
          trustorErrors.innerHTML = 'Please enter a number between 0 and ' + node.env.coins;
          return;
        }

        node.emit('TRUST_DONE', other, trustAmount.value);
      };

      node.on.data('RETURN_DONE', function(msg) {
        trustorContent.innerHTML = '<h3>You got an amount of ' + msg.data + ' back.</h3>';
        node.timer.randomEmit('DONE', 3000);
      });
    });
  });
};

