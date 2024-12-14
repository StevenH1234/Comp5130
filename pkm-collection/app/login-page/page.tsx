"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/fireabse";
import db from "@/app/lib/firestore";
import { collection, query, where, doc, getDocs } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
// TODO: do login stuff with firebase

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const res = await signInWithEmailAndPassword(email, password);

      if (res?.user.uid) {
        console.log(`user ID is: ${res?.user.uid}`);
        const q = query(
          collection(db, "userData"),
          where("uid", "==", res.user.uid),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            console.log(`found user data: ${userData.username}`);
          });
        } else {
          console.log("couldn't find user");
        }

        router.push("/home-page");
        setEmailError(false);
        setPasswordError(false);
      } else {
        setEmail("");
        setPassword("");
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/wrong-password") {
          console.log("wrong pass");
        } else if (error.code === "auth/user-not-found") {
          console.log("user not found");
        } else {
          console.log("---");
        }
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-auto flex-col rounded-md border-4 border-black bg-[#f0f0f8] pb-10 pl-10 pr-10 pt-10 font-bold text-black">
        <div>
          <img
            src="/assets/pokeball.png"
            alt="pokeball"
            width="100"
            height="100"
            className="mx-auto"
          ></img>
        </div>
        <div className="flex items-center justify-center pb-10 text-4xl font-bold">
          LOGIN
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="email">email: </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={` ${emailError ? "outline outline-red-500" : "outline outline-black"}`}
            ></input>
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${passwordError ? "outline outline-red-500" : "outline outline-black"}`}
            ></input>
          </div>
          <br />
          <div className="flex justify-between text-white">
            <Link href="/signup-page">
              <button className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]">
                signup
              </button>
            </Link>
            <button
              className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]"
              type="submit"
            >
              login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
