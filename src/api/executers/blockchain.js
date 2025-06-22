import { httpClient } from "../client/CommonApi"

export const getBlockchainList = async () => {
    return await httpClient.get(`/admindashboard/blockchain/list`)
}

export const removeBlockchainList = async (id) => {
    return await httpClient.delete(`/admindashboard/blockchain/delete/${id}`)
}

export const addBlockchain = async (params) => {
    return await httpClient.post(`/admindashboard/blockchain/add`, params)
}

export const getSingleBlockchain = async (id) => {
    return await httpClient.get(`/admindashboard/blockchain/${id}`,)
}

export const updateBlockchain = async (params) => {
    return await httpClient.post(`/admindashboard/blockchain/update`, params)
}