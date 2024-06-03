const CELL_SIZE = 15;
const PADDING_RATIO = 0.9;
const PADDED_CELL_SIZE = CELL_SIZE * PADDING_RATIO;
const PADDING = CELL_SIZE * (1 - PADDING_RATIO) / 2;


const TYPES = {
    CONWAY: 'conway',
    SAND: 'sand',
};

const CELLS = {
    DEAD: 0,
    ALIVE: 1,
    SAND: 2,
    WATER: 3,
    AIR: 4,
};

const COLORS = {
    [CELLS.DEAD]: '#fff',
    [CELLS.ALIVE]: '#000',
    [CELLS.SAND]: 'yellow',
    [CELLS.WATER]: '#00f',
    [CELLS.AIR]: '#fff',
};

class Board {
    constructor(canvasId, type) {
        this.isRunning = false;
        this.selectedCell = type === TYPES.CONWAY ? CELLS.ALIVE : CELLS.SAND;

        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.type = type;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.xSize = Math.floor(this.width / CELL_SIZE);
        this.ySize = Math.floor(this.height / CELL_SIZE);
        this.xMargin = (this.width % CELL_SIZE) / 2;
        this.yMargin = (this.height % CELL_SIZE) / 2;
        this.cells = this.createCells();
        this.randomize();
    }

    reset() {
        this.cells = this.createCells();
    }

    drawCell(x, y) {
        this.cells[y][x] = this.selectedCell;
        this.draw();
    }

    createCells() {
        let value;
        if (this.type === TYPES.CONWAY) {
            value = CELLS.DEAD;
        }
        else if (this.type === TYPES.SAND) {
            value = CELLS.AIR;
        }
        return Array(this.ySize).fill().map(() => Array(this.xSize).fill(value));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // // Draw grid
        this.ctx.strokeStyle = 'gray';
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                this.ctx.strokeRect(x * CELL_SIZE + this.xMargin, y * CELL_SIZE + this.yMargin, CELL_SIZE, CELL_SIZE);
            })
        })


        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                let color = COLORS[cell];
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x * CELL_SIZE + PADDING + this.xMargin, (this.ySize - y - 1) * CELL_SIZE + PADDING + this.yMargin, PADDED_CELL_SIZE, PADDED_CELL_SIZE);
            });
        });
    }

    copyCells() {
        return this.cells.map(row => row.slice());
    }

    update() {
        if (!this.isRunning) {
            return;
        }
        if (this.type === TYPES.CONWAY) {
            this.updateConway();
        }
        else if (this.type === TYPES.SAND) {
            this.updateSand();
        }
    }

    updateConway(){
        let newCells = this.createCells()

        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                this.updateConwayCell(cell, x, y, newCells);
            });
        });

        this.cells = newCells;
    }

    updateSand(){
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                console.log(x, y)
                this.updateSandCell(cell, x, y);
            });
        });
    }

    updateConwayCell(cell, x, y, newCells) {
        let neighbors = this.countNeighbors(x, y);
        if (cell === CELLS.ALIVE && (neighbors === 2 || neighbors === 3)) {
            newCells[y][x] = CELLS.ALIVE;
            return;
        }
        else if (cell === CELLS.DEAD && neighbors === 3) {
            newCells[y][x] = CELLS.ALIVE;
            return;
        }
    }

    updateSandCell(cell, x, y) {

        if (cell === CELLS.WATER) {
            if (y !== 0) {
                if (this.cells[y - 1][x] === CELLS.AIR) {
                    this.cells[y][x] = CELLS.AIR;
                    this.cells[y - 1][x] = CELLS.WATER;
                    return;
                }
                else if (x - 1 >= 0 && this.cells[y - 1][x - 1] === CELLS.AIR) {
                    this.cells[y][x] = CELLS.AIR;
                    this.cells[y - 1][x - 1] = CELLS.WATER;
                    return;
                }
                else if (x + 1 < this.xSize && this.cells[y - 1][x + 1] === CELLS.AIR) {
                    this.cells[y][x] = CELLS.AIR;
                    this.cells[y - 1][x + 1] = CELLS.WATER;
                    return;
                }
            }
            let rand = Math.random();
            let dx = 0;
            if (rand < 0.5){
                if (x - 1 >= 0 && this.cells[y][x - 1] === CELLS.AIR) {
                    this.cells[y][x] = CELLS.AIR;
                    this.cells[y][x - 1] = CELLS.WATER;
                    return;
                }
            }
            else {
                if (x + 1 < this.xSize && this.cells[y][x + 1] === CELLS.AIR) {
                    this.cells[y][x] = CELLS.AIR;
                    this.cells[y][x + 1] = CELLS.WATER;
                    return;
                }
            }
            
        }
        else if (cell === CELLS.SAND) {
            if (y === 0) {
                return;
            }
            if (this.cells[y - 1][x] !== CELLS.SAND) {
                this.cells[y][x] = this.cells[y - 1][x];
                this.cells[y - 1][x] = CELLS.SAND;
                return;
            }
            else if (x - 1 >= 0 && this.cells[y - 1][x - 1] !== CELLS.SAND) {
                this.cells[y][x] = this.cells[y - 1][x - 1];
                this.cells[y - 1][x - 1] = CELLS.SAND;
                return;
            }
            else if (x + 1 < this.xSize && this.cells[y - 1][x + 1] !== CELLS.SAND) {
                this.cells[y][x] = this.cells[y - 1][x + 1];
                this.cells[y - 1][x + 1] = CELLS.SAND;
                return;
            }
            return;
        }
    }

    checkBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.xSize && y < this.ySize;
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                let nx = x + dx;
                let ny = y + dy;
                if (this.checkBounds(nx, ny)) {
                    if (this.cells[ny][nx] === CELLS.ALIVE) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    randomize() {
        this.cells.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (this.type === TYPES.CONWAY) {
                    this.cells[y][x] = Math.random() > 0.5 ? CELLS.ALIVE : CELLS.DEAD;
                }
                else if (this.type === TYPES.SAND) {
                    this.cells[y][x] = Math.random() < 0.2 ? CELLS.SAND : CELLS.AIR;
                    this.cells[y][x] = Math.random() < 0.3 ? CELLS.WATER : this.cells[y][x];
                }
            });
        });
    }
}

