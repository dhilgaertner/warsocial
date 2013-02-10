var _adminEmail = 'dustin@warsocial.com';
var _gridRows = 25;
var _gridColumns = 35;
var _parentHexagon;
var _selectedColor = new selectedColorArray();
var _colorIndexCount = new colorIndexCountArray(_selectedColor.length);
var _hexagons = _hexagonsArray(_gridRows,_gridColumns);
var _changedHexagons = [];
var _undoStack = [];
var _redoStack = [];
var _showGridCode = false;

function writeMessage(messageLayer, message){
    var context = messageLayer.getContext();
    messageLayer.clear();
    context.font = "10pt Calibri";
    context.fillStyle = "black";
    context.fillText(message, 10, 10);
}

function WriteDirections(directionsLayer){
    var context = directionsLayer.getContext();
    var startX = 100;
    var startY = 850;
    var lineHeight = 25;
    var lineMultiplier = 1;
    directionsLayer.clear();
    var directions = new GetDirectionsTextArray();
    context.font = "20pt Calibri";
    context.fillStyle = "steelblue";
    context.fillText("DIRECTIONS:", 100, startY);
    context.font = "16pt Calibri";
    for (textLine = 0; textLine < directions.length; textLine++){
        context.fillText(directions[textLine], startX, startY + lineHeight * lineMultiplier++);
    }
}

function GetDirectionsTextArray(){
    var directions = [
        "1. There are two modes... Create and Erase.  You start in Create mode.",
        "    The button at the top toggles you between modes.",
        "2. In Create mode, clicking on an empty cell will change it to a new color (new land).",
        "3. You can drag this color to contiguous cells to change them to the same color.",
        "4. You can further expand a color by clicking on any of its cells and dragging (even over other colors).",
        "5. In Erase mode, clicking on cells will remove their color. You can drag here as well to erase.",
        "6. Be sure not to leave a color (land) cut in multiple pieces. There is not validation in place to check this yet.",
        "7. Once finished, you can email the grid code to WarSocial.com by clicking the Email button.",
        "    It should open an email already addressed in your default email program.",
        "    Alternatively, you can click the 'Show Grid Code' button and copy (ctrl+c)/ paste the codes manually.",
    ]
    return directions;
}

