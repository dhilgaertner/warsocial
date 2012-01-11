//this is basically all test data that can disappear once the server is written. Of course, it might still be useful as a reference on what the client expects in terms of data.


function initTestData(territories) {
	for (var i = 0; i < territories.length; i++)
	{
		WSClient.addTerritory(territories[i]);
	}
	
	WSClient.finalizeInit();
}

function initPositions() {
	var terrColors = [];
	
	for (var i = 0; i < testTerritories.length; i++)
	{
		terrColors.push(testColors[i % testColors.length]);
	}
	
	WSClient.setDeployments(terrColors);
}

var testColors = ["red","blue"]; //,"green","yellow","brown","teal","purple"]

var testTerritories = [
	{
		points: [new Point(1,1), new Point(3,1), new Point(3,2), new Point(4,2), new Point(4,4), new Point(3,4), new Point(3,5), new Point(5,5), new Point(5,7), new Point(4,7), new Point(4,6), new Point(2,6), new Point(2,7), new Point(1,7)],
		connections: [1,2]
	},
	
	{
		points: [new Point(3,1), new Point(5,1), new Point(5,4), new Point(4,4), new Point(4,2), new Point(3,2)],
		connections: [0,2]
	},
	{
		points: [
		new Point(5,1), 
		new Point(8,1), 
		new Point(8,3), 
		new Point(6,3), 
		new Point(6,5), 
		new Point(5,5)],
		connections: [0,1,3,4]
	},
	{
		points: [
		new Point(6,4), 
		new Point(10,4), 
		new Point(10,2), 
		new Point(11,2), 
		new Point(11,6), 
		new Point(6,6)],
		connections: [2,4]
	},
	{
		points: [
		new Point(8,1), 
		new Point(13,1), 
		new Point(13,4), 
		new Point(11,4), 
		new Point(11,2), 
		new Point(8,2)],
		connections: [2,3]
	}
];