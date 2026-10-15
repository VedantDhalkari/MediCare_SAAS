with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

header = """import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Grid,
  Search,
  BadgeIndianRupee,
  Layers,
  Sparkles,
} from "lucide-react";
import { serviceDashboardStyles } from "../../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

"""

tail = """
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open('admin/src/components/ServiceDashboard/ServiceDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(header + text.strip() + tail)
print("ServiceDashboard.jsx fixed successfully")