window.onload = function () {
    var stage = new Kinetic.Stage("mapCanvas", 1000, 1500);
    var hexagonLayer = new Kinetic.Layer();
    var messageLayer = new Kinetic.Layer();
    var buttonLayer = new Kinetic.Layer();
    var directionsLayer = new Kinetic.Layer();
    var isEraseMode = false;
    var isSelectionMode = false;
    var startX = 100;
    var startY = 100
    var segmentSize = 15;
    var halfSegment = segmentSize / 2;
    var radius = segmentSize * 0.886025404;

    AddMailButton();
    AddEraseCreateButton();
    AddShowGridCodeButton();
    AddUndoRedoButtons();

    for (row = 0; row < _gridRows; row++) {
        var offsetHexagon = false;
        var offsetY;
        for (col = 0; col < _gridColumns; col++) {
            offsetY = offsetHexagon ? 1 : 0;
            var posX = startX + col * (segmentSize + halfSegment);
            var posY = startY + row * radius * 2 + (offsetY * radius);
            _hexagons[row][col] = CreateHexagon(posX, posY);
            _hexagons[row][col].Row = row;
            _hexagons[row][col].Column = col;
            offsetHexagon = !offsetHexagon;
        }
    }

    function CreateHexagon(beginX, beginY) {
        var hexagon = new Kinetic.Shape(function(){DrawHexagon(this)});

        hexagon.StartX = beginX;
        hexagon.StartY = beginY;
        hexagon.colorIndex = 0;
        hexagon.lineWidth = 2;
        hexagon.selected = false;

        hexagon.on("mouseover", function () {
            OnHexagonMouseOver(this);
        });
        hexagon.on("mousedown touchstart", function () {
            OnHexagonMouseDown(this);
        });
        hexagon.on("mouseup touchend", function () {
            OnHexagonMouseUp(this);
        });
        hexagonLayer.add(hexagon);
        return hexagon;
    }
    stage.add(hexagonLayer);
    stage.add(directionsLayer);
    stage.add(messageLayer);
    stage.add(buttonLayer);
    //hexagonLayer.on("mouseout", OnLayerMouseOut());

    WriteDirections(directionsLayer);

    function DrawHexagon(hexagon){
        var context = hexagon.getContext();
        context.beginPath();
        context.lineWidth = hexagon.lineWidth;
        if (hexagon.selected) {
            hexagon.lineColor = _selectedColor[hexagon.colorIndex];
        } else {
            hexagon.lineColor = "lightgray";
        }
        context.strokeStyle = hexagon.lineColor;
        context.fillStyle = _selectedColor[hexagon.colorIndex];
        context.moveTo(hexagon.StartX, hexagon.StartY);
        context.lineTo(hexagon.StartX + segmentSize, hexagon.StartY);
        context.lineTo(hexagon.StartX + segmentSize + halfSegment, hexagon.StartY + radius);
        context.lineTo(hexagon.StartX + segmentSize, hexagon.StartY + 2 * radius);
        context.lineTo(hexagon.StartX, hexagon.StartY + 2 * radius);
        context.lineTo(hexagon.StartX - halfSegment, hexagon.StartY + radius);
        context.closePath();
        context.fill();
        context.stroke();
    }

    function SetColorIndex(hexagon, colorIndex) {
        // Update colorIndex counters
        _colorIndexCount[hexagon.colorIndex]--;
        hexagon.colorIndex = colorIndex;
        _colorIndexCount[colorIndex]++;
    }

    function OnHexagonMouseOver(hexagon) {
        if (isSelectionMode) {
            if (isEraseMode) {
                AddChangedHexagon(hexagon, _changedHexagons);
                SetColorIndex(hexagon, 0);
                hexagon.selected = false;
            } else if (hexagon.colorIndex != _parentHexagon.colorIndex){
                if (IsSelectionValid(hexagon, _parentHexagon.colorIndex)) {
                    AddChangedHexagon(hexagon, _changedHexagons);
                    SetColorIndex(hexagon, _parentHexagon.colorIndex);
                    hexagon.selected = true;
                }
            }
            hexagonLayer.draw();
        }
    }

    function OnHexagonMouseDown(hexagon) {
        if (isEraseMode) {
            AddChangedHexagon(hexagon, _changedHexagons);
            SetColorIndex(hexagon, 0);
            hexagon.selected = false;
        } else if (!hexagon.selected) {
            AddChangedHexagon(hexagon, _changedHexagons);
            SetColorIndex(hexagon, getNewColorIndex());
            hexagon.selected = true;
        }
        _parentHexagon = hexagon;
        isSelectionMode = true;
        hexagonLayer.draw();
    }

    function OnHexagonMouseUp(hexagon) {
        isSelectionMode = false;
        UpdateUndoRedo();
    }

    function OnLayerMouseOut(){
        isSelectionMode = false;
    }

    function AddChangedHexagon(hexagon, changedHexagonArray){
        var changedHexagon = {};
        CopyHexagonChanges(hexagon, changedHexagon);
        changedHexagonArray.push(changedHexagon);
    }

    function CopyHexagonChanges(copyFromHexagon, copyToHexagon){
        copyToHexagon.Row = copyFromHexagon.Row;
        copyToHexagon.Column = copyFromHexagon.Column;
        copyToHexagon.colorIndex = copyFromHexagon.colorIndex;
        copyToHexagon.selected = copyFromHexagon.selected;
    }

    function UpdateUndoRedo(){
        _undoStack.push(_changedHexagons);
        _changedHexagons = [];
        _redoStack = [];
        if (_undoStack.length > 50){
            _undoStack.splice(0, _undoStack.length - 50);
        }
        buttonLayer.remove(buttonLayer.getChild('undoButton'));
        buttonLayer.clear();
        AddUndoRedoButtons();
        buttonLayer.draw();
        if (_showGridCode){
            UpdateGridCodeDisplay();
        }
    }

    function OnUndoButtonClick(undoButton){
        OnUndoRedoClicked(_undoStack, _redoStack);
    }

    function OnRedoButtonClick(redoButton){
        OnUndoRedoClicked(_redoStack, _undoStack);
    }

    function OnUndoRedoClicked(fromStack, toStack){
        var changedHexagons = fromStack.pop();
        var currentHexagon = {};
        var currentChangedHexagons = [];
        for(index=0; index < changedHexagons.length; index++){
            var changedHexagon = changedHexagons[index];
            AddChangedHexagon(_hexagons[changedHexagon.Row][changedHexagon.Column], currentChangedHexagons);
            CopyHexagonChanges(changedHexagon, _hexagons[changedHexagon.Row][changedHexagon.Column]);
        }
        toStack.push(currentChangedHexagons);
        hexagonLayer.draw();
    }

    function GetSurroundingHexagons(hexagon) {
        var surroundingHexagons = new Array();
        var arrayIndex = 0;
        var currentRow = hexagon.Row;
        var currentColumn = hexagon.Column;
        var isEvenColumn = (currentColumn % 2);
        var rowWithOffset = currentRow + (isEvenColumn ? 1 : -1);
        var isFirstRow = (currentRow == 0);
        var isLastRow = (currentRow == _gridRows - 1);
        var isFirstColumn = (currentColumn == 0);
        var isLastColumn = (currentColumn == _gridColumns - 1);

        if (!isFirstRow) {
            // Directly above
            surroundingHexagons[arrayIndex++] = _hexagons[currentRow - 1][currentColumn];
        }
        if (!isLastRow) {
            // Directly below
            surroundingHexagons[arrayIndex++] = _hexagons[currentRow + 1][currentColumn];
        }
        if (!isFirstColumn) {
            // Same row to left
            surroundingHexagons[arrayIndex++] = _hexagons[currentRow][currentColumn - 1];
            // Row depends on whether column position is odd/even, look at column to left
            if ((rowWithOffset >= 0) && (rowWithOffset < _gridRows)) {
                surroundingHexagons[arrayIndex++] = _hexagons[rowWithOffset][currentColumn - 1];
            }
        }
        if (!isLastColumn) {
            // Same row to right
            surroundingHexagons[arrayIndex++] = _hexagons[currentRow][currentColumn + 1];
            // Row depends on whether column position is odd/even, look at column to right
            if ((rowWithOffset >= 0) && (rowWithOffset < _gridRows)) {
                surroundingHexagons[arrayIndex++] = _hexagons[rowWithOffset][currentColumn + 1];
            }
        }
        return surroundingHexagons;
    }

    function IsSelectionValid(hexagon, colorIndex) {
        // Selection is valid if a contiguous hexagon is same color index
        var currentRow = hexagon.Row;
        var currentColumn = hexagon.Column;
        var isEvenColumn = (currentColumn % 2);
        var rowWithOffset = currentRow + (isEvenColumn ? 1 : -1);
        var isFirstRow = (currentRow == 0);
        var isLastRow = (currentRow == _gridRows - 1);
        var isFirstColumn = (currentColumn == 0);
        var isLastColumn = (currentColumn == _gridColumns - 1);

        if (!isFirstRow) {
            // Directly above
            if (_hexagons[currentRow - 1][currentColumn].colorIndex == colorIndex) return true;
        }
        if (!isLastRow) {
            // Directly below
            if (_hexagons[currentRow + 1][currentColumn].colorIndex == colorIndex) return true;
        }
        if (!isFirstColumn) {
            // Same row to left
            if (_hexagons[currentRow][currentColumn - 1].colorIndex == colorIndex) return true;
            // Row depends on whether column position is odd/even, look at column to left
            if ((rowWithOffset >= 0) && (rowWithOffset < _gridRows)) {
                if (_hexagons[rowWithOffset][currentColumn - 1].colorIndex == colorIndex) return true;
            }
        }
        if (!isLastColumn) {
            // Same row to right
            if (_hexagons[currentRow][currentColumn + 1].colorIndex == colorIndex) return true;
            // Row depends on whether column position is odd/even, look at column to right
            if ((rowWithOffset >= 0) && (rowWithOffset < _gridRows)) {
                if (_hexagons[rowWithOffset][currentColumn + 1].colorIndex == colorIndex) return true;
            }
        }
        return false;
    }

    function getNewColorIndex() {
        for (colorIndex = 1; colorIndex < _colorIndexCount.length; colorIndex++) {
            if (_colorIndexCount[colorIndex] <= 0) return colorIndex;
        }
    }

    function getOutputString() {
        var output = '';
        for (row = 0; row < _gridRows; row++) {
            for (col = 0; col < _gridColumns; col++) {
                output = output + _hexagons[row][col].colorIndex + ',';
            }
            output = output + '\r\n';
        }
        return output.substr(0, output.length - 1);
    }

    function AddButton(startX, startY, width, height, text, text2, buttonColor,buttonName) {
        var newButton = new Kinetic.Shape(function () {
            var context = this.getContext();
            context.fillStyle = buttonColor;
            context.lineWidth = 1;
            context.lineStyle = "black";
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(startX, startY + height);
            context.lineTo(startX + width, startY + height);
            context.lineTo(startX + width, startY);
            context.closePath();
            context.fill();
            context.stroke();
            context.font = "15pt Calibri bold";
            context.fillStyle = "white";
            // Temp hack for multi-line text
            var textOffset = text2.length > 0 ? 5 : 0;
            context.fillText(text, startX + width / 5, startY + height / 2 - textOffset);
            context.fillText(text2, startX + width / 5, startY + height / 2 - textOffset + 20);
        },buttonName);
        return newButton;
    }

    function AddUndoRedoButtons() {
        var undoButton;
        var buttonColor = _undoStack.length > 0 ? 'limegreen' : 'lightgray';
        undoButton = AddButton(100, 20, 75, 50, 'Undo', '', buttonColor, 'undoButton');
        undoButton.on("mousedown touchstart", function() {
            OnUndoButtonClick(this);
            buttonLayer.remove(undoButton);
            buttonLayer.clear();
            AddUndoRedoButtons();
            buttonLayer.draw();
        });
        buttonLayer.add(undoButton);

        var redoButton;
        buttonColor = _redoStack.length > 0 ? 'limegreen' : 'lightgray';
        redoButton = AddButton(175, 20, 75, 50, 'Redo', '', buttonColor, 'redoButton');
        redoButton.on("mousedown touchstart", function() {
            OnRedoButtonClick();
            buttonLayer.remove(redoButton);
            buttonLayer.clear();
            AddUndoRedoButtons();
            buttonLayer.draw();
        });
        buttonLayer.add(redoButton);
    }

    function AddEraseCreateButton() {
        var eraseButton;
        if (isEraseMode) {
            eraseButton = AddButton(300, 20, 150, 50, 'To Create...', '', 'lightsalmon', 'eraseButton');
        } else {
            eraseButton = AddButton(300, 20, 150, 50, 'To Erase...', '', 'lightsteelblue', 'eraseButton');
        }
        buttonLayer.add(eraseButton);

        eraseButton.on("mousedown touchstart", function () {
            isEraseMode = !isEraseMode;
            buttonLayer.remove(eraseButton);
            buttonLayer.clear();
            AddEraseCreateButton();
            buttonLayer.draw();
        });
    }

    function AddMailButton() {
        var mailButton = AddButton(500, 20, 150, 50, 'Email to', 'WarSocial', 'lightseagreen', 'mailButton');
        mailButton.on("mousedown touchstart", function () {
            SendMail();
        });
        buttonLayer.add(mailButton);
    }

    function AddShowGridCodeButton() {
        if (buttonLayer.getChild('showGridCodeButton')){
            buttonLayer.remove('showGridCodeButton');
        }
        var showGridCodeButton = _showGridCode ?
            AddButton(700, 20, 150, 50, 'Hide Grid', 'Code', 'darkviolet', 'showGridCodeButton') :
            AddButton(700, 20, 150, 50, 'Show Grid', 'Code', 'lightcoral', 'showGridCodeButton');

        showGridCodeButton.on("mousedown touchstart", function () {
            ShowGridCode();
        });
        buttonLayer.add(showGridCodeButton);
    }

    function SendMail(message) {
        var subject = 'New WarSocial Map';
        window.location.href = 'mailto:' + _adminEmail +
            '?subject=' + subject +
            '&body=' + getOutputString();
    }

    function ShowGridCode() {
        _showGridCode = !_showGridCode;
        UpdateGridCodeDisplay();
        document.getElementById('gridCodeDisplay').style.display = _showGridCode ? 'block' : 'none';
        // alert('Press CTRL+C to copy the contents of this message. \r\n' +
        // 'Paste into an email and send to ' + _adminEmail + ':\r\n\r\n' +
        // getOutputString());
    }

    function UpdateGridCodeDisplay(){
        if (_showGridCode){
            $('#gridCodeDisplay').val(getOutputString());
        }
    }
};

