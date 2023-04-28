import './Nametag.css';

type Props = {
    name: string | null | undefined,
    gridArea: string,
    isTurn?: boolean,
}

export function Nametag({ name, gridArea, isTurn }: Props) {

    const turnValid = '🟢';
    const turnInvalid = '🔴';

    return (
        <div className={`nametag ${gridArea}`}>
            { name ? name : 'Player 2' } {isTurn !== undefined && isTurn ? turnValid : turnInvalid}
        </div>
    );
}