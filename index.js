const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

const mongourl = process.env.MONGOURL;
const client = new MongoClient(mongourl, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
  });

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Kết nối MongoDB thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
  } finally {
    await client.close();
  }
}

connectDB();
