import axios from "axios";
 

export const getForm = (id, token) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/forms/${id}`, {
      headers: { Authorization: token }
    });
    dispatch({ type: "GET_FORM", payload: res.data });
  } catch (err) {
    console.error("❌ getForm error:", err.response?.data || err.message);
  }
};

export const createForm = (token) => async (dispatch) => {
  try {
    const res = await axios.post("/api/forms", {}, {
      headers: { Authorization: token }
    });
    dispatch({ type: "GET_FORM", payload: res.data });
  } catch (err) {
    console.error("❌ createForm error:", err.response?.data || err.message);
  }
};

export const updateForm = (id, data, token) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/forms/${id}`, data, {
      headers: { Authorization: token }
    });
    dispatch({ type: "UPDATE_FORM", payload: res.data });
  } catch (err) {
    console.error("❌ updateForm error:", err.response?.data || err.message);
  }
};
