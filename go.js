$(function() {
  var width = 800,
      height = 600,
      growthSpeed = 0.5,
      movementSpeed = 0.05,
      movementShrinkSpeed = 0.01,
      playerInitialSize = 20,
      playerInitialPosition = {x: 400, y: 300},
      r = Raphael("map", width, height);

  $(r).focus();

  var xMomentum = 0;
  var yMomentum = 0;
  // var background = r.rect(0, 0, width, height).attr({fill: "90-#222-#000"}).toBack();
  var background = r.circle(400, 300, width/1.55).attr({fill: "r#222-#000"}).toBack();
  var targets = [
    r.circle(411, 330, 10),
    r.circle(429, 316, 10),
    r.circle(439, 347, 20),
    r.circle(439, 390, 20),
    r.circle(466, 424, 20),
    r.circle(508, 432, 20),
    r.circle(546, 412, 20),
    r.circle(561, 372, 20),
    r.circle(548, 331, 20),
    r.circle(498, 370, 40),
  ];
  $.each(targets, function(index, item) {
    targets.push(r.circle(item.attr('cx'), height - item.attr('cy'), item.attr('r')));
    targets.push(r.circle(width - item.attr('cx'), item.attr('cy'), item.attr('r')));
    targets.push(r.circle(width - item.attr('cx'), height - item.attr('cy'), item.attr('r')));
  });
  $.each(targets, function(index, item) {
    item.attr({
      'stroke': "#555",
      'stroke-width': 1,
      'fill': "#333",
    });
  });
  var circle = r.circle(playerInitialPosition['x'], playerInitialPosition['y'], playerInitialSize)
    .attr({
      'stroke': "#f00", 
      'stroke-width': 2, 
      'fill': "r#900-#400",
      'opacity': 1
    })
    .toFront();
  var scoreLabel = r.text(60, 580, 'SCORE:').attr({'font-size': 25, 'opacity': 0.4, fill: '#fff'}); 
  var score = r.text(150, 580, circle.attr('r')).attr({'font-size': 25, 'opacity': 0.5, fill: '#fff'}); 


  var keyFunctionMap = { 
    '37': function (amount) { alterXMomentum(-1 * amount) },
    '38': function (amount) { alterYMomentum(-1 * amount) },
    '39': function (amount) { alterXMomentum(amount) },
    '40': function (amount) { alterYMomentum(amount) }
  };

  var keyStatus = {
    '37': false,
    '38': false,
    '39': false,
    '40': false
  };

  // Set up key bindings
  $(window).keydown(function(e) {
    if (e.keyCode in keyStatus)
      keyStatus[e.keyCode] = true;
  });
  $(window).keyup(function(e) {
    if (e.keyCode in keyStatus)
      keyStatus[e.keyCode] = false;
  });

  function loop() {
    // Adjust the momentum based on key state
    $.each(keyStatus, function(key, value) {
      if (value == true) {
        keyFunctionMap[key](movementSpeed);
      }
    });

    // Move the bubble
    circle.translate(xMomentum, yMomentum);
    circle.attr('r', circle.attr('r') - (movementShrinkSpeed * (Math.abs(xMomentum) + Math.abs(yMomentum))));

    // Check impact
    $.each(targets, function(index, target) {
      if (areTouching(circle, target)) {
        runConsumption(circle, target);
      }
    });

    checkGameStatus();
    score.attr('text', circle.attr('r').toFixed(1));
  }
  var loopInterval = setInterval(loop, 20);

  function alterXMomentum(amount) {
    xMomentum = xMomentum + amount;
  }
  function alterYMomentum(amount) {
    yMomentum = yMomentum + amount;
  }

  function areTouching(circle1, circle2) {
    if (circle1 == null || circle2 == null) {
      return false;
    }
    var distance = Math.sqrt(
        Math.pow(circle1.attr('cx') - circle2.attr('cx'), 2) 
      + Math.pow(circle1.attr('cy') - circle2.attr('cy'), 2)
    );
    if (distance <= (circle1.attr('r') + circle2.attr('r'))) {
      return true;
    }
    return false;
  }
  function computeGrowth(radius1, radius2) {
    var shrunk = ((radius1 - 1) / radius1);
    var ratio  = radius2 / radius1;
    return ratio * shrunk * growthSpeed;
  }
  function grow(c, a) {
    c.attr('r', c.attr('r') + a);
  }
  function shrink(c, a) {
    if (c.attr('r') - a <= 1) {
      var i = targets.indexOf(c);
      if (i != -1) {
        targets.splice(i, 1);
        c.remove();
      }
      else {
        c.attr('removed', true);
        c.remove();
      }
    }
    else {
      c.attr('r', c.attr('r') - a);
    }
  }

  function runConsumption(circle1, circle2) {
    if (circle1.attr('r') >= circle2.attr('r')) {
      grow(circle1, computeGrowth(circle1.attr('r'), circle2.attr('r')));
      shrink(circle2, 1);
    }
    else {
      grow(circle2, 1);
      shrink(circle1, 1);
    }
  }

  function checkGameStatus() {
    if (circle.attr('removed') || circle.attr('r') <= 1) {
      // game over -- you lose
      clearInterval(loopInterval);
      $.each(targets, function(index, item) { item.hide() });
      r.text(404, 304, "GAME\nOVER").attr({'font-size': 180, fill: "#280000", 'stroke-width': 20, 'stroke': '#280000'});
      r.text(400, 300, "GAME\nOVER").attr({'font-size': 180, fill: "red"});
    }

    if (targets.length == 0) {
      // you won!
      clearInterval(loopInterval);
      $.each(targets, function(index, item) { item.hide() });
      r.text(404, 304, "YOU\nWIN!").attr({'font-size': 200, 'fill': '#002800', 'stroke-width': 20, 'stroke': '#002800'});
      r.text(400, 300, "YOU\nWIN!").attr({'font-size': 200, fill: 'green'});
    }
  }

});
