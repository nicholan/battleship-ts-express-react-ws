import { CellState, CellStyle, Coordinates, GameEvent, ShipPlacement } from '../types/shared';
import uniqid from 'uniqid';

export class Gameboard {
    #grid: Cell[][];
    #hits = new Map<string, boolean>();
    #buildArr: ShipPlacement[] = [];
    #axis: 'x' | 'y' = 'x';
    #nodeStack: Cell[] = [];
    #shipInventory =
        [
            { allowed: 1, length: 5, placed: 0 },
            { allowed: 1, length: 4, placed: 0 },
            { allowed: 1, length: 3, placed: 0 },
            { allowed: 2, length: 2, placed: 0 },
            { allowed: 2, length: 1, placed: 0 },
        ];

    constructor() {
        this.#grid = this.#createGrid();
    }

    getBuildArray = () => this.#buildArr;

    getNodeStack = () => this.#nodeStack;

    getGrid = () => this.#grid;

    getShipLength = () => {
        for (const ship of this.#shipInventory) {
            if (ship.allowed > ship.placed) {
                return ship.length;
            }
        }
        return 0;
    };

    receiveAttack = ({ x, y }: Coordinates) => {
        const key = [x, y].toString();
        if (this.#hits.get(key)) return null;
        this.#hits.set(key, true);

        return this.#grid[x][y].receiveAttack();
    };

    getShipId({ x, y }: Coordinates) {
        return this.#grid[x][y].getShipId();
    }

    clearCellStyles = () => {
        this.#nodeStack.forEach(cell => cell.style = '');
        this.#nodeStack.length = 0;
    };

    toggleAxis = () => {
        this.#axis === 'x' ? this.#axis = 'y' : this.#axis = 'x';
        this.clearCellStyles();
    };

    reset = () => {
        // Remove ships on board, reset inventory.
        for (const ship of this.#shipInventory) {
            ship.placed = 0;
        }
        this.#buildArr.length = 0;
        this.clearCellStyles();
        this.#grid = this.#createGrid();
    };

    buildPlayerBoard = (eventArr: GameEvent[], shipArr: ShipPlacement[] = []) => {
        shipArr.forEach(({ axis, coordinates, shipLength, shipId }) => {
            this.#axis = axis;
            this.placeShip(coordinates, shipLength, shipId);
        });
        eventArr.forEach(({ coordinates }) => this.receiveAttack(coordinates));
    };

    buildEnemyBoard = (eventArr: GameEvent[]) => {
        const copyArr = [...eventArr];
        const sunkShips = copyArr.filter(({ result }) => result === CellState.SHIP_SUNK);
        for (const ship of sunkShips) {
            copyArr.forEach((evt) => {
                if (ship.shipId === evt.shipId) {
                    evt.result = ship.result;
                }
            });
        }
        copyArr.forEach(({ coordinates: { x, y }, result }) => this.#grid[x][y].state = result);
    };

    #createGrid() {
        const grid: Cell[][] = [];
        for (let x = 0; x < 10; x++) {
            grid.push([]);
            for (let y = 0; y < 10; y++) {
                grid[x][y] = new Cell({ x, y });
            }
        }
        return grid;
    }

    updateCellStyle(isValid: boolean) {
        if (isValid) {
            this.#nodeStack.forEach(cell => cell.style = 'valid');
        } else {
            this.#nodeStack.forEach(cell => cell.style = 'invalid');
        }
    }

    placeShip = ({ x, y }: Coordinates, shipLength = this.getShipLength(), id: string | null = null) => {
        // Check available ships; check validity of placement; place ship on board; save ship to build array; update inventory.
        if (shipLength === 0) return;
        if (!this.isValidPlacement({ x, y }, false)) return;

        const ship = new Ship(shipLength, id);

        if (this.#axis === 'x') {
            for (let i = 0; i < shipLength; i++) {
                this.#grid[x + i][y].addShip(ship);
                ship.addCell(this.#grid[x + i][y]);
            }
        }
        if (this.#axis === 'y') {
            for (let i = 0; i < shipLength; i++) {
                this.#grid[x][y + i].addShip(ship);
                ship.addCell(this.#grid[x][y + i]);
            }
        }
        this.#buildArr.push({
            coordinates: { x, y },
            axis: this.#axis,
            shipLength,
            shipId: ship.id
        });
        this.#updateInventory(shipLength);
    };

    #updateInventory(shipLength: number) {
        for (const ship of this.#shipInventory) {
            if (ship.length === shipLength) {
                ship.placed++;
            }
        }
    }