function _hexagonsArray(rows,columns){
    var empty_hexagons = new Array(rows);
    for (row = 0; row < rows; row++)
    {
        empty_hexagons[row] = new Array(columns);
    }
    return empty_hexagons;
}

function selectedColorArray(){
    var colors = [
        'white', 'red', 'blue', 'green', 'purple', 'yellow', 'pink', 'gray', 'fuchsia', 'lime',
        'maroon', 'aqua', 'navy', 'olive', 'silver', 'teal', 'blueviolet', 'peru', 'burlywood', 'cadetblue',
        'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
        'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'salmon', 'seagreen', 'darkseagreen', 'darkslateblue',
        'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'dodgerblue', 'yellowgreen', 'forestgreen', 'gold', 'greenyellow', 'hotpink',
        'indianred', 'indigo', 'khaki', 'lawngreen', 'lightblue', 'lightcoral', 'lightgreen', 'lightpink', 'goldenrod', 'lightsalmon',
        'lightseagreen', 'lightsteelblue', 'limegreen', 'magenta', 'mediumblue', 'mediumorchid', 'mediumpurple', 'midnightblue', 'moccasin', 'orange', 'orchid'
    ];
    return colors;
}

function colorIndexCountArray(arrayLength){
    var countArray = new Array(arrayLength);

    for (index = 0; index < arrayLength; index++){
        countArray[index] = 0;
    }
    return countArray;
}

function SaveMap(mapName){

}