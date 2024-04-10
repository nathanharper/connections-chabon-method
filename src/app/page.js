import React, {useMemo} from 'react';
import App from './App.js';

const revalidate = 3600;

async function Main() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');

  const date = useMemo(() => {
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [day]);

  const tileData = await fetch(`https://www.nytimes.com/svc/connections/v2/${date}.json`, { next: { revalidate } })
    .then(res => res.json())
    .then((res) => {
      const { categories } = res;
      const initialData = [].concat(...categories.map(c => c.cards))
        .sort((a, b) => a.position - b.position)
        .map(w => ({ id: w.position + 1, text: w.content }));

      return [
        { id: 1, tiles: initialData.slice(0, 4), notes: '' },
        { id: 2, tiles: initialData.slice(4, 8), notes: '' },
        { id: 3, tiles: initialData.slice(8, 12), notes: '' },
        { id: 4, tiles: initialData.slice(12, 16), notes: '' },
      ];
    });

  return <App {...{tileData}} />;
}

export default Main;
