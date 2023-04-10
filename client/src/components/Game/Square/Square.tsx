import React from 'react';
import { Coordinates, CellStyle, CellState } from '../../../types/shared';
import './Square.css';

type Props = {
    coordinates: Coordinates,
    style?: CellStyle,
    state: keyof typeof CellState,
    mouseEventHandler: ((coordinates: Coordinates, isClick?: boolean, isWheel?: boolean) => void),
}

export function Square({ mouseEventHandler, coordinates, style, state }: Props) {
    let content: '×' | '';
    let stateStyle: 'ship' | '';
    switch (state) {
        case 'EMPTY':
            content = '';
            stateStyle = '';
            break;
        case 'SHIP':
            content = '';
            stateStyle = 'ship';
            break;
        case 'SHOT_MISS':
            content = '×';
            stateStyle = '';
            break;
        case 'SHIP_HIT':
            content = '×';
            stateStyle = 'ship';
            break;
    }

    return (
        <div
            className={`square ${style && style} ${stateStyle}`}
            onWheel={() => { mouseEventHandler(coordinates, false, true); }}
            onClick={() => { mouseEventHandler(coordinates, true, false); }}
            onMouseEnter={() => { mouseEventHandler(coordinates, false, false); }}
        >
            {content}
        </div>
    );
}