"use client"
import "./FormInput.css"

const FormInput = ({ label, type = "text", name, value, onChange, placeholder, required = false, error }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? "error" : ""}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default FormInput
