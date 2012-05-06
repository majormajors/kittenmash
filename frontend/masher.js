W=400
H=400
pi = 3.141592
function C(constructor, methods) {
    var rval = Class.create();
    methods.initialize = constructor;
    rval.prototype = methods;
    return rval;
}

var Vector = C ( function(x,y) {
    this.x = x;
    this.y = y;
}, {
    add: function(vec) {
	return new Vector(this.x + vec.x, this.y + vec.y);
    },
    sub:  function (vec) {
	return new Vector(this.x - vec.x, this.y - vec.y);
    },
    clip: function() {
	//return new Vector(Math.max(0, this.x), Math.max(0, this.y));
	return this;
    }
});

V = function (x,y) { return new Vector(x,y); }

function angleVec(theta, len) {
    return V(Math.cos(theta) * len, Math.sin(theta) * len);
}

var KittenFrame = C ( function(canvas) {
    this.background = null;
    this.slices = [];
    this.canvas = canvas;
},
{
    init : function () {
	var startPath = new Path();
	startPath.addPoint(V(0,0));
	startPath.addPoint(V(0,300));
	startPath.addPoint(V(300,300));
	startPath.addPoint(V(300,0));
	this.slices.push(new KittenPiece($("kitten"), null ,startPath, V(0,0) ));
	this.background = new Background($("bg"));
	this.canvas.height = W;
	this.canvas.width = H;
    },

    render : function() {
	var ctx = this.canvas.getContext("2d");
	ctx.fillRect(0,0,400,400);
	this.background.render(ctx);
	this.slices.each( function (slice) { 
	    slice.render(ctx);
	}.bind(this));

	//if (this.slices.length == 1) this.slices[0].render(ctx);
	//else this.slices[2].render(ctx);
    },
    
    click : function(pt) {
	slices_out = []
	this.slices.each(function(slice) {
	    if (slice.hitDetect(pt)) {
		mashees = slice.mash(pt);
		slices_out = slices_out.concat(mashees);
	    }
	    else {
		slices_out.push(slice);
	    }
	});
	this.slices = slices_out
	this.render();
    }
    
});

var Kitten = C ( function(img, x,y, w,h) {
    this.img = img;
    this.pos = V(x,y)
    this.size = V(w,h)
}, {
    render : function(canvas) {
	canvas.drawImage(this.img, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
});

function cross(a,b) {
    return a.x * b.y - a.y * b.x;
}

function CCW(a,b,c) {
    slope1 = b.sub(a)
    slope2 = b.sub(c)
    return cross(slope2, slope1) < 0;
}

var Path = C(function() {
    this.points = []
}, {
    addPoint : function(pt) {
	this.points.push(pt)
    },
    transpose: function(trans) {
	this.points = this.points.map(function(pt) { 
	    return pt.add(trans);
	})
    },
    copy: function() {
	var p = new Path();
	this.points.each(function (pt) {
	    p.addPoint(pt);
	});
	return p;
    },
    applyToCanvas: function(ctx) {
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y)
	this.points.slice(1).each(function (pt) {
	    ctx.lineTo(pt.x, pt.y);
	});
	ctx.closePath();
    },
    clip: function(ctx) {
	this.applyToCanvas(ctx);
	ctx.clip();
    },
    hitDetect: function(pt) {
	if (this.points.length != 3) return true;
	return CCW(this.points[0], this.points[1], pt) == CCW(this.points[1], this.points[2], pt) && CCW(this.points[1], this.points[2], pt) == CCW(this.points[2], this.points[0], pt);
    }
});

var MultiPath = C(function(paths) {
    this.paths = paths.map(function(p) { return p.copy(); });
}, {
    clip: function (ctx) {
	this.paths.each(function (path) { path.clip(ctx); });
    },
    transpose: function(v) {
	this.paths.each( function(path) { path.transpose(v); } );
    },
    copy: function() {
	p = new MultiPath(this.paths.map(function(p) { return p.copy() }));
	return p;
    },
    hitDetect: function(pt) {
	return this.paths.all(function (p) { return p.hitDetect(pt) })
    }
});

function makeTriangleInfinite(pt, theta1, theta2) {
    var p = new Path();
    p.addPoint(pt);
    p.addPoint(pt.add(angleVec(theta1, 1000)).clip());
    p.addPoint(pt.add(angleVec(theta2, 1000)).clip());
    return p;
}

var KittenPiece = C( function(img, borders, clip, transpose) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = W
    this.canvas.height = H
    if (borders)
	this.clip = new MultiPath([borders,clip])
    else 
	this.clip = clip.copy();

    this.clip.transpose(transpose)
    
    ctx = this.canvas.getContext("2d");
    ctx.save();
    this.clip.clip(ctx)
    ctx.drawImage(img, transpose.x, transpose.y);
    ctx.restore();
},
{
    render: function(ctx) {
	ctx.drawImage(this.canvas, 0,0);
    },
    mash: function(pt) {
	pieces = [[0, 2*pi/3] ,
		  [2*pi/3, 4*pi/3],
		  [4*pi/3, 0]]
	
	return pieces.map(function(piece) {
	    return new KittenPiece(this.canvas, makeTriangleInfinite(pt, piece[0], piece[1]), this.clip,
				   angleVec(piece[0], 5).add(angleVec(piece[1], 5)) )

	}.bind(this))
    },
    hitDetect: function(pt) {
	return this.clip.hitDetect(pt);
    }
});
		

var Background = C( function() {

}, {
    render: function() {

    }
});


function start() {
    var kf = new KittenFrame($("kittenmasher"));
    kf.init();
    kf.render();
    $("kittenmasher").addEventListener("click", function(e) {
	kf.click(V(e.clientX, e.clientY));
    })
}