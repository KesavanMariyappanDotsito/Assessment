import React, { useEffect, useState } from "react";
import { Form, Input, Select, Checkbox, InputNumber, Button } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

function Fillingform() {
  const [fields, setFields] = useState([]);
  const [form] = Form.useForm();
  const { tableName } = useParams();

  useEffect(() => {
    if (tableName) {
      axios
        .get(`http://localhost:5000/api/formdata/${tableName}`)
        .then((response) => {
          const formData = response.data.data[0];
          setFields(formData.fields);
        })
        .catch((error) => {
          console.error("Error fetching form data:", error);
        });
    }
  }, [tableName]);

  const onFinish = (values) => {
    axios
      .post(`http://localhost:5000/api/dynamic/${tableName}`, values)
      .then((response) => {
        console.log("Form Submitted Successfully:", response.data);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  };

  const getFieldRules = (field) => {
    const rules = [];

    if (field.validationRules && Array.isArray(field.validationRules)) {
      field.validationRules.forEach((rule) => {
        switch (rule.type) {
          case "required":
            if (rule.value) {
              rules.push({ required: true, message: `${field.label} is required!` });
            }
            break;
          case "min":
            rules.push({ type: "number", min: rule.value, message: `${field.label} must be at least ${rule.value}.` });
            break;
          case "max":
            rules.push({ type: "number", max: rule.value, message: `${field.label} must be at most ${rule.value}.` });
            break;
          case "minLength":
            rules.push({ min: rule.value, message: `${field.label} must be at least ${rule.value} characters.` });
            break;
          case "maxLength":
            rules.push({ max: rule.value, message: `${field.label} must be at most ${rule.value} characters.` });
            break;
          case "pattern":
            rules.push({ pattern: new RegExp(rule.value), message: `${field.label} format is invalid.` });
            break;
          default:
            break;
        }
      });
    }

    return rules;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dynamic Form for Table: {tableName}</h1>
      <Form form={form} onFinish={onFinish}>
        {fields.map((field, index) => (
          <Form.Item
            key={`${field.key}_${index}`}
            label={field.label}
            name={field.key}
            rules={getFieldRules(field)}
          >
            {field.type === "text" && <Input />}
            {field.type === "number" && <InputNumber />}
            {field.type === "textarea" && <Input.TextArea />}
            {field.type === "checkbox" && <Checkbox>{field.label}</Checkbox>}
            {field.type === "dropdown" && (
              <Select>
                {field.dropdownOptions.map((option, idx) => (
                  <Option key={`${option.key}_${idx}`} value={option.value}>
                    {option.value}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        ))}

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default Fillingform;
