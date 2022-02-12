import express from 'express';

const app = express();

// Random limits
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Hello pbl");
});

app.listen(port, () => {
    console.log("App running on port", port);
});