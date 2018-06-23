module.exports = function(stager) {
  // Load the TRUSTEE interface.
  node.on.data('TRUSTEE', function(msg) {
    console.log('RECEIVED TRUSTEE!');
    other = msg.data.other;
    node.set('ROLE', 'TRUSTEE');

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // W.loadFrame takes an optional third 'options' argument which
    // can be used to request caching of the displayed frames (see
    // the end of the following function call). The caching mode
    // can be set with two fields: 'loadMode' and 'storeMode'.
    //
    // 'loadMode' specifies whether the frame should be reloaded
    // regardless of caching (loadMode = 'reload') or whether the
    // frame should be looked up in the cache (loadMode = 'cache',
    // default).  If the frame is not in the cache, it is always
    // loaded from the server.
    //
    // 'storeMode' says when, if at all, to store the loaded frame.
    // By default the cache isn't updated (storeMode = 'off'). The
    // other options are to cache the frame right after it has been
    // loaded (storeMode = 'onLoad') and to cache it when it is
    // closed, that is, when the frame is replaced by other
    // contents (storeMode = 'onClose'). This last mode preserves
    // all the changes done while the frame was open.
    //
    /////////////////////////////////////////////
    W.loadFrame('/trustgame/trustee.html', function() {
      var trusteeContent = W.getElementById('trusteeContent');
      var trusteeErrors = W.getElementById('trusteeErrors');

      node.on('RETURN_DONE', function(other, returnAmount) {
        console.log('Returned ' + returnAmount);
        node.set('returnAmount', {
            amount: returnAmount,
            other: other
        });

        node.say('RETURN_DONE', other, returnAmount);
        node.timer.randomEmit('DONE', 3000);

        trusteeErrors.innerHTML = '';
        trusteeContent.innerHTML = '<h3>You returned an amount of ' +
            returnAmount + '.</h3>';
      });

      node.on.data('TRUST_DONE', function(message) {
        var trustAmount = message.data;
        trusteeContent.innerHTML =
          '<h3>You were trusted for ' + trustAmount +
              '. How much do you want to return?</h3>' +
          '<input type="number" min="0" max="' + trustAmount +
              '" id="returnAmount" />' +
          '<input type="button" value="Submit" id="returnMoney" class="btn" />';

        var returnMoney = W.getElementById('returnMoney');
        returnMoney.onclick = function() {
          var returnAmount = W.getElementById('returnAmount').value;
          if (!stager.isValidBid(returnAmount, 0, trustAmount)) {
            trusteeErrors.innerHTML =
                'Please enter a number between 0 and ' + trustAmount;
            return;
          }

          node.emit('RETURN_DONE', other, returnAmount);
        };

        setUpReturnTimer(trustAmount);
      });

      // Start the timer after an offer was received.
      node.game.timer.startWaiting({milliseconds: node.env.timeout});
      node.game.timer.mainBox.hideBox();

      trusteeContent.innerHTML = '<h3>Waiting on the trustor ...</h3>';

      var setUpReturnTimer = function(trustAmount) {
        var options = {
          milliseconds: node.env.timeout,
          timeup: function() {
            node.emit('RETURN_DONE', other, Math.floor(Math.random() * trustAmount));
          }
        };

        node.game.timer.clear();
        node.game.timer.startTiming(options);

        node.env('auto', function() {
          node.timer.randomExec(function() {
            node.emit(
                'RETURN_DONE',
                other,
                Math.floor(Math.random() * trustAmount)
            );
          }, 4000);
        });
      };
    });
  });
};

