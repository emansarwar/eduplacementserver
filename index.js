const express = require("express");
const app = express();
const cors = require("cors");
// const jwt = require("jsonwebtoken");

require("dotenv").config();
// const stripe = require('stripe')(process.env.STRIPE_SECTET_KEY);
const port = process.env.PORT || 5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4urre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("educationPlacement").collection("user");

    app.post("/users", async (req, res) => {
      const { name, email, varsity } = req.body;
      console.log("Request data:", req.body);
      // insert email if user doesn't exist
      try {
        const query = { email: email };
        // const existingUser = await userCollection.findOne(query.body.email);
        // if (existingUser) {
        //   return res.status(json).json({ message: "user already exists", insertedId: null });
        // }
        if(!req.body.varsity){
            console.log("varsity is null")
        }else{
            const user = { name, email, varsity };
            console.log("post", user);
            const result = await userCollection.insertOne(user);
    
            res.send({ message: "User added successfully", insertedId: result.insertedId });
        }
        
      } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      console.log("Received email:", email);
      
      try {
        const user = await userCollection.findOne({ email });
        res.send(user);
        console.log("Queried user:", user); // Log the user from the database
        if (user) {
          res.send(user);
        } else {
          res.status(404).send({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });
    app.get("/user", async (req, res) => {
    //   const email = req.query.email;
    //   console.log("Received email:", email);
      const users = await userCollection.find().toArray();
    res.send(users);
    
    });

    app.put("/users", async (req, res) => {
        const { email, name, varsity } = req.body;
      
        if (!email) {
          return res.status(400).send({ message: "Email is required for updates" });
        }
      
        try {
          const query = { email };
          const updateDoc = {
            $set: {
              name: name || "", // Update name if provided
              varsity: varsity || "", // Update varsity if provided
            },
          };
      
          const result = await userCollection.updateOne(query, updateDoc);
          if (result.modifiedCount > 0) {
            res.send({ message: "User updated successfully", result });
          } else {
            res.send({ message: "No changes were made" });
          }
        } catch (error) {
          console.error("Error updating user:", error);
          res.status(500).send({ message: "Internal server error" });
        }
      });
      

   

    

    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("foodedu website is running");
});

app.listen(port, () => {
  console.log(`eduWebsite is coming on port ${port}`);
});
