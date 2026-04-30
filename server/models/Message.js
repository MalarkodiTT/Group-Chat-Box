mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected!"))
.catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
});