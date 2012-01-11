//any function that's CamelCaseUpperFirst is going to be a class

//hopefully this method of encapsulation is acceptable
var WSClient = new Object();

//debug mode constants
WSClient.USE_DEBUG_GRID = false;

//bunch o' constants
WSClient.GRID_TO_CANVAS = 15; //the scale used; 1 grid cell is this many pixels
WSClient.CORNER_CURVE_SIZE = WSClient.GRID_TO_CANVAS/5; //this determines how large we want the curved corners on territories to be


//this happens when the body of the page is loaded
WSClient.init = function() {
	//we're going to be doing a LOT of work with the canvas, so may as well store it
	this.canvas = $("#gameboard");
	this.ctx = this.canvas[0].getContext('2d'); //ditto for the 2D drawing context
	
	//initialize the grid that handles click-to-territory conversions (important!)
	this.grid = [];
	for (var i = 0; i < this.canvas[0].width / WSClient.GRID_TO_CANVAS; i++)
	{
		this.grid[i] = [];
		for (var j = 0; j < this.canvas[0].height / WSClient.GRID_TO_CANVAS; j++)
		{
			this.grid[i][j] = null;
		}
	}
	
	this.canvas.click(function(e){ WSClient.handleClick(e) });
	
	//a list of the territories on the game board (not actually ordered, but an array is handy
	this.terr = []; //"territory" is long, I'd rather just type "terr"
	
	this.selectedTerr = null;
}

//takes a territory in either JSON or object format
WSClient.addTerritory = function(terrData) {
	//check whether we need to parse JSON, or if we got an actual object
	var territory = typeof terrData == 'string' ? JSON.parse(terrData) : terrData;
	
	this.terr.push(new WSTerritory(territory.points));
}

WSClient.addDeployments = function(terrColors) {
	//check whether we need to parse JSON, or if we got an actual object
	var territory = typeof terrData == 'string' ? JSON.parse(terrData) : terrData;
	
	this.terr.push(new WSTerritory(territory.points));
}

//call this after all of the server-side initialization is done
WSClient.finalizeInit = function() {
	this.drawBoard();
	
	this.initializeGrid();
}

WSClient.initializeGrid = function() {
	for (var i = 0; i < this.grid.length; i++)
	{
		for (var j = 0; j < this.grid[i].length; j++)
		{
			//we do want that 0.5 there, in order to test the middle of the grid cell
			var x = (i + 0.5) * WSClient.GRID_TO_CANVAS;
			var y = (j + 0.5) * WSClient.GRID_TO_CANVAS;
			var p = new Point(x,y);
			
			for (var t = 0; t < this.terr.length; t++)
			{
				if (this.terr[t].contains(new Point(x,y)))
				{
					this.grid[i][j] = this.terr[t];
				}
			}
		}
	}
}


WSClient.handleClick = function(e) {
	var x = Math.floor((e.clientX - this.canvas.offset().left) / WSClient.GRID_TO_CANVAS);
	var y = Math.floor((e.clientY - this.canvas.offset().top) / WSClient.GRID_TO_CANVAS);
	
	this.selectedTerr = this.grid[x][y];
	
	this.drawBoard();
}

WSClient.drawBoard = function() {
	this.ctx.clearRect(0,0,this.canvas[0].width, this.canvas[0].height);
	for (var i = 0; i < this.terr.length; i++)
	{
		this.terr[i].draw(this.ctx);
	}
	
	if (this.USE_DEBUG_GRID)
	{
		this.ctx.strokeStyle = 'rgb(0,0,0)';
		this.ctx.lineWidth = 1;
		for (var x = 0; x < this.canvas[0].width; x += this.GRID_TO_CANVAS)
		{
			this.ctx.beginPath();
			this.ctx.moveTo(x-0.5,0);
			this.ctx.lineTo(x-0.5, this.canvas[0].height);
			this.ctx.stroke();
		}
		for (var y = 0; y < this.canvas[0].height; y += this.GRID_TO_CANVAS)
		{
			this.ctx.beginPath();
			this.ctx.moveTo(0,y-0.5);
			this.ctx.lineTo(this.canvas[0].width, y-0.5);
			this.ctx.stroke();
		}
	}
}

//takes a list of corners defining a bounded region on graph paper. Assumes that the shape is closed, so don't double-count the first/last point.
function WSTerritory(cornerPoints, owner) {
	this.corners = [];
	for (var i = 0; i < cornerPoints.length; i++)
	{
		//scaling points because we no longer care about the backend grid
		this.corners.push(new Point(cornerPoints[i].x * WSClient.GRID_TO_CANVAS, cornerPoints[i].y * WSClient.GRID_TO_CANVAS));
	}
	
	this.owner = owner;
}

