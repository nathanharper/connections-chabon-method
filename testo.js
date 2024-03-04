fetch('https://www.nytimes.com/svc/connections/v2/2024-03-03.json').then(res => res.json())
  .then(({categories}) => {
    const allC = [].concat(...categories.map(c => c.cards))
      .sort((a,b) => a.position - b.position)
    console.log(allC)
  })
