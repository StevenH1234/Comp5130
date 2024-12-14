"use client";

import React from "react";
import Link from "next/link";
import Dropdown from "./dropDownProfile";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const logout = () => {
    const auth = getAuth();

    try {
      router.push("/home-page");
      signOut(auth);
      console.log("logged out");
    } catch (error) {
      console.log("error logging out");
    }
  };

  const goToSignup = () => {
    router.push("/login-page");
  };

  const goToProfile = () => {
    router.push("/profile-page");
  };
  // if user is nulll than there should be an option to log in
  const menuItems = [
    {
      label: "view Profile",
      onClick: goToProfile,
      visible: false,
    },
    { label: "logout", onClick: logout, visible: false },
    { label: "sign in", onClick: goToSignup, visible: true },
  ];

  return (
    <div
      className="relative z-[10] flex h-[50px] items-center justify-center border-b-8 border-black bg-[#c85048]"
      id="navBar"
    >
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        PKM-COLLECTIONS
      </div>
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        <Link href="/home-page">HOME</Link>
      </div>
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        <Link href="/shop-page">SHOP</Link>
      </div>
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        <Link href="/catalog-page">CATALOG</Link>
      </div>
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        <Link href="/cart-page">CART</Link>
      </div>
      <div className="flex-1 border-l-4 border-r-4 border-[#a82028] text-center font-bold text-black">
        <Dropdown menuItems={menuItems} />
      </div>
    </div>
  );
};

export default Navbar;
