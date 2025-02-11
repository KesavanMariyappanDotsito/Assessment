import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Form } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";

const DisplayTable = () => {
    const [dataSource, setDataSource] = useState([]);
    const [editingKey, setEditingKey] = useState("");
    const [form] = Form.useForm();
    const { tableName } = useParams();

    useEffect(() => {
        if (tableName) {
            fetchTableData();
        }
    }, [tableName]);

    const fetchTableData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/dynamic/${tableName}`);
            setDataSource(response.data.data || []);
        } catch (error) {
            console.error("Error fetching table data:", error);
        }
    };

    const handleDelete = async (record) => {
        try {
            await axios.delete(`http://localhost:5000/api/dynamic/${tableName}/${record._id}`);
            setDataSource(dataSource.filter((item) => item._id !== record._id));
            message.success("Record deleted successfully.");
        } catch (error) {
            message.error("Error deleting record.");
        }
    };

    const edit = (record) => {
        form.setFieldsValue(record);
        setEditingKey(record._id);
    };

    const save = async (record) => {
        try {
            const updatedData = await form.validateFields();
            await axios.put(`http://localhost:5000/api/formdata/${tableName}/${record._id}`, updatedData);
            const updatedSource = dataSource.map((item) => (item._id === record._id ? { ...item, ...updatedData } : item));
            setDataSource(updatedSource);
            setEditingKey("");
            message.success("Record updated successfully.");
        } catch (error) {
            message.error("Error updating record.");
        }
    };

    const cancel = () => setEditingKey("");

    const isEditing = (record) => record._id === editingKey;

    // Utility function to recursively flatten objects
    const flattenObject = (obj, parentKey = "", result = {}) => {
        for (let key in obj) {
            if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                flattenObject(obj[key], `${parentKey}${key}.`, result);
            } else if (Array.isArray(obj[key])) {
                obj[key].forEach((item, index) => {
                    flattenObject(item, `${parentKey}${key}[${index}].`, result);
                });
            } else {
                result[`${parentKey}${key}`] = obj[key] !== undefined ? obj[key] : "null";
            }
        }
        return result;
    };

    const flattenedData = dataSource.map((item) => flattenObject(item));

    const allFields = Array.from(
        new Set(flattenedData.flatMap((item) => Object.keys(item)))
    );

    const columns = [
        ...allFields.map((key) => ({
            title: key,
            dataIndex: key,
            key,
            render: (text) => <>{text !== undefined ? text : "null"}</>,
        })),
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button type="link" onClick={() => save(record)}>
                            Save
                        </Button>
                        <Button type="link" onClick={cancel}>
                            Cancel
                        </Button>
                    </span>
                ) : (
                    <>
                        <Button type="link" onClick={() => edit(record)} disabled={editingKey !== ""}>
                            Edit
                        </Button>
                        <Popconfirm title="Are you sure to delete this record?" onConfirm={() => handleDelete(record)}>
                            <Button type="link" danger>
                                Delete
                            </Button>
                        </Popconfirm>
                    </>
                );
            },
        },
    ];

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Data Table for Table: {tableName}</h1>
            <Form form={form} component={false}>
                <Table
                    dataSource={flattenedData}
                    columns={columns}
                    rowKey="_id"
                    bordered
                    scroll={{ x: "max-content", y: 400 }}
                />
            </Form>
        </div>
    );
};

export default DisplayTable;
