import { Link } from 'react-router-dom'

const categories = [
  { label: 'Welfare Council', icon: 'volunteer_activism' },
  { label: 'Academic Council', icon: 'school' },
  { label: 'Cultural Council', icon: 'theater_comedy' },
  { label: 'Sports Council', icon: 'sports_soccer' },
  { label: 'PDC Council', icon: 'work' },
  { label: 'IRP Council', icon: 'public' },
  { label: 'General Complaints', icon: 'report' },
]

function Categories() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center p-gutter">
      <main className="w-full max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-display-lg font-display-lg text-primary uppercase tracking-widest mb-2">
            Select the complaint category
          </h1>
          <div className="w-12 h-1 bg-primary mx-auto opacity-20" />
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {categories.map((category) => (
            <Link
              key={category.label}
              to={`/submit/${encodeURIComponent(category.label)}`}
              className="group relative flex flex-col items-center justify-center w-full sm:w-64 aspect-square bg-white border border-outline-variant hover:border-primary transition-all duration-300 p-12"
              style={{ textDecoration: 'none' }}
            >
              <div className="mb-6">
                <span className="material-symbols-outlined text-[64px] text-primary group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-widest text-primary uppercase">
                {category.label}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-primary" />
            </Link>
          ))}
        </div>
      </main>

      <Link
        to="/"
        className="button fixed bottom-8 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 z-10"
        style={{ textDecoration: 'none' }}
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        Home
      </Link>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />
    </div>
  )
}

export default Categories
