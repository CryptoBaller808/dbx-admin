import { httpClient } from "../client/CommonApi"
 
export const getTransactions = async () => {
    return await httpClient.get('/admindashboard/transactions/list')
} 