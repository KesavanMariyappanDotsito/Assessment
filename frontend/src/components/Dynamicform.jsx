import React, { useState } from "react";
import { Form, Input, Select, Button, Checkbox, InputNumber, Space, message } from "antd";
import axios from "axios";

const { Option } = Select;

function Dynamicform() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ type: "", label: "", key: "", dropdownOptions: [], validationRules: [] });
  const [dropdownOption, setDropdownOption] = useState({ key: "", value: "" });
  const [formMeta, setFormMeta] = useState({ tableName: "", displayName: "" });

  const [form] = Form.useForm();

  const addField = () => {
    if (newField.type && newField.label && newField.key) {
      setFields([...fields, { ...newField }]);
      setNewField({ type: "", label: "", key: "", dropdownOptions: [], validationRules: [] });
    } else {
      message.error("Please fill all field details!");
    }
  };

  const addDropdownOption = () => {
    if (dropdownOption.key && dropdownOption.value) {
      setNewField({
        ...newField,
        dropdownOptions: [...newField.dropdownOptions, { ...dropdownOption }],
      });
      setDropdownOption({ key: "", value: "" });
    } else {
      message.error("Both key and value are required for dropdown options.");
    }
  };

  const onFinish = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/formdata", {
        formMeta,
        fields
      });
      console.log(response.data);
      message.success("Form data saved successfully!");
    } catch (error) {
      console.error(error);
      message.error("Error saving form data!");
    }
  };

  const handleValidationChange = (ruleType, value) => {
    setNewField({
      ...newField,
      validationRules: newField.validationRules.filter((rule) => rule.type !== ruleType).concat(
        value !== null ? { type: ruleType, value } : []
      ),
    });
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#ffffff", color: "#000", width:"100%" }}>
      <h1>Dynamic Form Builder with Validation Rules</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>Form Metadata</h2>
        <Input
          placeholder="Table Name"
          value={formMeta.tableName}
          onChange={(e) => setFormMeta({ ...formMeta, tableName: e.target.value })}
          style={{ width: "30%", marginRight: "1rem" }}
        />
        <Input
          placeholder="Display Name"
          value={formMeta.displayName}
          onChange={(e) => setFormMeta({ ...formMeta, displayName: e.target.value })}
          style={{ width: "30%" }}
        />
      </div>

      {/* Field Builder Section */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Add New Field</h2>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Label"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            style={{ width: "30%" }}
          />
          <Input
            placeholder="Key"
            value={newField.key}
            onChange={(e) => setNewField({ ...newField, key: e.target.value })}
            style={{ width: "30%" }}
          />
          <Select
            placeholder="Select Field Type"
            value={newField.type}
            onChange={(value) => setNewField({ ...newField, type: value })}
            style={{ width: "30%" }}
          >
            <Option value="text">Textbox</Option>
            <Option value="dropdown">Dropdown</Option>
            <Option value="checkbox">Checkbox</Option>
            <Option value="number">Number</Option>
            <Option value="textarea">Textarea</Option>
          </Select>

          <Checkbox
            onChange={(e) => {
              const checked = e.target.checked;
              handleValidationChange("required", checked ? true : null);
            }}
          >
            Required Field
          </Checkbox>

          {newField.type === "text" && (
            <>
              <InputNumber
                placeholder="Min Length"
                onChange={(value) => handleValidationChange("minLength", value)}
                style={{ width: "30%" }}
              />
              <InputNumber
                placeholder="Max Length"
                onChange={(value) => handleValidationChange("maxLength", value)}
                style={{ width: "30%" }}
              />
            </>
          )}

          {newField.type === "number" && (
            <>
              <InputNumber
                placeholder="Min Value"
                onChange={(value) => handleValidationChange("min", value)}
                style={{ width: "30%" }}
              />
              <InputNumber
                placeholder="Max Value"
                onChange={(value) => handleValidationChange("max", value)}
                style={{ width: "30%" }}
              />
            </>
          )}

          {newField.type === "text" && (
            <Input
              placeholder="Pattern (Regex)"
              onChange={(e) => handleValidationChange("pattern", e.target.value)}
              style={{ width: "30%" }}
            />
          )}

          <Button type="primary" onClick={addField}>
            Add Field
          </Button>
        </Space>

        {newField.type === "dropdown" && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Dropdown Options</h3>
            <Space>
              <Input
                placeholder="Option Key"
                value={dropdownOption.key}
                onChange={(e) => setDropdownOption({ ...dropdownOption, key: e.target.value })}
              />
              <Input
                placeholder="Option Value"
                value={dropdownOption.value}
                onChange={(e) => setDropdownOption({ ...dropdownOption, value: e.target.value })}
              />
              <Button type="dashed" onClick={addDropdownOption}>
                Add Option
              </Button>
            </Space>
            <div style={{ marginTop: "0.5rem" }}>
              {newField.dropdownOptions.map((opt, idx) => (
                <div key={idx}>
                  {opt.key} - {opt.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Form Section */}
      <h2>Generated Form</h2>
      <Form form={form} onFinish={onFinish}>
        {fields.map((field, index) => (
          <Form.Item key={index} label={field.label} name={field.key} valuePropName={field.type === "checkbox" ? "checked" : undefined}>

            {field.type === "text" && <Input />}
            {field.type === "number" && <InputNumber />}
            {field.type === "textarea" && <Input.TextArea />}
            {field.type === "checkbox" && <Checkbox />}
            {field.type === "dropdown" && (
              <Select>
                {field.dropdownOptions.map((opt, idx) => (
                  <Option key={idx} value={opt.key}>
                    {opt.value}
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

export default Dynamicform;
