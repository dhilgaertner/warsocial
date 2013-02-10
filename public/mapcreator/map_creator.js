function MapEditor(options) {
    var defaults = this.defaultOptions();
    options = typeof options !== 'undefined' ? options : {};
    var settings = $.extend({}, defaults, options);

    var _parentHexagon;
    var _colorIndexCount = new colorIndexCountArray(settings.selectedColor.length);
    var _hexagons = hexagonsArray(settings.gridRows, settings.gridColumns);
    var _changedHexagons = [];
    var _undoStack = [];
    var _redoStack = [];
    var _showGridCode = false;

    var stage = new Kinetic.Stage(settings.elementId, settings.size.width, settings.size.height);
    var hexagonLayer = new Kinetic.Layer();
    var isEraseMode = false;
    var isSelectionMode = false;
    var halfSegment = settings.segmentSize / 2;
    var radius = settings.segmentSize * 0.886025404;

    for (row = 0; row < settings.gridRows; row++) {
        var offsetHexagon = false;
        var offsetY;
        for (col = 0; col < settings.gridColumns; col++) {
            offsetY = offsetHexagon ? 1 : 0;
            var posX = settings.origin.x + col * (settings.segmentSize + halfSegment);
            var posY = settings.origin.y + row * radius * 2 + (offsetY * radius);
            _hexagons[row][col] = CreateHexagon(posX, posY);
            _hexagons[row][col].Row = row;
            _hexagons[row][col].Column = col;
            offsetHexagon = !offsetHexagon;
        }
    }

    stage.add(hexagonLayer);

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

    function DrawHexagon(hexagon){
        var context = hexagon.getContext();
        context.beginPath();
        context.lineWidth = hexagon.lineWidth;
        if (hexagon.selected) {
            hexagon.lineColor = settings.selectedColor[hexagon.colorIndex];
        } else {
            hexagon.lineColor = "lightgray";
        }
        context.strokeStyle = hexagon.lineColor;
        context.fillStyle = settings.selectedColor[hexagon.colorIndex];
        context.moveTo(hexagon.StartX, hexagon.StartY);
        context.lineTo(hexagon.StartX + settings.segmentSize, hexagon.StartY);
        context.lineTo(hexagon.StartX + settings.segmentSize + halfSegment, hexagon.StartY + radius);
        context.lineTo(hexagon.StartX + settings.segmentSize, hexagon.StartY + 2 * radius);
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
        var isLastRow = (currentRow == settings.gridRows - 1);
        var isFirstColumn = (currentColumn == 0);
        var isLastColumn = (currentColumn == settings.gridColumns - 1);

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
            if ((rowWithOffset >= 0) && (rowWithOffset < settings.gridRows)) {
                surroundingHexagons[arrayIndex++] = _hexagons[rowWithOffset][currentColumn - 1];
            }
        }
        if (!isLastColumn) {
            // Same row to right
            surroundingHexagons[arrayIndex++] = _hexagons[currentRow][currentColumn + 1];
            // Row depends on whether column position is odd/even, look at column to right
            if ((rowWithOffset >= 0) && (rowWithOffset < settings.gridRows)) {
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
        var isLastRow = (currentRow == settings.gridRows - 1);
        var isFirstColumn = (currentColumn == 0);
        var isLastColumn = (currentColumn == settings.gridColumns - 1);

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
            if ((rowWithOffset >= 0) && (rowWithOffset < settings.gridRows)) {
                if (_hexagons[rowWithOffset][currentColumn - 1].colorIndex == colorIndex) return true;
            }
        }
        if (!isLastColumn) {
            // Same row to right
            if (_hexagons[currentRow][currentColumn + 1].colorIndex == colorIndex) return true;
            // Row depends on whether column position is odd/even, look at column to right
            if ((rowWithOffset >= 0) && (rowWithOffset < settings.gridRows)) {
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
        for (row = 0; row < settings.gridRows; row++) {
            for (col = 0; col < settings.gridColumns; col++) {
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

    function colorIndexCountArray(arrayLength){
        var countArray = new Array(arrayLength);

        for (index = 0; index < arrayLength; index++){
            countArray[index] = 0;
        }
        return countArray;
    }

    function hexagonsArray(rows,columns){
        var empty_hexagons = new Array(rows);
        for (row = 0; row < rows; row++)
        {
            empty_hexagons[row] = new Array(columns);
        }
        return empty_hexagons;
    }
}

MapEditor.prototype.defaultOptions = function() {
    return {
        elementId: "mapCanvas",
        gridRows: 25,
        gridColumns: 35,
        selectedColor: [
            'white', 'red', 'blue', 'green', 'purple', 'yellow', 'pink', 'gray', 'fuchsia', 'lime',
            'maroon', 'aqua', 'navy', 'olive', 'silver', 'teal', 'blueviolet', 'peru', 'burlywood', 'cadetblue',
            'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
            'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'salmon', 'seagreen', 'darkseagreen', 'darkslateblue',
            'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'dodgerblue', 'yellowgreen', 'forestgreen', 'gold', 'greenyellow', 'hotpink',
            'indianred', 'indigo', 'khaki', 'lawngreen', 'lightblue', 'lightcoral', 'lightgreen', 'lightpink', 'goldenrod', 'lightsalmon',
            'lightseagreen', 'lightsteelblue', 'limegreen', 'magenta', 'mediumblue', 'mediumorchid', 'mediumpurple', 'midnightblue', 'moccasin', 'orange', 'orchid'
        ],
        origin: {
            x: 10,
            y: 10
        },
        segmentSize: 13,
        size: {
            width: 800,
            height: 700
        }
    };
};