// document.addEventListener('DOMContentLoaded', () => {

// });
const conway = new Board('conway', TYPES.CONWAY);
const sand = new Board('sand', TYPES.SAND);

let bResetSand = document.getElementById('b-reset-sand');
let bResetConway = document.getElementById('b-reset-conway');
let bStartSand = document.getElementById('b-start-sand');
let bStartConway = document.getElementById('b-start-conway');

let bLiveConway = document.getElementById('b-live-conway');
let bDeadConway = document.getElementById('b-dead-conway');

let bSandSand = document.getElementById('b-sand-sand');
let bWaterSand = document.getElementById('b-water-sand');
let bAirSand = document.getElementById('b-air-sand');

bResetSand.addEventListener('click', () => {
    sand.reset();
});
bResetConway.addEventListener('click', () => {
    conway.reset();
});

bStartSand.addEventListener('click', () => {
    sand.isRunning = !sand.isRunning;
    bStartSand.innerText = sand.isRunning ? 'Stop' : 'Start';
});
bStartConway.addEventListener('click', () => {
    conway.isRunning = !conway.isRunning;
    bStartConway.innerText = conway.isRunning ? 'Stop' : 'Start';
});

bLiveConway.addEventListener('click', () => { conway.selectedCell = CELLS.ALIVE; });
bDeadConway.addEventListener('click', () => { conway.selectedCell = CELLS.DEAD; });

bSandSand.addEventListener('click', () => { sand.selectedCell = CELLS.SAND; });
bWaterSand.addEventListener('click', () => { sand.selectedCell = CELLS.WATER; });
bAirSand.addEventListener('click', () => { sand.selectedCell = CELLS.AIR; });

let drawCellHandler = (game) => (e) => {
    const rect = game.canvas.getBoundingClientRect();
    const mousePos = {
        x: e.clientX - rect.left - 8,
        y: e.clientY - rect.top - 8,
    }

    let x = Math.floor((mousePos.x - game.xMargin) / CELL_SIZE);
    let y = Math.floor((game.height - mousePos.y - game.yMargin) / CELL_SIZE);

    if (x < 0 || x >= game.xSize || y < 0 || y >= game.ySize) {
        return;
    }

    game.drawCell(x, y);
}

conway.canvas.addEventListener('click', drawCellHandler(conway));
sand.canvas.addEventListener('click', drawCellHandler(sand));

let lastFrameConway = 0;
let lastFrameSand = 0;

const fpsConway = 2;
const fpsSand = 10;

function loop(timeStamp) {
    let elapsedTimeConway = timeStamp - lastFrameConway;
    let elapsedTimeSand = timeStamp - lastFrameSand;
    if (elapsedTimeConway > 1000 / fpsConway) {
        conway.draw();
        conway.update();
        lastFrameConway = timeStamp;
    }
    if (elapsedTimeSand > 1000 / fpsSand) {
        sand.draw();
        sand.update();
        lastFrameSand = timeStamp;
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);