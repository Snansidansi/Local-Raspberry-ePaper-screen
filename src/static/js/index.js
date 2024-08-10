const lineWidthInput = document.getElementById("brushSize");
const fontSizeInputDraw = document.getElementById("fontSizeDraw");
const fontSizeInputText = document.getElementById("fontSizeText");
const rowCountInput = document.getElementById("rowCount");
const canvas = document.getElementById("screenCanvas");
const ctx = canvas.getContext("2d");
const canvasDiv = document.getElementById("canvasDiv");
const rotationSelect = document.getElementById("rotation");
const ActionTypes = {
    NONE: 'NONE',
    TEXT: 'TEXT',
    DRAW: 'DRAW',
    ERASE: 'ERASE'
};

let drawing = false;
let startX;
let startY;
let mode = ActionTypes.NONE;
let oldRowCount = 0

canvas.addEventListener("mousedown", startMouseDrawing);
canvas.addEventListener("touchstart", startTouchDrawing);
canvas.addEventListener("mouseup", mouseUpEvent);
canvas.addEventListener("touchend", mouseUpEvent);
clearCanvas();

rowCountInput.addEventListener("change", showInputRows);
rowCountInput.addEventListener("mousedown", setRowMax)
fontSizeInputText.addEventListener("change", resizeInputRows);
fontSizeInputText.addEventListener("mousedown", setTextFontMax);
showInputRows();

