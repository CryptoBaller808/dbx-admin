import { httpClient } from "../client/CommonApi"

export const getAnalyticData = async (startDate, endDate) => {
    return await httpClient.get(`/admindashboard/analytics?startDate=${startDate}&endDate=${endDate}`)
}