//returns true if the given point on the canvas lies within the borders of this territory
WSTerritory.prototype.contains = function(point) {
	//English explanation of the algorithm: count how many border lines occur in each of the cardinal directions from the given point. If all of them are odd, then the point is inside the territory.
	var leftCount = 0;
	var rightCount = 0;
	var topCount = 0;
	var bottomCount = 0;
	
	for (var i = 0; i < this.corners.length; i++)
	{
		var next = (i+1) % this.corners.length;
		if (this.corners[i].x != this.corners[next].x) //horizontal line
		{
			if (point.x > Math.min(this.corners[i].x, this.corners[next].x) && point.x < Math.max(this.corners[i].x, this.corners[next].x))
			{
				if (point.y < this.corners[i].y)
				{
					topCount++;
				}
				else
				{
					bottomCount++;
				}
			}
		}
		else //must be a vertical line
		{
			if (point.y > Math.min(this.corners[i].y, this.corners[next].y) && point.y < Math.max(this.corners[i].y, this.corners[next].y))
			{
				if (point.x < this.corners[i].x)
				{
					leftCount++;
				}
				else
				{
					rightCount++;
				}
			}
		}
	}
	
	//return true ONLY if all counts are odd
	return (leftCount % 2 == 1 && rightCount % 2 == 1 && topCount % 2 == 1 && bottomCount % 2 == 1);
}

//draws the territory onto whatever canvas context we give it
WSTerritory.prototype.draw = function(ctx) {
	//TODO make the colors dynamic (and server-specified)
	ctx.strokeStyle = 'black';
	ctx.fillStyle = 'grey';
	
	ctx.lineWidth = 4;
	
	//note that this drawing path REQUIRES that all lines be parallel to the x/y axes, so that this.corners[i] and this.corners[i-1] differ in only one of x and y
	//also note that the drawing path REQUIRES that there be no degenerate corners (i.e., no straight lines with a "corner" somewhere in the middle)
	
	ctx.beginPath();
	ctx.moveTo(this.corners[0].x, this.corners[0].y);
	
	//this large for loop draws the rounded corners
	for (var i = 1; i < this.corners.length; i++) //yes, start at 1 - we already handled case 0 as a special case, and we're using i-1 in a few places
	{
		//Now, I COULD condense this, but I was having trouble coming up with the condensed version on the fly. Given that fact, I'm going to assume that the big gnarly list of conditionals is going to be easier to maintain than the succinct version, and, well, Dustin might want to play around with this later!
		
		var next = (i+1) % this.corners.length;
		
		if (this.corners[i-1].x < this.corners[i].x && this.corners[next].y > this.corners[i].y) //from left, towards down
		{
			ctx.lineTo(this.corners[i].x - WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x, this.corners[i].y + WSClient.CORNER_CURVE_SIZE);
		}
		else if (this.corners[i-1].x > this.corners[i].x && this.corners[next].y > this.corners[i].y) //from right, towards down
		{
			ctx.lineTo(this.corners[i].x + WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x, this.corners[i].y + WSClient.CORNER_CURVE_SIZE);
		}
		else if (this.corners[i-1].x < this.corners[i].x && this.corners[next].y < this.corners[i].y) //from left, towards up
		{
			ctx.lineTo(this.corners[i].x - WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x, this.corners[i].y - WSClient.CORNER_CURVE_SIZE);
		}
		else if (this.corners[i-1].x > this.corners[i].x && this.corners[next].y < this.corners[i].y) //from right, towards up
		{
			ctx.lineTo(this.corners[i].x + WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x, this.corners[i].y - WSClient.CORNER_CURVE_SIZE);
		}
		else if (this.corners[i-1].y < this.corners[i].y && this.corners[next].x > this.corners[i].x) //from up, towards right
		{
			ctx.lineTo(this.corners[i].x, this.corners[i].y - WSClient.CORNER_CURVE_SIZE);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x + WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
		}
		else if (this.corners[i-1].y > this.corners[i].y && this.corners[next].x > this.corners[i].x) //from down, towards right
		{
			ctx.lineTo(this.corners[i].x, this.corners[i].y + WSClient.CORNER_CURVE_SIZE);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x + WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
		}
		else if (this.corners[i-1].y < this.corners[i].y && this.corners[next].x < this.corners[i].x) //from up, towards left
		{
			ctx.lineTo(this.corners[i].x, this.corners[i].y - WSClient.CORNER_CURVE_SIZE);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x - WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
		}
		else if (this.corners[i-1].y > this.corners[i].y && this.corners[next].x < this.corners[i].x) //from down, towards left
		{
			ctx.lineTo(this.corners[i].x, this.corners[i].y + WSClient.CORNER_CURVE_SIZE);
			ctx.quadraticCurveTo(this.corners[i].x, this.corners[i].y, this.corners[i].x - WSClient.CORNER_CURVE_SIZE, this.corners[i].y);
		}
		else
		{
			//if we got to this case, something is screwy, so let's just use a lineTo and keep things simple
			ctx.lineTo(this.corners[i].x, this.corners[i].y);
		}
	}
	ctx.closePath();
	
	ctx.fill(); //fill the territory with our fill style
	
	//highlight the territory if it's currently selected
	if (WSClient.selectedTerr == this)
	{
		ctx.fillStyle = "rgba(255,255,255,0.5)";
		ctx.fill();
	}
	
	ctx.stroke(); //outline the territory with a nice, thick line
	
}




