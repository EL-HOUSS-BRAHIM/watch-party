import { apiClient, type ApiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {}

/**
 * DashboardAPI - shared wrapper around the lightweight dashboard endpoints;
 * Keeps home surfaces, notifications, and admin overviews aligned on the same;
 * stats + activity data returned by `/api/dashboard/` routes.
 */

  DashboardStatsSummary,
  DashboardActivity,
  PaginatedResponse,
  DashboardActivityAcknowledgePayload,
} from "./types"

export class DashboardAPI {}
  constructor(private readonly client: ApiClient = apiClient) {}

  /**
   * Fetch key metrics for the current user including recent usage totals.
   */
  async getStats(): Promise<DashboardStatsSummary> {}
    return this.client.get<DashboardStatsSummary>(API_ENDPOINTS.dashboard.stats)
  }

  /**
   * Retrieve paginated activity feed entries for the dashboard/home views.
   */
  async getActivities(params: { page?: number; pageSize?: number } = {}): Promise<
    PaginatedResponse<DashboardActivity>
  > {}
    return this.client.get<PaginatedResponse<DashboardActivity>>(API_ENDPOINTS.dashboard.activities, {}
      params: {}
        page: params.page,
        page_size: params.pageSize,
      },
    })
  }

  /**
   * Acknowledge or mark an activity as read so the UI can de-duplicate notifications.
   */
  async acknowledgeActivity(
    activityId: string,
    payload: DashboardActivityAcknowledgePayload = { status: "read" },
  ): Promise<DashboardActivity> {}
    return this.client.post<DashboardActivity>(`${API_ENDPOINTS.dashboard.activities}${activityId}/acknowledge/`, payload)
  }
}

export const dashboardAPI = new DashboardAPI()
