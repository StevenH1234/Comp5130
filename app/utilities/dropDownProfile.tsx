"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User, getAuth, signOut } from "firebase/auth";
import { auth } from "@/app/lib/fireabse";
import { useAuth } from "@/app/context/authContext";
import { collection, query, where, doc, getDocs } from "firebase/firestore";
import db from "../lib/firestore";

// NOTE SECTION:
// weird behaviors wiht the loggin. top right profile section changes strangely investigate furthere and fix

type MenuItem = {
  label: string;
  visible: boolean;
  onClick: () => void;
};

type DropdownProps = {
  menuItems: MenuItem[];
};

const Dropdown: React.FC<DropdownProps> = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean);
  const { user } = useAuth();
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  });

  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };

  const getUsername = async () => {
    if (user) {
      const q = query(collection(db, "userData"), where("uid", "==", user.uid));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.username;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const displayName = await getUsername();
        if (displayName != null) {
          console.log(`DIsplay name is ${displayName}`);
          setDisplayName(displayName);
        } else {
          setDisplayName("error");
        }
      } else {
        setDisplayName("Guest");
      }
    };

    fetchUserName();
  }, [user]);

  return (
    <div className="relative inline-block">
      <button onClick={toggleDropDown} className="flex items-center">
        {displayName ? displayName : "Loading..."}
      </button>

      {/* drop down menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-40 rounded-lg border bg-white">
          {menuItems
            .filter((item) => {
              if (item.label === "view Profile" || item.label === "logout") {
                return isLoggedIn;
              }
              if (item.label === "sign in") {
                return !isLoggedIn;
              }
              return true;
            })
            .map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  toggleDropDown();
                  item.onClick();
                }}
                className="block px-4 py-2 text-sm text-gray-700"
              >
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
