import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`);
        console.log('MongoDB is connected, connectionInstance: ', connectionInstance, connectionInstance.connection.host)
    } catch (error) {
        console.error('Error encountered while connecting the MongoDB: ', error);
        process.exit(1);
    }
}
export default connectDB;