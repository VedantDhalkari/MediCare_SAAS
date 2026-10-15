with open('admin/src/components/ServiceAppointmentsPage/ServiceAppointmentsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

header = """import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  MapPin,
  Phone,
  User,
  Filter,
  BadgeIndianRupee,
} from "lucide-react";
import { serviceAppointmentsStyles } from "../../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

"""

tail = """
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open('admin/src/components/ServiceAppointmentsPage/ServiceAppointmentsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(header + text.strip() + tail)
print("ServiceAppointmentsPage.jsx fixed successfully")
