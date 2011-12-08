//this is basically all test data that can disappear once the server is written. Of course, it might still be useful as a reference on what the client expects in terms of data.


function initTestData() {
	for (var i = 0; i < testTerritories.length; i++)
	{
		WSClient.addTerritory(testTerritories[i]);
	}
	
	WSClient.finalizeInit();
}

var testTerritories = [
	{
		points: [new Point(1,1), new Point(3,1), new Point(3,2), new Point(4,2), new Point(4,4), new Point(3,4), new Point(3,5), new Point(5,5), new Point(5,7), new Point(4,7), new Point(4,6), new Point(2,6), new Point(2,7), new Point(1,7)],
		connections: [1]
	},
	
	{
		points: [new Point(3,1), new Point(5,1), new Point(5,4), new Point(4,4), new Point(4,2), new Point(3,2)],
		connections: [0]
	}
]