    populateBoard() {
        // Generate ship placements on board randomly.
        this.reset();

        while (this.getShipLength() > 0) {
            this.#axis = Math.random() > 0.5 ? 'x' : 'y';

            const [x, y] = [randomNum(10), randomNum(10)]; // Generate random coordinates.
            const isValid = this.isValidPlacement({ x, y }, false);
            if (isValid) {
                this.placeShip({ x, y });
            }
        }
    }

    isValidPlacement = (coordinates: Coordinates, useNodeStack = true) => {
        // Check that placement is not out of bounds or overlapping.
        if (this.getShipLength() === 0) return false;

        if (this.#axis === 'x') {
            return this.#noCollisionX(coordinates, this.getShipLength(), useNodeStack);
        } else {
            return this.#noCollisionY(coordinates, this.getShipLength(), useNodeStack);
        }
    };

    #noCollisionY({ x, y }: Coordinates, shipLength: number, useNodeStack: boolean) {
        // Checks that ships do not collide on the Y-axis.
        let isValid = true;
        for (let i = 0; i < shipLength; i++) {
            if ((y + i) > 9) {
                isValid = false;
                break;
            }
            if (this.#grid[x][y + i].state === CellState.SHIP) {
                isValid = false;
                break;
            }
            useNodeStack && this.#nodeStack.push(this.#grid[x][y + i]);
        }
        this.updateCellStyle(isValid);
        return isValid;
    }

    #noCollisionX({ x, y }: Coordinates, shipLength: number, useNodeStack: boolean) {
        // Checks that ships do not collide on the X-axis.
        let isValid = true;

        for (let i = 0; i < shipLength; i++) {
            if ((x + i) > 9) { // Index out of bounds
                isValid = false;
                break;
            }
            if (this.#grid[x + i][y].state === CellState.SHIP) { // Ship overlap
                isValid = false;
                break;
            }
            useNodeStack && this.#nodeStack.push(this.#grid[x + i][y]);
        }
        this.updateCellStyle(isValid);
        return isValid;
    }
}

class Cell {
    state: keyof typeof CellState = CellState.EMPTY;
    style: CellStyle = '';
    coordinates;
    #ship: Ship | null = null;

    constructor(coordinates: Coordinates) {
        this.coordinates = coordinates;
    }

    addShip(ship: Ship) {
        this.#ship = ship;
        this.state = CellState.SHIP;
    }

    getShipId() {
        if (!this.#ship) return null;
        return this.#ship.id;
    }

    receiveAttack() {
        if (this.#ship) {
            this.state = CellState.SHIP_HIT;
            return this.#ship.damage();
        }
        if (this.state === CellState.EMPTY) {
            this.state = CellState.SHOT_MISS;
            return CellState.SHOT_MISS;
        }
        return null;
    }
}

class Ship {
    health;
    shipNodes: Cell[] = [];
    id: string;

    constructor(length: number, id?: string | null) {
        this.health = length;
        if (!id) {
            this.id = uniqid();
        } else {
            this.id = id;
        }
    }

    addCell(cell: Cell) {
        this.shipNodes.push(cell);
    }

    setSunk() {
        this.shipNodes.forEach(node => node.state = CellState.SHIP_SUNK);
    }

    damage() {
        this.health--;
        if (this.health < 1) {
            this.setSunk();
            return CellState.SHIP_SUNK;
        }
        return CellState.SHIP_HIT;
    }
}

function randomNum(max: number) {
    return Math.floor(Math.random() * max);
}

export const playerGameboard = new Gameboard();
export const enemyGameboard = new Gameboard();