"use client";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="absolute z-[40] flex h-screen w-full items-center justify-center bg-[#f0f0f8]">
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-full justify-between text-4xl font-bold text-white">
          <div className="flex flex-col">
            <div className="flex w-full items-center justify-center pb-5 text-4xl text-black">
              <TypeAnimation
                sequence={[
                  "Welcome Trainer",
                  2000,
                  "Start your Pokemon Collection",
                  2000,
                  "And Collect them all!",
                  2000,
                ]}
                wrapper="span"
                speed={40}
                repeat={Infinity}
              />
            </div>
            <div className="flex flex-row items-center justify-center">
              <div className="h-auto pr-20">
                <Link
                  href="/login-page"
                  className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]"
                >
                  <button>Login</button>
                </Link>
              </div>

              <div
                className="h-[300px] w-[300px] animate-spin"
                style={{ animationDuration: "8s" }}
              >
                <img src="/assets/pokeball.png" alt="pokeball" />
              </div>

              <div className="h-auto pl-20">
                <Link
                  href="/signup-page"
                  className="flex transform rounded bg-[#c85048] px-2 py-1 transition hover:scale-110 hover:bg-[#a82028]"
                >
                  <button>Sign Up</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
