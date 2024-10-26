import {GoogleGenerativeAI} from '@google/generative-ai';
const API_KEY = import.meta.env.VITE_CHAT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
export { API_KEY, model}