"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User, getAuth, signOut } from "firebase/auth";
import { auth } from "@/app/lib/fireabse";
import { useAuth } from "@/app/context/authContext";
import { collection, query, where, doc, getDocs } from "firebase/firestore";
import db from "../lib/firestore";

export default function () {
  return (
    <div>
      <button className="hover: rounded-full bg-[#A0BCAC] bg-[#D3D3D3]">
        &#x2714;
      </button>
    </div>
  );
}
