import { httpClient } from "../client/CommonApi";

export const uploadFile = async (params) => {
    return await httpClient.post('/admindashboard/upload/file', params, {
        headers: {
            'Content-Type': 'multipart/form-data',  // Set the Content-Type to multipart/form-data
        }
    });
};
