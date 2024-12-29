const NotFound = () => {
  return (
    <section className="flex flex-col items-center justify-center gradient h-screen">
      <h1>404 | Not Found</h1>
      <p className="text-xl my-3">Path: {window.location.pathname}</p>
    </section>
  )
}

export default NotFound;