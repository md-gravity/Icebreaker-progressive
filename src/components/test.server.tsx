const DocsServer = async ({title}: {title: string}) => {
  const response = await fetch(
    `https://api.publicapis.org/entries?title=${title}`
  )
  const data = await response.json()

  return (
    <div>
      {data.entries.map((item: any) => (
        <div key={item.Link}>{item.Link}</div>
      ))}
    </div>
  )
}

export {DocsServer}
