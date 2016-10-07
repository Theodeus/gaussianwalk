let Canvas = require("canvas");
let fs = require("fs");
let gaussian = require('gaussian');

let jobs = [];
let jobIndex = 0;
let canvasWidth = 4096;
let canvasHeight = 4096;
let canvas;
let ctx;

let distributionX = gaussian(0, 7);
let distributionY = gaussian(0, 3);
let colorDistribution = gaussian(200, 50);

console.log(distributionX.ppf(Math.random()));
console.log(distributionY.ppf(Math.random()));

// let i = 100;
// while (i--) {
//     var sample = distribution.ppf(Math.random());
//     console.log(sample)
// }
//
function runLine(red = 255, green = 255, blue = 255, alpha = 0.5, steps = 1000, position = [2048, 2048], changeRed, changeBlue, changeGreen) {
    ctx.strokeStyle = createColorString(red, green, blue, alpha);
    while(steps--) {
        ctx.beginPath();
        ctx.moveTo(position[0], position[1]);
        position[0] += distributionX.ppf(Math.random());
        position[1] += distributionY.ppf(Math.random());
        ctx.lineTo(position[0], position[1]);
        ctx.stroke();
        if (changeRed) red = Math.round(colorDistribution.ppf(Math.random()));
        if (changeGreen) green = Math.round(colorDistribution.ppf(Math.random()));
        if (changeBlue) blue = Math.round(colorDistribution.ppf(Math.random()));
        ctx.strokeStyle = createColorString(red, green, blue, alpha);
    }
}

function createArt(background, lines, changeRed = false, changeBlue = false, changeGreen = false) {
    canvas = new Canvas(canvasWidth, canvasHeight);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    while (lines--) {
        runLine(255, 200, 255, .5, 1000000, [2048, 2048], changeRed, changeBlue, changeGreen);
    }
    let out = fs.createWriteStream(__dirname + "/walk" + Date.now() + ".png");
    let stream = canvas.pngStream();

    stream.on("data", function(chunk){
        out.write(chunk);
    });

    stream.on("end", function(){
        console.log("saved png");
        startNextJob();
    });
}

function createColorString(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function createGaussianColorString() {
    return createColorString(
        Math.round(colorDistribution.ppf(Math.random())),
        Math.round(colorDistribution.ppf(Math.random())),
        Math.round(colorDistribution.ppf(Math.random())),
        0.5
    )
}

function addJob() {
    jobs.push(arguments);
}

function startNextJob() {
    if (jobs[jobIndex]) {
        createArt.apply(null, jobs[jobIndex]);
        jobIndex++;
    } else {
        console.log("sucessfully created", jobIndex, "jobs");
    }
}

// addJob("#d0d0d0", 2, false, false, true);
addJob(createGaussianColorString(), 3, true, true, true);
// addJob("#d2d5ff", 5, false, true, false);
// addJob("#ffc6fc", 1, true, false, true);
startNextJob();
