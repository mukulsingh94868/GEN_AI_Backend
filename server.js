import "dotenv/config";
import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import bodyParser from "body-parser";

connectToDB()

// Parse application/json
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => {
    console.log("Server is running on port 5000")
})