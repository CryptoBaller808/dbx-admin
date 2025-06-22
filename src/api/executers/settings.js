import { httpClient } from "../client/CommonApi"

export const uploadBanner = async (params) => {
    return await httpClient.post('/admindashboard/banner/add', params)
}

export const getBanner = async () => {
    return await httpClient.get('/admindashboard/banner/get')
} 