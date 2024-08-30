const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace 'localhost' and '27017' with your MongoDB server details
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

async function onRequest(req, res) {
    const path = url.parse(req.url).pathname;
    console.log('Request for ' + path + ' received');

    const query = url.parse(req.url).query;
    const params = querystring.parse(query);
    const username = params["username"];
    const id = params["id"];
    const branch = params["branch"];
    const mobileNo = params["phno"];
    const gender = params["gender"];
    const branchadd = params["branchadd"];
 
    if (path === "/insert") {
        await insertData(res, username, id, branch, mobileNo, gender, branchadd);
    } else if (path === "/delete") {
        await deleteData(res, id);
    } else if (path === "/update") {
        await updateData(res, id, params);
    } else if (path === "/report") {
        await displayTable(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Invalid Request');
    }
}

async function insertData(res, username, id, branch, mobileNo, gender, branchadd) {
    try {
        const database = client.db('exp6'); // Replace with your actual database name
        const collection = database.collection('employee');

        const employee = {
            username,
            id,
            branch,
            mobileNo,
            gender,
            branchadd
        };

        const result = await collection.insertOne(employee);
        console.log(`${result.insertedCount} document inserted`);

        const htmlResponse = `
            <html>
                <head>
                    <title>User Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 50%;
                            margin: 20px auto;
                        }
                        td, th {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>User Details</h2>
                    <table>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td>${username}</td>
                        </tr>
                        <tr>
                            <td>ID</td>
                            <td>${id}</td>
                        </tr>
                        <tr>
                            <td>Branch</td>
                            <td>${branch}</td>
                        </tr>
                        <tr>
                            <td>Mobile No</td>
                            <td>${mobileNo}</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>${gender}</td>
                        </tr>
                        <tr>
                            <td>Branch Address</td>
                            <td>${branchadd}</td>
                        </tr>
                    </table>
                    <a href="/report">View Inserted Table</a>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(htmlResponse);
        res.end();
    } catch (error) {
        console.error('Error inserting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function deleteData(res, id) {
    try {
        const database = client.db('exp6'); // Replace with your actual database name
        const collection = database.collection('employee');

        const filter = { id };

        const result = await collection.deleteOne(filter);
        console.log(`${result.deletedCount} document deleted`);

        if (result.deletedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Document deleted successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Document not found');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function updateData(res, id, params) {
    try {
        const database = client.db('exp6'); // Replace with your actual database name
        const collection = database.collection('employee');

        const filter = { id };

        const updateDoc = {
            $set: {}
        };

        if (params.phno) updateDoc.$set.mobileNo = params.phno;
        if (params.branch) updateDoc.$set.branch = params.branch;
        if (params.gender) updateDoc.$set.gender = params.gender;
        if (params.branchadd) updateDoc.$set.branchadd = params.branchadd;
        if (params.username) updateDoc.$set.username = params.username;

        const result = await collection.updateOne(filter, updateDoc);
        console.log(`${result.modifiedCount} document updated`);

        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Employee details updated successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Employee ID not found');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function displayTable(res) {
    try {
        const database = client.db('exp6'); // Replace with your actual database name
        const collection = database.collection('employee');

        const employees = await collection.find({}).toArray();

        let tableHtml = `
            <html>
                <head>
                    <title>Employee Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Employee Details</h2>
                    <table>
                        <tr>
                            <th>Username</th>
                            <th>ID</th>
                            <th>Branch</th>
                            <th>Mobile No</th>
                            <th>Gender</th>
                            <th>Branch Address</th>
                        </tr>
        `;

        employees.forEach(employee => {
            tableHtml += `
                <tr>
                    <td>${employee.username}</td>
                    <td>${employee.id}</td>
                    <td>${employee.branch}</td>
                    <td>${employee.mobileNo}</td>
                    <td>${employee.gender}</td>
                    <td>${employee.branchadd}</td>
                </tr>
            `;
        });

        tableHtml += `
                    </table>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(tableHtml);
        res.end();
    } catch (error) {
        console.error('Error displaying table:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

// Create HTTP server
http.createServer(onRequest).listen(7050);
console.log('Server is running...');
