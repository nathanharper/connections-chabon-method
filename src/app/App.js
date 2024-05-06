"use client"
import React, { useCallback, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import './App.css';

const TILE = 'TILE';
const CLEAR = 1;
const LOCK = 2;

function rowToText(row) {
  return row.tiles.map(t => t.text).join(', ');
}

const Tile = ({ id, text, onDrop, isDragging }) => {
  const [, drag] = useDrag({
    type: TILE,
    item: () => ({ id }),
  });

  const [, drop] = useDrop({
    accept: TILE,
    drop: (droppedItem) => onDrop(droppedItem.id, id),
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`tile ${isDragging ? 'dragging' : ''}`}>
      {text}
    </div>
  );
};

const Row = ({ id, tiles, onTileDrop, lockData, onDoubleClick }) => {
  return (
    <div className="row" onDoubleClick={() => onDoubleClick(id)}>
      {tiles.map((tile) => (
        <Tile
          key={tile.id}
          id={tile.id}
          text={tile.text}
          onDrop={onTileDrop}
          isDragging={tile.isDragging}
        />
      ))}
    </div>
  );
};

function LockOverlay({id, row, onSubmit, onCancel}) {
  return (
    <div className="overlay">
      <h2>Connect Words: {rowToText(row)}</h2>
      <form onSubmit={onSubmit}>
        <input type="hidden" name="row_id" value={id} />
        <div>
          <label>
            Color:
            <input
              type="color"
              name="color"
              title="color"
              defaultValue={row.lockData?.color}
            />
          </label>
        </div>
        <div>
          <label>
            Theme:
            <input
              type="text"
              name="theme"
              placeholder="theme"
              defaultValue={row.lockData?.theme}
            />
          </label>
        </div>
        <div>
          <input type="submit" value="connect" />
          <input type="button" value="clear" onClick={() => onCancel(id)} />
        </div>
      </form>
    </div>
  );
}

function LockedRow({row, onDoubleClick}) {
  return (
    <div className="locked-row" style={{ backgroundColor: row.lockData.color }} onDoubleClick={() => onDoubleClick(row.id)}>
      <h3>{row.lockData.theme}</h3>
      <div className="word-list">{rowToText(row)}</div>
    </div>
  );
}

function App({ tileData }) {
  const [rows, setGridData] = useState(tileData);
  const [overlay, setOverlay] = useState(null);
  const [excludeRows, setExcludeRows] = useState({});

  const handleTileDrop = (fromTileId, toTileId) => {
    setGridData((prevRows) => {
      let fromTile, toTile;

      const updatedRows = prevRows.map((row) => {
        const updatedTiles = row.tiles.map((tile) => {
          if (tile.id === fromTileId) {
            fromTile = { ...tile, isDragging: false };
            return fromTile;
          }
          if (tile.id === toTileId) {
            toTile = { ...tile, isDragging: false };
            return toTile;
          }
          return tile;
        });

        return { ...row, tiles: updatedTiles };
      });

      // Swap the positions of the dragged and dropped tiles across rows
      if (toTile) {
        const fromRow = updatedRows.find((row) => row.tiles.includes(fromTile));
        const toRow = updatedRows.find((row) => row.tiles.includes(toTile));

        const fromIndex = fromRow.tiles.findIndex((tile) => tile.id === fromTileId);
        const toIndex = toRow.tiles.findIndex((tile) => tile.id === toTileId);

        fromRow.tiles[fromIndex] = toTile;
        toRow.tiles[toIndex] = fromTile;
      }

      return updatedRows;
    });
  };

  const shuffleTiles = () => {
    setGridData((prevRows) => {
      const shuffledTiles = prevRows.reduce((acc, row) => {
        // Exclude tiles from rows with checked checkboxes
        if (!excludeRows[row.id]) {
          return [...acc, ...row.tiles];
        }
        return acc;
      }, []);

      // Shuffle the flattened array of tiles
      for (let i = shuffledTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
      }

      let startIndex = 0;
      const shuffledRows = prevRows.map((row) => {
        const endIndex = startIndex + row.tiles.length;
        const shuffledRowTiles = excludeRows[row.id]
          ? row.tiles
          : shuffledTiles.slice(startIndex, endIndex);
        if (!excludeRows[row.id]) startIndex = endIndex;
        return { ...row, tiles: shuffledRowTiles };
      });

      return shuffledRows;
    });
  };

  const onDoubleClick = useCallback((id) => {
    if (overlay) return;
    setOverlay({type: LOCK, id});
  }, [overlay, setOverlay]);

  const onLockSubmit = useCallback(e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rowId = Number(formData.get('row_id'));
    const color = formData.get('color');
    const theme = formData.get('theme');
    setGridData(prevRows => {
      return prevRows.map(row => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          lockData: { color, theme },
        };
      });
    });
    setExcludeRows((prevExcludeRows) => ({
      ...prevExcludeRows,
      [rowId]: true,
    }));
    setOverlay(null);
  }, [setGridData, setOverlay, setExcludeRows]);

  const onCancel = useCallback((rowId) => {
    setGridData(prevRows => {
      return prevRows.map(row => {
        if (row.id !== rowId) return row;
        return { ...row, lockData: null };
      });
    });
    setExcludeRows((prevExcludeRows) => ({
      ...prevExcludeRows,
      [rowId]: false,
    }));
    setOverlay(null);
  }, [setGridData, setOverlay, setExcludeRows]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>CONNECTIONS</h1>
        {rows.map((row) => (
          row.lockData ? (
            <LockedRow
              key={`locked-row-${row.id}`}
              row={row}
              onDoubleClick={onDoubleClick}
            />
          ) : (
            <Row
              key={`row-${row.id}`}
              id={row.id}
              tiles={row.tiles}
              lockData={row.lockData}
              onTileDrop={handleTileDrop}
              onDoubleClick={onDoubleClick}
            />
          )
        ))}
        <button onClick={shuffleTiles}>Shuffle Tiles</button>
        {overlay && (
          <LockOverlay
            id={overlay.id}
            row={rows.find(r => r.id === overlay.id)}
            onSubmit={onLockSubmit}
            onCancel={onCancel}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;
