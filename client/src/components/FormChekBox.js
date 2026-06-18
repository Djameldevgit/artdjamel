import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateForm } from "../redux/actions/formAction";

const FormCheckBox = ({ formId }) => {
  const { auth, form } = useSelector(state => state);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, checked } = e.target;
    const updatedData = { ...form, [name]: checked };
    dispatch(updateForm(formId, updatedData, auth.token)); // 👈 enviar token
  };

  return (
    <div>
      {Object.keys(form).map((campo, index) => (
        <div key={index}>
          <label>
            <input
              type="checkbox"
              name={campo}
              checked={form[campo]}
              onChange={handleChange}
            />
            {campo}
          </label>
        </div>
      ))}
    </div>
  );
};

export default FormCheckBox;

