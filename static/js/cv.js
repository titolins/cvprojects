
document.addEventListener("DOMContentLoaded", function() {
  var mainContext = document.getElementById('cv-wrapper');
  mainArea = new Area(mainContext);
  mainArea.span();
  obj = new MovingObject(mainArea);
  obj.span();
  newObj = new MovingObject(mainArea);
  newObj.span();

  window.addEventListener("keydown", function(e) {
    var direction,
        keyCode = e.keyCode,
        distance = 5;
    if (keyCode >= 37 && keyCode <= 40) {
      if (keyCode == 38 || keyCode == 75) direction = 't';
      else if (keyCode == 40 || keyCode == 74) direction = 'd';
      else if (keyCode == 37 || keyCode == 72) direction = 'l';
      else if (keyCode == 39 || keyCode == 76) direction = 'r';
      obj.move(direction, distance);
    } else {
      if (keyCode == 38 || keyCode == 75) direction = 't';
      else if (keyCode == 40 || keyCode == 74) direction = 'd';
      else if (keyCode == 37 || keyCode == 72) direction = 'l';
      else if (keyCode == 39 || keyCode == 76) direction = 'r';
      newObj.move(direction, distance);
    }
  }, false);
});

var ObjectLocator = function() {
  var self = this;

  this.position = [];

  this.updatePosition = function(object) {
    var compStyle = getComputedStyle(object);
    self.position = [
      // x axis
      [
        //left
        parseInt(compStyle.left),
        //right
        parseInt(compStyle.left)+parseInt(compStyle.width),
      ],
      // y axis
      [
        //top
        parseInt(compStyle.top),
        //bottom
        parseInt(compStyle.top)+parseInt(compStyle.height),
      ],
    ];
  };

  this.getPosition = function() {
    //return this.obj.getBoundingClientRect();
    return self.position;
  };

  this.getLeft = function() {
    return self.getPosition()[0][0];
  };

  this.getRight = function() {
    return self.getPosition()[0][1];
  };

  this.getTop = function() {
    return self.getPosition()[1][0];
  };

  this.getBottom = function() {
    return self.getPosition()[1][1];
  };

};

var ObjectBuilder = function() {

  var self = this;

  this.createElement = function(style) {
    var elem = document.createElement('div');
    for (k in style) {
      elem.style[k] = style[k];
    }
    return elem;
  };

  this.span = function(child, domObj) {
    domObj.appendChild(child.obj);
    child.locator.updatePosition(child.obj);
    child.id = ++ObjectBuilder.objCounter;
  };

};

ObjectBuilder.objCounter = 0;

var Area = function(domElement, width, height, color) {
  var self = this;
  this.children = [];

  this.style = {
    width: width || '75%',
    height: height || '75%',
    'background-color': color || '#FFF',
    position: 'relative',
    left: '50%',
    'margin-left': '-37.5%',
    border: '2px solid lightblue',
  };

  this.context = domElement;

  var builder = new ObjectBuilder();
  this.obj = builder.createElement(this.style);
  this.locator = new ObjectLocator();

  this.span = function() { builder.span(self, self.context); };

  this.getDirectionLimit = function(obj, direction) {
    var limit;
    var objPosition = obj.locator.getPosition();
    for (var i = 0; i < self.children.length; i++) {
      var child = self.children[i];
      //console.log(child);
      if (child.id !== obj.id) {
        var childPos = child.locator.getPosition();
        var relevantChildPos,
            relevantObjPos;
        if (direction === 't' || direction === 'l') {
          if (direction === 't') { relevantChildPos = childPos[1][1]; relevantObjPos = objPosition[1][0]; }
          else { relevantChildPos = childPos[0][1]; relevantObjPos = objPosition[0][0]; }
          if (relevantChildPos <= relevantObjPos && (inRange(direction, objPosition, childPos)) && (limit === undefined || limit < relevantChildPos)) limit = relevantChildPos;
        } else if (direction === 'd' || direction === 'r') {
          if (direction === 'd') { relevantChildPos = childPos[1][0]; relevantObjPos = objPosition[1][1]; }
          else { relevantChildPos = childPos[0][0]; relevantObjPos = objPosition[0][1]; }
          if (relevantChildPos >= relevantObjPos && (inRange(direction, objPosition, childPos)) && (limit === undefined || limit > relevantChildPos)) limit = relevantChildPos;
        }
      }
    }
    return limit;
  };

  function inRange(direction, objPos, childPos) {
    var relevantRange,
        relevantPos,
        inRange;
    if (direction === 't' || direction === 'r') {
      if (direction === 't') { relevantRange = childPos[0]; relevantPos = objPos[0] }
      else { relevantRange = childPos[1]; relevantPos = objPos[1]; }
      inRange = (
        (relevantPos[0] === relevantRange[0] && relevantPos[1] === relevantRange[1]) ||
        (relevantPos[0] > relevantRange[0] && relevantPos[0] < relevantRange[1]) ||
        (relevantPos[1] > relevantRange[0] && relevantPos[1] < relevantRange[1]));
    } else {
      if (direction === 'd') { relevantRange = childPos[0]; relevantPos = objPos[0] }
      else { relevantRange = childPos[1]; relevantPos = objPos[1]; }
      inRange = (
        (relevantPos[0] === relevantRange[0] && relevantPos[1] === relevantRange[1]) ||
        (relevantPos[0] < relevantRange[1] && relevantPos[0] > relevantRange[0]) ||
        (relevantPos[1] < relevantRange[1] && relevantPos[1] > relevantRange[0]));
    }
    return inRange;
  };

}

