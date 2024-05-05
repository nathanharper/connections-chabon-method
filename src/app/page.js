import React, {useMemo} from 'react';
import App from './App.js';

async function Main() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');

  const date = useMemo(() => {
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [day]);

  const tileData = await fetch(`https://www.nytimes.com/svc/connections/v2/${date}.json`, { cache: 'no-store' })
    .then(res => res.json())
    .then((res) => {
      const { categories } = res;
      const initialData = [].concat(...categories.map(c => c.cards))
        .sort((a, b) => a.position - b.position)
        .map(w => ({ id: w.position + 1, text: w.content }));

      return [
        { id: 1, tiles: initialData.slice(0, 4), lockData: false },
        { id: 2, tiles: initialData.slice(4, 8), lockData: false },
        { id: 3, tiles: initialData.slice(8, 12), lockData: false },
        { id: 4, tiles: initialData.slice(12, 16), lockData: false },
      ];
    });

  return <App {...{tileData}} />;
}

export default Main;
