function formatDate(timestamp) {
  if (!timestamp) {
    return '-'
  }

  const rawDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  if (Number.isNaN(rawDate.getTime())) {
    return '-'
  }

  return rawDate.toLocaleString()
}

function Table({ grievances }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Photo</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {grievances.length === 0 && (
            <tr>
              <td colSpan="5">No grievances found.</td>
            </tr>
          )}

          {grievances.map((item) => (
            <tr key={item.id}>
              <td>{item.name || 'Anonymous'}</td>
              <td>{item.category}</td>
              <td>{item.description}</td>
              <td>
                {item.photoUrl ? (
                  <a href={item.photoUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td>{formatDate(item.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
