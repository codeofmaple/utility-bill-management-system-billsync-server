require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dwmxail.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect(); //have to comment later
        const db = client.db("billsync_db")
        const billsCollection = db.collection("bills")
        const myBillsCollection = db.collection("my_bills")

        // get all bills
        app.get('/bills', async (req, res) => {
            const result = await billsCollection.find().toArray();
            res.send(result)
        })

        // get 6 by recent
        app.get('/recent-bills', async (req, res) => {

            const result = await billsCollection.find().sort({ date: -1 }).limit(6).toArray();
            res.send(result)
        })

        // get 1 with id
        app.get('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await billsCollection.findOne(filter)
            res.send(result)
        })

        // _____________________
        // my-bills
        // get bills
        app.get('/my-bills', async (req, res) => {
            const result = await myBillsCollection.find().toArray();
            res.send(result)
        })

        // post one bills
        app.post('/my-bills', async (req, res) => {
            const data = req.body
            const result = await myBillsCollection.insertOne(data);
            res.send(result)
        })

        // update one bill
        app.put("/my-bills/:id", async (req, res) => {
            const { id } = req.params;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const update = {
                $set: data,
            };
            const result = await myBillsCollection.updateOne(filter, update);

            res.send(result);
        });

        // delate one bill
        app.delete("/my-bills/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await myBillsCollection.deleteOne(filter)
            res.send(result)
        })




        await client.db("admin").command({ ping: 1 });//have to comment later
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("billsync server is running fine!");
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
