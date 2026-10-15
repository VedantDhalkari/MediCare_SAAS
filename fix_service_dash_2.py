with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
# Let's find where 'function formatCurrency' ends
idx = 0
for i, l in enumerate(lines):
    if 'function formatCurrency' in l:
        idx = i + 3
        break

logic_code = '\n'.join(lines[:idx])
table_rows = '\n'.join(lines[idx:])

full_code = f"""{logic_code}

  return (
    <div className={{serviceDashboardStyles.container}}>
      <div className={{serviceDashboardStyles.innerContainer}}>
        {{/* Header */}}
        <div className={{serviceDashboardStyles.header.container}}>
          <div>
            <h1 className={{serviceDashboardStyles.header.title}}>Service Performance Dashboard</h1>
            <p className={{serviceDashboardStyles.header.subtitle}}>
              Hospital health checkups and diagnostic test metrics backed by PostgreSQL.
            </p>
          </div>
        </div>

        {{/* Stat Cards Grid */}}
        <div className={{serviceDashboardStyles.statGrid}}>
          <div className={{serviceDashboardStyles.statCard.container}}>
            <div className={{serviceDashboardStyles.statCard.iconContainer}}>
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <p className={{serviceDashboardStyles.statCard.label}}>Services</p>
              <p className={{serviceDashboardStyles.statCard.value}}>{{totals.totalServices}}</p>
            </div>
          </div>

          <div className={{serviceDashboardStyles.statCard.container}}>
            <div className={{serviceDashboardStyles.statCard.iconContainer}}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className={{serviceDashboardStyles.statCard.label}}>Bookings</p>
              <p className={{serviceDashboardStyles.statCard.value}}>{{totals.totalAppointments}}</p>
            </div>
          </div>

          <div className={{serviceDashboardStyles.statCard.container}}>
            <div className={{serviceDashboardStyles.statCard.iconContainer}}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className={{serviceDashboardStyles.statCard.label}}>Completed</p>
              <p className={{serviceDashboardStyles.statCard.value}}>{{totals.totalCompleted}}</p>
            </div>
          </div>

          <div className={{serviceDashboardStyles.statCard.container}}>
            <div className={{serviceDashboardStyles.statCard.iconContainer}}>
              <XCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className={{serviceDashboardStyles.statCard.label}}>Canceled</p>
              <p className={{serviceDashboardStyles.statCard.value}}>{{totals.totalCanceled}}</p>
            </div>
          </div>

          <div className={{serviceDashboardStyles.statCard.container}}>
            <div className={{serviceDashboardStyles.statCard.iconContainer}}>
              <BadgeIndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className={{serviceDashboardStyles.statCard.label}}>Total Revenue</p>
              <p className={{serviceDashboardStyles.statCard.value}}>{{formatCurrency(totals.totalEarning)}}</p>
            </div>
          </div>
        </div>

        {{/* Search */}}
        <div className={{serviceDashboardStyles.search.container}}>
          <div className={{serviceDashboardStyles.search.inputContainer}}>
            <Search size={16} className="text-emerald-500" />
            <input
              type="text"
              placeholder="Search diagnostic service..."
              value={{searchQuery}}
              onChange={{(e) => setSearchQuery(e.target.value)}}
              className={{serviceDashboardStyles.search.input}}
            />
          </div>
        </div>

        {{/* Table Container */}}
        <div className={{serviceDashboardStyles.table.container}}>
{table_rows}
"""

with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(full_code)
print("ServiceDashboard.jsx assembled successfully")
