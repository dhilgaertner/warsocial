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

            if (settings.init_map_code != null){
                hexIndex = (settings.init_map_code.width * row) + col
                SetColorIndex(_hexagons[row][col], settings.init_map_code.land_id_tiles[hexIndex]);
            }

            offsetHexagon = !offsetHexagon;
        }
    }

    settings.undoButton.click(function(){
        OnUndoButtonClick(this);
        UpdateUndoRedo();
    });

    settings.redoButton.click(function(){
        OnRedoButtonClick(this);
        UpdateUndoRedo();
    });

    settings.eraseButton.click(function(){
        isEraseMode = !isEraseMode;
        settings.eraseButton.html(isEraseMode ? "Create Mode" : "Erase Mode");
    });

    stage.add(hexagonLayer);

    UpdateUndoRedo();

    function CreateHexagon(beginX, beginY) {
        var hexagon = new Kinetic.Shape(function(){DrawHexagon(this)});

        hexagon.StartX = beginX;
        hexagon.StartY = beginY;
        hexagon.colorIndex = 0;
        hexagon.lineWidth = 2;
        hexagon.lineColor = "lightgray";
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
        _undoStack.push(_changedHexagons);
        _changedHexagons = [];
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
        if (_undoStack.length > 50){
            _undoStack.splice(0, _undoStack.length - 50);
        }

        var undo_show = _undoStack.length > 0;
        var redo_show = _redoStack.length > 0;

        if (undo_show)
            settings.undoButton.removeClass('disabled');
        else
            settings.undoButton.addClass('disabled');

        if(redo_show)
            settings.redoButton.removeClass('disabled');
        else
            settings.redoButton.addClass('disabled');
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

    this._getOutputString = function() {
        var output = [];
        for (row = 0; row < settings.gridRows; row++) {
            for (col = 0; col < settings.gridColumns; col++) {
                output.push(_hexagons[row][col].colorIndex);
            }
        }
        return output.join(',');
    };

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

MapEditor.prototype.getCurrentMapCode = function() {
    return this._getOutputString();
};

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
            x: 7,
            y: 5
        },
        segmentSize: 12,
        size: {
            width: 645,
            height: 550
        },
        undoButton: $('#undo'),
        redoButton: $('#redo'),
        eraseButton: $('#erase')
    };
};