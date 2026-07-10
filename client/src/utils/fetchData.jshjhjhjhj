import axios from 'axios'
export const  BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

 
// ✅ Función pública que recibe la URL y opciones (como params)
export const getPublicDataAPI = async (url, config = {}) => {
       const fullUrl = url.startsWith('/api') ? url : `/api/${url}`;
    const res = await axios.get(`${BASE_URL}${fullUrl}`, config);
    return res;
}

export const getDataAPI = async (url, token) => {
    const res = await axios.get(`/api/${url}`, {
        headers: { Authorization: token}
    })
    return res;
}

export const postDataAPI = async (url, post, token) => {
    const res = await axios.post(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const putDataAPI = async (url, post, token) => {
    const res = await axios.put(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const patchDataAPI = async (url, post, token) => {
    const res = await axios.patch(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const deleteDataAPI = async (url, token) => {
    const res = await axios.delete(`/api/${url}`, {
        headers: { Authorization: token}
    })
    return res;
}