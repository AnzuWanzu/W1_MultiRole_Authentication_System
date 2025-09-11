import app from "./app.js";
import { connectDB } from "./database/connection.js";

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to MongoDB | Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