var MovingObject = function(domElement, width, height, color) {

  var self = this;

  var defaultSize = 15;

  var animate;

  this.style = {
    width: width || defaultSize + 'px',
    height: height || defaultSize + 'px',
    'background-color': color || 'black',
    position: 'absolute',
    top: (0+(ObjectBuilder.objCounter*(height||defaultSize)))+'px',
    left: (0+(ObjectBuilder.objCounter*(height||defaultSize)))+'px',
  };

  this.context = domElement;

  var builder = new ObjectBuilder();
  this.obj = builder.createElement(this.style);
  this.locator = new ObjectLocator();

  this.span = function() {
    builder.span(self, self.context.obj);
    self.context.children.push(self);
  };

  this.walk = function(direction, distance, speed, wait) {
    speed |= 2;
    wait |= 50;
    var res = this.move(direction, speed);
    if (res === true && distance > 0) {
      animate = setTimeout(function() { self.walk(direction, (distance-speed), speed) }, wait);
    }
  };

  this.stop = function() {
    clearTimeout(animate);
  };

  this.moveDown = function(dist) {
    return this.move('d', dist);
  };

  this.moveTop = function(dist) {
    return this.move('t', dist);
  };

  this.moveLeft = function(dist) {
    return this.move('l', dist);
  };

  this.moveRight = function(dist) {
    return this.move('r', dist);
  };

  this.move = function(direction, distance) {
    var curValue,
        nextValue,
        limit,
        styleProp,
        res = true,
        dirLimit = self.context.getDirectionLimit(self, direction);
    distance |= 1;
    if (direction === 't' || direction === 'l') {
      limit = dirLimit || 0;
      if (direction === 't') { curValue = self.locator.getTop(); styleProp = 'top'; }
      else { curValue = self.locator.getLeft(); styleProp = 'left'; }
      nextValue = curValue - distance;
      if (nextValue <= limit) { nextValue = limit; res = false; }
    } else if (direction === 'd' || direction === 'r') {
      var contextStyleProp,
          incValue;
      if (direction === 'd') { curValue = self.locator.getTop(); styleProp = 'top'; contextStyleProp = 'height'; }
      else { curValue = self.locator.getLeft(); styleProp = 'left'; contextStyleProp = 'width'; }
      incValue = parseInt(getComputedStyle(self.obj)[contextStyleProp]);
      limit = (dirLimit || parseInt(getComputedStyle(self.context.obj)[contextStyleProp])) - incValue;
      nextValue = curValue + distance;
      if (nextValue >= limit) { nextValue = limit; res = false; }
    }
    self.obj.style[styleProp] = nextValue + 'px';
    self.locator.updatePosition(self.obj);
    return res;
  };
};
