import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WordInputPage from './WordInputPage';

import './App.css';

const TILE = 'TILE';

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

const Row = ({ id, tiles, notes, onTileDrop, onNoteChange, onExcludeChange }) => {
  const handleCheckboxChange = (event) => {
    onExcludeChange(id, event.target.checked);
  };

  return (
    <div className="row">
      <input
        type="checkbox"
        onChange={handleCheckboxChange}
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => onNoteChange(id, e.target.value)}
        placeholder="Notes"
      />
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

const App = () => {
  const [rows, setGridData] = useState([]);
  const [excludeRows, setExcludeRows] = useState({});

  const handleExcludeChange = (rowId, isChecked) => {
    setExcludeRows((prevExcludeRows) => ({
      ...prevExcludeRows,
      [rowId]: isChecked,
    }));
  };

  const handleWordInputSubmit = (words) => {
    const initialData = words.map((word, index) => ({ id: index + 1, text: word }));
    const data = [
      { id: 1, tiles: initialData.slice(0, 4), notes: '' },
      { id: 2, tiles: initialData.slice(4, 8), notes: '' },
      { id: 3, tiles: initialData.slice(8, 12), notes: '' },
      { id: 4, tiles: initialData.slice(12, 16), notes: '' },
    ];
    setGridData(data);
  };

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

  const handleNoteChange = (rowId, newNote) => {
    setGridData((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, notes: newNote } : row
      );
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

  return (
    <Router>
      <Routes>
        <Route path="/grid" element={
          <DndProvider backend={HTML5Backend}>
            <div className="App">
              {rows.map((row) => (
                <Row
                  key={row.id}
                  id={row.id}
                  tiles={row.tiles}
                  notes={row.notes}
                  onTileDrop={handleTileDrop}
                  onNoteChange={handleNoteChange}
                  onExcludeChange={handleExcludeChange}
                />
              ))}
              <button onClick={shuffleTiles}>Shuffle Tiles</button>
            </div>
          </DndProvider>
        } />
        <Route path="/" element={
          <WordInputPage onSubmit={handleWordInputSubmit} />
        } />
      </Routes>
    </Router>
  );
};

export default App;
