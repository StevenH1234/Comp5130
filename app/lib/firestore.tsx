import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "./fireabse";

const db = getFirestore(app);

// aadd user to the firebase database

export default db;