window.onload = function() {
    // Load image
    const image = new Image();
    image.onload = function() {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    image.onerror = function () {}
    image.src = "/image"

    // Load text
    fetch("get-text")
        .then(r => {
            if (!r.ok) {
                throw new Error("Text request from server was not ok. Using default values.");
            }

            return r.json();
        })
        .then(data => {
            rowCountInput.value = data.rows;
            setTextFontMax();
            fontSizeInputText.value = data.fontSize;
            setRowMax();

            resizeInputRows();
            showInputRows();

            document.getElementById("separatorLine").checked = data.separate;
            document.getElementById("distributeHorizontally").checked = data.distribute;

            let inputRows = document.getElementById("rowInputDiv").children;
            for (let i = 0; i < data.content.length; i++) {
                inputRows[i].value = data.content[i];
            }

            rotationSelect.value = data.rotation;
        })
        .catch (error => {
            console.error("Error when fetching text data: " + error);
        })
}

function drawRowsOnScreen() {
    clearCanvas();
    let separator = document.getElementById("separatorLine").checked;
    let distributeHorizontally = document.getElementById("distributeHorizontally").checked;
    let rows = document.getElementById("rowInputDiv").children;
    let rowSpace = fontSizeInputText.value;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.font = fontSizeInputText.value + "px Arial";

    if (distributeHorizontally) {
        rowSpace = canvas.height / (rows.length + 1);
    }

    for (let i = 0; i < rows.length; i++) {
        ctx.fillText(rows[i].value, 0, rowSpace * (i + 1));
    }

    if (separator && rows.length > 1) {
        for (let i = 0; i < rows.length - 1; i++) {
            let y = rowSpace * (i + 1) + rowSpace / 2;
            ctx.fillRect(0, Math.round(y) - 1, canvas.width, 2);
        }
    }
}

function resizeInputRows() {
    let rowInputDivChildren = document.getElementById("rowInputDiv").children;
    for (let i = 0; i < rowInputDivChildren.length; i++) {
        rowInputDivChildren[i].style.fontSize = fontSizeInputText.value + "px";
    }
}

function showInputRows() {
    let numberNewRows = rowCountInput.value - oldRowCount;
    let rowInputDiv = document.getElementById("rowInputDiv");

    while (numberNewRows < 0) {
        rowInputDiv.lastChild.remove();
        numberNewRows++;
    }

    for (let i = 0; i < numberNewRows; i++) {
        let rowInput = document.createElement("input");
        rowInput.type = "text";
        rowInput.style.width = canvas.width + "px";
        rowInput.style.fontSize = fontSizeInputText.value + "px";
        rowInputDiv.appendChild(rowInput);
    }

    oldRowCount = rowCountInput.value;
}

function setTextFontMax() {
    fontSizeInputText.max = canvas.width / rowCountInput.value;
}

function setRowMax() {
    rowCountInput.max = canvas.width / fontSizeInputText.value;
}

function calcStartPos(absX, absY) {
    let canvasBoundingRec = canvas.getBoundingClientRect();
    startX = absX - canvasBoundingRec.left;
    startY = absY - canvasBoundingRec.top;
}

function enableInsertText() {
    mode = ActionTypes.TEXT;
}

function enableDraw(){
    mode = ActionTypes.DRAW;
    ctx.strokeStyle = "black";
}

function getMousePos(e) {
    return {
        x: e.clientX,
        y: e.clientY
    }
}

function getTouchPos(e) {
    const touch = e.touches[0];
    return {
        x: touch.clientX,
        y: touch.clientY
    }
}

function startTouchDrawing(e) {
    const absPos = getTouchPos(e);
    startDrawing(absPos.x, absPos.y);
}

function startMouseDrawing(e) {
    const absPos = getMousePos(e);
    startDrawing(absPos.x, absPos.y);
}

function startDrawing(absX, absY) {
    if (mode === ActionTypes.ERASE) {
        ctx.strokeStyle = "white";
    }
    else if (mode !== ActionTypes.DRAW) {
        return;
    }

    calcStartPos(absX, absY);
    ctx.moveTo(startX, startY);
    drawing = true;

    canvas.addEventListener("mousemove", mouseDraw);
    canvas.addEventListener("touchmove", touchDraw);
}

function touchDraw(e) {
    const absPos = getTouchPos(e);
    draw(absPos.x, absPos.y);
}

function mouseDraw(e) {
    const absPos = getMousePos(e);
    draw(absPos.x, absPos.y);
}

function draw(absX, absY) {
    if (!drawing) {
        return;
    }

    let canvasBoundingRec = canvas.getBoundingClientRect();
    let x = absX - canvasBoundingRec.left;
    let y = absY - canvasBoundingRec.top;

    console.log("x: " + x + "; y: " + y);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidthInput.value;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function mouseUpEvent(e) {
    endDrawing();
    addText(e);
}

function addText(e) {
    if (mode !== ActionTypes.TEXT) {
        return;
    }

    const absPos = getMousePos(e);
    calcStartPos(absPos.x, absPos.y);

    let input = document.createElement("input");
    input.type = "text";
    input.id = "newText";
    input.className = "canvasText";
    input.style.fontSize = `${fontSizeInputDraw.value}px`;
    input.style.left = `${startX}px`;
    input.style.top = `${startY}px`;

    canvasDiv.appendChild(input);
    input.focus();
    input.addEventListener("focusout", e => {
        ctx.fillStyle = "black";
        ctx.textBaseLine = "hanging";
        ctx.font = `${fontSizeInputDraw.value}px Arial`;
        ctx.textBaseline = "top";
        ctx.fillText(input.value, startX - 1, startY - 1);
        input.remove();
    })
}

function endDrawing() {
    if (!drawing) {
        return;
    }

    ctx.beginPath();
    drawing = false;

    if (mode === ActionTypes.DRAW || mode === ActionTypes.ERASE) {
        return;
    }

    canvas.removeEventListener("mousemove", mouseDraw);
    canvas.removeEventListener("touchmove", touchDraw);
}

function enableErase() {
    mode = ActionTypes.ERASE;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function upload() {
    const uploadBtn = document.getElementById("uploadBtn");
    uploadBtn.disabled = true;

    let rows = Array.from(document.getElementById("rowInputDiv").children,
        row => row.value);

    fetch("/save-text", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rows: rowCountInput.value,
            fontSize: fontSizeInputText.value,
            separate: document.getElementById("separatorLine").checked,
            distribute: document.getElementById("distributeHorizontally").checked,
            rotation: rotationSelect.value,
            content: rows
        })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log("Upload of text successful");
            }
            else {
                console.log("Upload of text failed: " + data.message);
            }
        })
        .catch (error => {
            console.error("Error when uploading text: ", error);
        })

    const canvasDataURL = canvas.toDataURL("image/png");
    fetch("/upload-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: canvasDataURL,
            rotation: rotationSelect.value
        })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log("Upload of image successful");
            }
            else {
                console.log("Upload of image failed: " + data.message);
            }
            uploadBtn.disabled = false;
        })
        .catch(error => {
            console.error("Error when uploading image: ", error);
            uploadBtn.disabled = false;
        })
}
