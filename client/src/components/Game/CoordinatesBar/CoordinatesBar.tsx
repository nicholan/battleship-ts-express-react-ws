import React  from 'react';
import './CoordinatesBar.css';

type Props = {
    type: 'num' | 'letter',
    axis: 'row' | 'column',
    gridArea: string,
}

export function CoordinatesBar({ type, axis, gridArea }: Props) {
    const style = `coordinateBar ${axis === 'row' ? 'flexRow' : 'flexColumn'} ${gridArea}`;
    const content = type === 'num' ? getNumbers() : getLetters();

    return (
        <div className={style}>
            { content }
        </div>
    );
}

function getNumbers() {
    const numbers = [];
    for (let i = 1; i < 11; i++){
        numbers.push(<div key={i}>{i}</div>);
    }
    return numbers;
}

function getLetters() {
    const letters = [];
    for (let i = 97; i < 107; i++){
        letters.push(<div key={i}>{String.fromCharCode(i)}</div>);
    }
    return letters;
}