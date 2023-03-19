import dotenv from 'dotenv';

dotenv.config();

export const{
REFRESH_SECRET,
APP_PORT,DEBUG_MODE,DB_URL,JWT_SECRET,APP_URL
}=process.env;