import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('admin/src/components/ServiceAppointmentsPage/ServiceAppointmentsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

header = text[:text.find('  const displayList = useMemo(')]
displayList_part = """  const displayList = useMemo(() => {
    const copy = filtered.slice();
    copy.sort((x, y) => getTimestamp(y) - getTimestamp(x));
    return copy;
  }, [filtered]);
"""

card_jsx = text[text.find('<div className={serviceAppointmentsStyles.cardInner}>'):]

body_top = """
  return (
    <div className={serviceAppointmentsStyles.container}>
      {/* Header */}
      <div className={serviceAppointmentsStyles.headerContainer}>
        <div className={serviceAppointmentsStyles.headerTitleContainer}>
          <h1 className={serviceAppointmentsStyles.headerTitle}>Diagnostic Service Appointments</h1>
          <p className={serviceAppointmentsStyles.headerSubtitle}>
            Manage patient health checkup bookings, slot rescheduling, and visit cancellations (PostgreSQL).
          </p>
        </div>

        <div className={serviceAppointmentsStyles.searchContainer}>
          <div className={serviceAppointmentsStyles.searchInputWrapper}>
            <div className={serviceAppointmentsStyles.searchLabel}>
              <div className={serviceAppointmentsStyles.searchIconContainer}>
                <Search className={serviceAppointmentsStyles.searchIcon} />
              </div>
              <input
                type="text"
                placeholder="Search patient, mobile, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={serviceAppointmentsStyles.searchInput}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={serviceAppointmentsStyles.clearSearchButton}
                >
                  <X className={serviceAppointmentsStyles.clearSearchIcon} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={serviceAppointmentsStyles.statusFilterSelect}
              title="Filter by status"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={serviceAppointmentsStyles.loadingContainer}>
          Loading service appointments from PostgreSQL...
        </div>
      ) : error ? (
        <div className={serviceAppointmentsStyles.errorContainer}>{error}</div>
      ) : displayList.length === 0 ? (
        <div className={serviceAppointmentsStyles.noResultsContainer}>
          <div className={serviceAppointmentsStyles.noResultsIcon}>📅</div>
          <p className={serviceAppointmentsStyles.noResultsText}>No service appointments found</p>
          <p className={serviceAppointmentsStyles.noResultsSubtext}>Try adjusting your search or status filter.</p>
        </div>
      ) : (
        <div className={serviceAppointmentsStyles.gridContainer}>
          {displayList.map((a) => {
            const isLocked = a.status === "Canceled" || a.status === "Completed";
            return (
              <article key={a.id} className={serviceAppointmentsStyles.article}>
                """

with open('admin/src/components/ServiceAppointmentsPage/ServiceAppointmentsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(header + displayList_part + body_top + card_jsx)
print("ServiceAppointmentsPage.jsx rebuilt successfully!")
