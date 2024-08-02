const lineWidthInput = document.getElementById("brushSize");
const fontSizeInput = document.getElementById("fontSize")
const canvas = document.getElementById("screenCanvas");
const ctx = canvas.getContext("2d");
const canvasDiv = document.getElementById("canvasDiv");
const ActionTypes = {
    NONE: 'NONE',
    TEXT: 'TEXT',
    DRAW: 'DRAW',
    ERASE: 'ERASE'
};

let canvasBoundingRec = canvas.getBoundingClientRect();
let drawing = false;
let startX;
let startY;
let mode = ActionTypes.NONE;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouse" + "up", mouseUpEvent);
clearCanvas();

function calcStartPos(e) {
    startX = e.clientX - canvasBoundingRec.left;
    startY = e.clientY - canvasBoundingRec.top;
}

function enableInsertText() {
    mode = ActionTypes.TEXT;
}

function enableDraw(){
    mode = ActionTypes.DRAW;
    ctx.strokeStyle = "black";
}

function startDrawing(e) {
    if (mode === ActionTypes.ERASE) {
        ctx.strokeStyle = "white";
    }
    else if (mode !== ActionTypes.DRAW) {
        return;
    }

    calcStartPos(e);
    ctx.moveTo(startX, startY);
    drawing = true;

    canvas.addEventListener("mousemove", draw);
}

function draw(e) {
    if (!drawing) {
        return;
    }

    let x = e.clientX - canvasBoundingRec.left;
    let y = e.clientY - canvasBoundingRec.top;

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

    calcStartPos(e);
    let input = document.createElement("input");
    input.type = "text";
    input.id = "newText";
    input.className = "canvasText";
    input.style.fontSize = `${fontSizeInput.value}px`;
    input.style.left = `${startX}px`;
    input.style.top = `${startY}px`;

    canvasDiv.appendChild(input);
    input.focus();
    input.addEventListener("focusout", e => {
        ctx.fillStyle = "black";
        ctx.textBaseLine = "hanging";
        ctx.font = `${fontSizeInput.value}px Arial`;
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

    canvas.removeEventListener("mousemove", draw);
}

function enableErase() {
    mode = ActionTypes.ERASE;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function upload() {
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "canvas";
    anchor.click();
    anchor.remove();
}