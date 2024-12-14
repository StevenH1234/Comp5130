"use client";

import Link from "next/link";
import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import db from "@/app/lib/firestore";
import { sign } from "crypto";
import { auth } from "@/app/lib/fireabse";

export default function Home() {
  // React state hooks
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        alert("An account already exists please login");
      } else {
        // create the user credentials
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        // create data object to store username in the DB
        const userData = {
          uid: user.uid,
          email: user.email,
          username: username,
        };

        // store in the DB
        const userCollection = collection(db, "userData");
        await addDoc(userCollection, userData); // stores to firebase db collection
        router.push("/home-page");
        console.log("success");
        setError(null);
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setEmailError(true);
      }

      //console.error("sign-up error", error);
      setError("email already registered, log in!");
      setEmail("");
      setPassword("");
      setUsername("");
      setSuccess(null);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[400px] rounded-md border-4 border-black bg-[#f0f0f8] pb-10 pl-10 pr-10 pt-10 font-bold text-black">
        <div>
          <img
            src="/assets/pokeball.png"
            alt="pokeball"
            height="100"
            width="100"
            className="mx-auto"
          ></img>
        </div>
        <div className="flex items-center justify-center pb-10 text-4xl font-bold">
          REGISTER
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="flex flex-col">
            <label htmlFor="email">Email: </label>
            <input
              type="text"
              id="email"
              name="email"
              required
              placeholder="Email Address"
              className="rounded border-2 border-black text-black"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            ></input>
          </div>

          <div className="flex flex-col">
            <label htmlFor="username">UserName: </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              placeholder="Username"
              className="rounded border-2 border-black text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </div>

          <div className="flex flex-col">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Password"
              className="rounded border-2 border-black text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          <br />
          <div className="flex justify-between text-white">
            <Link
              href="/login-page"
              className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]"
            >
              <button>return to login</button>
            </Link>
            <button
              type="submit"
              className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
