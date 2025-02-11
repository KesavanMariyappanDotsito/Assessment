import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const db = mongoose.connection;

// Route to store form data
app.post("/api/formdata", async (req, res) => {
  try {
    const collection = db.collection("formdata"); // collection without schema
    const result = await collection.insertOne(req.body);
    res.status(201).json({ message: "Form data saved successfully!", data: result });
  } catch (error) {
    res.status(500).json({ message: "Error saving form data", error: error.message });
  }
});

// Route to get all form data
app.get("/api/formdata", async (req, res) => {
    try {
      const collection = db.collection("formdata");
      const data = await collection.find().toArray();
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ message: "Error fetching form data", error: error.message });
    }
  });

app.get("/api/formdata/:tableName", async (req, res) => {
    const { tableName } = req.params;
  
    try {
      const collection = db.collection("formdata");
      const data = await collection.find({ "formMeta.tableName": tableName }).toArray();
      
      if (data.length === 0) {
        return res.status(404).json({ message: `No form data found for table: ${tableName}` });
      }
  
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ message: "Error fetching form data", error: error.message });
    }
  });
  

app.post("/api/dynamic/:tableName", async (req, res) => {
    const { tableName } = req.params;
    try {
      const collection = db.collection(tableName); // Use tableName from params
      const result = await collection.insertOne(req.body);
  
      res.status(201).json({ message: "Form data saved successfully!", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error saving form data", error: error.message });
    }
  });
  
app.get("/api/dynamic/:tableName", async (req, res) => {
    const { tableName } = req.params;
    
    try {
      const collection = db.collection(tableName); // Use tableName from params
      const data = await collection.find().toArray();
      
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ message: "Error fetching form data", error: error.message });
    }
  });

// DELETE route for deleting a record
app.delete("/api/dynamic/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const collection = db.collection(tableName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Record not found!" });
    }

    res.status(200).json({ message: "Record deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record", error: error.message });
  }
});

// PUT route for updating a record
app.put("/api/dynamic/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const collection = db.collection(tableName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Record not found!" });
    }

    res.status(200).json({ message: "Record updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating record", error: error.message });
  }
});

  

app.get("/", (req, res) => {
  res.send("Hello from the Backend!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
