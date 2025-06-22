import { httpClient } from "../client/CommonApi";

export const addCryptoCurrency = async (params) => {
    return await httpClient.post('/admindashboard/assets/add', params)
}

export const updateCryptoCurrency = async (params) => {
    return await httpClient.post('/admindashboard/assets/update', params)
}

export const getCryptoCurrencyList = async (type) => {
    return await httpClient.get(`/admindashboard/assets/list?type=${type}`,)
}

export const getSingleCurrencyData = async (id) => {
    return await httpClient.get(`/admindashboard/assets/${id}`,)
}