import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <header className="bg-white dark:bg-slate-950 full-width top-0 border-b border-slate-200 dark:border-slate-800 z-50 sticky">
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold tracking-tighter text-slate-900 dark:text-slate-50">
              Grievance Portal
            </span>
          </div>
          <div className="flex items-center gap-4" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-20">
        <section className="px-8 max-w-[1280px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to="/categories"
              className="group bg-white border border-outline-variant p-10 flex flex-col justify-between transition-all duration-300 hover:border-primary cursor-pointer min-h-[360px]"
              style={{ textDecoration: 'none' }}
            >
              <div>
                <div className="w-14 h-14 bg-surface-container-low flex items-center justify-center mb-8">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'wght' 300" }}
                  >
                    description
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Lodge a Complaint
                </h3>
                <p className="font-body-lg text-body-lg text-secondary">
                  Secure and confidential submission portal for institutional feedback and formal grievance procedures.
                </p>
              </div>
              <div className="flex items-center text-primary font-label-md group-hover:gap-4 transition-all mt-8">
                <span>INITIATE FORM</span>
                <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </div>
            </Link>

            <Link
              to="/login"
              className="group bg-white border border-outline-variant p-10 flex flex-col justify-between transition-all duration-300 hover:border-primary cursor-pointer min-h-[360px]"
              style={{ textDecoration: 'none' }}
            >
              <div>
                <div className="w-14 h-14 bg-surface-container-low flex items-center justify-center mb-8">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'wght' 300" }}
                  >
                    visibility
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">View Complaints</h3>
                <p className="font-body-lg text-body-lg text-secondary">
                  Track progress, review submitted status, and access resolution updates for existing institutional filings.
                </p>
              </div>
              <div className="flex items-center text-primary font-label-md group-hover:gap-4 transition-all mt-8">
                <span>ACCESS STATUS</span>
                <span className="material-symbols-outlined ml-2">open_in_new</span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Landing
