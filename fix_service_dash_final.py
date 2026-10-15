import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function formatCurrency(v) {')
logic_part = text[:text.find('}', idx) + 1]

jsx = '''

  return (
    <div className={serviceDashboardStyles.container}>
      <div className={serviceDashboardStyles.innerContainer}>
        {/* Header */}
        <div className={serviceDashboardStyles.header.container}>
          <div>
            <h1 className={serviceDashboardStyles.header.title}>Service Performance Dashboard</h1>
            <p className={serviceDashboardStyles.header.subtitle}>
              Hospital health checkups and diagnostic test metrics backed by PostgreSQL.
            </p>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className={serviceDashboardStyles.statGrid}>
          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Services</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalServices}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Bookings</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalAppointments}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Completed</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalCompleted}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <XCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Canceled</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalCanceled}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <BadgeIndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Total Revenue</p>
              <p className={serviceDashboardStyles.statCard.value}>{formatCurrency(totals.totalEarning)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={serviceDashboardStyles.search.container}>
          <div className={serviceDashboardStyles.search.inputContainer}>
            <Search size={16} className="text-emerald-500" />
            <input
              type="text"
              placeholder="Search diagnostic service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={serviceDashboardStyles.search.input}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className={serviceDashboardStyles.table.container}>
          {/* Tablet Header */}
          <div className={serviceDashboardStyles.table.headerMd}>
            <div className={serviceDashboardStyles.table.headerText}>Service</div>
            <div className={serviceDashboardStyles.table.headerText}>Appointments</div>
            <div className={serviceDashboardStyles.table.headerText}>Completed</div>
            <div className={serviceDashboardStyles.table.headerText}>Canceled</div>
            <div className={serviceDashboardStyles.table.headerText}>Earning</div>
          </div>

          {/* Desktop Header */}
          <div className={serviceDashboardStyles.table.headerLg}>
            <div className="col-span-5">Service</div>
            <div className="col-span-2">Price</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Appointments</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Completed</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Canceled</div>
            <div className="col-span-2 text-right">Earning</div>
          </div>

          {loading ? (
            <div className={serviceDashboardStyles.states.loading}>
              Loading diagnostic services from PostgreSQL...
            </div>
          ) : error ? (
            <div className={serviceDashboardStyles.states.error}>
              {error}
            </div>
          ) : visibleServices.length === 0 ? (
            <div className={serviceDashboardStyles.states.empty}>
              No services found matching your criteria.
            </div>
          ) : (
            <div className={serviceDashboardStyles.table.body}>
              {visibleServices.map((s) => {
                const earning = s.completed * s.price;
                return (
                  <div key={s.id} className={serviceDashboardStyles.table.row}>
                    {/* Desktop View */}
                    <div className={serviceDashboardStyles.table.desktopView}>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={serviceDashboardStyles.table.desktopImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <h3 className={serviceDashboardStyles.table.desktopServiceName}>
                            {s.name}
                          </h3>
                        </div>
                      </div>

                      <div className="col-span-2 font-medium text-slate-700">
                        {formatCurrency(s.price)}
                      </div>

                      <div className={serviceDashboardStyles.table.desktopCenterCell(1)}>
                        {s.totalAppointments}
                      </div>

                      <div className={`${serviceDashboardStyles.table.desktopCenterCell(1)} text-emerald-700 font-medium`}>
                        {s.completed}
                      </div>

                      <div className={`${serviceDashboardStyles.table.desktopCenterCell(1)} text-rose-500`}>
                        {s.canceled}
                      </div>

                      <div className="col-span-2 text-right font-bold text-emerald-800">
                        {formatCurrency(earning)}
                      </div>
                    </div>

                    {/* Tablet View */}
                    <div className={serviceDashboardStyles.table.tabletView}>
                      <div className="flex items-center gap-3">
                        <div className={serviceDashboardStyles.table.tabletImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={serviceDashboardStyles.table.tabletTextContainer}>
                          <div className={serviceDashboardStyles.table.tabletServiceName}>
                            {s.name}
                          </div>
                          <div className={serviceDashboardStyles.table.tabletPrice}>
                            {formatCurrency(s.price)}
                          </div>
                        </div>
                      </div>

                      <div className={serviceDashboardStyles.table.tabletCell}>
                        {s.totalAppointments}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-emerald-700`}>
                        {s.completed}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-red-500`}>
                        {s.canceled}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-right font-bold text-emerald-800`}>
                        {formatCurrency(earning)}
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className={serviceDashboardStyles.table.mobileView}>
                      <div className="flex items-start gap-3">
                        <div className={serviceDashboardStyles.table.mobileImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={serviceDashboardStyles.table.mobileServiceHeader}>
                            <h3 className={serviceDashboardStyles.table.mobileServiceName}>
                              {s.name}
                            </h3>
                            <div className="text-sm font-medium">
                              {formatCurrency(s.price)}
                            </div>
                          </div>

                          <div className={serviceDashboardStyles.table.mobileStatsContainer}>
                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <Calendar size={14} />
                              <span className="leading-none">
                                {s.totalAppointments} Appointments
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <CheckCircle size={14} />
                              <span className="leading-none text-emerald-700">
                                {s.completed} Completed
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("red")}>
                              <XCircle size={14} />
                              <span className="leading-none text-red-500">
                                {s.canceled} Canceled
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <BadgeIndianRupee size={14} />
                              <span className="leading-none font-bold text-emerald-800">
                                Total Earning: {formatCurrency(earning)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredServices.length > INITIAL_COUNT && (
            <div className={serviceDashboardStyles.showMore.container}>
              <button
                onClick={() => setShowAll(!showAll)}
                className={serviceDashboardStyles.showMore.button}
              >
                {showAll ? "Show Less" : `View All Services (${filteredServices.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'''

with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(logic_part + jsx)
print("ServiceDashboard.jsx successfully written!")
