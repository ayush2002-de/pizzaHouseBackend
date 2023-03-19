import express from 'express';
import { APP_PORT, DB_URL} from './config';
import errorHandler from './middleware/errorHandler';
import routes from './routes';
import mongoose from 'mongoose';
import path from 'path';


const app=express();

global.appRoot=path.resolve(__dirname);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/uploads',express.static('uploads'));

//data_base connection
mongoose.connect(DB_URL);
const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log("data base is connected..");
})


app.use('/api',routes);




app.use(errorHandler);
app.listen(APP_PORT,()=>{
    console.log(`server are running in port ${APP_PORT}`);
})