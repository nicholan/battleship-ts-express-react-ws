import { CellState, CellStyle, Coordinates, GameEvent } from '../types/shared';
import uniqid from 'uniqid';

export class Cell {
    state;
    style: CellStyle = '';
    id: string = uniqid();
    coordinates;

    constructor(state: keyof typeof CellState, coordinates: Coordinates) {
        this.state = state;
        this.coordinates = coordinates;
    }
}

export const playerGameboard = Gameboard();
export const enemyGameboard = Gameboard();

function Gameboard() {
    let grid = _createGrid();
    let axis: 'x' | 'y' = 'x';
    const nodeStack: Cell[] = [];

    const shipInventory = [
        { allowed: 1, length: 5, placed: 0 },
        { allowed: 1, length: 4, placed: 0 },
        { allowed: 1, length: 3, placed: 0 },
        { allowed: 2, length: 2, placed: 0 },
        { allowed: 2, length: 1, placed: 0 },
    ];

    function getShipLength() {
        for (const ship of shipInventory) {
            if (ship.allowed > ship.placed) {
                return ship.length;
            }
        }
        return 0;
    }

    function _updateInventory(shipLength: number) {
        for (const ship of shipInventory) {
            if (ship.length === shipLength) {
                ship.placed++;
            }
        }
    }

    function _setShipLengthToZero() {
        for (const ship of shipInventory) {
            ship.placed = ship.allowed;
        }
    }

    function parseGameData(eventArr: GameEvent[], board?: Cell[][]) {
        if (board && board?.length > 0) {
            board?.forEach(arr => arr.forEach(cell => grid[cell.coordinates.x][cell.coordinates.y].state = cell.state));
            _setShipLengthToZero();
        }
        eventArr.forEach(evt => grid[evt.coordinates.x][evt.coordinates.y].state = evt.result);
    }

    function toggleAxis() {
        axis === 'x' ? axis = 'y' : axis = 'x';
        clearCellStyles();
    }

    function reset() {
        // Remove ships on board, reset inventory.
        for (const ship of shipInventory) {
            ship.placed = 0;
        }
        clearCellStyles();
        grid = _createGrid();
    }

    function getGrid() {
        return grid;
    }

    function clearCellStyles() {
        nodeStack.forEach(cell => cell.style = '');
        nodeStack.length = 0;
    }

    function getNodeStack() {
        return nodeStack;
    }

    function updateCellStyle(isValid: boolean) {
        if (isValid) {
            nodeStack.forEach(cell => cell.style = 'valid');
        } else {
            nodeStack.forEach(cell => cell.style = 'invalid');
        }
    }

    function _createGrid() {
        const grid: Cell[][] = [];
        for (let x = 0; x < 10; x++) {
            grid.push([]);
            for (let y = 0; y < 10; y++) {
                grid[x][y] = new Cell(CellState.EMPTY, { x, y });
            }
        }
        return grid;
    }

    function receiveAttack({ x, y }: Coordinates) {
        switch (grid[x][y].state) {
            case CellState.EMPTY:
                grid[x][y].state = CellState.SHOT_MISS;
                return CellState.SHOT_MISS;
            case CellState.SHIP:
                grid[x][y].state = CellState.SHIP_HIT;
                return CellState.SHIP_HIT;
            default:
                break;
        }
    }

    function isValidPlacement(coordinates: Coordinates, useNodeStack = true) {
        // Check that placement is not out of bounds or overlapping.
        const shipLength = getShipLength();
        if (shipLength === 0) return false;

        if (axis === 'x') {
            return _noCollisionX(coordinates, shipLength, useNodeStack);
        } else {
            return _noCollisionY(coordinates, shipLength, useNodeStack);
        }
    }

    function _noCollisionY({ x, y }: Coordinates, shipLength: number, useNodeStack: boolean) {
        // Checks that ships do not collide on the Y-axis.
        let isValid = true;
        for (let i = 0; i < shipLength; i++) {
            if ((y + i) > 9) {
                isValid = false;
                break;
            }
            if (grid[x][y + i].state === CellState.SHIP) {
                isValid = false;
                break;
            }
            useNodeStack && nodeStack.push(grid[x][y + i]);
        }
        updateCellStyle(isValid);
        return isValid;
    }

    function _noCollisionX({ x, y }: Coordinates, shipLength: number, useNodeStack: boolean) {
        // Checks that ships do not collide on the X-axis.
        let isValid = true;

        for (let i = 0; i < shipLength; i++) {
            if ((x + i) > 9) { // Index out of bounds
                isValid = false;
                break;
            }
            if (grid[x + i][y].state === CellState.SHIP) { // Ship overlap
                isValid = false;
                break;
            }
            useNodeStack && nodeStack.push(grid[x + i][y]);
        }
        updateCellStyle(isValid);
        return isValid;
    }

    function placeShip({ x, y }: Coordinates) {
        // Check available ships; check validity of placement; place ship on board; update inventory.
        const shipLength = getShipLength();
        if (shipLength === 0) return;
        if (!isValidPlacement({ x, y }, false)) return;

        if (axis === 'x') {
            for (let i = 0; i < shipLength; i++) {
                grid[x + i][y].state = CellState.SHIP;
            }
        }
        if (axis === 'y') {
            for (let i = 0; i < shipLength; i++) {
                grid[x][y + i].state = CellState.SHIP;
            }
        }
        _updateInventory(shipLength);
    }

    function populateBoard() {
        // Generate ship placements on board randomly.
        reset();

        while (getShipLength() > 0) {
            axis = Math.random() > 0.5 ? 'x' : 'y';

            const [x, y] = [randomNum(10), randomNum(10)]; // Generate random coordinates.
            const isValid = isValidPlacement({ x, y }, false);
            if (isValid) {
                placeShip({ x, y });
            }
        }
    }

    return { parseGameData, getShipLength, placeShip, receiveAttack, isValidPlacement, toggleAxis, getGrid, reset, populateBoard, clearCellStyles, getNodeStack };
}

function randomNum(max: number) {
    return Math.floor(Math.random() * max);
}



